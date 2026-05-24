import express from 'express'
import { 
    createOrder, 
    getMyOrders, 
    getRecentOrdersPublic,
    getAllOrdersAdmin, 
    updateOrderStatus, 
    trackOrderPublic,
    createRazorpayOrder,
    verifyRazorpayPayment
} from '../controllers/order.controller.js'
import isAuth from '../middleware/isAuth.js'
import adminAuth from '../middleware/adminAuth.js'

const orderRouter = express.Router()

orderRouter.post('/create', isAuth, createOrder)
orderRouter.post('/razorpay/create', isAuth, createRazorpayOrder)
orderRouter.post('/razorpay/verify', isAuth, verifyRazorpayPayment)
orderRouter.get('/myorders', isAuth, getMyOrders)
orderRouter.get('/recent', getRecentOrdersPublic)
orderRouter.get('/track/:orderId', trackOrderPublic)
orderRouter.get('/admin/all', adminAuth, getAllOrdersAdmin)
orderRouter.post('/admin/status', adminAuth, updateOrderStatus)

export default orderRouter
