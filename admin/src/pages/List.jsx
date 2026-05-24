import React, { useState, useEffect, useContext } from 'react'
import Sidebar from '../components/Sidebar'
import { Sparkles, Trash2, Search, ArrowUpDown, Loader2 } from 'lucide-react'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'

// Import fallback assets
import j1 from "../assets/GreenImg.png"
import j2 from "../assets/PinkyPonky.png"
import j3 from "../assets/PurpleImg.png"
import j4 from "../assets/aboutImage.PNG"

const defaultInventory = [
    { id: "default_1", name: "Vortex Strike Jersey (Emerald)", category: "Football", price: 899, image: j1, isDefault: true },
    { id: "default_2", name: "Apex Pro Jersey (Crimson)", category: "Football", price: 899, image: j2, isDefault: true },
    { id: "default_3", name: "Elite Performance Jersey (Purple)", category: "Basketball", price: 949, image: j3, isDefault: true },
    { id: "default_4", name: "Stealth Edition Jersey (Classic)", category: "Cricket", price: 849, image: j4, isDefault: true }
]

const List = () => {
    const { serverUrl } = useContext(authDataContext)

    const [inventory, setInventory] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch products
    const fetchInventory = async () => {
        try {
            setIsLoading(true)
            const res = await axios.get(`${serverUrl}/api/products/all`)
            
            // Combine backend products with fallback default jerseys
            const dbProducts = res.data?.products || []
            
            // Map db products to fit table properties
            const formattedDbProducts = dbProducts.map(p => ({
                id: p._id,
                name: p.name,
                category: p.category,
                price: p.price,
                image: p.image,
                isDefault: false
            }))

            setInventory([...formattedDbProducts, ...defaultInventory])
        } catch (error) {
            console.error("Failed to load inventory:", error)
            setInventory(defaultInventory)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchInventory()
    }, [])

    const handleDelete = async (item) => {
        if (item.isDefault) {
            alert("Default stock designs cannot be deleted from the seed catalog!")
            return
        }

        if (confirm(`Are you sure you want to delete "${item.name}" from active collections?`)) {
            try {
                const res = await axios.delete(`${serverUrl}/api/products/delete/${item.id}`, {
                    withCredentials: true
                })
                if (res.status === 200) {
                    alert("Product successfully deleted!")
                    fetchInventory()
                }
            } catch (error) {
                const msg = error.response?.data?.message || error.message
                alert(`Failed to delete product: ${msg}`)
            }
        }
    }

    const filteredList = inventory.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#02060d] text-white flex font-sans">
            <Sidebar />

            <div className="flex-1 p-8 ml-64 overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-5">
                    <div>
                        <p className="text-[10px] text-green-400 uppercase tracking-widest font-black flex items-center gap-1">
                            <Sparkles size={12} /> Stock levels
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide mt-1">PRODUCT INVENTORY LIST</h1>
                    </div>
                </div>

                {/* Inventory tools */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 bg-[#050b14] border border-white/5 p-4 rounded-2xl">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search active stock..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-green-500 transition"
                        />
                    </div>
                    <button 
                        onClick={fetchInventory}
                        className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition duration-300"
                    >
                        <ArrowUpDown size={14} /> Refresh Catalog
                    </button>
                </div>

                {/* Inventory Grid Table */}
                <div className="bg-[#050b14] border border-white/5 rounded-3xl p-6 shadow-xl relative min-h-[250px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050b14]/50 rounded-3xl gap-3">
                            <Loader2 className="animate-spin text-green-500" size={32} />
                            <span className="text-xs text-gray-400">Loading catalog from database...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-gray-500 uppercase tracking-widest font-black">
                                        <th className="pb-3">Preview</th>
                                        <th className="pb-3">Jersey Name</th>
                                        <th className="pb-3">Category</th>
                                        <th className="pb-3">Pricing</th>
                                        <th className="pb-3 text-center">Status</th>
                                        <th className="pb-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-6 text-gray-500">No matching jerseys in inventory.</td>
                                        </tr>
                                    ) : (
                                        filteredList.map((item, idx) => (
                                            <tr key={item.id || idx} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition">
                                                <td className="py-3">
                                                    <div className="w-12 h-12 bg-black/40 border border-white/5 rounded-xl flex items-center justify-center overflow-hidden">
                                                        <img src={item.image} alt="" className="w-10 h-10 object-contain" />
                                                    </div>
                                                </td>
                                                <td className="py-4 font-bold text-white">{item.name}</td>
                                                <td className="py-4 text-gray-400 uppercase tracking-wider">{item.category}</td>
                                                <td className="py-4 font-bold text-white">₹{item.price}</td>
                                                <td className="py-4 text-center font-bold text-gray-300 font-mono">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full ${
                                                        item.isDefault 
                                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' 
                                                            : 'bg-green-500/10 text-green-400 border border-green-500/10'
                                                    }`}>
                                                        {item.isDefault ? 'Default' : 'Live Cloudinary'}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        disabled={item.isDefault}
                                                        className={`p-2 transition ${
                                                            item.isDefault 
                                                                ? 'text-gray-700 cursor-not-allowed opacity-35' 
                                                                : 'text-gray-500 hover:text-red-500'
                                                        }`}
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
                    )}
                </div>
            </div>
        </div>
    )
}

export default List
