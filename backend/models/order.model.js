import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userData',
        required: true
    },
    items: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        size: { type: String, required: true },
        image: { type: String }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    couponCode: {
        type: String,
        default: ''
    },
    shippingAddress: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: 'India' }
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Razorpay'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Cash on Delivery', 'Paid', 'Pending', 'Failed', 'Completed'],
        default: 'Pending'
    },
    razorpayOrderId: {
        type: String,
        default: ''
    },
    razorpayPaymentId: {
        type: String,
        default: ''
    },
    orderStatus: {
        type: String,
        enum: ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'],
        default: 'Placed'
    },
    trackingTimeline: [{
        status: { type: String, required: true },
        description: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true })

const orderData = mongoose.model('orderData', orderSchema)

export default orderData
