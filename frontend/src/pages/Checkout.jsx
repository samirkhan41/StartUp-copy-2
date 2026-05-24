import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { cartDataContext } from '../context/CartContext'
import { authDataContext } from '../context/AuthContext'
import { ShoppingBag, ShieldCheck, MapPin, CheckCircle, Tag, Loader2, ArrowRight, Banknote, QrCode, AlertCircle, X } from 'lucide-react'

const Checkout = () => {
    const navigate = useNavigate()
    const { serverUrl } = useContext(authDataContext)
    const { cartItems, subtotal, discount, total, coupon, setCoupon, clearCart } = useContext(cartDataContext)

    const [step, setStep] = useState(1)
    const [couponCode, setCouponCode] = useState('')
    const [couponError, setCouponError] = useState('')
    const [couponSuccess, setCouponSuccess] = useState('')

    // Form inputs
    const [address, setAddress] = useState({
        name: '',
        email: '',
        phone: '',
        addressLine: '',
        city: '',
        postalCode: ''
    })

    const [paymentMethod, setPaymentMethod] = useState('COD')
    
    // Loading & status states
    const [loadingState, setLoadingState] = useState(null) // null | 'placing' | 'creating_payment' | 'verifying' | 'success'
    const [errorState, setErrorState] = useState(null) // null | { title, message }

    // ─── Load Razorpay SDK ────────────────────────────────────
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true)
                return
            }
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    // ─── Validate Address ─────────────────────────────────────
    const validateAddress = () => {
        if (!address.name || !address.email || !address.phone || !address.addressLine || !address.city || !address.postalCode) {
            setErrorState({ title: 'Incomplete Address', message: 'Please fill in all shipping address fields before proceeding.' })
            setStep(1)
            return false
        }
        return true
    }

    // ─── Place COD Order ──────────────────────────────────────
    const handlePlaceCODOrder = async () => {
        if (!validateAddress()) return

        setLoadingState('placing')
        setErrorState(null)

        try {
            const orderPayload = {
                items: cartItems.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size,
                    image: item.image
                })),
                totalAmount: total,
                discountAmount: discount,
                couponCode: coupon?.code || '',
                shippingAddress: address,
                paymentMethod: 'COD'
            }

            const res = await axios.post(`${serverUrl}/api/orders/create`, orderPayload, { withCredentials: true })
            
            clearCart()
            setLoadingState('success')

            localStorage.setItem('latestPlacedOrderId', res.data.order._id)
            const placedIds = JSON.parse(localStorage.getItem('placedOrderIds') || '[]')
            if (!placedIds.includes(res.data.order._id)) {
                placedIds.push(res.data.order._id)
                localStorage.setItem('placedOrderIds', JSON.stringify(placedIds))
            }

            setTimeout(() => {
                navigate(`/orders/track/${res.data.order._id}`)
            }, 1500)
        } catch (error) {
            console.error("COD order failed", error)
            setLoadingState(null)
            setErrorState({
                title: 'Order Failed',
                message: error.response?.data?.message || 'Failed to place order. Please make sure you are logged in and try again.'
            })
        }
    }

    // ─── Razorpay UPI Payment Flow ────────────────────────────
    const handleRazorpayPayment = async () => {
        if (!validateAddress()) return

        setLoadingState('creating_payment')
        setErrorState(null)

        try {
            // Step 1: Load Razorpay SDK
            const scriptLoaded = await loadRazorpayScript()
            if (!scriptLoaded) {
                setLoadingState(null)
                setErrorState({
                    title: 'SDK Load Failed',
                    message: 'Failed to load payment gateway. Please check your internet connection and try again.'
                })
                return
            }

            // Step 2: Create Razorpay order on backend
            const { data } = await axios.post(`${serverUrl}/api/orders/razorpay/create`, {
                totalAmount: total
            }, { withCredentials: true })

            if (!data.success || !data.rzpOrder) {
                setLoadingState(null)
                setErrorState({
                    title: 'Payment Setup Failed',
                    message: 'Could not create payment order. Please try again later.'
                })
                return
            }

            setLoadingState(null)

            // Step 3: Open Razorpay Checkout
            const orderPayload = {
                items: cartItems.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size,
                    image: item.image
                })),
                totalAmount: total,
                discountAmount: discount,
                couponCode: coupon?.code || '',
                shippingAddress: address
            }

            const options = {
                key: data.keyId,
                amount: data.rzpOrder.amount,
                currency: data.rzpOrder.currency,
                name: 'TeesX',
                description: `Order - ${cartItems.length} item(s)`,
                order_id: data.rzpOrder.id,
                prefill: {
                    name: address.name,
                    email: address.email,
                    contact: address.phone
                },
                theme: {
                    color: '#22c55e'
                },
                method: {
                    upi: true,
                    card: true,
                    netbanking: true,
                    wallet: true
                },
                handler: async function (response) {
                    // Payment successful — verify on backend
                    setLoadingState('verifying')
                    try {
                        const verifyRes = await axios.post(`${serverUrl}/api/orders/razorpay/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderPayload
                        }, { withCredentials: true })

                        clearCart()
                        setLoadingState('success')

                        localStorage.setItem('latestPlacedOrderId', verifyRes.data.order._id)
                        const placedIds = JSON.parse(localStorage.getItem('placedOrderIds') || '[]')
                        if (!placedIds.includes(verifyRes.data.order._id)) {
                            placedIds.push(verifyRes.data.order._id)
                            localStorage.setItem('placedOrderIds', JSON.stringify(placedIds))
                        }

                        setTimeout(() => {
                            navigate(`/orders/track/${verifyRes.data.order._id}`)
                        }, 1500)
                    } catch (verifyError) {
                        console.error("Payment verification failed", verifyError)
                        setLoadingState(null)
                        setErrorState({
                            title: 'Verification Failed',
                            message: 'Payment was received but verification failed. Please contact support with your payment reference.'
                        })
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoadingState(null)
                        setErrorState({
                            title: 'Payment Cancelled',
                            message: 'You closed the payment window. Your order has not been placed. You can try again.'
                        })
                    },
                    escape: true,
                    confirm_close: true
                }
            }

            const razorpayInstance = new window.Razorpay(options)
            
            razorpayInstance.on('payment.failed', function (response) {
                setLoadingState(null)
                const errorDesc = response.error?.description || 'Payment could not be processed.'
                const errorReason = response.error?.reason || 'Unknown error'
                setErrorState({
                    title: 'Payment Failed',
                    message: `${errorDesc} (Reason: ${errorReason}). Please try again.`
                })
            })

            razorpayInstance.open()

        } catch (error) {
            console.error("Razorpay payment failed", error)
            setLoadingState(null)
            if (error.code === 'ERR_NETWORK') {
                setErrorState({
                    title: 'Network Error',
                    message: 'Unable to connect to the payment server. Please check your internet connection.'
                })
            } else {
                setErrorState({
                    title: 'Payment Error',
                    message: error.response?.data?.message || 'Something went wrong with the payment. Please try again.'
                })
            }
        }
    }

    // ─── Handle Complete Purchase ─────────────────────────────
    const handleCompletePurchase = () => {
        if (paymentMethod === 'COD') {
            handlePlaceCODOrder()
        } else {
            handleRazorpayPayment()
        }
    }

    // ─── Coupon Verification ──────────────────────────────────
    const handleVerifyCoupon = async () => {
        if (!couponCode) return
        setCouponError('')
        setCouponSuccess('')
        try {
            const res = await axios.post(`${serverUrl}/api/coupons/validate`, {
                code: couponCode,
                cartAmount: subtotal
            }, { withCredentials: true })

            setCoupon(res.data.coupon)
            setCouponSuccess(`Coupon approved! ${res.data.coupon.discountPercentage}% Discount applied!`)
        } catch (error) {
            setCouponError(error.response?.data?.message || "Invalid coupon code")
            setCoupon(null)
        }
    }

    // ─── Loading State Overlay ────────────────────────────────
    const loadingMessages = {
        placing: { text: 'Placing your order...', sub: 'Registering order in our system.' },
        creating_payment: { text: 'Setting up payment...', sub: 'Creating a secure payment session.' },
        verifying: { text: 'Verifying payment...', sub: 'Confirming transaction with payment gateway.' },
        success: { text: 'Order placed successfully!', sub: 'Redirecting to your order tracking page.' }
    }

    // ─── Empty Cart View ──────────────────────────────────────
    if (cartItems.length === 0 && loadingState !== 'success') {
        return (
            <div className="min-h-screen bg-[#02060d] text-white flex flex-col items-center justify-center p-6 font-sans">
                <ShoppingBag size={64} className="text-green-500/20 mb-4 animate-bounce" />
                <h2 className="text-2xl font-black italic uppercase tracking-wider mb-2">Cart is Empty</h2>
                <p className="text-gray-400 mb-6">Choose a premium t-shirt first to checkout!</p>
                <button onClick={() => navigate('/jersey')} className="bg-green-500 text-black px-6 py-3 rounded-xl font-bold">
                    Browse Catalog
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#02060d] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            
            {/* ─── Full-Screen Loading / Success Overlay ─────── */}
            <AnimatePresence>
                {loadingState && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#02060d]/95 backdrop-blur-md z-[99999] flex flex-col items-center justify-center p-6"
                    >
                        {loadingState === 'success' ? (
                            <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                className="flex flex-col items-center text-center space-y-4"
                            >
                                <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                                    <CheckCircle size={40} className="text-green-400" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-wider text-green-400">
                                    {loadingMessages.success.text}
                                </h3>
                                <p className="text-sm text-gray-400">{loadingMessages.success.sub}</p>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center text-center space-y-4">
                                <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                                <h3 className="text-lg font-black uppercase tracking-wider text-white">
                                    {loadingMessages[loadingState]?.text}
                                </h3>
                                <p className="text-xs text-gray-400 max-w-xs">
                                    {loadingMessages[loadingState]?.sub}
                                </p>
                                <p className="text-[10px] text-gray-600 mt-2">Please do not close this page.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Error Toast ──────────────────────────────── */}
            <AnimatePresence>
                {errorState && (
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[99998] w-full max-w-md px-4"
                    >
                        <div className="bg-red-950/90 border border-red-500/30 rounded-2xl p-4 backdrop-blur-md shadow-2xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-red-300">{errorState.title}</p>
                                    <p className="text-xs text-red-400/80 mt-1">{errorState.message}</p>
                                </div>
                                <button onClick={() => setErrorState(null)} className="text-red-400/60 hover:text-red-300 transition">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
                
                {/* ─── Checkout Wizard ──────────────────────── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Step indicator */}
                    <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-xs">
                        {['Shipping', 'Payment', 'Review'].map((label, idx) => {
                            const stepNum = idx + 1
                            const isCompleted = stepNum < step
                            const isActive = stepNum === step
                            return (
                                <div key={label} className="flex items-center gap-2">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                                        isCompleted ? 'bg-green-500 text-black' : isActive ? 'bg-green-500/20 border border-green-500 text-green-400' : 'bg-white/5 border border-white/10 text-gray-500'
                                    }`}>
                                        {isCompleted ? <CheckCircle size={14} /> : stepNum}
                                    </span>
                                    <span className={isActive ? 'text-green-400 font-bold' : isCompleted ? 'text-white' : 'text-gray-500'}>{label}</span>
                                </div>
                            )
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        {/* ─── Step 1: Shipping ────────────────── */}
                        {step === 1 && (
                            <motion.div
                                key="step-shipping"
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                className="bg-[#050b14] border border-white/5 rounded-3xl p-6 space-y-4"
                            >
                                <h3 className="font-bold text-lg flex items-center gap-2 mb-2 text-green-400 uppercase italic">
                                    <MapPin size={18} /> Shipping Information
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={address.name}
                                            onChange={e => setAddress({ ...address, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={address.email}
                                            onChange={e => setAddress({ ...address, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            placeholder="+91 9876543210"
                                            value={address.phone}
                                            onChange={e => setAddress({ ...address, phone: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Address Line</label>
                                        <input
                                            type="text"
                                            placeholder="123 Main St, Block B"
                                            value={address.addressLine}
                                            onChange={e => setAddress({ ...address, addressLine: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">City</label>
                                        <input
                                            type="text"
                                            placeholder="Mumbai"
                                            value={address.city}
                                            onChange={e => setAddress({ ...address, city: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Postal Code</label>
                                        <input
                                            type="text"
                                            placeholder="400001"
                                            value={address.postalCode}
                                            onChange={e => setAddress({ ...address, postalCode: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (validateAddress()) setStep(2)
                                    }}
                                    className="w-full bg-green-500 text-black py-4 rounded-xl font-black mt-4 uppercase hover:bg-green-400 transition"
                                >
                                    Proceed to Payment
                                </button>
                            </motion.div>
                        )}

                        {/* ─── Step 2: Payment Method ──────────── */}
                        {step === 2 && (
                            <motion.div
                                key="step-payment"
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                className="bg-[#050b14] border border-white/5 rounded-3xl p-6 space-y-6"
                            >
                                <h3 className="font-bold text-lg flex items-center gap-2 mb-2 text-green-400 uppercase italic">
                                    <ShieldCheck size={18} /> Select Payment Method
                                </h3>

                                <div className="grid gap-4">
                                    {/* COD Option */}
                                    <div
                                        onClick={() => setPaymentMethod('COD')}
                                        className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                                            paymentMethod === 'COD'
                                                ? 'border-green-500 bg-green-500/5 shadow-lg shadow-green-500/5'
                                                : 'border-white/5 bg-white/[0.01] hover:border-white/15 hover:bg-white/[0.02]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                paymentMethod === 'COD' ? 'border-green-500' : 'border-gray-600'
                                            }`}>
                                                {paymentMethod === 'COD' && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="w-2.5 h-2.5 rounded-full bg-green-500"
                                                    />
                                                )}
                                            </div>
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                                paymentMethod === 'COD' ? 'bg-green-500/10' : 'bg-white/5'
                                            }`}>
                                                <Banknote size={22} className={paymentMethod === 'COD' ? 'text-green-400' : 'text-gray-400'} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-white">Cash on Delivery</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Pay with cash when your order arrives at your doorstep. No extra charges.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* UPI / Razorpay Option */}
                                    <div
                                        onClick={() => setPaymentMethod('Razorpay')}
                                        className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                                            paymentMethod === 'Razorpay'
                                                ? 'border-green-500 bg-green-500/5 shadow-lg shadow-green-500/5'
                                                : 'border-white/5 bg-white/[0.01] hover:border-white/15 hover:bg-white/[0.02]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                paymentMethod === 'Razorpay' ? 'border-green-500' : 'border-gray-600'
                                            }`}>
                                                {paymentMethod === 'Razorpay' && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="w-2.5 h-2.5 rounded-full bg-green-500"
                                                    />
                                                )}
                                            </div>
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                                paymentMethod === 'Razorpay' ? 'bg-green-500/10' : 'bg-white/5'
                                            }`}>
                                                <QrCode size={22} className={paymentMethod === 'Razorpay' ? 'text-green-400' : 'text-gray-400'} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-white">UPI / Online Payment</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Pay instantly via UPI QR, GPay, PhonePe, Paytm, cards, or netbanking.</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'Razorpay' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-4 ml-9 pl-4 border-l-2 border-green-500/20"
                                            >
                                                <div className="flex items-center gap-2 text-[10px] text-green-400 font-bold uppercase tracking-wider">
                                                    <ShieldCheck size={12} />
                                                    Secured by Razorpay
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-1">
                                                    You'll be redirected to a secure payment page. Your payment details are never stored on our servers.
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl font-bold uppercase text-xs transition">
                                        Back
                                    </button>
                                    <button onClick={() => setStep(3)} className="flex-1 bg-green-500 text-black py-4 rounded-xl font-black uppercase text-xs hover:bg-green-400 transition">
                                        Final Review
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ─── Step 3: Review & Confirm ────────── */}
                        {step === 3 && (
                            <motion.div
                                key="step-review"
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                className="bg-[#050b14] border border-white/5 rounded-3xl p-6 space-y-4"
                            >
                                <h3 className="font-bold text-lg text-green-400 uppercase italic mb-2">Final Confirmation</h3>
                                
                                {/* Address Review */}
                                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-2 text-xs text-gray-400">
                                    <p className="font-bold text-white mb-2 uppercase tracking-wide">Shipping Address</p>
                                    <p><span className="text-gray-500">Name:</span> {address.name}</p>
                                    <p><span className="text-gray-500">Email:</span> {address.email}</p>
                                    <p><span className="text-gray-500">Address:</span> {address.addressLine}, {address.city}, {address.postalCode}</p>
                                    <p><span className="text-gray-500">Phone:</span> {address.phone}</p>
                                </div>

                                {/* Payment Method Review */}
                                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 text-xs">
                                    <p className="font-bold text-white mb-2 uppercase tracking-wide">Payment Method</p>
                                    <div className="flex items-center gap-3">
                                        {paymentMethod === 'COD' ? (
                                            <>
                                                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                                    <Banknote size={18} className="text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-amber-400 font-bold uppercase tracking-wider">Cash on Delivery</p>
                                                    <p className="text-gray-500 text-[10px]">Pay ₹{total} when your order arrives</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                    <QrCode size={18} className="text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-green-400 font-bold uppercase tracking-wider">UPI / Online Payment</p>
                                                    <p className="text-gray-500 text-[10px]">Pay ₹{total} securely via Razorpay</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setStep(2)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl font-bold uppercase text-xs transition">
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCompletePurchase}
                                        disabled={!!loadingState}
                                        className="flex-1 bg-green-500 text-black py-4 rounded-xl font-black uppercase text-xs hover:bg-green-400 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'} <ArrowRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ─── Right Side: Order Summary & Coupons ──── */}
                <div className="space-y-6">
                    <div className="bg-[#050b14] border border-white/5 rounded-3xl p-6 shadow-xl">
                        <h3 className="font-bold text-sm tracking-wider uppercase text-green-400 italic mb-4">Cart Summary</h3>
                        
                        <div className="space-y-4 max-h-[220px] overflow-y-auto mb-4 border-b border-white/5 pb-4">
                            {cartItems.map((item, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-green-400 text-xs font-bold font-mono border border-white/10">
                                        {item.size}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-xs truncate text-white">{item.name}</p>
                                        <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="text-xs font-bold text-white">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 text-xs border-b border-white/5 pb-4 mb-4 text-gray-400">
                            <div className="flex justify-between">
                                <span>Cart Subtotal:</span>
                                <span className="text-white">₹{subtotal}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-emerald-400">
                                    <span>Applied Coupon discount:</span>
                                    <span>-₹{discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-white/5 pt-2 font-bold text-sm text-white">
                                <span>Total Payable:</span>
                                <span className="text-green-400">₹{total}</span>
                            </div>
                        </div>

                        {/* Apply Coupon */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Promo Coupon Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g. CHAMP50"
                                    value={couponCode}
                                    onChange={e => setCouponCode(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs uppercase text-white outline-none focus:border-green-500 transition-colors"
                                />
                                <button
                                    onClick={handleVerifyCoupon}
                                    className="bg-white/10 hover:bg-white/15 px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 transition"
                                >
                                    <Tag size={12} /> Apply
                                </button>
                            </div>
                            {couponError && <p className="text-[10px] text-red-400">{couponError}</p>}
                            {couponSuccess && <p className="text-[10px] text-green-400 flex items-center gap-1"><ShieldCheck size={10} /> {couponSuccess}</p>}
                            
                            <div className="mt-4 p-3 bg-green-500/5 border border-green-500/10 rounded-xl text-[9px] text-gray-400">
                                <span className="text-green-400 font-bold uppercase block mb-0.5">Quick Coupons</span>
                                Try <span className="text-white font-bold">CHAMP20</span> (20% off) or <span className="text-white font-bold">FOOTYFIT50</span> (50% off)!
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Checkout
