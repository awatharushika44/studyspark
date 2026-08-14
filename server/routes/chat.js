const express = require('express')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const authMiddleware = require('../middleware/auth')
const router = express.Router()

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

// ---- AI-powered response ----
async function getAIResponse(message, history = []) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.7-flash' })

  const systemPrompt = `You are StudySpark's AI Study Assistant — a friendly, encouraging, knowledgeable study coach for students. Give practical, evidence-based advice on studying, focus, memory techniques, exam stress, motivation, and time management. Keep responses concise (under 150 words), warm, and actionable. Use markdown bold (**text**) for key terms. Occasionally reference StudySpark features (Focus Mode, AI Planner, streaks) naturally where relevant, but don't force it every time.`

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood — I\'ll give warm, practical study advice, concise and actionable.' }] },
      ...history,
    ],
  })

  const result = await chat.sendMessage(message)
  return result.response.text()
}

// ---- Rule-based fallback (used if no API key or AI call fails) ----
const getStudyResponse = (message) => {
  const msg = message.toLowerCase()

  if (msg.includes('stress') || msg.includes('anxiety') || msg.includes('nervous')) {
    return `Exam stress is completely normal — here's how to handle it:\n\n**Breathe first.** Box breathing: inhale 4s, hold 4s, exhale 4s. Do it 3 times.\n\n**Reframe it.** Stress = your brain caring. Channel it into focus, not fear.\n\n**5-minute rule.** Tell yourself "just 5 minutes of studying." You'll almost always keep going.\n\n**Sleep is non-negotiable.** One good night of sleep beats 3 hours of late cramming every time.`
  }

  if (msg.includes('focus') || msg.includes('concentrate') || msg.includes('distract')) {
    return `Here's how to lock in your focus:\n\n**Pomodoro technique** — 25 min study, 5 min break. After 4 rounds, take a 20 min break. This is scientifically proven to work.\n\n**Phone in another room.** Not face-down. Another room. Out of sight = out of mind.\n\n**Background noise.** Try lofi music or brown noise. Silence can actually make distraction worse.\n\n**One tab rule.** Close everything except what you're studying. Use StudySpark's Focus Mode to track sessions!`
  }

  if (msg.includes('calculus') || msg.includes('math') || msg.includes('maths')) {
    return `For Calculus/Maths success:\n\n**Don't just read — do problems.** Maths is a skill, not knowledge. Watching examples isn't enough.\n\n**Work backwards from past papers.** Find the question types that appear most, master those first.\n\n**Khan Academy** is genuinely great for calculus concepts. Free and clear.\n\n**Common mistakes to avoid:**\n- Forgetting chain rule applications\n- Sign errors in integration\n- Not checking answers by differentiating back\n\nHow many days until your exam? I can help you build a specific plan.`
  }

  if (msg.includes('memorize') || msg.includes('remember') || msg.includes('memory')) {
    return `The most effective memory techniques:\n\n**Active recall** — close your notes and write everything you remember. Then check. This beats re-reading by 2-3x.\n\n**Spaced repetition** — review material at increasing intervals: 1 day, 3 days, 1 week, 2 weeks.\n\n**The Feynman technique** — explain the concept out loud like you're teaching a 10-year-old. If you can't, you don't understand it yet.\n\n**Mind maps** — great for subjects with lots of connected concepts (biology, history).`
  }

  if (msg.includes('sleep') || msg.includes('tired') || msg.includes('exhausted')) {
    return `Sleep and studying — the truth:\n\n**Memory consolidates during sleep.** You literally learn while sleeping — your brain replays what you studied.\n\n**The optimal schedule:** Study until 10-11 PM max. Sleep 7-8 hours. Your brain absorbs more in 6 focused daytime hours than 12 exhausted night hours.\n\n**Power naps work.** 20 minutes (not more) in the afternoon restores focus significantly.\n\n**Red flag:** If you're studying past 2 AM regularly, your schedule needs fixing — not more caffeine.`
  }

  if (msg.includes('pomodoro') || msg.includes('technique') || msg.includes('method')) {
    return `Top study techniques that actually work:\n\n**Pomodoro** — 25 min focus + 5 min break. Best for tasks that need sustained attention.\n\n**Active recall** — test yourself instead of re-reading. The harder it feels, the better it's working.\n\n**Spaced repetition** — review material across multiple days, not in one cramming session.\n\n**The Feynman Method** — teach it to someone (or yourself out loud) to identify gaps.\n\n**Mind palace** — for memorizing lists or sequences, attach items to locations in a familiar place.`
  }

  if (msg.includes('schedule') || msg.includes('plan') || msg.includes('organize')) {
    return `Smart study scheduling:\n\n**Time-block, don't to-do list.** Instead of "study physics today," write "Physics 2-4 PM." Specific blocks get done.\n\n**Hard subjects in the morning.** Your prefrontal cortex (decision-making, focus) peaks in the first 2-3 hours after waking.\n\n**Use StudySpark's AI Planner** to generate a full schedule based on your exam dates — it handles the optimization automatically.\n\n**One subject per session.** Context-switching kills deep learning. Go deep, not wide.`
  }

  if (msg.includes('motivation') || msg.includes('lazy') || msg.includes('procrastinat')) {
    return `Motivation is overrated — here's what actually works:\n\n**Don't wait to feel motivated.** Action creates motivation, not the other way around. Start first.\n\n**Make it tiny.** "Study for 2 minutes" feels achievable. You'll almost always go longer.\n\n**Track your streak.** Check your StudySpark streak — don't break the chain.\n\n**Identity shift.** Instead of "I need to study," think "I'm someone who studies every day." Small difference, huge impact.\n\n**Reward yourself.** After a session, do something you enjoy. Your brain learns to associate studying with reward.`
  }

  return `Great question! Here's what I know about that:\n\nStudying effectively comes down to three fundamentals:\n\n**1. Active over passive** — doing problems, teaching others, and self-testing beat re-reading every time.\n\n**2. Consistency over intensity** — 1 hour daily for 7 days beats 7 hours on one day.\n\n**3. Sleep and breaks are part of studying** — not breaks from it.\n\nCan you tell me more specifically what subject or challenge you're facing? I can give you a more targeted answer! 📚`
}

router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body
    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' })
    }

    let reply, source

    if (genAI) {
      try {
        reply = await getAIResponse(message)
        source = 'ai'
      } catch (aiErr) {
        console.error('AI chat failed, falling back to rule-based:', aiErr.message)
        reply = getStudyResponse(message)
        source = 'rule-based-fallback'
      }
    } else {
      reply = getStudyResponse(message)
      source = 'rule-based-no-key'
    }

    res.json({ reply, source })
  } catch (err) {
    console.error('CHAT ERROR:', err.message)
    res.status(500).json({ message: 'Failed to get response' })
  }
})

module.exports = router