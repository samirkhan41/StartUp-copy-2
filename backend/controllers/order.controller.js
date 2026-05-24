import orderData from '../models/order.model.js'
import Razorpay from 'razorpay'
import crypto from 'crypto'

// ─── COD Order Creation ───────────────────────────────────────
export const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, discountAmount, couponCode, shippingAddress, paymentMethod } = req.body
        const userId = req.userId

        if (!items || items.length === 0 || !totalAmount || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ message: "Missing required order fields" })
        }

        // This route only handles COD orders
        if (paymentMethod !== 'COD') {
            return res.status(400).json({ message: "This route only accepts COD orders. Use /razorpay/verify for online payments." })
        }

        const newOrder = await orderData.create({
            userId,
            items,
            totalAmount,
            discountAmount,
            couponCode,
            shippingAddress,
            paymentMethod: 'COD',
            paymentStatus: 'Cash on Delivery',
            orderStatus: 'Placed',
            trackingTimeline: [{
                status: 'Placed',
                description: 'Your order has been placed successfully. Payment will be collected on delivery.'
            }]
        })

        return res.status(201).json({ message: "Order placed successfully", order: newOrder })
    } catch (error) {
        return res.status(500).json({ message: `Order creation failed: ${error.message}` })
    }
}

// ─── Get User's Orders ────────────────────────────────────────
export const getMyOrders = async (req, res) => {
    try {
        const userId = req.userId
        const orders = await orderData.find({ userId }).sort({ createdAt: -1 })
        return res.status(200).json({ orders })
    } catch (error) {
        return res.status(500).json({ message: `Failed to fetch orders: ${error.message}` })
    }
}

// ─── Recent Orders (Public) ───────────────────────────────────
export const getRecentOrdersPublic = async (req, res) => {
    try {
        const orders = await orderData.find({}).sort({ createdAt: -1 }).limit(3)
        return res.status(200).json({ orders })
    } catch (error) {
        return res.status(500).json({ message: `Failed to fetch recent orders: ${error.message}` })
    }
}

// ─── Admin: Get All Orders ────────────────────────────────────
export const getAllOrdersAdmin = async (req, res) => {
    try {
        const orders = await orderData.find().populate('userId', 'name email').sort({ createdAt: -1 })
        return res.status(200).json({ orders })
    } catch (error) {
        return res.status(500).json({ message: `Admin failed to fetch orders: ${error.message}` })
    }
}

// ─── Admin: Update Order Status ───────────────────────────────
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, orderStatus } = req.body
        if (!orderId || !orderStatus) {
            return res.status(400).json({ message: "Order ID and status are required" })
        }

        const order = await orderData.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        let desc = ''
        switch (orderStatus) {
            case 'Packed':
                desc = 'Your items have been beautifully packed and prepared for pickup.'
                break
            case 'Shipped':
                desc = 'Your package is on its way via premium courier services.'
                break
            case 'Out for Delivery':
                desc = 'Our delivery specialist is bringing your order today.'
                break
            case 'Delivered':
                desc = 'Delivered! Thank you for shopping with us.'
                // For COD orders, mark payment as Paid upon delivery
                if (order.paymentMethod === 'COD' && order.paymentStatus === 'Cash on Delivery') {
                    order.paymentStatus = 'Paid'
                }
                break
            default:
                desc = `Order updated to ${orderStatus}.`
        }

        order.orderStatus = orderStatus
        order.trackingTimeline.push({
            status: orderStatus,
            description: desc
        })

        await order.save()
        return res.status(200).json({ message: "Order status updated", order })
    } catch (error) {
        return res.status(500).json({ message: `Failed to update status: ${error.message}` })
    }
}

// ─── Public: Track Order ──────────────────────────────────────
export const trackOrderPublic = async (req, res) => {
    try {
        const { orderId } = req.params
        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" })
        }

        let order = null
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderId)
        if (isObjectId) {
            order = await orderData.findById(orderId)
        } else {
            // Find by matching the suffix of stringified ObjectId
            const allOrders = await orderData.find({})
            order = allOrders.find(o => o._id.toString().toLowerCase().endsWith(orderId.toLowerCase()))
        }

        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }
        return res.status(200).json({ order })
    } catch (error) {
        return res.status(500).json({ message: `Failed to track order: ${error.message}` })
    }
}

// ─── Razorpay: Create Order ───────────────────────────────────
export const createRazorpayOrder = async (req, res) => {
    try {
        const { totalAmount } = req.body
        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ message: "Valid total amount is required" })
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ message: "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables." })
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const options = {
            amount: Math.round(totalAmount * 100), // Razorpay expects paise
            currency: "INR",
            receipt: `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}`
        }

        const rzpOrder = await razorpay.orders.create(options)
        return res.status(200).json({
            success: true,
            keyId: process.env.RAZORPAY_KEY_ID,
            rzpOrder
        })
    } catch (error) {
        console.error("Razorpay order creation failed:", error)
        return res.status(500).json({ message: `Razorpay order creation failed: ${error.message}` })
    }
}

// ─── Razorpay: Verify Payment & Place Order ───────────────────
export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderPayload
        } = req.body

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing Razorpay payment details" })
        }

        if (!orderPayload || !orderPayload.items || !orderPayload.totalAmount || !orderPayload.shippingAddress) {
            return res.status(400).json({ message: "Missing order payload details" })
        }

        // Verify signature using HMAC SHA256
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id)
        const generatedSignature = hmac.digest('hex')

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed. Invalid signature." })
        }

        // Signature valid — create the order
        const { items, totalAmount, discountAmount, couponCode, shippingAddress } = orderPayload
        const userId = req.userId

        const newOrder = await orderData.create({
            userId,
            items,
            totalAmount,
            discountAmount: discountAmount || 0,
            couponCode: couponCode || '',
            shippingAddress,
            paymentMethod: 'Razorpay',
            paymentStatus: 'Paid',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            orderStatus: 'Placed',
            trackingTimeline: [{
                status: 'Placed',
                description: `Order placed successfully. Payment verified via UPI. Payment ID: ${razorpay_payment_id}`
            }]
        })

        return res.status(201).json({ message: "Payment verified and order placed successfully", order: newOrder })
    } catch (error) {
        console.error("Razorpay payment verification failed:", error)
        return res.status(500).json({ message: `Payment verification failed: ${error.message}` })
    }
}
