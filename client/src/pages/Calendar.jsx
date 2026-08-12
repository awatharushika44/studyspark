import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, X, Calendar as CalIcon } from 'lucide-react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const eventTypeColors = {
  exam:    'bg-red-500/20 text-red-400 border-red-500/30',
  task:    'bg-blue-500/20 text-blue-400 border-blue-500/30',
  reminder:'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  study:   'bg-green-500/20 text-green-400 border-green-500/30',
}

const dotColors = {
  exam:    'bg-red-400',
  task:    'bg-blue-400',
  reminder:'bg-yellow-400',
  study:   'bg-green-400',
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [events, setEvents] = useState({})
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', type: 'task' })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Load saved calendar events (user-created + planner exam sync + dashboard task sync)
  useEffect(() => {
    if (user?._id) {
      const saved = localStorage.getItem(`calendar_${user._id}`)
      const base = saved ? JSON.parse(saved) : {}

      // Pull exam dates from planner subjects
      const plannerSubjects = localStorage.getItem(`plannerSubjects_${user._id}`)
      if (plannerSubjects) {
        const parsed = JSON.parse(plannerSubjects)
        parsed.forEach(sub => {
          if (sub.examDate && sub.name) {
            const key = sub.examDate
            if (!base[key]) base[key] = []
            const alreadyExists = base[key].some(e => e.title === `${sub.name} Exam` && e.type === 'exam')
            if (!alreadyExists) {
              base[key].push({
                id: `exam_${sub.name}`,
                title: `${sub.name} Exam`,
                type: 'exam',
                fromPlanner: true
              })
            }
          }
        })
      }

      setEvents(base)
    }
  }, [user?._id])

  // Save only manually-added events — planner and dashboard synced events
  // are regenerated on load, not stored as "user" events
  const saveEvents = (updated) => {
    setEvents(updated)
    if (user?._id) {
      const toSave = {}
      Object.entries(updated).forEach(([date, evs]) => {
        const userEvents = evs.filter(e => !e.fromPlanner && !e.fromDashboard)
        if (userEvents.length > 0) toSave[date] = userEvents
      })
      localStorage.setItem(`calendar_${user._id}`, JSON.stringify(toSave))
    }
  }

  const getDateKey = (day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const selectedKey = getDateKey(selectedDay)
  const selectedEvents = events[selectedKey] || []

  const addEvent = () => {
    if (!newEvent.title.trim()) return
    const updated = {
      ...events,
      [selectedKey]: [...(events[selectedKey] || []), { ...newEvent, id: Date.now() }]
    }
    saveEvents(updated)
    setNewEvent({ title: '', type: 'task' })
    setShowAddEvent(false)
  }

  const removeEvent = (id) => {
    const updated = {
      ...events,
      [selectedKey]: (events[selectedKey] || []).filter(e => e.id !== id)
    }
    saveEvents(updated)
  }

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const getDayEvents = (day) => events[getDateKey(day)] || []

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-gray-950/80 backdrop-blur-md px-6 h-16 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
          Dashboard
        </button>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <CalIcon size={18} className="text-blue-400" />
          <span className="font-semibold">Calendar</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* CALENDAR GRID */}
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-6">

            {/* Month navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-xl">{MONTHS[month]} {year}</h2>
              <div className="flex gap-2">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs text-gray-500 py-2 font-medium">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const isSelected = day === selectedDay
                const todayDay = isToday(day)
                const dayEvs = getDayEvents(day)
                const hasExam = dayEvs.some(e => e.type === 'exam')

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : todayDay
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : hasExam
                        ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                        : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    {day}
                    {dayEvs.length > 0 && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        {dayEvs.slice(0, 3).map((ev, di) => (
                          <div key={di} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : dotColors[ev.type] || 'bg-gray-400'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
              {Object.entries(dotColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-xs text-gray-500 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SELECTED DAY PANEL */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{MONTHS[month]} {selectedDay}</h3>
                <p className="text-xs text-gray-500">
                  {isToday(selectedDay) ? 'Today' : DAYS[new Date(year, month, selectedDay).getDay()]}
                </p>
              </div>
              <button
                onClick={() => setShowAddEvent(true)}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Add event form */}
            <AnimatePresence>
              {showAddEvent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
                    <input
                      autoFocus
                      placeholder="Event title..."
                      value={newEvent.title}
                      onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addEvent()}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                    />
                    <select
                      value={newEvent.type}
                      onChange={e => setNewEvent(p => ({ ...p, type: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    >
                      <option value="task">📋 Task</option>
                      <option value="exam">📝 Exam</option>
                      <option value="reminder">🔔 Reminder</option>
                      <option value="study">📚 Study Session</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={addEvent} className="flex-1 bg-blue-500 hover:bg-blue-400 text-xs py-2 rounded-lg font-medium transition-all">
                        Add Event
                      </button>
                      <button onClick={() => setShowAddEvent(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Events */}
            {selectedEvents.length === 0 && !showAddEvent ? (
              <div className="text-center py-10">
                <CalIcon size={28} className="text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No events</p>
                <p className="text-xs text-gray-600 mt-1">Click "Add" to create one</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map(event => (
                  <div key={event.id} className={`flex items-center justify-between p-3 rounded-xl border ${eventTypeColors[event.type] || eventTypeColors.task}`}>
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs opacity-70 capitalize">
                        {event.type}
                        {event.fromPlanner ? ' · from Planner' : ''}
                        {event.fromDashboard ? ' · from Dashboard' : ''}
                      </p>
                    </div>
                    {!event.fromPlanner && !event.fromDashboard && (
                      <button onClick={() => removeEvent(event.id)} className="text-current opacity-50 hover:opacity-100 transition-opacity">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}