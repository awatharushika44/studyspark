const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/planner', require('./routes/planner'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/focus', require('./routes/focus'))
app.use('/api/analytics', require('./routes/analytics'))

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'StudySpark API is running 🚀' })
})

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    })
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err))