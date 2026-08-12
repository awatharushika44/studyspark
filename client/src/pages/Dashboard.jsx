import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Brain, Zap, Flame, Clock, BookOpen,
  TrendingUp, CheckCircle, Plus, LogOut, Sparkles,
  Target, Calendar, BarChart2, MessageSquare, X
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts'
import { useSubjects } from '../hooks/useSubjects'

const studyData = [
  { day: 'Mon', hours: 0 }, { day: 'Tue', hours: 0 },
  { day: 'Wed', hours: 0 }, { day: 'Thu', hours: 0 },
  { day: 'Fri', hours: 0 }, { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0 },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } })
}

const priorityColors = {
  high: 'text-red-400 bg-red-500/10',
  medium: 'text-yellow-400 bg-yellow-500/10',
  low: 'text-green-400 bg-green-500/10',
}

const navItems = [
  { icon: BarChart2, label: 'Overview', tab: 'overview', path: null },
  { icon: Brain, label: 'AI Planner', tab: 'planner', path: '/planner' },
  { icon: Zap, label: 'Focus Mode', tab: 'focus', path: '/focus' },
  { icon: MessageSquare, label: 'Study Assistant', tab: 'chat', path: '/chat' },
  { icon: Calendar, label: 'Calendar', tab: 'calendar', path: '/calendar' },
  { icon: Target, label: 'Goals', tab: 'goals', path: '/goals' },
  { icon: TrendingUp, label: 'Analytics', tab: 'analytics', path: '/analytics' },
]

const todayStr = () => new Date().toISOString().split('T')[0]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // Tasks — persisted per user
  const [taskList, setTaskList] = useState([])
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', subject: '', priority: 'medium' })

  // Subjects from MongoDB via hook
  const { subjects, addSubject, removeSubject } = useSubjects()
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [newSubject, setNewSubject] = useState('')

  // Load tasks on mount
  useEffect(() => {
    if (user?._id) {
      const saved = localStorage.getItem(`tasks_${user._id}`)
      if (saved) setTaskList(JSON.parse(saved))
    }
  }, [user?._id])

  // Update default subject when subjects load
  useEffect(() => {
    if (subjects.length > 0 && !newTask.subject) {
      setNewTask(p => ({ ...p, subject: subjects[0] }))
    }
  }, [subjects])

  // Central save function — updates state + localStorage + calendar sync
  const saveTasks = (updated) => {
    setTaskList(updated)
    if (user?._id) {
      localStorage.setItem(`tasks_${user._id}`, JSON.stringify(updated))
      syncTasksToCalendar(updated)
    }
  }

  // Push tasks into the calendar's event store, keyed by due date
  const syncTasksToCalendar = (tasks) => {
    if (!user?._id) return
    const saved = localStorage.getItem(`calendar_${user._id}`)
    const base = saved ? JSON.parse(saved) : {}

    // strip out old dashboard-synced task events first
    Object.keys(base).forEach(dateKey => {
      base[dateKey] = base[dateKey].filter(e => !e.fromDashboard)
      if (base[dateKey].length === 0) delete base[dateKey]
    })

    // add current tasks back in under their due date
    tasks.forEach(task => {
      const dateKey = task.due
      if (!dateKey) return
      if (!base[dateKey]) base[dateKey] = []
      base[dateKey].push({
        id: `task_${task.id}`,
        title: task.done ? `✓ ${task.title}` : task.title,
        type: 'task',
        fromDashboard: true
      })
    })

    localStorage.setItem(`calendar_${user._id}`, JSON.stringify(base))
  }

  const toggleTask = (id) => {
    const updated = taskList.map(t => t.id === id ? { ...t, done: !t.done } : t)
    saveTasks(updated)
  }

  const deleteTask = (id) => {
    const updated = taskList.filter(t => t.id !== id)
    saveTasks(updated)
  }

  const addTask = () => {
    if (!newTask.title.trim()) return
    const updated = [...taskList, {
      id: Date.now(),
      title: newTask.title,
      subject: newTask.subject || subjects[0] || 'General',
      priority: newTask.priority,
      due: todayStr(),
      done: false,
    }]
    saveTasks(updated)
    setNewTask({ title: '', subject: subjects[0] || '', priority: 'medium' })
    setShowAddTask(false)
  }

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return
    await addSubject(newSubject.trim())
    setNewSubject('')
    setShowAddSubject(false)
  }

  const handleRemoveSubject = async (s) => {
    await removeSubject(s)
  }

  const completedTasks = taskList.filter(t => t.done).length
  const totalTasks = taskList.length
  const xpForNextLevel = (user?.level || 1) * 1000
  const xpProgress = Math.round(((user?.xp || 0) / xpForNextLevel) * 100)

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 fixed h-full overflow-y-auto">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg">StudySpark</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ icon: Icon, label, tab, path }) => (
            <button
              key={tab}
              onClick={() => path ? navigate(path) : setActiveTab(tab)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === tab
                  ? 'bg-blue-500/10 text-blue-400 font-medium'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/5 pt-4 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">Level {user?.level} • {user?.xp} XP</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-500/5"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1 p-8">

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
          <h1 className="text-2xl font-bold mb-1">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm">
            {totalTasks === 0
              ? "No tasks yet — add one to get started! 🚀"
              : `You have ${taskList.filter(t => !t.done).length} tasks pending today. Let's get it! 🚀`}
          </p>
        </motion.div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Flame, label: 'Current Streak', value: `${user?.streak || 0} days`, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { icon: Zap, label: 'XP Points', value: `${user?.xp || 0} XP`, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { icon: Clock, label: 'Hours This Week', value: '0 hrs', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: CheckCircle, label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, color: 'text-green-400', bg: 'bg-green-500/10' },
          ].map((stat, i) => (
            <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}
              className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
            className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold">Study Hours</h2>
                <p className="text-xs text-gray-500">This week</p>
              </div>
              <div className="flex items-center gap-1 text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded-lg">
                <TrendingUp size={12} />
                Complete sessions to see data
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={studyData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #ffffff10', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" fill="url(#colorHours)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-6"
          >
            <h2 className="font-semibold mb-1">Level Progress</h2>
            <p className="text-xs text-gray-500 mb-4">{user?.xp || 0} / {xpForNextLevel} XP to Level {(user?.level || 1) + 1}</p>
            <ResponsiveContainer width="100%" height={140}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%"
                data={[{ value: xpProgress || 0, fill: '#3b82f6' }]}
              >
                <RadialBar dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="text-center text-2xl font-bold mt-2">Level {user?.level || 1}</p>
            <p className="text-center text-xs text-gray-500">{xpForNextLevel - (user?.xp || 0)} XP to go</p>
          </motion.div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Tasks */}
          <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Today's Tasks</h2>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus size={14} /> Add task
              </button>
            </div>

            <AnimatePresence>
              {showAddTask && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
                    <input
                      autoFocus
                      placeholder="Task title..."
                      value={newTask.title}
                      onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addTask()}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newTask.subject}
                        onChange={e => setNewTask(p => ({ ...p, subject: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
                      >
                        {subjects.length === 0 && <option value="">Add subjects first</option>}
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select
                        value={newTask.priority}
                        onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addTask} className="flex-1 bg-blue-500 hover:bg-blue-400 text-xs py-2 rounded-lg font-medium transition-all">
                        Add Task
                      </button>
                      <button onClick={() => setShowAddTask(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {taskList.length === 0 && !showAddTask && (
              <div className="text-center py-8">
                <CheckCircle size={32} className="text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No tasks yet</p>
                <p className="text-xs text-gray-600 mt-1">Click "Add task" to create one</p>
              </div>
            )}

            <div className="space-y-3">
              {taskList.map(task => (
                <div key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    task.done ? 'border-white/5 opacity-50' : 'border-white/5 hover:border-white/10'
                  }`}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    task.done ? 'bg-green-500 border-green-500' : 'border-gray-600'
                  }`}>
                    {task.done && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.done ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {task.subject} • Due {task.due === todayStr() ? 'Today' : task.due}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteTask(task.id) }}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* My Subjects */}
          <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">My Subjects</h2>
              <button
                onClick={() => setShowAddSubject(p => !p)}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <AnimatePresence>
              {showAddSubject && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      placeholder="e.g. Biology, Economics..."
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                    />
                    <button
                      onClick={handleAddSubject}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-xl text-sm font-medium transition-all"
                    >
                      Add
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {subjects.length === 0 && (
              <div className="text-center py-8">
                <BookOpen size={32} className="text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No subjects added</p>
                <p className="text-xs text-gray-600 mt-1">Click "Add" to add your subjects</p>
              </div>
            )}

            <div className="space-y-3">
              {subjects.map((subject, i) => {
                const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']
                const color = colors[i % colors.length]
                return (
                  <div key={subject} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Active</span>
                        <button
                          onClick={() => handleRemoveSubject(subject)}
                          className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full w-0 transition-all" style={{ backgroundColor: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  )
}