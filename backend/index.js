import express from 'express'
import dotenv from 'dotenv'
import dbConnect from './config/db.js'
import cors from 'cors'
import authRouter from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/user.routes.js'
import orderRouter from './routes/order.routes.js'
import couponRouter from './routes/coupon.routes.js'
import reviewRouter from './routes/review.routes.js'
import analyticsRouter from './routes/analytics.routes.js'
import productRouter from './routes/product.routes.js'

dotenv.config()

const port = process.env.PORT 
const app = express()
app.use(express.json())
app.use(cookieParser())

// Build CORS origins from env (comma-separated) + localhost defaults
const defaultOrigins = [
  "https://startup-copy-2-frontend.onrender.com",
  "https://startup-copy-2-admin.onrender.com"
]
const envOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(',').map(url => url.trim()).filter(Boolean)
  : []
const allowedOrigins = [...defaultOrigins, ...envOrigins]

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use("/api/auth",authRouter)
app.use("/api/user",userRoutes)
app.use("/api/orders", orderRouter)
app.use("/api/coupons", couponRouter)
app.use("/api/reviews", reviewRouter)
app.use("/api/analytics", analyticsRouter)
app.use("/api/products", productRouter)


app.listen(port, async() => {

  console.log(`Server started at ${port}`)
 await dbConnect()
})
