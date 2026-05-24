import React, { useState, useContext } from 'react'
import Sidebar from '../components/Sidebar'
import { Sparkles, UploadCloud, ShieldAlert, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'

const Add = () => {
    const { serverUrl } = useContext(authDataContext)

    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [category, setCategory] = useState('Football')
    const [desc, setDesc] = useState('')
    const [sizing, setSizing] = useState(['M', 'L'])
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isPublishing, setIsPublishing] = useState(false)

    const handleSizingToggle = (size) => {
        setSizing(prev => 
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        )
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleAddProduct = async (e) => {
        e.preventDefault()
        setSuccessMessage('')
        setErrorMessage('')

        if (!name || !price || !category) {
            setErrorMessage("Please complete all required fields!")
            return
        }

        if (!imageFile) {
            setErrorMessage("Please upload a display image for the jersey!")
            return
        }

        setIsPublishing(true)

        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('price', price)
            formData.append('category', category)
            formData.append('description', desc)
            formData.append('sizes', JSON.stringify(sizing))
            formData.append('image', imageFile)

            const res = await axios.post(`${serverUrl}/api/products/create`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            })

            if (res.status === 201) {
                setSuccessMessage(`Product "${name}" successfully registered and uploaded to Cloudinary!`)
                setName('')
                setPrice('')
                setDesc('')
                setSizing(['M', 'L'])
                setImageFile(null)
                setImagePreview(null)
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message
            setErrorMessage(`Failed to publish product: ${msg}`)
        } finally {
            setIsPublishing(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#02060d] text-white flex font-sans">
            <Sidebar />

            <div className="flex-1 p-8 ml-64 overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-5">
                    <div>
                        <p className="text-[10px] text-green-400 uppercase tracking-widest font-black flex items-center gap-1">
                            <Sparkles size={12} className="animate-pulse" /> Catalog Builder
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide mt-1">ADD PREMIUM JERSEY</h1>
                    </div>
                </div>

                {/* Form layout */}
                <div className="max-w-2xl bg-[#050b14] border border-white/5 p-6 sm:p-8 rounded-3xl shadow-2xl">
                    {successMessage && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2">
                            <CheckCircle size={16} />
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2">
                            <ShieldAlert size={16} />
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleAddProduct} className="space-y-6">
                        
                        {/* Jersey details */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Jersey Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Apex Pro V2"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-green-500 transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Retail Price (INR) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    placeholder="e.g. 899"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-green-500 transition"
                                    required
                                />
                            </div>
                        </div>

                        {/* Category selection */}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Sports Category <span className="text-red-500">*</span></label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full bg-[#0d1527] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-green-500 transition"
                            >
                                {["Football", "Basketball", "Cricket", "Volleyball"].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Size fit selectors */}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-3">Sizes Inventory</label>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {["XS", "S", "M", "L", "XL", "2XL", "3XL"].map(size => {
                                    const isSelected = sizing.includes(size)
                                    return (
                                        <button
                                            type="button"
                                            key={size}
                                            onClick={() => handleSizingToggle(size)}
                                            className={`border px-4 py-2.5 rounded-xl transition duration-300 ${
                                                isSelected 
                                                    ? 'border-green-500 bg-green-500/10 text-green-400 font-bold shadow-[0_0_10px_rgba(34,197,94,0.15)]' 
                                                    : 'border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Description field */}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Product Description</label>
                            <textarea
                                placeholder="Details about cloth materials, breathability, washing guidelines..."
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-green-500 transition"
                            />
                        </div>

                        {/* Drag-and-drop Image Uploader */}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Display Image <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                {/* Uploader container */}
                                <div className="sm:col-span-2 relative border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-white/[0.01] hover:border-green-500/40 transition duration-300 cursor-pointer group">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <UploadCloud className="text-green-500/40 group-hover:text-green-400 w-10 h-10 mb-2 transition" />
                                    <p className="font-bold text-xs">Choose or Drag Image</p>
                                    <p className="text-[9px] text-gray-500 mt-1">Supports PNG, JPG, WEBP (Max 5MB)</p>
                                </div>

                                {/* Preview container */}
                                <div className="border border-white/5 rounded-2xl h-36 flex items-center justify-center bg-white/[0.02] overflow-hidden relative">
                                    {imagePreview ? (
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="h-full w-full object-contain p-2"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-600">
                                            <ImageIcon size={24} className="mx-auto mb-1 opacity-40" />
                                            <span className="text-[10px] block">No Preview</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPublishing}
                            className={`w-full bg-green-500 hover:bg-green-400 text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest transition duration-300 flex items-center justify-center gap-2 ${
                                isPublishing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isPublishing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    Uploading to Cloudinary...
                                </>
                            ) : (
                                "Publish Product Fit"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Add
