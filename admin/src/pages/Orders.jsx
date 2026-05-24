import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { authDataContext } from '../context/AuthContext'
import { Sparkles, Calendar, Truck, ShieldCheck, Banknote, QrCode, CreditCard, Filter } from 'lucide-react'

const Orders = () => {
    const { serverUrl } = useContext(authDataContext)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'cod' | 'paid'

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/orders/admin/all`, { withCredentials: true })
            setOrders(res.data.orders)
            setLoading(false)
        } catch (error) {
            console.error("Failed to load admin orders", error)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await axios.post(`${serverUrl}/api/orders/admin/status`, {
                orderId,
                orderStatus: newStatus
            }, { withCredentials: true })

            // Update state
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: res.data.order.orderStatus, paymentStatus: res.data.order.paymentStatus, trackingTimeline: res.data.order.trackingTimeline } : o))
            alert(`Order status updated successfully to "${newStatus}"!`)
        } catch (error) {
            console.error("Failed to update status", error)
            alert(error.response?.data?.message || "Failed to update order status.")
        }
    }

    // ─── Payment Status Badge ─────────────────────────────────
    const PaymentStatusBadge = ({ status }) => {
        const config = {
            'Cash on Delivery': { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', label: 'Cash on Delivery' },
            'Paid': { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', label: 'Paid' },
            'Completed': { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', label: 'Paid' },
            'Pending': { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
            'Failed': { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', label: 'Failed' }
        }
        const c = config[status] || config['Pending']
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.border} ${c.text} border`}>
                <span className={`w-1.5 h-1.5 rounded-full ${c.text === 'text-green-400' ? 'bg-green-400' : c.text === 'text-amber-400' ? 'bg-amber-400' : c.text === 'text-yellow-400' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                {c.label}
            </span>
        )
    }

    // ─── Payment Method Badge ─────────────────────────────────
    const PaymentMethodBadge = ({ method }) => {
        if (method === 'COD') {
            return (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Banknote size={14} className="text-amber-400" />
                    </div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">COD</span>
                </div>
            )
        }
        return (
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <QrCode size={14} className="text-blue-400" />
                </div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">UPI / Razorpay</span>
            </div>
        )
    }

    // ─── Filtered Orders ──────────────────────────────────────
    const filteredOrders = orders.filter(order => {
        if (activeFilter === 'cod') return order.paymentMethod === 'COD'
        if (activeFilter === 'paid') return order.paymentMethod === 'Razorpay' || order.paymentStatus === 'Paid' || order.paymentStatus === 'Completed'
        return true
    })

    // ─── Counts for filter tabs ───────────────────────────────
    const codCount = orders.filter(o => o.paymentMethod === 'COD').length
    const paidCount = orders.filter(o => o.paymentMethod === 'Razorpay' || o.paymentStatus === 'Paid' || o.paymentStatus === 'Completed').length

    if (loading) {
        return (
            <div className="min-h-screen bg-[#02060d] text-white flex items-center justify-center font-sans">
                <div className="w-12 h-12 rounded-full border-t-2 border-green-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#02060d] text-white flex font-sans">
            <Sidebar />

            <div className="flex-1 p-8 ml-64 overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-5">
                    <div>
                        <p className="text-[10px] text-green-400 uppercase tracking-widest font-black flex items-center gap-1">
                            <Sparkles size={12} /> Live tracking log
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide mt-1">ORDERS DISPATCH MANAGER</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Total Orders</p>
                        <p className="text-2xl font-black text-green-400">{orders.length}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'all', label: 'All Orders', count: orders.length },
                        { id: 'cod', label: 'Cash on Delivery', count: codCount },
                        { id: 'paid', label: 'Online Paid', count: paidCount }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                                activeFilter === tab.id
                                    ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                            }`}
                        >
                            {tab.id === 'all' && <Filter size={12} />}
                            {tab.id === 'cod' && <Banknote size={12} />}
                            {tab.id === 'paid' && <QrCode size={12} />}
                            {tab.label}
                            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                                activeFilter === tab.id ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Orders container */}
                <div className="space-y-6">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-[#050b14] border border-white/5 p-8 rounded-3xl text-center text-gray-500 text-xs">
                            {activeFilter === 'all'
                                ? 'No purchases have been registered in the database yet.'
                                : `No ${activeFilter === 'cod' ? 'Cash on Delivery' : 'online paid'} orders found.`
                            }
                        </div>
                    ) : (
                        filteredOrders.map((order, index) => (
                            <div key={index} className="bg-[#050b14] border border-white/5 p-6 rounded-3xl shadow-xl space-y-6">
                                
                                {/* Top info bar */}
                                <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-white/5 pb-4 text-xs">
                                    <div>
                                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider mb-1">Order Identifiers</p>
                                        <p className="font-mono text-white font-bold text-[11px]">{order._id}</p>
                                        <p className="text-gray-500 mt-2 flex items-center gap-1">
                                            <Calendar size={12} /> {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="sm:text-right">
                                        <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">Set Shipment Status</p>
                                        <select
                                            value={order.orderStatus}
                                            onChange={e => handleStatusChange(order._id, e.target.value)}
                                            className="bg-[#0d1527] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-green-400 cursor-pointer"
                                        >
                                            {['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Payment Info Row */}
                                <div className="flex flex-wrap items-center gap-4 px-1">
                                    <div>
                                        <p className="text-[9px] text-gray-500 uppercase font-bold mb-1.5">Payment Method</p>
                                        <PaymentMethodBadge method={order.paymentMethod} />
                                    </div>
                                    <div className="w-px h-8 bg-white/5 hidden sm:block" />
                                    <div>
                                        <p className="text-[9px] text-gray-500 uppercase font-bold mb-1.5">Payment Status</p>
                                        <PaymentStatusBadge status={order.paymentStatus} />
                                    </div>
                                    <div className="w-px h-8 bg-white/5 hidden sm:block" />
                                    <div>
                                        <p className="text-[9px] text-gray-500 uppercase font-bold mb-1.5">Order Status</p>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white">
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                    {order.razorpayPaymentId && (
                                        <>
                                            <div className="w-px h-8 bg-white/5 hidden sm:block" />
                                            <div>
                                                <p className="text-[9px] text-gray-500 uppercase font-bold mb-1.5">Razorpay ID</p>
                                                <span className="font-mono text-[10px] text-blue-400 bg-blue-500/5 border border-blue-500/10 px-2 py-1 rounded-lg">
                                                    {order.razorpayPaymentId}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Address and billing */}
                                <div className="grid md:grid-cols-3 gap-6 text-xs text-gray-400">
                                    
                                    {/* Shipping details */}
                                    <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                                        <h4 className="font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <Truck size={12} /> Deliver to
                                        </h4>
                                        <p className="font-bold text-white text-sm">{order.shippingAddress.name}</p>
                                        <p className="mt-1">{order.shippingAddress.addressLine}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                        <p className="mt-2 text-white font-mono">Phone: {order.shippingAddress.phone}</p>
                                    </div>

                                    {/* Shopping summary */}
                                    <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl space-y-2 col-span-2">
                                        <h4 className="font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                            <ShieldCheck size={12} /> Billing Items Summary
                                        </h4>
                                        <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-black/20 p-2 rounded-xl border border-white/[0.02]">
                                                    <div>
                                                        <p className="font-bold text-white text-xs">{item.name}</p>
                                                        <p className="text-[10px] text-gray-500">Size: <span className="text-green-400 font-bold font-mono">{item.size}</span> | Qty: {item.quantity}</p>
                                                    </div>
                                                    <span className="font-bold text-white text-xs">₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {order.discountAmount > 0 && (
                                            <div className="flex justify-between text-xs text-red-400 mt-2">
                                                <span>Applied Coupon ({order.couponCode || 'PROMO'}):</span>
                                                <span className="font-mono font-bold">-₹{order.discountAmount}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t border-white/5 pt-2.5 text-xs">
                                            <span className="font-bold text-white">Total Amount:</span>
                                            <span className="text-green-400 font-black text-sm">₹{order.totalAmount}</span>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default Orders
