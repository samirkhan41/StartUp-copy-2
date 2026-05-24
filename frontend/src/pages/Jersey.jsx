import React, { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { Heart, ShoppingCart, Star, ShieldCheck, Sparkles, MessageSquare, Plus, X } from 'lucide-react'
import { cartDataContext } from '../context/CartContext'
import { authDataContext } from '../context/AuthContext'

import j1 from "../assets/GreenImg.png"
import j2 from "../assets/PinkyPonky.png"
import j3 from "../assets/PurpleImg.png"
import j4 from "../assets/aboutImage.PNG"

const defaultJerseys = [
    { name: "Vortex Strike Jersey", price: 1, image: j1, category: "Football", rating: 4.8 },
    { name: "Apex Pro Jersey", price: 899, image: j2, category: "Football", rating: 4.9 },
    { name: "Elite Performance Jersey", price: 949, image: j3, category: "Basketball", rating: 4.7 },
    { name: "Stealth Edition Jersey", price: 849, image: j4, category: "Cricket", rating: 4.5 },
    { name: "Thunder Bolt Jersey", price: 899, image: j1, category: "Volleyball", rating: 4.6 },
    { name: "Crimson Fury Jersey", price: 899, image: j2, category: "Football", rating: 4.8 },
    { name: "Phantom Jersey", price: 849, image: j3, category: "Cricket", rating: 4.4 },
    { name: "Ion Energy Jersey", price: 899, image: j4, category: "Volleyball", rating: 4.7 }
]

const Jersey = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { serverUrl } = useContext(authDataContext)
    const { addToCart, toggleWishlist, wishlist, addRecentlyViewed, recentlyViewed } = useContext(cartDataContext)

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selectedSize, setSelectedSize] = useState('M')
    const [maxPrice, setMaxPrice] = useState(1200)

    const [selectedProduct, setSelectedProduct] = useState(null)
    const [modalSize, setModalSize] = useState('M')
    const [jerseys, setJerseys] = useState(defaultJerseys)

    // Load products dynamically from database and poll for real-time deletions/updates
    useEffect(() => {
        const fetchDbProducts = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/products/all`)
                if (res.data?.products) {
                    const dbProducts = res.data.products.map(p => ({
                        name: p.name,
                        price: p.price,
                        image: p.image,
                        category: p.category,
                        rating: p.rating || 4.8,
                        description: p.description,
                        sizes: p.sizes,
                        isDbProduct: true
                    }))
                    setJerseys([...dbProducts, ...defaultJerseys])
                }
            } catch (err) {
                console.error("Failed to fetch database products:", err)
            }
        }
        fetchDbProducts()

        // Sync and pull updates every 4 seconds for instant admin deletion reflections!
        const syncInterval = setInterval(fetchDbProducts, 4000)
        return () => clearInterval(syncInterval)
    }, [serverUrl])

    // Interactive Modals
    const [activeJerseyReviews, setActiveJerseyReviews] = useState(null)
    const [reviewsList, setReviewsList] = useState([])
    const [reviewStats, setReviewStats] = useState({ avgRating: 4.7, count: 5 })
    
    // Write review inputs
    const [newRating, setNewRating] = useState(5)
    const [newComment, setNewComment] = useState('')
    const [reviewPostSuccess, setReviewPostSuccess] = useState('')

    // Read search query from URL params if present
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const q = params.get('search')
        if (q) setSearchQuery(q)
    }, [location.search])

    // Load reviews
    const openReviewsModal = async (jersey) => {
        setActiveJerseyReviews(jersey)
        setReviewPostSuccess('')
        setNewComment('')
        try {
            const res = await axios.get(`${serverUrl}/api/reviews/jersey/${jersey.name}`)
            setReviewsList(res.data.reviews)
            setReviewStats({
                avgRating: res.data.avgRating || jersey.rating,
                count: res.data.count || 3
            })
        } catch (error) {
            console.error("Failed to load reviews", error)
            setReviewsList([])
        }
    }

    // Submit review
    const handlePostReview = async () => {
        if (!newComment.trim()) return
        try {
            await axios.post(`${serverUrl}/api/reviews/add`, {
                jerseyName: activeJerseyReviews.name,
                rating: newRating,
                comment: newComment
            }, { withCredentials: true })

            setReviewPostSuccess("Review submitted! Thank you.")
            // Refresh
            openReviewsModal(activeJerseyReviews)
        } catch (error) {
            alert(error.response?.data?.message || "Failed to post review. Please log in first!")
        }
    }

    // Smart search: matches name, category, keywords, colors, price terms
    const smartSearch = (jersey, query) => {
        if (!query.trim()) return true
        const q = query.toLowerCase().trim()
        const name = jersey.name.toLowerCase()
        const category = jersey.category.toLowerCase()

        // Build a searchable text blob for each jersey
        const colorMap = {
            'green': ['vortex', 'thunder bolt'],
            'pink': ['apex', 'crimson'],
            'purple': ['elite', 'phantom'],
            'white': ['stealth', 'ion energy'],
            'red': ['crimson', 'fury'],
            'blue': ['vortex', 'bolt']
        }

        const priceKeywords = {
            'cheap': (j) => j.price <= 849,
            'sasta': (j) => j.price <= 849,
            'budget': (j) => j.price <= 849,
            'affordable': (j) => j.price <= 849,
            'lowest': (j) => j.price <= 849,
            'expensive': (j) => j.price >= 949,
            'premium': () => true,
            'mehenga': (j) => j.price >= 949,
        }

        const sportKeywords = ['football', 'basketball', 'cricket', 'volleyball']

        // 1. Direct name match (fuzzy — each word in query checked)
        const queryWords = q.split(/\s+/)
        const nameMatch = queryWords.every(word => name.includes(word))
        if (nameMatch) return true

        // 2. Partial name match (any word matches)
        const partialNameMatch = queryWords.some(word => word.length >= 2 && name.includes(word))
        if (partialNameMatch) return true

        // 3. Category match
        if (category.includes(q)) return true
        if (sportKeywords.some(sport => q.includes(sport) && category === sport.charAt(0).toUpperCase() + sport.slice(1))) return true

        // 4. Color match
        for (const [color, jerseyKeywords] of Object.entries(colorMap)) {
            if (q.includes(color)) {
                if (jerseyKeywords.some(kw => name.includes(kw))) return true
            }
        }

        // 5. Price keyword match
        for (const [keyword, checker] of Object.entries(priceKeywords)) {
            if (q.includes(keyword)) {
                if (checker(jersey)) return true
            }
        }

        // 6. Generic keyword matching (description-like terms)
        const genericKeywords = {
            'best': () => jersey.rating >= 4.7,
            'top': () => jersey.rating >= 4.7,
            'popular': () => jersey.rating >= 4.6,
            'new': () => true,
            'jersey': () => true,
            'tshirt': () => true,
            't-shirt': () => true,
            'shirt': () => true,
        }
        for (const [keyword, checker] of Object.entries(genericKeywords)) {
            if (q.includes(keyword)) {
                if (checker()) return true
            }
        }

        return false
    }

    const filteredJerseys = jerseys.filter(jersey => {
        const matchesSearch = smartSearch(jersey, searchQuery)
        const matchesCategory = selectedCategory === 'All' || jersey.category === selectedCategory
        const matchesPrice = jersey.price <= maxPrice
        return matchesSearch && matchesCategory && matchesPrice
    })

    // AI recommendation simulation (recommends matching styles)
    const aiRecommendations = jerseys
        .filter(j => j.category === selectedCategory && !filteredJerseys.includes(j))
        .slice(0, 3)

    return (
        <div className="min-h-screen bg-[#02060d] text-white px-4 sm:px-6 lg:px-10 pt-36 pb-12 overflow-hidden font-sans">
            
            {/* Header */}
            <div className="mb-10 text-left">
                <p className="text-green-400 uppercase text-xs tracking-widest font-black flex items-center gap-1.5">
                    <Sparkles size={14} className="animate-spin" /> Premium Gear
                </p>
                <h1 className="text-3xl sm:text-5xl font-black italic tracking-wide mt-2">TEESX COLLECTIONS</h1>
                <p className="text-gray-400 mt-3 max-w-2xl text-xs sm:text-sm leading-relaxed">
                    Futuristic jerseys engineered for ultimate turf supremacy. Designed with high-performance fabrics, glassmorphic accents, and premium lightweight micro-fibres.
                </p>
            </div>

            {/* Catalog Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Filters sidebar */}
                <div className="w-full lg:w-[280px] bg-[#050b14] p-6 rounded-3xl border border-white/5 h-fit grid grid-cols-1 sm:grid-cols-2 lg:block gap-6 lg:space-y-8 shadow-xl">
                    <h3 className="text-xs text-gray-400 uppercase tracking-widest font-black border-b border-white/5 pb-3 sm:col-span-2 lg:col-span-1">Filters</h3>

                    {/* Search bar */}
                    <div>
                        <h4 className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">Search Name</h4>
                        <input
                            type="text"
                            placeholder="Type a jersey..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-green-400/50"
                        />
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-green-400 text-xs font-bold uppercase tracking-wider mb-3">Categories</h4>
                        <ul className="text-gray-400 space-y-2 text-xs">
                            {["All", "Football", "Basketball", "Cricket", "Volleyball"].map(cat => (
                                <li
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`cursor-pointer transition flex items-center justify-between ${
                                        selectedCategory === cat ? 'text-green-400 font-bold' : 'hover:text-white'
                                    }`}
                                >
                                    <span>{cat}</span>
                                    {selectedCategory === cat && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Sizes */}
                    <div>
                        <h4 className="text-green-400 text-xs font-bold uppercase tracking-wider mb-3">Select Sizing Fit</h4>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                            {["XS", "S", "M", "L", "XL", "2XL", "3XL"].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`border py-2 rounded-xl transition ${
                                        selectedSize === size ? 'border-green-500 bg-green-500/10 text-green-400 font-bold' : 'border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h4 className="text-green-400 text-xs font-bold uppercase tracking-wider mb-3">Max Price: ₹{maxPrice}</h4>
                        <input
                            type="range"
                            min="800"
                            max="1500"
                            step="50"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="w-full accent-green-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                            <span>₹800</span>
                            <span>₹1500</span>
                        </div>
                    </div>
                </div>

                {/* Jersey Grid */}
                <div className="flex-1 space-y-12">
                    {filteredJerseys.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 text-sm">
                            No jerseys match your filters. Try adjusting your search query!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {filteredJerseys.map((item, index) => {
                                const isWishlisted = wishlist.some(w => w.name === item.name)

                                return (
                                    <motion.div
                                        key={index}
                                        whileHover={{ y: -6 }}
                                        onClick={() => {
                                            addRecentlyViewed(item)
                                            setSelectedProduct(item)
                                            setModalSize(selectedSize)
                                        }}
                                        className="bg-[#050b14] border border-white/5 rounded-3xl p-5 hover:border-green-500/40 transition duration-300 shadow-xl flex flex-col justify-between cursor-pointer"
                                    >
                                        <div>
                                            {/* Tag & Wishlist */}
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    {item.category}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleWishlist(item)
                                                    }}
                                                    className={`hover:scale-110 transition ${
                                                        isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-white'
                                                    }`}
                                                >
                                                    <Heart fill={isWishlisted ? "currentColor" : "none"} size={18} />
                                                </button>
                                            </div>

                                            {/* Product Image */}
                                            <div className="h-48 mb-6 flex items-center justify-center overflow-hidden bg-black/20 rounded-2xl border border-white/[0.02]">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-40 object-contain hover:scale-110 transition duration-500"
                                                />
                                            </div>

                                            <h3 className="text-sm sm:text-base font-bold text-white mb-2">{item.name}</h3>

                                            {/* Rating and Reviews link */}
                                            <div 
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openReviewsModal(item)
                                                }}
                                                className="flex items-center gap-1.5 mb-4 text-xs cursor-pointer hover:text-green-400 transition"
                                            >
                                                <div className="flex text-yellow-400"><Star size={12} fill="currentColor" /></div>
                                                <span className="font-bold text-white">{item.rating}</span>
                                                <span className="text-gray-500 flex items-center gap-0.5"><MessageSquare size={10} /> View Ratings</span>
                                            </div>
                                        </div>

                                        {/* Purchase controls */}
                                        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                                            <span className="text-md sm:text-lg font-black text-white">₹{item.price}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    addToCart(item, selectedSize)
                                                }}
                                                className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition"
                                            >
                                                <ShoppingCart size={14} /> Add to Bag
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}

                    {/* Recently Viewed Panel */}
                    {recentlyViewed.length > 0 && (
                        <div className="border-t border-white/5 pt-10">
                            <h3 className="text-xs text-gray-500 uppercase tracking-widest font-black mb-6">Recently Viewed</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {recentlyViewed.map((item, idx) => (
                                    <div key={idx} className="bg-[#050b14] border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                                        <img src={item.image} alt={item.name} className="w-10 h-10 object-contain" />
                                        <div className="min-w-0">
                                            <p className="font-bold text-xs truncate text-white">{item.name}</p>
                                            <p className="text-[10px] text-green-400">₹{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Ratings & Reviews Modal Window */}
            <AnimatePresence>
                {activeJerseyReviews && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                        <div onClick={() => setActiveJerseyReviews(null)} className="absolute inset-0 bg-black/80 backdrop-blur-xs" />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-lg bg-[#050b14]/95 border border-white/10 p-6 rounded-3xl shadow-2xl z-10 flex flex-col justify-between max-h-[90vh] overflow-hidden"
                        >
                            <div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                                    <div>
                                        <h3 className="font-bold text-white text-md uppercase">{activeJerseyReviews.name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                            <Star size={12} className="text-yellow-400" fill="currentColor" />
                                            <span className="font-bold text-white">{reviewStats.avgRating}</span>
                                            <span>({reviewStats.count} verified ratings)</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveJerseyReviews(null)} className="text-gray-400 hover:text-white transition">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Review messages list */}
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
                                    {reviewsList.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 text-xs">
                                            No reviews yet. Be the first to verify this product fit!
                                        </div>
                                    ) : (
                                        reviewsList.map((rev, idx) => (
                                            <div key={idx} className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl text-xs">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-white">{rev.userName}</span>
                                                    <div className="flex gap-0.5 text-yellow-400">
                                                        {Array.from({ length: rev.rating }).map((_, i) => (
                                                            <Star key={i} size={10} fill="currentColor" />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-400 mt-1">{rev.comment}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Write Review Section */}
                            <div className="border-t border-white/5 pt-4 space-y-3">
                                <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest">Share Your Feedback</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">Star Rating:</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(stars => (
                                            <button
                                                key={stars}
                                                onClick={() => setNewRating(stars)}
                                                className={`transition ${newRating >= stars ? 'text-yellow-400' : 'text-gray-600'}`}
                                            >
                                                <Star size={16} fill={newRating >= stars ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add comment..."
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-green-400/50"
                                    />
                                    <button
                                        onClick={handlePostReview}
                                        className="bg-green-500 hover:bg-green-400 text-black px-4 rounded-xl text-xs font-bold uppercase transition"
                                    >
                                        Post
                                    </button>
                                </div>
                                {reviewPostSuccess && <p className="text-[10px] text-green-400 flex items-center gap-1"><ShieldCheck size={12} /> {reviewPostSuccess}</p>}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* STUNNING FUTURISTIC PRODUCT DETAILS MODAL */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                        <div 
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                setSelectedProduct(null)
                            }}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer z-0" 
                        />
                        
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-4xl bg-gradient-to-b from-[#050b14]/95 via-[#02060d]/95 to-[#050b14]/95 border border-white/10 rounded-[32px] shadow-[0_0_50px_rgba(34,197,94,0.15)] z-10 overflow-y-auto max-h-[90vh] md:max-h-none flex flex-col md:flex-row gap-8 p-8 pointer-events-auto"
                        >
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    setSelectedProduct(null)
                                }}
                                className="absolute top-6 right-6 text-gray-400 hover:text-white transition p-2 bg-white/5 hover:bg-white/10 rounded-full z-50 cursor-pointer pointer-events-auto"
                            >
                                <X size={20} />
                            </button>

                            {/* Left Column: Image Container */}
                            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/5 rounded-3xl p-6 min-h-[250px] md:min-h-[380px] relative overflow-hidden group">
                                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
                                
                                <motion.img 
                                    src={selectedProduct.image} 
                                    alt={selectedProduct.name} 
                                    className="h-56 object-contain z-10 transition-transform duration-500 group-hover:scale-105"
                                />
                                <span className="absolute bottom-4 left-4 text-[9px] font-black uppercase tracking-widest text-green-400/60 z-10">
                                    TeesX TechFit™ 2026
                                </span>
                            </div>

                            {/* Right Column: Premium Details */}
                            <div className="flex-1 flex flex-col justify-between space-y-6 z-10 text-left">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                                            {selectedProduct.category} Collection
                                        </span>
                                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-xs text-yellow-400">
                                            <Star size={12} fill="currentColor" />
                                            <span className="font-bold text-white text-[11px]">{selectedProduct.rating}</span>
                                        </div>
                                    </div>

                                    <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-wider text-white">
                                        {selectedProduct.name}
                                    </h2>

                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-green-400 font-mono">₹{selectedProduct.price}</span>
                                        <span className="text-xs text-gray-500 line-through">₹1,799</span>
                                        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md font-bold">50% OFF</span>
                                    </div>

                                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed border-t border-white/5 pt-4">
                                        Engineered with TeesX proprietary AeroDry™ moisture-wicking fibers to keep you cool under peak pressure. Features ultra-breathable mesh ventilation panels, ergonomic flatlock anti-chafing seams, and double-stitched reinforcements for unmatched longevity on the turf.
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-[10px] bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
                                        <div className="text-gray-500 font-medium">Fabric: <span className="text-white font-bold">100% Recycled Polyester</span></div>
                                        <div className="text-gray-500 font-medium">Fit: <span className="text-white font-bold">Athletic Tailored</span></div>
                                        <div className="text-gray-500 font-medium">Weight: <span className="text-white font-bold">Ultra-light 140g</span></div>
                                        <div className="text-gray-500 font-medium">Wash: <span className="text-white font-bold">Machine Wash Cold</span></div>
                                    </div>
                                </div>

                                {/* Size Selector */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-black uppercase text-green-400 tracking-wider">Select Size Fit</span>
                                        <span className="text-gray-500 text-[10px] font-mono">Standard Sizing</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {["XS", "S", "M", "L", "XL", "2XL", "3XL"].map(sz => (
                                            <button
                                                key={sz}
                                                onClick={() => setModalSize(sz)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                                                    modalSize === sz 
                                                        ? 'border-green-500 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)] font-black' 
                                                        : 'border-white/5 bg-white/[0.01] hover:border-white/20 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {sz}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Purchase controls */}
                                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => {
                                            addToCart(selectedProduct, modalSize)
                                            setSelectedProduct(null)
                                        }}
                                        className="flex-1 bg-green-500 hover:bg-green-400 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(34,197,94,0.25)]"
                                    >
                                        <ShoppingCart size={16} /> Add to Shopping Bag
                                    </button>
                                    
                                    <button 
                                        onClick={() => toggleWishlist(selectedProduct)}
                                        className="p-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-red-500 rounded-2xl transition duration-300"
                                    >
                                        <Heart 
                                            size={18} 
                                            fill={wishlist.some(w => w.name === selectedProduct.name) ? "currentColor" : "none"} 
                                            className={wishlist.some(w => w.name === selectedProduct.name) ? 'text-red-500' : 'text-gray-400'} 
                                        />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Jersey