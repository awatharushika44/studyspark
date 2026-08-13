const express = require('express')
const OpenAI = require('openai')
const authMiddleware = require('../middleware/auth')
const router = express.Router()

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// ---- AI-powered generation ----
async function generateAISchedule(subjects, hoursPerDay) {
  const maxDays = Math.min(Math.max(...subjects.map(s => s.daysUntilExam)), 14)

  const subjectSummary = subjects.map(s =>
    `- ${s.name}: exam in ${s.daysUntilExam} day(s), difficulty: ${s.difficulty}`
  ).join('\n')

  const prompt = `You are an expert academic study planner. Build a study plan for a student with the following subjects and upcoming exams:

${subjectSummary}

The student can study ${hoursPerDay} hours per day, across ${maxDays} day(s) starting today (day offset 0).

Rules:
- Prioritize subjects with fewer days until their exam and higher difficulty.
- Never schedule a subject on or after its own exam day (dayOffset must be less than that subject's daysUntilExam).
- Each day's total session hours should not exceed ${hoursPerDay}.
- Each individual session should be between 0.5 and 3 hours.
- Give each session a short, specific, encouraging study tip (under 15 words) relevant to that subject's difficulty.
- Skip days with no valid sessions.

Respond with ONLY valid JSON (no markdown fences, no extra text), in exactly this shape:
{
  "days": [
    {
      "dayOffset": 0,
      "sessions": [
        { "subject": "Mathematics", "hours": 1.5, "difficulty": "hard", "tip": "Tackle proofs first while your focus is sharp." }
      ]
    }
  ],
  "insights": [
    "Four to five short, specific, motivating insight strings referencing the actual subjects and urgency."
  ]
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a precise JSON API. Always respond with valid JSON only, matching the requested schema exactly.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
  })

  const raw = completion.choices[0].message.content.trim()
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim()
  const parsed = JSON.parse(cleaned)

  if (!Array.isArray(parsed.days) || !Array.isArray(parsed.insights)) {
    throw new Error('AI response missing expected fields')
  }

  // Convert AI's relative dayOffsets into real calendar dates/day names
  const schedule = parsed.days
    .filter(d => Array.isArray(d.sessions) && d.sessions.length > 0)
    .map(d => {
      const date = new Date()
      date.setDate(date.getDate() + d.dayOffset)
      return {
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        sessions: d.sessions.map((s, i) => ({
          subject: s.subject,
          hours: s.hours,
          difficulty: s.difficulty,
          tip: s.tip,
          timeSlot: getTimeSlot(i),
        }))
      }
    })

  return { schedule, insights: parsed.insights }
}

// ---- Rule-based fallback (used if no API key or AI call fails) ----
const generateFallbackSchedule = (subjects, totalDays, hoursPerDay) => {
  const schedule = []
  const sorted = [...subjects].sort((a, b) => a.daysUntilExam - b.daysUntilExam)
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

    if (daySchedule.sessions.length > 0) schedule.push(daySchedule)
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

const getFallbackInsights = (subjects, hoursPerDay, scheduleLength) => ([
  `📚 You have ${subjects.length} subjects to cover over the next 2 weeks`,
  `⏰ With ${hoursPerDay} hours/day, you'll complete ${scheduleLength} study days`,
  `🎯 Focus most on ${[...subjects].sort((a, b) => a.daysUntilExam - b.daysUntilExam)[0]?.name} — it's your most urgent subject`,
  `💡 Hard subjects are scheduled for morning slots when focus is highest`,
  `🔥 Stay consistent — even 1 hour counts toward your streak!`
])

// POST /api/planner/generate
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { subjects, hoursPerDay } = req.body

    if (!subjects || subjects.length === 0) {
      return res.status(400).json({ message: 'Please add at least one subject' })
    }

    const hrs = hoursPerDay || 4
    let schedule, insights, source

    if (openai) {
      try {
        const aiResult = await generateAISchedule(subjects, hrs)
        schedule = aiResult.schedule
        insights = aiResult.insights
        source = 'ai'
      } catch (aiErr) {
        console.error('AI planner failed, falling back to rule-based:', aiErr.message)
        schedule = generateFallbackSchedule(subjects, 14, hrs)
        insights = getFallbackInsights(subjects, hrs, schedule.length)
        source = 'rule-based-fallback'
      }
    } else {
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