import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/happyThoughts'
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

mongoose.connection.once('open', () => {
  console.log('Connected to mongodb 🎉')
})

mongoose.connection.on('error', err => {
  console.error('connection error:', err)
})

const port = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(bodyParser.json())

// Setup model
const Thought = mongoose.model('Thought', {
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 120
  },
  hearts: {
    type: Number,
    require: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tag: {
    type: String
  }
})

// Setup routes
app.get('/', async (req, res) => {
  const thoughts = await Thought.find()
    .sort({ createdAt: 'desc' })
    .limit(20)
  res.json(thoughts)
})

app.post('/', async (req, res) => {
  const thought = new Thought({
    message: req.body.message,
    hearts: 0
  })
  try {
    const saved = await thought.save()
    res.status(201).json(saved)
  } catch (err) {
    res
      .status(400)
      .json({ message: 'could not save thought', errors: err.errors })
  }
})

app.post('/:id/like', async (req, res) => {
  try {
    const thought = await Thought.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { hearts: 1 } },
      { new: true }
    )
    res.json(thought)
  } catch (err) {
    res
      .status(400)
      .json({ message: 'coudl not update heart', errors: err.errors })
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
