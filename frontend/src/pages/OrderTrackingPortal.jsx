import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Search, Package, Calendar, ArrowRight, ShieldCheck, ShoppingBag, Clock } from 'lucide-react'
import { authDataContext } from '../context/AuthContext'

const OrderTrackingPortal = () => {
    const navigate = useNavigate()
    const { serverUrl, userData } = useContext(authDataContext)
    const [orders, setOrders] = useState([])
    const [searchId, setSearchId] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchOrders = async () => {
        try {
            setLoading(true)
            let fetchedOrders = []

            // 1. Fetch user orders from database if logged in
            if (userData) {
                try {
                    const res = await axios.get(`${serverUrl}/api/orders/myorders`, { withCredentials: true })
                    fetchedOrders = res.data.orders || []
                } catch (err) {
                    console.error("Failed to fetch database orders", err)
                }
            }

            // 2. Fetch locally placed orders from localStorage (Guest Orders)
            const placedIds = JSON.parse(localStorage.getItem('placedOrderIds') || '[]')
            if (placedIds.length > 0) {
                const uniqueIds = [...new Set(placedIds)]
                
                const guestOrdersPromises = uniqueIds.map(async (id) => {
                    try {
                        if (fetchedOrders.some(o => o._id === id)) return null
                        const res = await axios.get(`${serverUrl}/api/orders/track/${id}`, { withCredentials: true })
                        return res.data.order
                    } catch (err) {
                        console.error(`Failed to track guest order: ${id}`, err)
                        return null
                    }
                })

                const resolvedGuestOrders = await Promise.all(guestOrdersPromises)
                const validGuestOrders = resolvedGuestOrders.filter(o => o !== null)
                fetchedOrders = [...fetchedOrders, ...validGuestOrders]
            }

            // 3. Fallback: Fetch most recent orders from system if list is still empty (e.g. for guest testing)
            if (fetchedOrders.length === 0) {
                try {
                    const res = await axios.get(`${serverUrl}/api/orders/recent`)
                    fetchedOrders = res.data.orders || []
                } catch (err) {
                    console.error("Failed to fetch recent fallback orders", err)
                }
            }

            // Sort orders by newest first
            fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

            setOrders(fetchedOrders)
            setLoading(false)
        } catch (err) {
            console.error("Failed to fetch user orders", err)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [userData])

    const handleSearch = (e) => {
        e.preventDefault()
        if (!searchId.trim()) return
        navigate(`/orders/track/${searchId.trim()}`)
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Placed': return 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            case 'Packed': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            case 'Shipped': return 'bg-purple-500/10 border-purple-500/20 text-purple-400'
            case 'Out for Delivery': return 'bg-pink-500/10 border-pink-500/20 text-pink-400'
            case 'Delivered': return 'bg-green-500/10 border-green-500/20 text-green-400'
            default: return 'bg-gray-500/10 border-gray-500/20 text-gray-400'
        }
    }

    return (
        <div className="min-h-screen bg-[#02060d] text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-10">
                
                {/* Brand Page Title */}
                <div className="text-center">
                    <span className="text-[10px] text-green-400 font-black tracking-widest uppercase block mb-1">Live Tracking Center</span>
                    <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-wider">YOUR SHIPMENTS</h1>
                    <p className="text-gray-400 text-xs mt-2 max-w-md mx-auto">
                        Locate your premium athletic kits, monitor dispatch updates, and access cybernetic shipping records.
                    </p>
                </div>

                {/* Search Bar Portal */}
                <div className="bg-[#050b14] border border-white/5 p-6 rounded-3xl shadow-xl max-w-xl mx-auto">
                    <form onSubmit={handleSearch} className="space-y-3">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                            Track via Order ID
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-green-400/50 transition">
                                <Search size={16} className="text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Enter order reference code (e.g. 660f...)" 
                                    value={searchId}
                                    onChange={e => setSearchId(e.target.value)}
                                    className="bg-transparent outline-none text-white text-xs w-full font-medium font-mono"
                                />
                            </div>
                            <button className="bg-green-500 hover:bg-green-400 text-black px-6 rounded-xl font-black text-xs uppercase tracking-widest transition flex items-center gap-1.5">
                                Search <ArrowRight size={12} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Order History list */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h3 className="font-black text-sm tracking-wider uppercase text-green-400 italic flex items-center gap-2">
                            <Clock size={16} /> Purchase Chronicles
                        </h3>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{orders.length} Orders Found</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 rounded-full border-t-2 border-green-500 animate-spin" />
                        </div>
                    ) : orders.length === 0 ? (
                        !userData ? (
                            <div className="bg-[#050b14] border border-white/5 rounded-3xl p-8 text-center space-y-3">
                                <ShoppingBag className="text-green-500/20 w-10 h-10 mx-auto" />
                                <p className="text-xs text-gray-400">Want to see all your active and past orders at a glance? Login to view your full Purchase Chronicles.</p>
                                <button onClick={() => navigate('/login')} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition">
                                    Login to Account
                                </button>
                            </div>
                        ) : (
                            <div className="bg-[#050b14] border border-white/5 rounded-3xl p-10 text-center space-y-4">
                                <ShoppingBag className="text-gray-600 w-12 h-12 mx-auto" />
                                <p className="text-sm text-gray-400">You haven't ordered any premium athletic gear yet!</p>
                                <button onClick={() => navigate('/jersey')} className="bg-green-500 text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider">
                                    Explore Gear
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="grid gap-4">
                            {orders.map((order) => (
                                <div 
                                    key={order._id} 
                                    className="bg-[#050b14] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                                >
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xs font-mono text-gray-300 font-bold">#{order._id.slice(-8).toUpperCase()}</span>
                                            <span className={`border text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${getStatusStyle(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 space-y-1">
                                            <p className="flex items-center gap-1.5"><Calendar size={10} /> Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                                            <p className="flex items-center gap-1.5"><Package size={10} /> {order.items.length} Item(s) inside shipment</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                        <div className="text-left md:text-right">
                                            <p className="text-[10px] text-gray-500">Paid amount</p>
                                            <p className="text-green-400 font-black text-sm">₹{order.totalAmount}</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/orders/track/${order._id}`)} 
                                            className="bg-white/5 border border-white/10 hover:bg-green-500 hover:text-black hover:border-green-500 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5"
                                        >
                                            Track Status <ArrowRight size={10} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default OrderTrackingPortal
