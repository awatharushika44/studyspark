const express = require('express')
const { GoogleGenAI } = require('@google/genai')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// ============================================
// GEMINI CLIENT
// ============================================

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })
  : null


// ============================================
// AI STUDY SCHEDULE (with retry on transient errors)
// ============================================

async function generateAISchedule(subjects, hoursPerDay, retries = 1) {
  const maxDays = Math.min(
    Math.max(...subjects.map(s => s.daysUntilExam)),
    14
  )

  const subjectSummary = subjects
    .map(
      s =>
        `- ${s.name}: exam in ${s.daysUntilExam} day(s), difficulty: ${s.difficulty}`
    )
    .join('\n')

  const prompt = `You are an expert academic study planner.

Create a personalized study plan.

SUBJECTS:

${subjectSummary}

The student can study ${hoursPerDay} hours per day.

Create a plan for ${maxDays} days starting today.
Day offset 0 means today.

RULES:

- Prioritize subjects with fewer days until their exam.
- Give higher priority to difficult subjects.
- Never schedule a subject on or after its exam day.
- Each day's total study time must not exceed ${hoursPerDay} hours.
- Each individual session must be between 0.5 and 3 hours.
- Give every session a short encouraging study tip.
- Tips must be under 15 words.
- Use the exact subject names provided.
- Skip days with no valid sessions.
- Return ONLY valid JSON.

Return exactly:

{
  "days": [
    {
      "dayOffset": 0,
      "sessions": [
        {
          "subject": "Mathematics",
          "hours": 1.5,
          "difficulty": "hard",
          "tip": "Practice difficult problems while your focus is strongest."
        }
      ]
    }
  ],
  "insights": [
    "Personalized insight about the student's subjects.",
    "Insight about exam urgency.",
    "Motivating study recommendation.",
    "Insight about difficult subjects.",
    "Personalized consistency recommendation."
  ]
}`

  try {
    const interaction = await ai.interactions.create({
      model: 'gemini-3.6-flash',
      input: prompt
    })

    const raw = interaction.output_text.trim()

    console.log('✅ Gemini response received')

    // Remove accidental markdown fences
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    // Validate response
    if (!Array.isArray(parsed.days) || !Array.isArray(parsed.insights)) {
      throw new Error('Gemini response missing expected fields')
    }

    // ============================================
    // CONVERT DAY OFFSETS TO REAL DATES
    // ============================================

    const schedule = parsed.days
      .filter(day => Array.isArray(day.sessions) && day.sessions.length > 0)
      .map(day => {
        const date = new Date()
        date.setDate(date.getDate() + Number(day.dayOffset))

        return {
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
          sessions: day.sessions.map((session, index) => ({
            subject: session.subject,
            hours: Number(session.hours),
            difficulty: session.difficulty,
            tip: session.tip,
            timeSlot: getTimeSlot(index)
          }))
        }
      })

    return {
      schedule,
      insights: parsed.insights
    }

  } catch (err) {
    const isTransient =
      err.message?.includes('503') ||
      err.message?.includes('overloaded') ||
      err.message?.includes('high demand') ||
      err.message?.includes('UNAVAILABLE')

    if (isTransient && retries > 0) {
      console.log(`⏳ Gemini busy, retrying planner in 2s... (${retries} retr${retries === 1 ? 'y' : 'ies'} left)`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      return generateAISchedule(subjects, hoursPerDay, retries - 1)
    }

    throw err
  }
}


// ============================================
// FALLBACK SCHEDULE
// ============================================

const generateFallbackSchedule = (subjects, totalDays, hoursPerDay) => {
  const schedule = []

  const sorted = [...subjects].sort((a, b) => a.daysUntilExam - b.daysUntilExam)

  const totalWeight = sorted.reduce(
    (sum, subject) => sum + (10 - Math.min(subject.daysUntilExam, 9)),
    0
  )

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
      if (day >= subject.daysUntilExam) continue

      const weight = (10 - Math.min(subject.daysUntilExam, 9)) / totalWeight

      let allocatedHours = Math.round(weight * hoursPerDay * 10) / 10
      allocatedHours = Math.min(allocatedHours, remainingHours, 3)
      allocatedHours = Math.max(allocatedHours, 0.5)

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


// ============================================
// TIPS
// ============================================

const getTip = (difficulty, day) => {
  const tips = {
    hard: [
      'Tackle this when your energy is highest 🧠',
      'Use active recall after each section.',
      'Break difficult topics into focused blocks.'
    ],
    medium: [
      'Review your notes first, then practice problems.',
      'Connect new concepts to what you already know.',
      'Summarize key points in your own words.'
    ],
    easy: [
      'Quick review to keep it fresh 📖',
      'Reinforce your confidence with practice.',
      'Review highlights and answer a few questions.'
    ]
  }

  const list = tips[difficulty] || tips.medium
  return list[day % list.length]
}


// ============================================
// TIME SLOTS
// ============================================

const getTimeSlot = index => {
  const slots = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '7:00 PM']
  return slots[index % slots.length]
}


// ============================================
// FALLBACK INSIGHTS
// ============================================

const getFallbackInsights = (subjects, hoursPerDay, scheduleLength) => [
  `📚 You have ${subjects.length} subjects to cover over the next 2 weeks`,
  `⏰ With ${hoursPerDay} hours/day, you'll complete ${scheduleLength} study days`,
  `🎯 Focus most on ${[...subjects].sort((a, b) => a.daysUntilExam - b.daysUntilExam)[0]?.name} — it's your most urgent subject`,
  `💡 Hard subjects are scheduled for morning slots when focus is highest`,
  `🔥 Stay consistent — even 1 hour counts toward your streak!`
]


// ============================================
// POST /api/planner/generate
// ============================================

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { subjects, hoursPerDay } = req.body

    if (!subjects || subjects.length === 0) {
      return res.status(400).json({ message: 'Please add at least one subject' })
    }

    const hrs = hoursPerDay || 4

    let schedule
    let insights
    let source

    if (ai) {
      try {
        console.log('🤖 Generating AI study plan with Gemini...')

        const result = await generateAISchedule(subjects, hrs)

        schedule = result.schedule
        insights = result.insights
        source = 'ai'

        console.log('🎉 Gemini AI planner succeeded!')

      } catch (aiErr) {
        console.error('❌ AI planner failed, falling back to rule-based:', aiErr.message)

        schedule = generateFallbackSchedule(subjects, 14, hrs)
        insights = getFallbackInsights(subjects, hrs, schedule.length)
        source = 'rule-based-fallback'
      }

    } else {
      console.warn('⚠️ GEMINI_API_KEY is missing')

      schedule = generateFallbackSchedule(subjects, 14, hrs)
      insights = getFallbackInsights(subjects, hrs, schedule.length)
      source = 'rule-based-no-key'
    }

    res.json({ schedule, insights, source })

  } catch (err) {
    console.error('PLANNER ERROR:', err.message)
    res.status(500).json({ message: 'Failed to generate schedule' })
  }
})

module.exports = router