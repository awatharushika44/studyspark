import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  Plus, X, Calendar as CalendarIcon,
  BookOpen, Clock, Flame
} from 'lucide-react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const priorityColors = {
  high: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  medium: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  low: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
}

const initialTasks = [
  { id: 1, date: '2026-07-14', title: 'Complete Calculus Chapter 5', subject: 'Mathematics', priority: 'high', done: false },
  { id: 2, date: '2026-07-14', title: 'Read Quantum Mechanics', subject: 'Physics', priority: 'medium', done: false },
  { id: 3, date: '2026-07-16', title: 'Chemistry Lab Report', subject: 'Chemistry', priority: 'high', done: false },
  { id: 4, date: '2026-07-18', title: 'Essay Draft', subject: 'English', priority: 'low', done: true },
  { id: 5, date: '2026-07-20', title: 'Physics Exam', subject: 'Physics', priority: 'high', done: false, isExam: true },
  { id: 6, date: '2026-07-25', title: 'Math Final Exam', subject: 'Mathematics', priority: 'high', done: false, isExam: true },
]

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()

const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

const toDateStr = (year, month, day) => {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

export default function Calendar() {
  const navigate = useNavigate()
  const today = new Date()

  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(toDateStr(today.getFullYear(), today.getMonth(), today.getDate()))
  const [tasks, setTasks] = useState(initialTasks)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', subject: 'Mathematics', priority: 'medium' })

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())

  const getTasksForDate = (dateStr) => tasks.filter(t => t.date === dateStr)

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const addTask = () => {
    if (!newTask.title.trim()) return
    const task = {
      id: Date.now(),
      date: selectedDate,
      title: newTask.title,
      subject: newTask.subject,
      priority: newTask.priority,
      done: false,
    }
    setTasks(prev => [...prev, task])
    setNewTask({ title: '', subject: 'Mathematics', priority: 'medium' })
    setShowAddTask(false)
  }

  const selectedTasks = getTasksForDate(selectedDate)
  const selectedDateObj = new Date(selectedDate + 'T00:00:00')
  const selectedDateLabel = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

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
            <CalendarIcon size={18} className="text-blue-400" />
            <span className="font-semibold">Calendar</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* CALENDAR */}
          <div className="lg:col-span-2">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">

              {/* Month navigation */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all">
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); setSelectedDate(todayStr) }}
                    className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all"
                  >
                    Today
                  </button>
                  <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for first day offset */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = toDateStr(currentYear, currentMonth, day)
                  const dayTasks = getTasksForDate(dateStr)
                  const isToday = dateStr === todayStr
                  const isSelected = dateStr === selectedDate
                  const hasExam = dayTasks.some(t => t.isExam)
                  const hasTasks = dayTasks.length > 0

                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`relative aspect-square flex flex-col items-center justify-start pt-2 rounded-xl text-sm transition-all ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : isToday
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      <span className="font-medium">{day}</span>

                      {/* Task dots */}
                      {hasTasks && (
                        <div className="flex gap-0.5 mt-1">
                          {hasExam && (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          )}
                          {dayTasks.filter(t => !t.isExam).slice(0, 2).map((_, idx) => (
                            <div key={idx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/60' : 'bg-blue-400'}`} />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-xs text-gray-500">Exam</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-xs text-gray-500">Task</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-gray-500">Today</span>
                </div>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[
                { icon: BookOpen, label: 'Tasks this month', value: tasks.filter(t => t.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)).length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: Flame, label: 'Exams coming', value: tasks.filter(t => t.isExam && !t.done).length, color: 'text-red-400', bg: 'bg-red-500/10' },
                { icon: Clock, label: 'Completed', value: tasks.filter(t => t.done).length, color: 'text-green-400', bg: 'bg-green-500/10' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                    <stat.icon size={16} className={stat.color} />
                  </div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SIDE PANEL - Selected day tasks */}
          <div className="lg:col-span-1">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 sticky top-6">

              {/* Selected date header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{selectedDateLabel}</h3>
                  <p className="text-xs text-gray-500">{selectedTasks.length} items</p>
                </div>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Plus size={14} /> Add
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
                          {['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology', 'Other'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
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
                        <button onClick={() => setShowAddTask(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-all">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tasks list */}
              {selectedTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon size={32} className="text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No tasks for this day</p>
                  <p className="text-xs text-gray-600 mt-1">Click Add to create one</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {selectedTasks.map(task => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={`p-3 rounded-xl border transition-all ${
                          task.isExam
                            ? 'border-red-500/30 bg-red-500/5'
                            : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all ${
                              task.done ? 'bg-green-500 border-green-500' : 'border-gray-600'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${task.done ? 'line-through text-gray-500' : ''}`}>
                              {task.isExam ? '🎯 ' : ''}{task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{task.subject}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-md ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text}`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}