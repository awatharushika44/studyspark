const express = require('express')
const authMiddleware = require('../middleware/auth')
const StudySession = require('../models/StudySession')
const router = express.Router()

// GET /api/analytics/summary
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id

    // Get all sessions for this user
    const allSessions = await StudySession.find({ user: userId })

    // Last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weeklyData = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const daySessions = allSessions.filter(s => {
        const d = new Date(s.date)
        return d >= date && d < nextDate
      })

      const hours = daySessions.reduce((sum, s) => sum + s.minutes / 60, 0)
      const sessions = daySessions.length

      weeklyData.push({
        day: days[date.getDay()],
        hours: Math.round(hours * 10) / 10,
        sessions
      })
    }

    // Subject breakdown
    const subjectMap = {}
    allSessions.forEach(s => {
      subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.minutes
    })

    const totalMinutes = Object.values(subjectMap).reduce((a, b) => a + b, 0)
    const subjectColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']
    const subjectData = Object.entries(subjectMap).map(([name, mins], i) => ({
      name,
      value: totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0,
      color: subjectColors[i % subjectColors.length]
    }))

    // Heatmap — last 84 days (12 weeks)
    const heatmap = []
    for (let week = 11; week >= 0; week--) {
      const weekData = []
      for (let day = 6; day >= 0; day--) {
        const date = new Date()
        date.setDate(date.getDate() - (week * 7 + day))
        date.setHours(0, 0, 0, 0)

        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const daySessions = allSessions.filter(s => {
          const d = new Date(s.date)
          return d >= date && d < nextDate
        })

        const hours = daySessions.reduce((sum, s) => sum + s.minutes / 60, 0)
        weekData.push({
          date: date.toISOString().split('T')[0],
          hours: Math.round(hours * 10) / 10
        })
      }
      heatmap.push(weekData)
    }

    // Totals
    const totalHours = Math.round(allSessions.reduce((s, sess) => s + sess.minutes / 60, 0) * 10) / 10
    const totalSessions = allSessions.length
    const weekHours = weeklyData.reduce((s, d) => s + d.hours, 0)
    const weekSessions = weeklyData.reduce((s, d) => s + d.sessions, 0)

    res.json({
      weeklyData,
      subjectData,
      heatmap,
      totalHours,
      totalSessions,
      weekHours: Math.round(weekHours * 10) / 10,
      weekSessions,
    })

  } catch (err) {
    console.error('ANALYTICS ERROR:', err.message)
    res.status(500).json({ message: 'Failed to fetch analytics' })
  }
})

module.exports = router