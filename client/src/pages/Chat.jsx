import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { chatAPI } from '../services/api'
import {
  ArrowLeft, Send, Sparkles, Loader2, Brain
} from 'lucide-react'

const quickPrompts = [
  'Best study techniques?',
  'How to stay focused?',
  'Reduce exam anxiety',
  'How to memorize better?',
  'Study schedule tips',
  'I keep procrastinating',
]

const formatMessage = (text) => {
  return text.split('\n').map((line, i) => {
    const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    return <p key={i} style={{ margin: '2px 0', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: formatted }} />
  })
}

export default function Chat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: "Hey! I'm your AI study assistant 🧠\n\nAsk me anything — study techniques, subject help, focus tips, or how to handle exam stress. I'm here to help you succeed!",
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: msg }])
    setLoading(true)

    try {
      const res = await chatAPI.sendMessage(msg)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: res.data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'ai',
        text: 'Sorry, something went wrong. Make sure the server is running and try again!'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-gray-950/80 backdrop-blur-md px-6 h-16 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            Dashboard
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-blue-400" />
            <span className="font-semibold">Study Assistant</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-gray-400">Online</span>
        </div>
      </nav>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">

        {/* Quick prompts - show only at start */}
        {messages.length === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-xs text-gray-500 mb-3 text-center">Quick questions to get started</p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickPrompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-2 rounded-full transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles size={14} className="text-blue-400" />
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-sm'
                    : 'bg-white/[0.05] border border-white/5 text-gray-200 rounded-tl-sm'
                }`}>
                  {msg.role === 'ai' ? formatMessage(msg.text) : msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-blue-400" />
              </div>
              <div className="bg-white/[0.05] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader2 size={14} className="text-gray-400 animate-spin" />
                <span className="text-xs text-gray-400">Thinking...</span>
              </div>
            </motion.div>
          )}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="border-t border-white/5 bg-gray-950/80 backdrop-blur-md px-6 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about studying..."
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>

    </div>
  )
}