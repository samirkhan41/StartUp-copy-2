import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { authDataContext } from '../context/AuthContext'
import { Sparkles, Trash2, Calendar, Tag, Percent } from 'lucide-react'

const Coupons = () => {
    const { serverUrl } = useContext(authDataContext)
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)

    // Form inputs
    const [code, setCode] = useState('')
    const [discountPercentage, setDiscountPercentage] = useState('')
    const [maxDiscount, setMaxDiscount] = useState('')
    const [minCartAmount, setMinCartAmount] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const fetchCoupons = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/coupons/admin/all`, { withCredentials: true })
            setCoupons(res.data.coupons)
            setLoading(false)
        } catch (error) {
            console.error("Failed to fetch coupons", error)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    const handleCreateCoupon = async (e) => {
        e.preventDefault()
        if (!code || !discountPercentage || !maxDiscount || !expiryDate) {
            alert("Please fill all coupon details!")
            return
        }

        try {
            const res = await axios.post(`${serverUrl}/api/coupons/admin/create`, {
                code: code.toUpperCase(),
                discountPercentage: Number(discountPercentage),
                maxDiscount: Number(maxDiscount),
                minCartAmount: Number(minCartAmount) || 0,
                expiryDate
            }, { withCredentials: true })

            setSuccessMessage(`Coupon "${res.data.coupon.code}" successfully declared!`)
            setCode('')
            setDiscountPercentage('')
            setMaxDiscount('')
            setMinCartAmount('')
            setExpiryDate('')
            fetchCoupons()

            setTimeout(() => setSuccessMessage(''), 4000)
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create coupon code.")
        }
    }

    const handleDeleteCoupon = async (id) => {
        if (!confirm("Are you sure you want to drop this promotion code?")) return
        try {
            await axios.delete(`${serverUrl}/api/coupons/admin/${id}`, { withCredentials: true })
            setCoupons(prev => prev.filter(c => c._id !== id))
            alert("Coupon successfully deleted!")
        } catch (error) {
            alert("Failed to delete coupon.")
        }
    }

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

            <div className="flex-1 p-8 ml-64 overflow-y-auto grid lg:grid-cols-3 gap-8">
                
                {/* Left col: Add coupon */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-1">
                        <Sparkles size={12} className="text-green-400" />
                        <h1 className="text-2xl font-black italic tracking-wide uppercase">COUPON CREATOR</h1>
                    </div>

                    <div className="bg-[#050b14] border border-white/5 p-6 rounded-3xl shadow-xl">
                        {successMessage && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl text-xs font-bold mb-4">
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleCreateCoupon} className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    placeholder="e.g. ULTRA50"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-green-500 uppercase"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Discount %</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 50"
                                    value={discountPercentage}
                                    onChange={e => setDiscountPercentage(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Max Discount Value (INR)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 500"
                                    value={maxDiscount}
                                    onChange={e => setMaxDiscount(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Min Order Total (INR)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 1000"
                                    value={minCartAmount}
                                    onChange={e => setMinCartAmount(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Expiry Date</label>
                                <input
                                    type="date"
                                    value={expiryDate}
                                    onChange={e => setExpiryDate(e.target.value)}
                                    className="w-full bg-[#0d1527] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-green-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-500 text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-400 transition"
                            >
                                Publish Campaign
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right col: Coupons table */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-sm font-bold tracking-wider uppercase text-green-400">Active Discount Promotions</h2>

                    <div className="bg-[#050b14] border border-white/5 p-6 rounded-3xl shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-gray-500 uppercase tracking-widest font-black">
                                        <th className="pb-3">Code</th>
                                        <th className="pb-3">Discount</th>
                                        <th className="pb-3">Min Spent</th>
                                        <th className="pb-3">Valid Until</th>
                                        <th className="pb-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-6 text-gray-500">No campaigns active.</td>
                                        </tr>
                                    ) : (
                                        coupons.map((coupon, idx) => (
                                            <tr key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition">
                                                <td className="py-4 font-bold text-green-400 font-mono flex items-center gap-1.5">
                                                    <Tag size={12} /> {coupon.code}
                                                </td>
                                                <td className="py-4 text-white">
                                                    <p className="font-bold flex items-center gap-0.5"><Percent size={12} /> {coupon.discountPercentage}% off</p>
                                                    <p className="text-[10px] text-gray-500">Max: ₹{coupon.maxDiscount}</p>
                                                </td>
                                                <td className="py-4 text-gray-300 font-bold">₹{coupon.minCartAmount}</td>
                                                <td className="py-4 text-gray-400 font-mono">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={10} /> {new Date(coupon.expiryDate).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteCoupon(coupon._id)}
                                                        className="text-gray-500 hover:text-red-500 p-2 transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
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
        </div>
    )
}

export default Coupons
