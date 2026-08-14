const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const User = require('./models/User')
const StudySession = require('./models/StudySession')

const DEMO_EMAIL = 'demo@studyspark.com'
const DEMO_PASSWORD = 'Demo1234!'
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology']

const randomBetween = (min, max) =>
  Math.round((Math.random() * (max - min) + min) * 10) / 10

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected')

    // Delete existing demo user and their sessions
    const existing = await User.findOne({ email: DEMO_EMAIL })
    if (existing) {
      await StudySession.deleteMany({ user: existing._id })
      await User.deleteOne({ email: DEMO_EMAIL })
      console.log('🗑️  Removed old demo account')
    }

    // Create demo user — pass the PLAIN password.
    // The pre('save') hook on the User model hashes it automatically.
    // Do NOT hash it manually here, or it gets hashed twice and login will always fail.
    const demoUser = await User.create({
      name: 'Alex Johnson',
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      xp: 4850,
      level: 5,
      streak: 14,
      lastStudyDate: new Date(),
      subjects: SUBJECTS,
      studyHoursPerDay: 5,
    })
    console.log('👤 Demo user created:', demoUser.email)

    // Generate 60 days of study sessions
    const sessions = []
    const today = new Date()

    for (let daysAgo = 60; daysAgo >= 0; daysAgo--) {
      // Skip some days randomly to make it realistic
      // But make last 14 days consistent (streak)
      if (daysAgo > 14 && Math.random() < 0.25) continue

      const date = new Date(today)
      date.setDate(date.getDate() - daysAgo)
      date.setHours(0, 0, 0, 0)

      // 2-4 sessions per day
      const sessionsPerDay = Math.floor(Math.random() * 3) + 2

      for (let s = 0; s < sessionsPerDay; s++) {
        const minutes = Math.floor(randomBetween(20, 55))
        const subject = randomFrom(SUBJECTS)
        const xpEarned = Math.round(minutes * 2)

        const sessionDate = new Date(date)
        sessionDate.setHours(
          Math.floor(Math.random() * 12) + 8, // between 8am and 8pm
          Math.floor(Math.random() * 60),
          0, 0
        )

        sessions.push({
          user: demoUser._id,
          subject,
          minutes,
          xpEarned,
          date: sessionDate,
          createdAt: sessionDate,
          updatedAt: sessionDate,
        })
      }
    }

    await StudySession.insertMany(sessions)
    console.log(`📚 Created ${sessions.length} study sessions`)

    // Summary
    const totalHours = Math.round(
      sessions.reduce((sum, s) => sum + s.minutes, 0) / 60
    )

    console.log('\n🎉 Demo account ready!')
    console.log('─────────────────────────────')
    console.log(`📧 Email:    ${DEMO_EMAIL}`)
    console.log(`🔑 Password: ${DEMO_PASSWORD}`)
    console.log(`⚡ XP:       ${demoUser.xp}`)
    console.log(`🏆 Level:    ${demoUser.level}`)
    console.log(`🔥 Streak:   ${demoUser.streak} days`)
    console.log(`📊 Sessions: ${sessions.length}`)
    console.log(`⏱️  Hours:    ${totalHours}h total`)
    console.log('─────────────────────────────')

    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  }
}

seed()