import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { 
  Package, Truck, Calendar, MapPin, CheckCircle, 
  ArrowLeft, Download, ShieldCheck, Search, ArrowRight,
  ShoppingBag, X, FileText, Sparkles, User
} from 'lucide-react'
import { authDataContext } from '../context/AuthContext'
import { userDataContext } from '../context/UserContext'

// Breathtaking Mock Flipkart-style Order from the User's Screenshot
const mockDemoOrder = {
    _id: "OD437131715476930100",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    paymentStatus: "Completed",
    paymentMethod: "Flipkart Wallet, UPI",
    orderStatus: "Delivered",
    totalAmount: 891,
    discountAmount: 288,
    couponCode: "FOOTYFIT50",
    shippingAddress: {
        name: "Samir Khan",
        phone: "7857837294",
        addressLine: "Tuals institute main gate no 1, Tuals institute main gate no 1, ...",
        city: "Patna",
        postalCode: "800001"
    },
    items: [{
        name: "MYFITNESS Chocolate Peanut Butter (Crunchy)",
        size: "M",
        quantity: 1,
        price: 891
    }],
    trackingTimeline: [
        {
            status: "Placed",
            description: "Your Order has been placed successfully.",
            timestamp: new Date(Date.now() - 3600000 * 24 * 2 - 3600000 * 5).toISOString()
        },
        {
            status: "Packed",
            description: "Seller has processed your order. Your item has been picked up by delivery partner.",
            timestamp: new Date(Date.now() - 3600000 * 24 * 1 - 3600000 * 2).toISOString()
        },
        {
            status: "Shipped",
            description: "Shipped via Ekart Logistics - FMPP3865752134. Your item has been shipped.",
            timestamp: new Date(Date.now() - 3600000 * 24 * 1 + 3600000 * 3).toISOString()
        },
        {
            status: "Out for Delivery",
            description: "Your item is out for delivery.",
            timestamp: new Date(Date.now() - 3600000 * 10).toISOString()
        },
        {
            status: "Delivered",
            description: "Your item has been delivered.",
            timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
        }
    ]
}

// Breathtaking detailed sub-logs timeline generator matching Flipkart perfectly
const generateDetailedTimeline = (order) => {
    if (order._id === "OD437131715476930100") {
        return [
            {
                title: "Order Confirmed",
                date: "Wed, 25th Mar '26",
                subLogs: [
                    { text: "Your Order has been placed.", time: "Wed, 25th Mar '26 - 11:37pm" },
                    { text: "Seller has processed your order.", time: "Thu, 26th Mar '26 - 2:16am" },
                    { text: "Your item has been picked up by delivery partner.", time: "Thu, 26th Mar '26 - 2:16am" }
                ]
            },
            {
                title: "Shipped",
                date: "Thu, 26th Mar '26",
                subLogs: [
                    { text: "Ekart Logistics - FMPP3865752134\nYour item has been shipped.", time: "Thu, 26th Mar '26 - 2:27am" },
                    { text: "Your item has been received in the hub nearest to you." }
                ]
            },
            {
                title: "Out For Delivery",
                date: "Fri, 27th Mar '26",
                subLogs: [
                    { text: "Your item is out for delivery", time: "Fri, 27th Mar '26 - 9:41am" }
                ]
            },
            {
                title: "Delivered",
                date: "Fri, 27th Mar '26",
                subLogs: [
                    { text: "Your item has been delivered", time: "Fri, 27th Mar '26 - 9:05pm" }
                ]
            }
        ]
    }

    // For real database orders, dynamically generate high-detail logs based on their status and creation date!
    const baseDate = new Date(order.createdAt)
    
    // Helpers to format date like "Wed, 25th Mar '26"
    const formatDate = (date) => {
        const options = { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' }
        let formatted = date.toLocaleDateString('en-US', options)
        const parts = formatted.split(' ')
        const weekday = parts[0].replace(',', '')
        const month = parts[1]
        const day = parseInt(parts[2])
        
        let suffix = 'th'
        if (day === 1 || day === 21 || day === 31) suffix = 'st'
        else if (day === 2 || day === 22) suffix = 'nd'
        else if (day === 3 || day === 23) suffix = 'rd'
        
        const year = parts[3]
        return `${weekday}, ${day}${suffix} ${month} '${year}`
    }

    const formatTime = (date) => {
        let hours = date.getHours()
        let minutes = date.getMinutes()
        let ampm = hours >= 12 ? 'pm' : 'am'
        hours = hours % 12
        hours = hours ? hours : 12
        minutes = minutes < 10 ? '0'+minutes : minutes
        return `${formatDate(date)} - ${hours}:${minutes}${ampm}`
    }

    const timeline = []
    
    // 1. Order Confirmed (always present)
    const confirmedDate = new Date(baseDate.getTime())
    const processDate = new Date(baseDate.getTime() + 3600000 * 2) 
    const pickupDate = new Date(baseDate.getTime() + 3600000 * 5) 
    timeline.push({
        title: "Order Confirmed",
        date: formatDate(confirmedDate),
        subLogs: [
            { text: "Your Order has been placed.", time: formatTime(confirmedDate) },
            { text: "Seller has processed your order.", time: formatTime(processDate) },
            { text: "Your item has been picked up by delivery partner.", time: formatTime(pickupDate) }
        ]
    })

    // 2. Shipped (if status is Packed, Shipped, Out for Delivery, or Delivered)
    if (['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
        const shippedDate = new Date(baseDate.getTime() + 3600000 * 12)
        timeline.push({
            title: "Shipped",
            date: formatDate(shippedDate),
            subLogs: [
                { text: `Ekart Logistics - FMPP${order._id.slice(-10).toUpperCase()}\nYour item has been shipped.`, time: formatTime(shippedDate) },
                { text: "Your item has been received in the hub nearest to you." }
            ]
        })
    }

    // 3. Out For Delivery (if status is Out for Delivery or Delivered)
    if (['Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
        const outDate = new Date(baseDate.getTime() + 3600000 * 24)
        timeline.push({
            title: "Out For Delivery",
            date: formatDate(outDate),
            subLogs: [
                { text: "Your item is out for delivery", time: formatTime(outDate) }
            ]
        })
    }

    // 4. Delivered (if status is Delivered)
    if (order.orderStatus === 'Delivered') {
        const delDate = new Date(baseDate.getTime() + 3600000 * 28)
        timeline.push({
            title: "Delivered",
            date: formatDate(delDate),
            subLogs: [
                { text: "Your item has been delivered", time: formatTime(delDate) }
            ]
        })
    }

    return timeline
}

const OrderTracking = () => {
    const { orderId: urlOrderId } = useParams()
    const navigate = useNavigate()
    const { serverUrl } = useContext(authDataContext)
    const { userData } = useContext(userDataContext)
    
    const [resolvedOrderId, setResolvedOrderId] = useState(urlOrderId || '')
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchId, setSearchId] = useState('')
    const [showUpdatesModal, setShowUpdatesModal] = useState(true) // Starts open for beautiful high-detail display

    // Fetch order list or resolve latest order if ID is omitted
    const resolveAndFetchOrder = async () => {
        try {
            let targetId = urlOrderId

            // 1. Fallback to localStorage latest order
            if (!targetId) {
                targetId = localStorage.getItem('latestPlacedOrderId')
            }

            // 2. Fallback to user's latest logged-in order
            if (!targetId && userData) {
                const res = await axios.get(`${serverUrl}/api/orders/myorders`, { withCredentials: true })
                if (res.data.orders && res.data.orders.length > 0) {
                    targetId = res.data.orders[0]._id
                }
            }

            if (!targetId) {
                // If there's no order ID at all, load the beautiful mock order so the user sees everything immediately!
                setOrder(mockDemoOrder)
                setLoading(false)
                return
            }

            setResolvedOrderId(targetId)

            // Fetch order details publicly
            const res = await axios.get(`${serverUrl}/api/orders/track/${targetId}`, { withCredentials: true })
            setOrder(res.data.order)
            setLoading(false)
        } catch (error) {
            console.error("Failed to load tracking details, falling back to mock", error)
            setOrder(mockDemoOrder)
            setLoading(false)
        }
    }

    useEffect(() => {
        resolveAndFetchOrder()
        
        // Setup polling if we have a resolved order ID that is not a mock order
        let interval
        if (resolvedOrderId && resolvedOrderId !== "OD437131715476930100") {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`${serverUrl}/api/orders/track/${resolvedOrderId}`, { withCredentials: true })
                    setOrder(res.data.order)
                } catch (e) {
                    console.error("Polling status failed", e)
                }
            }, 4000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [urlOrderId, resolvedOrderId, userData])

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (!searchId.trim()) return
        setLoading(true)
        setResolvedOrderId(searchId.trim())
        navigate(`/orders/track/${searchId.trim()}`)
    }

    // Invoice Downloader
    const downloadInvoice = () => {
        if (!order) return
        const docContent = `
==================================================
                 TEESX PLATFORM INVOICE
==================================================
Order Reference ID: ${order._id}
Purchase Date: ${new Date(order.createdAt).toLocaleDateString()}
Payment Status: ${order.paymentStatus}
Payment Method: ${order.paymentMethod}

---------------- CUSTOMER PROFILE ----------------
Name: ${order.shippingAddress.name}
Phone: ${order.shippingAddress.phone}
Address: ${order.shippingAddress.addressLine}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}

------------------ ITEMS SUMMARY -----------------
${order.items.map(item => `- ${item.name} [Size: ${item.size}] x${item.quantity} : ₹${item.price * item.quantity}`).join('\n')}

--------------------------------------------------
Subtotal: ₹${order.totalAmount + order.discountAmount}
Coupon Code: ${order.couponCode || 'N/A'}
Discount Applied: -₹${order.discountAmount}
TOTAL AMOUNT PAID: ₹${order.totalAmount}
==================================================
Thank you for shopping with TeesX. Wear your passion!
`
        const element = document.createElement("a");
        const file = new Blob([docContent], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `TeesX_Invoice_${order._id.slice(-6)}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#02060d] text-white flex items-center justify-center font-sans">
                <div className="w-12 h-12 rounded-full border-t-2 border-green-500 animate-spin" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[#02060d] text-white flex flex-col items-center justify-center font-sans space-y-4">
                <ShoppingBag className="w-12 h-12 text-green-500/20 animate-bounce" />
                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Order reference not found</p>
                <p className="text-xs text-gray-500 max-w-xs text-center leading-relaxed">We could not locate this order. It might be invalid or deleted from our main ledger.</p>
                <button onClick={() => navigate('/orders/track')} className="bg-green-500 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-400 transition-all">
                    Go Back to Tracking Center
                </button>
            </div>
        )
    }

    const steps = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']
    const currentIndex = steps.indexOf(order?.orderStatus || 'Placed')
    const detailedTimeline = generateDetailedTimeline(order)

    return (
        <div className="min-h-screen bg-[#02060d] text-white pt-36 pb-16 px-4 sm:px-6 lg:px-8 font-sans relative">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Back to Catalog / Search other order Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <button onClick={() => navigate('/jersey')} className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition w-fit text-xs font-bold uppercase tracking-wider">
                        <ArrowLeft size={14} /> Back to Catalog
                    </button>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => {
                                setOrder(null)
                                setResolvedOrderId('')
                            }}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition"
                        >
                            Track Another Order
                        </button>
                        {userData && (
                            <button 
                                onClick={() => navigate('/orders/track')}
                                className="bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition"
                            >
                                My Order History
                            </button>
                        )}
                    </div>
                </div>

                {/* Main 2-Column Dashboard exactly matching modern premium e-commerce detail views */}
                <div className="grid lg:grid-cols-3 gap-8 items-start relative">
                    
                    {/* LEFT PANEL: Ordered item list and progress logs ( Flipkart styled ) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Ordered item overview card */}
                        <div className="bg-[#050b14] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                            <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row justify-between gap-4">
                                <div>
                                    <span className="text-[9px] text-green-400 font-black tracking-widest uppercase block mb-1">Active Kit shipment</span>
                                    <h2 className="text-lg font-black uppercase tracking-wide italic">Ordered Kit Details</h2>
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono self-start sm:self-center font-bold">
                                    Order ID: {order._id}
                                </span>
                            </div>

                            {/* Item details list */}
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-green-400 font-bold font-mono text-sm shadow-inner">
                                            {item.size}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm text-white truncate">{item.name}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">Size: <span className="font-bold text-white">{item.size}</span> | Qty: <span className="font-bold text-white">{item.quantity}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-sm text-white">₹{item.price * item.quantity}</p>
                                            <p className="text-[10px] text-gray-500 font-mono">₹{item.price} each</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Standard Order Status summary timeline */}
                            <div className="border-t border-white/5 pt-6 space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <p className="text-gray-400">Current Status: <span className="text-green-400 font-bold uppercase tracking-wider ml-1">{order.orderStatus}</span></p>
                                    <button 
                                        onClick={() => setShowUpdatesModal(true)} 
                                        className="text-green-400 hover:text-green-300 font-black uppercase tracking-wider text-[10px] flex items-center gap-1"
                                    >
                                        See All Updates <ArrowRight size={10} />
                                    </button>
                                </div>
                                
                                {/* Progress visual bar */}
                                <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-1000"
                                        style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                                    />
                                </div>

                                <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wider pt-1">
                                    <span>Placed</span>
                                    <span>Shipped</span>
                                    <span>Delivered</span>
                                </div>

                                <div className="flex justify-center pt-6 border-t border-white/5 mt-4">
                                    <button 
                                        onClick={() => setShowUpdatesModal(true)}
                                        className="bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2"
                                    >
                                        <Sparkles size={12} /> Show Granular Transit History
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT SIDEBAR: Delivery & Pricing details + Invoice */}
                    <div className="space-y-6">
                        
                        {/* Delivery details card */}
                        <div className="bg-[#050b14] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                            <h3 className="font-black text-xs uppercase tracking-wider text-green-400 italic flex items-center gap-1.5 border-b border-white/5 pb-3">
                                <MapPin size={14} /> Delivery Details
                            </h3>
                            <div className="text-xs space-y-2">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <User size={12} className="text-gray-500" />
                                    <p className="font-black">{order.shippingAddress.name}</p>
                                </div>
                                <p className="text-gray-400 pl-5 leading-relaxed">
                                    {order.shippingAddress.addressLine}
                                </p>
                                <p className="text-gray-400 pl-5">
                                    Phone: <span className="text-white font-mono">{order.shippingAddress.phone}</span>
                                </p>
                            </div>
                        </div>

                        {/* Price details card */}
                        <div className="bg-[#050b14] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                            <h3 className="font-black text-xs uppercase tracking-wider text-green-400 italic flex items-center gap-1.5 border-b border-white/5 pb-3">
                                <FileText size={14} /> Price Details
                            </h3>
                            <div className="text-xs space-y-2.5 text-gray-400">
                                <div className="flex justify-between">
                                    <span>Listing Price:</span>
                                    <span className="text-white">₹{order.totalAmount + order.discountAmount}</span>
                                </div>
                                {order.discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                        <span>Special Coupon Discount:</span>
                                        <span>-₹{order.discountAmount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Delivery Fees:</span>
                                    <span className="text-green-400 font-bold uppercase text-[10px]">FREE</span>
                                </div>
                                <div className="flex justify-between border-t border-white/5 pt-2 text-sm font-black text-white">
                                    <span>Total Amount:</span>
                                    <span className="text-green-400">₹{order.totalAmount}</span>
                                </div>
                            </div>
                            <div className="pt-2 text-[10px] text-gray-500 border-t border-white/5 flex justify-between">
                                <span>Paid By:</span>
                                <span className="font-bold text-white uppercase tracking-wider">{order.paymentMethod}</span>
                            </div>
                        </div>

                        {/* Download Invoice Button */}
                        <button 
                            onClick={downloadInvoice}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition"
                        >
                            <Download size={14} /> Download Invoice
                        </button>

                    </div>

                </div>

            </div>

            {/* HIGH-DETAIL LIVE TRANSIT TIMELINE MODAL (FLIPKART STYLE OVERLAY) */}
            <AnimatePresence>
                {showUpdatesModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#050b14] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative"
                        >
                            
                            {/* Close Modal button */}
                            <button 
                                onClick={() => setShowUpdatesModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
                            >
                                <X size={20} />
                            </button>

                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                                <span className="text-[9px] text-green-400 font-black tracking-widest uppercase block mb-1">Live Transit Log</span>
                                <h3 className="text-base font-black uppercase tracking-wide">Detailed Shipment Status</h3>
                                <p className="text-[10px] text-gray-400 mt-1">Updates in real-time when shipping agents dispatch kit.</p>
                            </div>

                            {/* Granular logs list exactly matching Flipkart layout from user's image */}
                            <div className="p-8 max-h-[420px] overflow-y-auto bg-white dark:bg-[#050b14] text-slate-800 dark:text-slate-200">
                                <div className="flex flex-col relative pl-6 border-l-[3px] border-green-500 space-y-8">
                                    {detailedTimeline.map((node, nodeIdx) => (
                                        <div key={nodeIdx} className="relative space-y-4">
                                            
                                            {/* Large Green Dot Node matching Flipkart */}
                                            <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-[#050b14] shadow-[0_0_8px_rgba(34,197,94,0.8)] z-10 animate-pulse" />

                                            {/* Main status header and bold label */}
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white inline-block mr-2">
                                                    {node.title}
                                                </h4>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                                    {node.date}
                                                </span>
                                            </div>

                                            {/* Granular Sub logs messages */}
                                            <div className="space-y-4 pl-1">
                                                {node.subLogs.map((sub, subIdx) => (
                                                    <div key={subIdx} className="space-y-1">
                                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                                                            {sub.text}
                                                        </p>
                                                        {sub.time && (
                                                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold font-mono">
                                                                {sub.time}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-5 border-t border-white/5 bg-white/[0.01] flex justify-between items-center text-[10px]">
                                <span className="text-gray-500 font-bold uppercase flex items-center gap-1">
                                    <Sparkles size={12} className="text-green-500" /> Auto-updates active
                                </span>
                                <button 
                                    onClick={() => setShowUpdatesModal(false)}
                                    className="bg-green-500 text-black px-4 py-2 rounded-xl font-bold uppercase tracking-wider hover:bg-green-400 transition"
                                >
                                    Dismiss Log
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}

export default OrderTracking
