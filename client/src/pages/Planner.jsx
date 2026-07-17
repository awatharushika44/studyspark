import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { plannerAPI } from '../services/api'
import {
  Brain, Plus, Trash2, Sparkles, ArrowLeft,
  Clock, BookOpen, Lightbulb, Calendar, Loader2
} from 'lucide-react'

const difficultyColors = {
  easy: 'text-green-400 bg-green-500/10 border-green-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  hard: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const subjectColors = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#84cc16'
]

// Calculate days between today and chosen date
const calcDaysUntil = (dateStr) => {
  if (!dateStr) return 7
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exam = new Date(dateStr)
  exam.setHours(0, 0, 0, 0)
  const diff = Math.ceil((exam - today) / (1000 * 60 * 60 * 24))
  return Math.max(diff, 1)
}

// Get today's date in YYYY-MM-DD for min attribute
const todayStr = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1) // minimum tomorrow
  return d.toISOString().split('T')[0]
}

// Format date nicely for display e.g. "Jun 15"
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Planner() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [hoursPerDay, setHoursPerDay] = useState(4)
  const [subjects, setSubjects] = useState([
    { name: '', examDate: '', difficulty: 'medium' }
  ])
  const [schedule, setSchedule] = useState(null)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addSubject = () => {
    setSubjects(prev => [...prev, { name: '', examDate: '', difficulty: 'medium' }])
  }

  const removeSubject = (index) => {
    setSubjects(prev => prev.filter((_, i) => i !== index))
  }

  const updateSubject = (index, field, value) => {
    setSubjects(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const handleGenerate = async () => {
    const validSubjects = subjects.filter(s => s.name.trim() && s.examDate)

    if (validSubjects.length === 0) {
      setError('Please add at least one subject with an exam date')
      return
    }

    // Convert examDate → daysUntilExam for the backend
    const subjectsWithDays = validSubjects.map(s => ({
      ...s,
      daysUntilExam: calcDaysUntil(s.examDate)
    }))

    setError('')
    setLoading(true)
    try {
      const res = await plannerAPI.generate({ subjects: subjectsWithDays, hoursPerDay })
      setSchedule(res.data.schedule)
      setInsights(res.data.insights)
      setStep(2)
    } catch (err) {
      setError('Failed to generate schedule. Make sure your server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-gray-950/80 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            Dashboard
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-blue-400" />
            <span className="font-semibold">AI Study Planner</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-blue-400' : 'bg-gray-600'}`} />
          <span className={step >= 1 ? 'text-white' : ''}>Setup</span>
          <div className="w-8 h-px bg-white/10" />
          <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-blue-400' : 'bg-gray-600'}`} />
          <span className={step >= 2 ? 'text-white' : ''}>Schedule</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">

          {/* STEP 1 - INPUT */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={24} className="text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Build Your Study Plan</h1>
                <p className="text-gray-400">Tell us about your upcoming exams and we'll create a smart schedule for you.</p>
              </div>

              {/* Hours per day */}
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold">Daily Study Hours</h2>
                    <p className="text-xs text-gray-500">How many hours can you study per day?</p>
                  </div>
                  <div className="text-3xl font-bold text-blue-400">{hoursPerDay}h</div>
                </div>
                <input
                  type="range" min="1" max="12" value={hoursPerDay}
                  onChange={e => setHoursPerDay(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>1 hour</span>
                  <span>12 hours</span>
                </div>
              </div>

              {/* Subjects */}
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-semibold">Your Subjects</h2>
                    <p className="text-xs text-gray-500">Add each subject and pick its exam date</p>
                  </div>
                  <button onClick={addSubject} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    <Plus size={16} /> Add Subject
                  </button>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-12 gap-3 mb-2 px-1">
                  <div className="col-span-1" />
                  <p className="col-span-4 text-xs text-gray-500">Subject</p>
                  <p className="col-span-4 text-xs text-gray-500">Exam Date</p>
                  <p className="col-span-2 text-xs text-gray-500">Difficulty</p>
                  <div className="col-span-1" />
                </div>

                <div className="space-y-3">
                  {subjects.map((subject, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-12 gap-3 items-center"
                    >
                      {/* Color dot */}
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: subjectColors[i % subjectColors.length] }}
                        />
                      </div>

                      {/* Subject name */}
                      <input
                        className="col-span-4 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="e.g. Mathematics"
                        value={subject.name}
                        onChange={e => updateSubject(i, 'name', e.target.value)}
                      />

                      {/* Exam date picker */}
                      <div className="col-span-4 relative">
                        <input
                          type="date"
                          min={todayStr()}
                          value={subject.examDate}
                          onChange={e => updateSubject(i, 'examDate', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                          style={{ colorScheme: 'dark' }}
                        />
                        {/* Days badge - shows how many days away */}
                        {subject.examDate && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
                              calcDaysUntil(subject.examDate) <= 3
                                ? 'bg-red-500/20 text-red-400'
                                : calcDaysUntil(subject.examDate) <= 7
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {calcDaysUntil(subject.examDate)}d
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Difficulty */}
                      <select
                        className="col-span-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                        value={subject.difficulty}
                        onChange={e => updateSubject(i, 'difficulty', e.target.value)}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>

                      {/* Delete */}
                      <button
                        onClick={() => removeSubject(i)}
                        className="col-span-1 flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Urgency legend */}
                <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5">
                  <p className="text-xs text-gray-600">Days badge:</p>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md">≤3d urgent</span>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-md">≤7d soon</span>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md">8d+ relaxed</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 transition-colors py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Generating your plan...</>
                ) : (
                  <><Sparkles size={20} /> Generate My Study Plan</>
                )}
              </button>
            </motion.div>
          )}

          {/* STEP 2 - SCHEDULE */}
          {step === 2 && schedule && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Your Study Schedule 🎯</h1>
                  <p className="text-gray-400 text-sm">Optimized for your energy levels and exam dates</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl transition-all"
                >
                  Regenerate
                </button>
              </div>

              {/* Insights */}
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={18} className="text-blue-400" />
                  <h2 className="font-semibold">AI Insights</h2>
                </div>
                <div className="space-y-2">
                  {insights.map((insight, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-sm text-gray-300"
                    >
                      {insight}
                    </motion.p>
                  ))}
                </div>
              </div>

              {/* Schedule Days */}
              <div className="space-y-4">
                {schedule.map((day, i) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{day.dayName}</h3>
                        <p className="text-xs text-gray-500">{day.date}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-lg">
                        <Clock size={12} />
                        {day.sessions.reduce((sum, s) => sum + s.hours, 0).toFixed(1)}h total
                      </div>
                    </div>

                    <div className="space-y-3">
                      {day.sessions.map((session, j) => (
                        <div key={j} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="text-xs text-gray-500 w-16 flex-shrink-0">{session.timeSlot}</div>
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: subjectColors[subjects.findIndex(s => s.name === session.subject) % subjectColors.length] }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium">{session.subject}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-lg border ${difficultyColors[session.difficulty]}`}>
                                {session.difficulty}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{session.tip}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                            <BookOpen size={12} />
                            {session.hours}h
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-blue-500 hover:bg-blue-400 transition-colors py-3 rounded-xl font-semibold"
                >
                  Save & Go to Dashboard
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}