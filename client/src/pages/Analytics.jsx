import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft, TrendingUp, Flame,
  Clock, Zap, AlertTriangle, CheckCircle,
  BarChart2
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { analyticsAPI } from '../services/api'

const fallbackWeekly = [
  { day: 'Mon', hours: 0, sessions: 0 },
  { day: 'Tue', hours: 0, sessions: 0 },
  { day: 'Wed', hours: 0, sessions: 0 },
  { day: 'Thu', hours: 0, sessions: 0 },
  { day: 'Fri', hours: 0, sessions: 0 },
  { day: 'Sat', hours: 0, sessions: 0 },
  { day: 'Sun', hours: 0, sessions: 0 },
]

const fallbackSubjects = [
  { name: 'No data yet', value: 100, color: '#374151' },
]

const monthlyData = [
  { month: 'Feb', hours: 45 },
  { month: 'Mar', hours: 62 },
  { month: 'Apr', hours: 58 },
  { month: 'May', hours: 75 },
  { month: 'Jun', hours: 88 },
  { month: 'Jul', hours: 26 },
]

const bestTimeData = [
  { time: '6am', productivity: 40 },
  { time: '8am', productivity: 75 },
  { time: '10am', productivity: 95 },
  { time: '12pm', productivity: 60 },
  { time: '2pm', productivity: 45 },
  { time: '4pm', productivity: 70 },
  { time: '6pm', productivity: 85 },
  { time: '8pm', productivity: 65 },
  { time: '10pm', productivity: 30 },
]

const getHeatColor = (hours) => {
  if (hours === 0) return 'bg-white/5'
  if (hours < 1) return 'bg-blue-500/20'
  if (hours < 2) return 'bg-blue-500/40'
  if (hours < 4) return 'bg-blue-500/60'
  return 'bg-blue-500'
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}{p.name === 'hours' ? 'h' : ''}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [period, setPeriod] = useState('week')
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.getSummary()
      .then(res => setAnalyticsData(res.data))
      .catch(err => console.error('Analytics fetch error:', err))
      .finally(() => setLoading(false))
  }, [])

  const weeklyChartData = analyticsData?.weeklyData || fallbackWeekly
  const subjectChartData = analyticsData?.subjectData?.length > 0
    ? analyticsData.subjectData
    : fallbackSubjects
  const heatmapChartData = analyticsData?.heatmap || []
  const totalHours = analyticsData?.weekHours || 0
  const totalSessions = analyticsData?.weekSessions || 0
  const avgHours = (totalHours / 7).toFixed(1)

  const recentHours = weeklyChartData.slice(-3).reduce((s, d) => s + d.hours, 0)
  const burnoutRisk = recentHours > 12 ? 'high' : recentHours > 8 ? 'medium' : 'low'
  const burnoutConfig = {
    high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'High Risk', msg: "You've been overworking! Take a break today.", icon: AlertTriangle },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Medium Risk', msg: 'Watch your study load. Make sure to rest.', icon: AlertTriangle },
    low: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Low Risk', msg: 'Great balance! Keep up the consistent work.', icon: CheckCircle },
  }
  const burnout = burnoutConfig[burnoutRisk]

  const productivityScore = Math.min(Math.round(
    (totalHours / 28) * 40 +
    (totalSessions / 21) * 30 +
    ((user?.streak || 0) / 7) * 30
  ), 100)

  const scoreColor = productivityScore >= 70 ? '#10b981' : productivityScore >= 40 ? '#f59e0b' : '#ef4444'
  const scoreLabel = productivityScore >= 70 ? 'Excellent' : productivityScore >= 40 ? 'Good' : 'Needs Work'

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

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
            <BarChart2 size={18} className="text-blue-400" />
            <span className="font-semibold">Analytics</span>
          </div>
        </div>
        <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
          {['week', 'month'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                period === p ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Clock, label: 'Total Hours', value: `${totalHours}h`, sub: 'this week', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: Zap, label: 'Sessions', value: totalSessions, sub: 'this week', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { icon: TrendingUp, label: 'Daily Average', value: `${avgHours}h`, sub: 'per day', color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { icon: Flame, label: 'Streak', value: `${user?.streak || 0}d`, sub: 'current', color: 'text-orange-400', bg: 'bg-orange-500/10' },
          ].map((stat, i) => (
            <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}
              className="bg-white/[0.03] border border-white/5 rounded-2xl p-5"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label} · {stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
            className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-6"
          >
            <h2 className="font-semibold mb-1">Study Hours</h2>
            <p className="text-xs text-gray-500 mb-6">Daily breakdown this week</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-6"
          >
            <h2 className="font-semibold mb-1">Subject Breakdown</h2>
            <p className="text-xs text-gray-500 mb-4">Time distribution</p>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={subjectChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {subjectChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {subjectChartData.map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-gray-400">{s.name}</span>
                  </div>
                  <span className="text-gray-500">{s.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CHARTS ROW 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}
            className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-6"
          >
            <h2 className="font-semibold mb-1">Best Study Times</h2>
            <p className="text-xs text-gray-500 mb-6">Your productivity by hour</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={bestTimeData}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="productivity" stroke="#8b5cf6" fill="url(#colorProd)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-3">
              🎯 Your peak productivity is at <span className="text-purple-400 font-medium">10:00 AM</span> — schedule hard subjects then!
            </p>
          </motion.div>

          <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center"
          >
            <h2 className="font-semibold mb-1 self-start">Productivity Score</h2>
            <p className="text-xs text-gray-500 mb-6 self-start">Based on hours, sessions & streak</p>
            <div className="relative w-36 h-36 mb-4">
              <svg width="144" height="144" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="72" cy="72" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <motion.circle
                  cx="72" cy="72" r="60"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - productivityScore / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{productivityScore}</span>
                <span className="text-xs text-gray-500">/ 100</span>
              </div>
            </div>
            <span className="text-sm font-semibold" style={{ color: scoreColor }}>{scoreLabel}</span>
            <p className="text-xs text-gray-500 text-center mt-1">
              {productivityScore >= 70 ? "You're crushing it! 🔥" : productivityScore >= 40 ? 'Keep pushing! 💪' : "Let's get back on track! 🎯"}
            </p>
          </motion.div>
        </div>

        {/* HEATMAP */}
        <motion.div custom={8} initial="hidden" animate="visible" variants={fadeUp}
          className="bg-white/[0.03] border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold">Study Heatmap</h2>
              <p className="text-xs text-gray-500">Last 12 weeks of activity</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Less</span>
              {['bg-white/5', 'bg-blue-500/20', 'bg-blue-500/40', 'bg-blue-500/60', 'bg-blue-500'].map(c => (
                <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
              ))}
              <span>More</span>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {heatmapChartData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${day.date}: ${day.hours}h`}
                    className={`w-3 h-3 rounded-sm ${getHeatColor(day.hours)} transition-all hover:ring-1 hover:ring-blue-400 cursor-pointer`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-gray-500">
            <span>📅 Active days: {heatmapChartData.flat().filter(d => d.hours > 0).length}</span>
            <span>⭐ Streak: {user?.streak || 0} days</span>
          </div>
        </motion.div>

        {/* BURNOUT DETECTOR */}
        <motion.div custom={9} initial="hidden" animate="visible" variants={fadeUp}
          className={`border rounded-2xl p-6 ${burnout.bg} ${burnout.border}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${burnout.bg} border ${burnout.border} flex items-center justify-center flex-shrink-0`}>
              <burnout.icon size={22} className={burnout.color} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold">Burnout Detection</h2>
                <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${burnout.bg} ${burnout.color} border ${burnout.border}`}>
                  {burnout.label}
                </span>
              </div>
              <p className={`text-sm ${burnout.color} mb-3`}>{burnout.msg}</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Hours last 3 days', value: `${recentHours}h` },
                  { label: 'Recommended max', value: '12h' },
                  { label: 'Recovery needed', value: burnoutRisk === 'high' ? '1 day' : burnoutRisk === 'medium' ? 'A break' : 'None' },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className={`font-semibold ${burnout.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* MONTHLY TREND */}
        <motion.div custom={10} initial="hidden" animate="visible" variants={fadeUp}
          className="bg-white/[0.03] border border-white/5 rounded-2xl p-6"
        >
          <h2 className="font-semibold mb-1">Monthly Trend</h2>
          <p className="text-xs text-gray-500 mb-6">Study hours over the past 6 months</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="hours" stroke="#10b981" fill="url(#colorMonthly)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </div>
  )
}