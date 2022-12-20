import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import userRoutes from './routes/users.js'
import questionRoutes from './routes/Questions'
import answerRoutes from './routes/Answers'

const app = express()
app.use(express.json({limit:'30mb',extended:true}))
app.use(express.urlencoded({ limit: '30mb', extended: true }))
app.use(cors())
app.get('/', (req, res) => {
    res.send("This is a stack overflow clone api")
    console.log('server fired up at port', PORT);
    console.log(req.protocol + '://' + req.get('host') + req.originalUrl)
})
app.use('/user',userRoutes)
app.use('/questions',questionRoutes)
app.use('/answer',answerRoutes)

const PORT = process.env.PORT || 5000

// const CONNECTION_URL = 'mongodb+srv://NamachuStackOverflowClone:stackoverflow@cluster0.zaxrt3p.mongodb.net/?retryWrites=true&w=majority'
const CONNECTION_URL = 'mongodb+srv://Namasivaayam007:6383512055@cluster0.zaxrt3p.mongodb.net/stackoverflowclone?retryWrites=true&w=majority'

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => { console.log(`Server fired up on ${PORT}`) }))
    .catch(err => console.log(err.message))