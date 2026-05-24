import express from 'express'
import { validateCoupon, createCoupon, getAllCoupons, deleteCoupon } from '../controllers/coupon.controller.js'
import isAuth from '../middleware/isAuth.js'
import adminAuth from '../middleware/adminAuth.js'

const couponRouter = express.Router()

couponRouter.post('/validate', isAuth, validateCoupon)
couponRouter.post('/admin/create', adminAuth, createCoupon)
couponRouter.get('/admin/all', adminAuth, getAllCoupons)
couponRouter.delete('/admin/:couponId', adminAuth, deleteCoupon)

export default couponRouter
