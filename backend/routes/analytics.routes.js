import express from 'express'
import { getAdminAnalytics } from '../controllers/analytics.controller.js'
import adminAuth from '../middleware/adminAuth.js'

const analyticsRouter = express.Router()

analyticsRouter.get('/admin', adminAuth, getAdminAnalytics)

export default analyticsRouter
