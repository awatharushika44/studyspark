import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { focusAPI } from '../services/api'
import {
  ArrowLeft, Play, Pause, SkipForward,
  Zap, Flame, Clock, RotateCcw, CheckCircle, Plus, X
} from 'lucide-react'

const MODES = [
  { label: 'Focus', minutes: 25, color: '#3b82f6', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  { label: 'Short Break', minutes: 5, color: '#10b981', bg: 'bg-green-500/10', text: 'text-green-400' },
  { label: 'Long Break', minutes: 15, color: '#8b5cf6', bg: 'bg-purple-500/10', text: 'text-purple-400' },
]

const DEFAULT_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology', 'History', 'Other']

export default function Focus() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()

  const [modeIndex, setModeIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].minutes * 60)
  const [running, setRunning] = useState(false)
  const [sessionsToday, setSessionsToday] = useState(0)
  const [minutesToday, setMinutesToday] = useState(0)
  const [xpToday, setXpToday] = useState(0)
  const [showComplete, setShowComplete] = useState(false)
  const [lastXp, setLastXp] = useState(0)

  // Custom subjects
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('userSubjects')
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS
  })
  const [subject, setSubject] = useState(() => {
    const saved = localStorage.getItem('userSubjects')
    const list = saved ? JSON.parse(saved) : DEFAULT_SUBJECTS
    return list[0]
  })
  const [newSubject, setNewSubject] = useState('')
  const [showAddSubject, setShowAddSubject] = useState(false)

  const intervalRef = useRef(null)
  const mode = MODES[modeIndex]
  const totalSeconds = mode.minutes * 60
  const progress = (secondsLeft / totalSeconds) * 100

  const radius = 90
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const addSubject = () => {
    if (!newSubject.trim()) return
    const updated = [...subjects, newSubject.trim()]
    setSubjects(updated)
    localStorage.setItem('userSubjects', JSON.stringify(updated))
    setSubject(newSubject.trim())
    setNewSubject('')
    setShowAddSubject(false)
  }

  const removeSubject = (s) => {
    if (subjects.length <= 1) return
    const updated = subjects.filter(sub => sub !== s)
    setSubjects(updated)
    localStorage.setItem('userSubjects', JSON.stringify(updated))
    if (subject === s) setSubject(updated[0])
  }

  const handleComplete = useCallback(async (studiedMinutes) => {
    clearInterval(intervalRef.current)
    setRunning(false)

    if (modeIndex === 0) {
      const mins = Math.max(Math.round(studiedMinutes || mode.minutes), 1)
      try {
        const res = await focusAPI.complete({ minutes: mins, subject })
        const { xpEarned, totalXp, level, streak } = res.data
        setLastXp(xpEarned)
        setSessionsToday(p => p + 1)
        setMinutesToday(p => p + mins)
        setXpToday(p => p + xpEarned)
        if (setUser) setUser(prev => ({ ...prev, xp: totalXp, level, streak }))
      } catch (err) {
        console.error('Failed to save session:', err)
        const fallbackXp = mins * 2
        setLastXp(fallbackXp)
        setSessionsToday(p => p + 1)
        setMinutesToday(p => p + mins)
        setXpToday(p => p + fallbackXp)
      }
      setShowComplete(true)
    } else {
      switchMode(0)
    }
  }, [modeIndex, mode.minutes, subject, setUser])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            handleComplete(mode.minutes)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, handleComplete, mode.minutes])

  const switchMode = (index) => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setModeIndex(index)
    setSecondsLeft(MODES[index].minutes * 60)
    setShowComplete(false)
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setSecondsLeft(mode.minutes * 60)
    setShowComplete(false)
  }

  const skip = () => {
    if (!running && secondsLeft === totalSeconds) return
    const studied = (totalSeconds - secondsLeft) / 60
    handleComplete(Math.max(studied, 1))
  }

  const startBreak = () => {
    setShowComplete(false)
    const breakMode = sessionsToday % 4 === 0 ? 2 : 1
    switchMode(breakMode)
    setTimeout(() => setRunning(true), 100)
  }

  const startNext = () => {
    setShowComplete(false)
    switchMode(0)
    setTimeout(() => setRunning(true), 100)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* NAVBAR */}
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            Dashboard
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-yellow-400" />
            <span className="font-semibold">Focus Mode</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Flame size={14} className="text-orange-400" />
          <span>{user?.streak || 0} day streak</span>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-10">

        {/* Mode tabs */}
        <div className="flex gap-2 mb-8 bg-white/[0.03] p-1 rounded-xl border border-white/5">
          {MODES.map((m, i) => (
            <button
              key={m.label}
              onClick={() => switchMode(i)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                modeIndex === i
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Subject selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500">Studying</label>
            <button
              onClick={() => setShowAddSubject(p => !p)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus size={12} /> Add subject
            </button>
          </div>

          {/* Add subject input */}
          <AnimatePresence>
            {showAddSubject && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="flex gap-2">
                  <input
                    autoFocus
                    placeholder="e.g. Economics, Literature..."
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSubject()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  <button
                    onClick={addSubject}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-xl text-sm font-medium transition-all"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddSubject(false)}
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subject pills */}
          <div className="flex flex-wrap gap-2">
            {subjects.map(s => (
              <div key={s} className="flex items-center gap-0.5 group">
                <button
                  onClick={() => setSubject(s)}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                    subject === s
                      ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                      : 'border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20'
                  }`}
                >
                  {s}
                </button>
                {s !== 'Other' && subjects.length > 1 && (
                  <button
                    onClick={() => removeSubject(s)}
                    className="w-4 h-4 rounded-full bg-white/10 hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TIMER */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-6" style={{ width: 220, height: 220 }}>
            <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="110" cy="110" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
              />
              <circle
                cx="110" cy="110" r={radius}
                fill="none"
                stroke={mode.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold tabular-nums tracking-tight">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-xs text-gray-500 mt-1">{mode.label}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={() => setRunning(r => !r)}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-semibold transition-all"
              style={{ backgroundColor: mode.color }}
            >
              {running ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
            </button>

            <button
              onClick={skip}
              disabled={!running && secondsLeft === totalSeconds}
              className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <p className="text-xs text-gray-600 mt-4">
            {!running && secondsLeft === totalSeconds
              ? 'Press play to start your session'
              : running
              ? `Studying ${subject}...`
              : 'Paused — press play to continue'}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: CheckCircle, label: 'Sessions', value: sessionsToday, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: Clock, label: 'Minutes', value: minutesToday, color: 'text-green-400', bg: 'bg-green-500/10' },
            { icon: Zap, label: 'XP Earned', value: `+${xpToday}`, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon size={16} className={stat.color} />
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500">
            {modeIndex === 0
              ? '💡 Put your phone away. One tab only. You got this.'
              : modeIndex === 1
              ? '☕ Step away from the screen. Stretch or grab water.'
              : '🧘 Take a proper break — walk, rest, breathe deeply.'}
          </p>
        </div>
      </div>

      {/* SESSION COMPLETE MODAL */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold mb-1">Session Complete! 🎉</h2>
              <p className="text-gray-400 text-sm mb-4">{subject} · {minutesToday} min studied today</p>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-6">
                <p className="text-yellow-400 font-bold text-2xl">+{lastXp} XP</p>
                <p className="text-xs text-gray-500 mt-0.5">Total today: +{xpToday} XP</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startBreak}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm text-gray-300 transition-all"
                >
                  Take a Break
                </button>
                <button
                  onClick={startNext}
                  className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-sm font-semibold transition-all"
                >
                  Next Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}