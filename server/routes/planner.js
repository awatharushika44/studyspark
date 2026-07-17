const express = require('express')
const authMiddleware = require('../middleware/auth')
const router = express.Router()

const generateSchedule = (subjects, totalDays, hoursPerDay) => {
  const schedule = []
  
  // Sort subjects by exam date (urgent first)
  const sorted = [...subjects].sort((a, b) => a.daysUntilExam - b.daysUntilExam)
  
  // Calculate priority weights
  const totalWeight = sorted.reduce((sum, s) => sum + (10 - Math.min(s.daysUntilExam, 9)), 0)
  
  for (let day = 0; day < Math.min(totalDays, 14); day++) {
    const date = new Date()
    date.setDate(date.getDate() + day)
    
    const daySchedule = {
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      sessions: []
    }

    let remainingHours = hoursPerDay

    for (const subject of sorted) {
      if (remainingHours <= 0) break
      
      const weight = (10 - Math.min(subject.daysUntilExam, 9)) / totalWeight
      let allocatedHours = Math.round(weight * hoursPerDay * 10) / 10
      allocatedHours = Math.min(allocatedHours, remainingHours, 3)
      allocatedHours = Math.max(allocatedHours, 0.5)

      if (day >= subject.daysUntilExam) continue

      daySchedule.sessions.push({
        subject: subject.name,
        hours: allocatedHours,
        difficulty: subject.difficulty,
        tip: getTip(subject.difficulty, day),
        timeSlot: getTimeSlot(daySchedule.sessions.length)
      })

      remainingHours -= allocatedHours
    }

    if (daySchedule.sessions.length > 0) {
      schedule.push(daySchedule)
    }
  }

  return schedule
}

const getTip = (difficulty, day) => {
  const tips = {
    hard: [
      'Tackle this when your energy is highest 🧠',
      'Use active recall — test yourself after each section',
      'Break into 25-min focused blocks with 5-min breaks',
    ],
    medium: [
      'Review your notes first, then practice problems',
      'Connect new concepts to what you already know',
      'Summarize key points in your own words',
    ],
    easy: [
      'Quick review to keep it fresh 📖',
      'Great time to reinforce your confidence',
      'Skim highlights and do a few practice questions',
    ]
  }
  const list = tips[difficulty] || tips.medium
  return list[day % list.length]
}

const getTimeSlot = (index) => {
  const slots = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '7:00 PM']
  return slots[index % slots.length]
}

// POST /api/planner/generate
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { subjects, hoursPerDay } = req.body

    if (!subjects || subjects.length === 0) {
      return res.status(400).json({ message: 'Please add at least one subject' })
    }

    const schedule = generateSchedule(subjects, 14, hoursPerDay || 4)

    const insights = [
      `📚 You have ${subjects.length} subjects to cover over the next 2 weeks`,
      `⏰ With ${hoursPerDay || 4} hours/day, you'll complete ${schedule.length} study days`,
      `🎯 Focus most on ${subjects.sort((a,b) => a.daysUntilExam - b.daysUntilExam)[0]?.name} — it's your most urgent subject`,
      `💡 Hard subjects are scheduled for morning slots when focus is highest`,
      `🔥 Stay consistent — even 1 hour counts toward your streak!`
    ]

    res.json({ schedule, insights })
  } catch (err) {
    console.error('PLANNER ERROR:', err.message)
    res.status(500).json({ message: 'Failed to generate schedule' })
  }
})

module.exports = router