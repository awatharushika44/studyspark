import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Brain, Zap, Trophy, Flame, Clock, BookOpen,
  TrendingUp, CheckCircle, Plus, LogOut, Sparkles,
  Target, Calendar, BarChart2, MessageSquare, X
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts'

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

const DEFAULT_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English']

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // Dynamic tasks
  const [taskList, setTaskList] = useState([])
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', subject: 'Mathematics', priority: 'medium' })

  // Dynamic subjects
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('dashboardSubjects')
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS
  })
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [newSubject, setNewSubject] = useState('')

  const toggleTask = (id) => {
    setTaskList(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTask = (id) => {
    setTaskList(prev => prev.filter(t => t.id !== id))
  }

  const addTask = () => {
    if (!newTask.title.trim()) return
    setTaskList(prev => [...prev, {
      id: Date.now(),
      title: newTask.title,
      subject: newTask.subject,
      priority: newTask.priority,
      due: 'Today',
      done: false,
    }])
    setNewTask({ title: '', subject: subjects[0] || 'Mathematics', priority: 'medium' })
    setShowAddTask(false)
  }

  const addSubject = () => {
    if (!newSubject.trim()) return
    const updated = [...subjects, newSubject.trim()]
    setSubjects(updated)
    localStorage.setItem('dashboardSubjects', JSON.stringify(updated))
    setNewSubject('')
    setShowAddSubject(false)
  }

  const removeSubject = (s) => {
    const updated = subjects.filter(sub => sub !== s)
    setSubjects(updated)
    localStorage.setItem('dashboardSubjects', JSON.stringify(updated))
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

            {/* Add task form */}
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

            {/* Empty state */}
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
                    <p className="text-xs text-gray-500">{task.subject} • Due {task.due}</p>
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

          {/* Subject Progress */}
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

            {/* Add subject form */}
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
                      onKeyDown={e => e.key === 'Enter' && addSubject()}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                    />
                    <button onClick={addSubject} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-xl text-sm font-medium transition-all">
                      Add
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subjects list */}
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
                          onClick={() => removeSubject(subject)}
                          className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full w-0" style={{ backgroundColor: color }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {subjects.length === 0 && (
              <div className="text-center py-8">
                <BookOpen size={32} className="text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No subjects added</p>
                <p className="text-xs text-gray-600 mt-1">Click "Add" to add your subjects</p>
              </div>
            )}
          </motion.div>
        </div>

      </main>
    </div>
  )
}