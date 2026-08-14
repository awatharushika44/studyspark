import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Calendar, Zap, BarChart2, Shield, Trophy, ArrowRight, Sparkles } from 'lucide-react'
import { authAPI } from '../services/api'

const features = [
  { icon: Brain, title: 'AI Study Planner', desc: 'Generates a personalized schedule based on your subjects, exam dates and energy levels.', color: 'bg-blue-500/10 text-blue-400' },
  { icon: Calendar, title: 'Smart Scheduling', desc: 'Automatically adjusts your plan when you miss sessions. Stays balanced, always.', color: 'bg-purple-500/10 text-purple-400' },
  { icon: Zap, title: 'Focus Mode', desc: 'Distraction-free study sessions with built-in Pomodoro timer and XP rewards.', color: 'bg-yellow-500/10 text-yellow-400' },
  { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Track study hours, streaks, and performance patterns with beautiful charts.', color: 'bg-green-500/10 text-green-400' },
  { icon: Shield, title: 'Burnout Detection', desc: 'AI monitors your workload and alerts you before you hit exhaustion.', color: 'bg-red-500/10 text-red-400' },
  { icon: Trophy, title: 'Gamification', desc: 'Earn XP, unlock badges, and level up as you complete your study goals.', color: 'bg-orange-500/10 text-orange-400' },
]

const stats = [
  { value: '10,000+', label: 'Students' },
  { value: '94%', label: 'Grade Improvement' },
  { value: '2.4x', label: 'Productivity Boost' },
  { value: '4.9★', label: 'Average Rating' },
]

const steps = [
  { num: '01', title: 'Set Your Goals', desc: 'Enter your subjects, exam dates and how many hours you can study per day.' },
  { num: '02', title: 'AI Builds Your Plan', desc: 'Our AI generates a smart, balanced schedule optimized for your energy levels.' },
  { num: '03', title: 'Study & Level Up', desc: 'Follow your plan, track progress, earn XP and hit your academic goals.' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
}

export default function Landing() {
  const navigate = useNavigate()

  const handleTryDemo = async () => {
    try {
      const res = await authAPI.login({
        email: 'demo@studyspark.com',
        password: 'Demo1234!'
      })
      localStorage.setItem('token', res.data.token)
      // Force page reload to update AuthContext
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Demo login failed:', err)
      alert('Demo account not available. Try again later.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">StudySpark</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#stats" className="hover:text-white transition-colors">Stats</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTryDemo}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors px-4 py-2 border border-purple-500/20 hover:border-purple-500/40 rounded-lg"
            >
              Try Demo
            </button>
            <button onClick={() => navigate('/login')} className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="text-sm bg-blue-500 hover:bg-blue-400 transition-colors px-4 py-2 rounded-lg font-medium">
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6"
          >
            <Sparkles size={14} />
            AI-Powered Student Success Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            Study Smarter,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Not Harder
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            StudySpark uses AI to build your perfect study schedule, track your progress,
            detect burnout before it hits, and keep you motivated every single day.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={() => navigate('/register')} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 transition-colors px-8 py-3.5 rounded-xl font-semibold text-lg">
              Start for Free <ArrowRight size={18} />
            </button>
            <button
              onClick={handleTryDemo}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-8 py-3.5 rounded-xl border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 text-lg"
            >
              Try Demo — No signup needed
            </button>
          </motion.div>

          {/* floating badges */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-16 flex flex-wrap justify-center gap-3"
          >
            {['🔥 14 day streak', '⚡ Focus Mode', '🧠 AI Schedule', '🏆 Level 5', '📊 Analytics'].map((badge) => (
              <span key={badge} className="text-sm bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-gray-300">
                {badge}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} custom={i} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }} className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">Built for students who are serious about their academics and wellbeing.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:bg-white/[0.05] transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color.split(' ')[0]}`}>
                  <f.icon size={22} className={f.color.split(' ')[1]} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-gray-400 text-lg">Up and running in under 2 minutes.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.num} custom={i} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }} className="text-center">
                <div className="text-5xl font-bold text-white/5 mb-4">{s.num}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-12"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to transform your studies?</h2>
          <p className="text-gray-400 mb-8">
            Join students already using StudySpark to reach their academic goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 transition-colors px-8 py-3.5 rounded-xl font-semibold text-lg mx-auto">
              Get Started — It's Free <ArrowRight size={18} />
            </button>
            <button onClick={handleTryDemo} className="flex items-center gap-2 border border-white/10 hover:border-purple-500/40 transition-colors px-8 py-3.5 rounded-xl text-gray-300 hover:text-white text-lg mx-auto">
             Try Demo
            </button>
          </div>
        </motion.div>
      </section>

    </div>
  )
}