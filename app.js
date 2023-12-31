const express = require('express')
const cors = require('cors')
const userRouter = require('./routes/users')
const loginRouter = require('./routes/login')
const notesRouter = require('./routes/notes')
const searchRouter = require('./routes/search')
const likeRouter = require('./routes/like')
const config = require('./utils/config')
const middleware = require('./utils/middleware')


const app = express()


const mongoose = require('mongoose')
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Failed to connect to MongoDB', err))


app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.getTokenFrom)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)
app.use('/api/notes', notesRouter)
app.use('/api/search', searchRouter)
app.use('/api/notes/like', likeRouter)

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
