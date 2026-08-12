import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft, Target, Trophy, Plus, X,
  CheckCircle, Lock, Flame, Zap,
  BookOpen, Clock, Star
} from 'lucide-react'

const ACHIEVEMENTS = [
  { id: 1, icon: '🔥', title: '7 Day Streak', desc: 'Study 7 days in a row', xp: 500, condition: (user) => user?.streak >= 7 },
  { id: 2, icon: '⚡', title: 'Speed Learner', desc: 'Complete 5 focus sessions in one day', xp: 300, condition: () => false },
  { id: 3, icon: '🎯', title: 'Goal Crusher', desc: 'Complete 10 goals', xp: 400, condition: () => false },
  { id: 4, icon: '🧠', title: 'Big Brain', desc: 'Reach Level 5', xp: 600, condition: (user) => user?.level >= 5 },
  { id: 5, icon: '📚', title: 'Bookworm', desc: 'Study 50 hours total', xp: 700, condition: () => false },
  { id: 6, icon: '🏆', title: 'Champion', desc: 'Reach Level 10', xp: 1000, condition: (user) => user?.level >= 10 },
  { id: 7, icon: '💪', title: 'Consistent', desc: 'Study 30 days in a row', xp: 1500, condition: (user) => user?.streak >= 30 },
  { id: 8, icon: '🚀', title: 'Rocket Start', desc: 'Complete your first focus session', xp: 100, condition: (user) => (user?.xp || 0) > 0 },
  { id: 9, icon: '✨', title: 'Early Bird', desc: 'Start a session before 8am', xp: 200, condition: () => false },
]

const GOAL_CATEGORIES = [
  { label: 'Study Hours', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Sessions', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { label: 'Subjects', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Streak', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
]

const GOAL_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

export default function Goals() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Load goals from localStorage per user — no defaults
  const [goals, setGoals] = useState(() => {
    if (!user?._id) return []
    const saved = localStorage.getItem(`goals_${user._id}`)
    return saved ? JSON.parse(saved) : []
  })

  const [activeTab, setActiveTab] = useState('goals')
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '', category: 'Study Hours', target: 10, current: 0, unit: 'hrs'
  })

  const saveGoals = (updated) => {
    setGoals(updated)
    localStorage.setItem(`goals_${user._id}`, JSON.stringify(updated))
  }

  const unlockedCount = ACHIEVEMENTS.filter(a => a.condition(user)).length
  const completedGoals = goals.filter(g => g.current >= g.target).length

  const addGoal = () => {
    if (!newGoal.title.trim()) return
    const updated = [...goals, {
      id: Date.now(),
      ...newGoal,
      color: GOAL_COLORS[goals.length % GOAL_COLORS.length]
    }]
    saveGoals(updated)
    setNewGoal({ title: '', category: 'Study Hours', target: 10, current: 0, unit: 'hrs' })
    setShowAddGoal(false)
  }

  const deleteGoal = (id) => saveGoals(goals.filter(g => g.id !== id))

  const updateProgress = (id, delta) => {
    saveGoals(goals.map(g =>
      g.id === id
        ? { ...g, current: Math.max(0, Math.min(g.target, g.current + delta)) }
        : g
    ))
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
            <Target size={18} className="text-blue-400" />
            <span className="font-semibold">Goals & Achievements</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">{unlockedCount}/{ACHIEVEMENTS.length} unlocked</span>
          <div className="flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/20">
            <Star size={14} />
            <span className="font-medium">{user?.xp || 0} XP</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 mb-8 w-fit">
          {[
            { id: 'goals', icon: Target, label: 'Goals' },
            { id: 'achievements', icon: Trophy, label: 'Achievements' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.id === 'goals' && goals.length > 0 && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md">
                  {completedGoals}/{goals.length}
                </span>
              )}
              {tab.id === 'achievements' && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-md">
                  {unlockedCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* GOALS TAB */}
          {activeTab === 'goals' && (
            <motion.div key="goals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Category stats — only show if goals exist */}
              {goals.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {GOAL_CATEGORIES.map(cat => (
                    <div key={cat.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                      <div className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center mb-2`}>
                        <cat.icon size={16} className={cat.color} />
                      </div>
                      <p className="text-lg font-bold">
                        {goals.filter(g => g.category === cat.label && g.current >= g.target).length}/
                        {goals.filter(g => g.category === cat.label).length || '0'}
                      </p>
                      <p className="text-xs text-gray-500">{cat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Header + add button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Your Goals</h2>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Plus size={16} /> Add Goal
                </button>
              </div>

              {/* Add goal form */}
              <AnimatePresence>
                {showAddGoal && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                      <h3 className="font-medium text-sm text-gray-300">New Goal</h3>
                      <input
                        autoFocus
                        placeholder="e.g. Study 10 hours this week"
                        value={newGoal.title}
                        onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addGoal()}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <select
                          value={newGoal.category}
                          onChange={e => setNewGoal(p => ({ ...p, category: e.target.value }))}
                          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                        >
                          {GOAL_CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                        </select>
                        <input
                          type="number" min="1"
                          placeholder="Target"
                          value={newGoal.target}
                          onChange={e => setNewGoal(p => ({ ...p, target: Number(e.target.value) }))}
                          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                        />
                        <input
                          placeholder="Unit e.g. hrs"
                          value={newGoal.unit}
                          onChange={e => setNewGoal(p => ({ ...p, unit: e.target.value }))}
                          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={addGoal} className="flex-1 bg-blue-500 hover:bg-blue-400 py-2.5 rounded-xl text-sm font-semibold transition-all">
                          Add Goal
                        </button>
                        <button onClick={() => setShowAddGoal(false)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty state */}
              {goals.length === 0 && !showAddGoal && (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
                  <Target size={36} className="text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium mb-1">No goals yet</p>
                  <p className="text-sm text-gray-600 mb-4">Set goals to track your academic progress</p>
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg transition-all"
                  >
                    Add your first goal
                  </button>
                </div>
              )}

              {/* Goals list */}
              <div className="space-y-4">
                {goals.map((goal, i) => {
                  const percent = Math.min(Math.round((goal.current / goal.target) * 100), 100)
                  const done = goal.current >= goal.target
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`bg-white/[0.03] border rounded-2xl p-5 transition-all ${
                        done ? 'border-green-500/20 bg-green-500/5' : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {done && <CheckCircle size={16} className="text-green-400 flex-shrink-0" />}
                          <h3 className={`font-medium ${done ? 'text-green-400' : 'text-white'}`}>
                            {goal.title}
                          </h3>
                        </div>
                        <button onClick={() => deleteGoal(goal.id)} className="text-gray-600 hover:text-red-400 transition-colors ml-2 flex-shrink-0">
                          <X size={16} />
                        </button>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span>{goal.category}</span>
                          <span>{goal.current}/{goal.target} {goal.unit} · {percent}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: done ? '#10b981' : goal.color }}
                          />
                        </div>
                      </div>

                      {!done ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateProgress(goal.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 text-lg font-bold transition-all"
                          >
                            −
                          </button>
                          <span className="text-xs text-gray-500 flex-1 text-center">Update progress</span>
                          <button
                            onClick={() => updateProgress(goal.id, 1)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 text-lg font-bold transition-all"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-400 text-xs">
                          <CheckCircle size={12} />
                          Goal completed! 🎉
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <motion.div key="achievements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-2xl">
                    🏆
                  </div>
                  <div>
                    <h2 className="font-bold text-xl">{unlockedCount} Achievements Unlocked</h2>
                    <p className="text-gray-400 text-sm">{ACHIEVEMENTS.length - unlockedCount} more to unlock · Keep studying!</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden w-32">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all"
                          style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ACHIEVEMENTS.map((achievement, i) => {
                  const unlocked = achievement.condition(user)
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        unlocked
                          ? 'bg-yellow-500/5 border-yellow-500/20'
                          : 'bg-white/[0.02] border-white/5 opacity-60'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                        unlocked ? 'bg-yellow-500/10' : 'bg-white/5 grayscale'
                      }`}>
                        {unlocked ? achievement.icon : <Lock size={20} className="text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className={`font-semibold text-sm ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                            {achievement.title}
                          </h3>
                          {unlocked && (
                            <span className="text-xs bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-md border border-green-500/20">
                              ✓ Unlocked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{achievement.desc}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Zap size={10} className="text-yellow-400" />
                          <span className="text-xs text-yellow-400 font-medium">+{achievement.xp} XP</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}