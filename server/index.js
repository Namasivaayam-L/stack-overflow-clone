import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import userRoutes from './routes/users.js'
import questionRoutes from './routes/Questions.js'
import answerRoutes from './routes/Answers.js'
import dotenv from 'dotenv'
import verification from './routes/verification.js'
import searchStackOverflow from './routes/searchStackOverflow.js'
import paymentRoutes from './routes/payment.js'
import cron from 'node-cron'
import helmet from 'helmet'
import updatePlans from './utilities/updatePlans.js'
import plans from './routes/Plans.js'
import postRoutes from './routes/post.routes.js'
import config from './config/config.js'

const app = express()

dotenv.config()
app.use(express.json({limit:'30mb',extended:true}))
app.use(express.urlencoded({ limit: '30mb', extended: true }))
app.use(cors())
app.use(helmet({
    crossOriginResourcePolicy: false,
  }));

mongoose.set('strictQuery', true)
app.get('/', (req, res) => {
    res.status(200).send("This is a stack overflow clone api")
    console.log('server fired up at port', PORT);
    console.log(req.protocol + '://' + req.get('host') + req.originalUrl)
})

app.use('/users',userRoutes)
app.use('/questions', questionRoutes)
app.use('/answer',answerRoutes)
app.use('/verify',verification)
app.use('/search',searchStackOverflow)
app.use('/payment', paymentRoutes);
app.use('/plans', plans)
app.use('/posts',postRoutes)
 
const PORT = process.env.PORT || 5000

cron.schedule('* 38 0 * * *', () => {
    console.log('Updating Plans', Date.now());
    updatePlans()
});
const DATABASE_URL = process.env.CONNECTION_URL || config.mongoUri
mongoose.connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => { console.log(`Server fired up on ${PORT} ${process.env.CONNECTION_URL|| config.mongoUri }`) }))
    .catch(err => console.log(err.message))