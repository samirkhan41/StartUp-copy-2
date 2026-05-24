import couponData from '../models/coupon.model.js'

export const validateCoupon = async (req, res) => {
    try {
        const { code, cartAmount } = req.body
        if (!code) {
            return res.status(400).json({ message: "Coupon code is required" })
        }

        const coupon = await couponData.findOne({ code: code.toUpperCase(), isActive: true })
        if (!coupon) {
            return res.status(404).json({ message: "Invalid or inactive coupon code" })
        }

        if (new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({ message: "Coupon code has expired" })
        }

        if (cartAmount && cartAmount < coupon.minCartAmount) {
            return res.status(400).json({ message: `Minimum purchase of ₹${coupon.minCartAmount} required for this coupon` })
        }

        return res.status(200).json({
            message: "Coupon validated successfully",
            coupon: {
                code: coupon.code,
                discountPercentage: coupon.discountPercentage,
                maxDiscount: coupon.maxDiscount,
                minCartAmount: coupon.minCartAmount || 0
            }
        })
    } catch (error) {
        return res.status(500).json({ message: `Coupon validation error: ${error.message}` })
    }
}

export const createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, maxDiscount, minCartAmount, expiryDate } = req.body
        if (!code || !discountPercentage || !maxDiscount || !expiryDate) {
            return res.status(400).json({ message: "Missing required coupon properties" })
        }

        const existing = await couponData.findOne({ code: code.toUpperCase() })
        if (existing) {
            return res.status(400).json({ message: "Coupon code already exists" })
        }

        const newCoupon = await couponData.create({
            code: code.toUpperCase(),
            discountPercentage,
            maxDiscount,
            minCartAmount: minCartAmount || 0,
            expiryDate: new Date(expiryDate)
        })

        return res.status(201).json({ message: "Coupon created successfully", coupon: newCoupon })
    } catch (error) {
        return res.status(500).json({ message: `Failed to create coupon: ${error.message}` })
    }
}

export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await couponData.find().sort({ createdAt: -1 })
        return res.status(200).json({ coupons })
    } catch (error) {
        return res.status(500).json({ message: `Failed to retrieve coupons: ${error.message}` })
    }
}

export const deleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.params
        await couponData.findByIdAndDelete(couponId)
        return res.status(200).json({ message: "Coupon deleted successfully" })
    } catch (error) {
        return res.status(500).json({ message: `Failed to delete coupon: ${error.message}` })
    }
}
