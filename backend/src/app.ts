import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors, { CorsOptions } from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { rateLimit } from './middlewares/rate-limit'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(cookieParser())
app.use(rateLimit(120, 60_000))

const allowedOrigins = (process.env.ORIGIN_ALLOW || 'http://localhost:5173').split(',').map((origin) => origin.trim())
const corsOptions: CorsOptions = {
    credentials: true,
    origin: (origin, callback) => {
        if (!origin) return callback(null, 'http://localhost:5173')
        return callback(null, allowedOrigins.includes(origin) ? origin : false)
    },
}
app.use(cors(corsOptions))
// app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: false, limit: '50kb', parameterLimit: 50 }))
app.use(json({ limit: '50kb' }))

app.options('*', cors(corsOptions))
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
