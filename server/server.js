const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

// ========================================
// CORS
// ========================================

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {

      // Allow requests with no origin
      // Example: Postman or server-to-server requests
      if (!origin) {
        return callback(null, true)
      }

      // Allow localhost and production frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      console.log('❌ CORS blocked origin:', origin)

      return callback(new Error('Not allowed by CORS'))
    },

    credentials: true
  })
)

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json())

// ========================================
// ROUTES
// ========================================

app.use('/api/auth', require('./routes/auth'))
app.use('/api/planner', require('./routes/planner'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/focus', require('./routes/focus'))
app.use('/api/analytics', require('./routes/analytics'))

// ========================================
// HEALTH CHECK
// ========================================

app.get('/', (req, res) => {
  res.json({
    message: 'StudySpark API is running 🚀'
  })
})

// ========================================
// DATABASE + SERVER
// ========================================

const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err)
  })