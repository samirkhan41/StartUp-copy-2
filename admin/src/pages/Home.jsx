import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { authDataContext } from '../context/AuthContext'
import { adminDataContext } from '../context/AdminContext'
import { DollarSign, ShoppingBag, Users, Layers, TrendingUp, Sparkles } from 'lucide-react'
import Sidebar from '../components/Sidebar'

const Home = () => {
    const { serverUrl } = useContext(authDataContext)
    const { adminData } = useContext(adminDataContext)
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/analytics/admin`, { withCredentials: true })
            setAnalytics(res.data)
            setLoading(false)
        } catch (error) {
            console.error("Failed to load analytics", error)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#02060d] text-white flex items-center justify-center font-sans">
                <div className="w-12 h-12 rounded-full border-t-2 border-green-500 animate-spin" />
            </div>
        )
    }

    const stats = analytics?.stats || { totalSales: 0, totalOrders: 0, totalUsers: 0, itemsSold: 0 }
    const statusBreakdown = analytics?.statusBreakdown || { Placed: 0, Packed: 0, Shipped: 0, OutForDelivery: 0, Delivered: 0 }
    const recentTransactions = analytics?.recentTransactions || []
    const salesByMonth = analytics?.salesByMonth || []

    return (
        <div className="min-h-screen bg-[#02060d] text-white flex font-sans">
            {/* Sidebar component */}
            <Sidebar />

            {/* Main Area */}
            <div className="flex-1 p-8 ml-64 overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-5">
                    <div>
                        <p className="text-[10px] text-green-400 uppercase tracking-widest font-black flex items-center gap-1">
                            <Sparkles size={12} className="animate-spin" /> Real-time Systems
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide mt-1">ADMIN ANALYTICS</h1>
                    </div>
                    <div className="text-right text-xs">
                        <p className="text-gray-400">Authenticated Admin</p>
                        <p className="text-green-400 font-bold">{adminData?.email || "admin@example.com"}</p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { title: 'Gross Revenue', value: `₹${stats.totalSales}`, icon: <DollarSign size={20} />, color: 'from-green-500/10 to-emerald-600/5', border: 'border-green-500/20' },
                        { title: 'Items Dispatched', value: stats.itemsSold, icon: <ShoppingBag size={20} />, color: 'from-blue-500/10 to-indigo-600/5', border: 'border-blue-500/20' },
                        { title: 'Total Purchases', value: stats.totalOrders, icon: <Layers size={20} />, color: 'from-purple-500/10 to-violet-600/5', border: 'border-purple-500/20' },
                        { title: 'Registered Users', value: stats.totalUsers, icon: <Users size={20} />, color: 'from-orange-500/10 to-amber-600/5', border: 'border-orange-500/20' }
                    ].map((metric, idx) => (
                        <div key={idx} className={`bg-gradient-to-br ${metric.color} border ${metric.border} p-6 rounded-3xl shadow-xl flex items-center justify-between`}>
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">{metric.title}</p>
                                <p className="text-white text-2xl font-black italic mt-2">{metric.value}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-green-400">
                                {metric.icon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts and Status breakdown */}
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    
                    {/* SVG Sales Progress Chart */}
                    <div className="lg:col-span-2 bg-[#050b14] border border-white/5 p-6 rounded-3xl shadow-xl">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-green-400 flex items-center gap-1.5 mb-6">
                            <TrendingUp size={16} /> Sales progression trend
                        </h3>
                        <div className="h-64 flex items-end justify-between gap-4 pt-10">
                            {salesByMonth.map((bar, idx) => {
                                const maxSales = Math.max(...salesByMonth.map(m => m.sales), 50000)
                                const heightPct = (bar.sales / maxSales) * 100 // full 100% scaling inside chart bounds

                                return (
                                    <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                                        {/* Hover Tooltip */}
                                        <div className="absolute -top-4 bg-green-500 text-black font-black text-[10px] px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300 shadow-md z-20">
                                            ₹{bar.sales}
                                        </div>
                                        
                                        {/* Bar wrapper with absolute scaling */}
                                        <div className="w-full h-[80%] flex items-end relative">
                                            <div 
                                                style={{ height: `${heightPct}%` }}
                                                className="w-full bg-gradient-to-t from-green-500/10 to-green-500 hover:to-green-400 rounded-t-xl transition-all duration-500 shadow-lg shadow-green-500/10 cursor-pointer"
                                            />
                                        </div>
                                        
                                        <span className="text-[10px] uppercase font-black text-gray-500 mt-2 block">{bar.month}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Status Breakdown logs */}
                    <div className="bg-[#050b14] border border-white/5 p-6 rounded-3xl shadow-xl">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-green-400 mb-6">Order Status pipeline</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Placed Orders', count: statusBreakdown.Placed, color: 'bg-blue-500' },
                                { label: 'Packed Orders', count: statusBreakdown.Packed, color: 'bg-purple-500' },
                                { label: 'Shipped Packages', count: statusBreakdown.Shipped, color: 'bg-orange-500' },
                                { label: 'Out for Delivery', count: statusBreakdown.OutForDelivery, color: 'bg-yellow-500' },
                                { label: 'Delivered jerseys', count: statusBreakdown.Delivered, color: 'bg-green-500' }
                            ].map((row, idx) => (
                                <div key={idx} className="space-y-1.5 text-xs">
                                    <div className="flex justify-between font-bold text-gray-400">
                                        <span>{row.label}</span>
                                        <span className="text-white">{row.count}</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            style={{ width: `${row.count > 0 ? (row.count / (stats.totalOrders || 1)) * 100 : 0}%` }}
                                            className={`h-full ${row.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Purchases List */}
                <div className="bg-[#050b14] border border-white/5 p-6 rounded-3xl shadow-xl">
                    <h3 className="text-sm font-bold tracking-wider uppercase text-green-400 mb-6">Recent Sales Ledger</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-gray-500 uppercase tracking-widest font-black">
                                    <th className="pb-3">Order ID</th>
                                    <th className="pb-3">Customer</th>
                                    <th className="pb-3">Total Amount</th>
                                    <th className="pb-3">Payment Method</th>
                                    <th className="pb-3">Order Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-gray-500">No active transactions.</td>
                                    </tr>
                                ) : (
                                    recentTransactions.map((tx, idx) => (
                                        <tr key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition">
                                            <td className="py-4 font-mono font-bold text-green-400">{tx._id.slice(-8)}</td>
                                            <td className="py-4 text-white">
                                                <p className="font-bold">{tx.shippingAddress.name}</p>
                                                <p className="text-[10px] text-gray-500">{tx.userId?.email || tx.shippingAddress.email}</p>
                                            </td>
                                            <td className="py-4 font-bold text-white">₹{tx.totalAmount}</td>
                                            <td className="py-4 uppercase tracking-wider text-gray-400">{tx.paymentMethod}</td>
                                            <td className="py-4">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                                                    tx.orderStatus === 'Delivered' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                                                }`}>
                                                    {tx.orderStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
