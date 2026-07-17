const express = require('express')
const authMiddleware = require('../middleware/auth')
const User = require('../models/User')
const StudySession = require('../models/StudySession')
const router = express.Router()

// POST /api/focus/complete
router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const { minutes, subject } = req.body
    const xpEarned = Math.round(minutes * 2)

    // ✅ NEW — Save study session to MongoDB
    await StudySession.create({
      user: req.user._id,
      subject,
      minutes,
      xpEarned,
    })

    const user = await User.findById(req.user._id)

    // Add XP
    user.xp += xpEarned

    // Level up
    const newLevel = Math.floor(user.xp / 1000) + 1
    if (newLevel > user.level) user.level = newLevel

    // Streak logic
    const today = new Date().toDateString()
    const lastStudy = user.lastStudyDate
      ? new Date(user.lastStudyDate).toDateString()
      : null
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    if (lastStudy === today) {
      // already studied today
    } else if (lastStudy === yesterday) {
      user.streak += 1
    } else {
      user.streak = 1
    }

    user.lastStudyDate = new Date()
    await user.save()

    res.json({
      xpEarned,
      totalXp: user.xp,
      level: user.level,
      streak: user.streak,
      message: `+${xpEarned} XP earned! Keep going! 🔥`
    })

  } catch (err) {
    console.error('FOCUS ERROR:', err.message)
    res.status(500).json({ message: 'Failed to save session' })
  }
})

module.exports = router