import React, { useContext, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/teesx-logo-wide.png'
import { FaSearch, FaUserCircle, FaHome, FaTrash, FaMoon, FaSun } from "react-icons/fa"
import { IoCartOutline, IoClose } from "react-icons/io5"
import { BsFillCollectionFill } from "react-icons/bs"
import { MdContacts } from "react-icons/md"
import { IoMdContact } from "react-icons/io"
import axios from 'axios'
import { userDataContext } from '../context/UserContext'
import { authDataContext } from '../context/AuthContext'
import { cartDataContext } from '../context/CartContext'

import j1 from "../assets/GreenImg.png"
import j2 from "../assets/PinkyPonky.png"
import j3 from "../assets/PurpleImg.png"
import j4 from "../assets/aboutImage.PNG"

const defaultJerseys = [
    { name: "Vortex Strike Jersey", price: 1, image: j1, category: "Football" },
    { name: "Apex Pro Jersey", price: 899, image: j2, category: "Football" },
    { name: "Elite Performance Jersey", price: 949, image: j3, category: "Basketball" },
    { name: "Stealth Edition Jersey", price: 849, image: j4, category: "Cricket" },
    { name: "Thunder Bolt Jersey", price: 899, image: j1, category: "Volleyball" },
    { name: "Crimson Fury Jersey", price: 899, image: j2, category: "Football" },
    { name: "Phantom Jersey", price: 849, image: j3, category: "Cricket" },
    { name: "Ion Energy Jersey", price: 899, image: j4, category: "Volleyball" }
]

const Navbar = () => {
    const [showSearch, setShowSearch] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [showCart, setShowCart] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const searchRef = useRef(null)
    
    const navigate = useNavigate()
    const { userData, setUserData } = useContext(userDataContext)
    const { serverUrl } = useContext(authDataContext)
    
    // TeesX Cart integration
    const { 
        cartItems, 
        removeFromCart, 
        updateQuantity, 
        subtotal, 
        isDarkMode, 
        setIsDarkMode 
    } = useContext(cartDataContext)

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const currentUserObj = userData?.user || userData;

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearch(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Smart search for Navbar dropdown
    const getSearchResults = (query) => {
        if (!query || query.trim().length < 1) return []
        const q = query.toLowerCase().trim()
        
        return defaultJerseys.filter(jersey => {
            const name = jersey.name.toLowerCase()
            const category = jersey.category.toLowerCase()
            
            // Name match (partial words)
            const queryWords = q.split(/\s+/)
            if (queryWords.some(word => word.length >= 1 && name.includes(word))) return true
            
            // Category match
            if (category.includes(q)) return true
            
            // Sport keywords
            const sports = ['football', 'basketball', 'cricket', 'volleyball']
            if (sports.some(sport => q.includes(sport) && category.toLowerCase() === sport)) return true
            
            // Color keywords
            const colorMap = {
                'green': ['vortex', 'thunder'],
                'pink': ['apex', 'crimson'],
                'purple': ['elite', 'phantom'],
                'white': ['stealth', 'ion']
            }
            for (const [color, keywords] of Object.entries(colorMap)) {
                if (q.includes(color) && keywords.some(kw => name.includes(kw))) return true
            }
            
            // Price keywords
            if (['cheap', 'sasta', 'budget', 'affordable'].some(kw => q.includes(kw)) && jersey.price <= 849) return true
            if (['expensive', 'premium', 'mehenga'].some(kw => q.includes(kw)) && jersey.price >= 949) return true
            
            // Generic
            if (['best', 'top', 'popular'].some(kw => q.includes(kw))) return true
            if (['jersey', 'tshirt', 't-shirt', 'shirt', 'all'].some(kw => q.includes(kw))) return true
            
            return false
        })
    }

    const searchResults = getSearchResults(searchQuery)

    const handleLogout = async () => {
        try {
            await axios.get(serverUrl + "/api/auth/logout", { withCredentials: true })
            setUserData(null)
            navigate("/login")
        } catch (error) {
            console.error("Logout failed", error)
        }
    }

    return (
        <>
            {/* NAVBAR */}
            <div className='h-[74px] w-[calc(100%-2rem)] max-w-7xl fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-8 bg-black/85 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl transition-all'>
                
                {/* Logo */}
                <div onClick={() => navigate("/")} className='flex items-center gap-2 cursor-pointer group'>
                    <img src={logo} alt="TeesX logo" className='h-[32px] sm:h-[42px] w-auto transition group-hover:scale-105 object-contain rounded-lg p-0.5 filter brightness-110' />
                </div>

                {/* Desktop Nav */}
                <div className='hidden md:flex items-center gap-10 text-xs font-black tracking-widest text-gray-400'>
                    <span onClick={() => navigate("/")} className='hover:text-green-400 cursor-pointer transition uppercase'>Home</span>
                    <span onClick={() => navigate("/jersey")} className='hover:text-green-400 cursor-pointer transition uppercase'>Jerseys</span>
                    <span onClick={() => navigate("/about")} className='hover:text-green-400 cursor-pointer transition uppercase'>About</span>
                    <span onClick={() => navigate("/contact")} className='hover:text-green-400 cursor-pointer transition uppercase'>Contact</span>
                </div>

                {/* Right widgets */}
                <div className='flex items-center gap-6 text-gray-400 text-lg'>
                    
                    {/* Dark Mode toggle */}
                    <button 
                        onClick={() => setIsDarkMode(!isDarkMode)} 
                        className="hover:text-green-400 transition cursor-pointer text-sm"
                    >
                        {isDarkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}
                    </button>

                    <FaSearch onClick={() => setShowSearch(prev => !prev)} className='hover:text-white cursor-pointer transition text-sm' />

                    {/* Cart Trigger with Active Bubble counter */}
                    <div onClick={() => setShowCart(true)} className="relative cursor-pointer hover:text-white transition">
                        <IoCartOutline className="text-xl" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-green-500 text-black text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                                {cartCount}
                            </span>
                        )}
                    </div>

                    {!currentUserObj ? (
                        <FaUserCircle className='hover:text-white cursor-pointer transition text-sm'
                            onClick={() => setShowProfile(prev => !prev)} />
                    ) : (
                        <div className='w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-black font-black text-xs cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                            onClick={() => setShowProfile(prev => !prev)}
                            onMouseEnter={() => setShowProfile(true)}
                        >
                            {currentUserObj?.name ? currentUserObj.name[0].toUpperCase() : "U"}
                        </div>
                    )}
                </div>

                {/* Live Search Dropdown */}
                {showSearch && (
                    <div ref={searchRef} className='absolute top-[75px] left-0 w-full flex flex-col items-center py-4 bg-black/95 backdrop-blur-xl border-b border-white/5 rounded-b-2xl z-50'>
                        <div className="w-[90%] sm:w-[60%] relative">
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                                <input 
                                    type="text" 
                                    placeholder='Search by name, sport, color, price...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchQuery.trim()) {
                                            navigate(`/jersey?search=${searchQuery}`)
                                            setShowSearch(false)
                                            setSearchQuery('')
                                        }
                                        if (e.key === 'Escape') {
                                            setShowSearch(false)
                                            setSearchQuery('')
                                        }
                                    }}
                                    autoFocus
                                    className='w-full bg-white/5 border border-white/10 text-white pl-10 pr-10 py-3 rounded-xl text-xs outline-none focus:border-green-400/50 transition-colors' 
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                                    >
                                        <IoClose size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Results dropdown */}
                            {searchQuery.trim().length > 0 && (
                                <div className="mt-2 bg-[#0a1120]/95 border border-white/5 rounded-2xl overflow-hidden shadow-2xl max-h-[320px] overflow-y-auto">
                                    {searchResults.length === 0 ? (
                                        <div className="py-8 px-4 text-center">
                                            <p className="text-gray-500 text-xs">No products found for "<span className="text-white">{searchQuery}</span>"</p>
                                            <p className="text-gray-600 text-[10px] mt-1">Try searching by name, sport, or color</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="px-4 py-2 border-b border-white/5">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                                                </p>
                                            </div>
                                            {searchResults.map((item, idx) => (
                                                <div 
                                                    key={idx}
                                                    onClick={() => {
                                                        navigate(`/jersey?search=${item.name}`)
                                                        setShowSearch(false)
                                                        setSearchQuery('')
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/[0.02] last:border-0"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        <img src={item.image} alt={item.name} className="w-8 h-8 object-contain" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded font-bold uppercase">{item.category}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-green-400 font-black text-xs font-mono">₹{item.price}</span>
                                                </div>
                                            ))}
                                            {searchResults.length > 0 && (
                                                <div 
                                                    onClick={() => {
                                                        navigate(`/jersey?search=${searchQuery}`)
                                                        setShowSearch(false)
                                                        setSearchQuery('')
                                                    }}
                                                    className="px-4 py-3 text-center hover:bg-green-500/5 cursor-pointer transition-colors border-t border-white/5"
                                                >
                                                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">
                                                        View all results →
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Profile dropdown */}
                {showProfile && (
                    <div 
                        onMouseLeave={() => setShowProfile(false)}
                        className='absolute w-[200px] top-[110%] right-[4%] bg-black/90 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in-50 duration-200'
                    >
                        <ul className='text-gray-400 text-xs font-bold space-y-1'>
                            {currentUserObj && (
                                <li className="px-4 py-2 border-b border-white/5 text-white truncate">
                                    Hey, {currentUserObj.name}
                                </li>
                            )}
                            {!currentUserObj ? (
                                <li onClick={() => { navigate("/login"); setShowProfile(false) }} className='hover:bg-white/5 hover:text-white px-4 py-2.5 rounded-xl cursor-pointer transition'>Login / Signup</li>
                            ) : (
                                <>
                                    <li onClick={() => { navigate("/orders/track"); setShowProfile(false) }} className='hover:bg-white/5 hover:text-white px-4 py-2.5 rounded-xl cursor-pointer transition'>Track Orders</li>
                                    <li onClick={() => { handleLogout(); setShowProfile(false) }} className='hover:bg-white/5 text-red-400 px-4 py-2.5 rounded-xl cursor-pointer transition'>Logout</li>
                                </>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {/* Premium Sliding Cart Drawer */}
            {showCart && (
                <div className="fixed inset-0 z-[9999] flex justify-end font-sans">
                    {/* Overlay backdrop */}
                    <div onClick={() => setShowCart(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
                    
                    {/* Drawer container */}
                    <div className="relative w-full max-w-[400px] h-full bg-[#050b14]/95 border-l border-white/5 backdrop-blur-2xl p-6 pb-24 md:pb-6 flex flex-col justify-between shadow-2xl">
                        <div>
                            {/* Header */}
                            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                                <h3 className="text-white text-md font-black uppercase italic tracking-wider flex items-center gap-2">
                                    <IoCartOutline /> SHOPPING BAG
                                </h3>
                                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white transition">
                                    <IoClose size={24} />
                                </button>
                            </div>

                            {/* Cart List */}
                            <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 text-xs">
                                        Your bag is currently empty.
                                    </div>
                                ) : (
                                    cartItems.map((item, index) => (
                                        <div key={index} className="flex gap-4 items-center bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
                                            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center font-black text-green-400 text-xs font-mono">
                                                {item.size}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white text-xs truncate">{item.name}</h4>
                                                <p className="text-[10px] text-green-400 font-mono mt-0.5">₹{item.price}</p>
                                                
                                                {/* Qty edit widgets */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button onClick={() => updateQuantity(item.name, item.size, item.quantity - 1)} className="w-5 h-5 bg-white/5 border border-white/10 text-white rounded-md text-[10px] flex items-center justify-center hover:bg-white/10">-</button>
                                                    <span className="text-[10px] font-bold text-white font-mono">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.name, item.size, item.quantity + 1)} className="w-5 h-5 bg-white/5 border border-white/10 text-white rounded-md text-[10px] flex items-center justify-center hover:bg-white/10">+</button>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.name, item.size)} className="text-gray-500 hover:text-red-400 p-2 transition">
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Totals & checkout button */}
                        <div className="border-t border-white/5 pt-6 space-y-4">
                            <div className="flex justify-between text-xs text-gray-400 font-bold">
                                <span>Cart Subtotal:</span>
                                <span className="text-green-400 text-sm font-black font-mono">₹{subtotal}</span>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowCart(false)
                                    navigate("/checkout")
                                }}
                                disabled={cartItems.length === 0}
                                className="w-full bg-green-500 disabled:bg-gray-800 disabled:text-gray-500 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-400 transition"
                            >
                                Secure Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile bottom nav */}
            <div className='fixed bottom-0 left-0 w-full h-[70px] flex items-center justify-around px-6 pb-2 pt-2 bg-black/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-5px_25px_rgba(0,0,0,0.8)] md:hidden z-[9999]'>
                <button onClick={() => navigate("/")} className='flex flex-col items-center text-gray-400 hover:text-white text-xs'>
                    <FaHome className='text-lg mb-1' />
                    Home
                </button>
                <button onClick={() => navigate("/jersey")} className='flex flex-col items-center text-gray-400 hover:text-white text-xs'>
                    <BsFillCollectionFill className='text-lg mb-1' />
                    Jerseys
                </button>
                <button onClick={() => navigate("/about")} className='flex flex-col items-center text-gray-400 hover:text-white text-xs'>
                    <MdContacts className='text-lg mb-1' />
                    About
                </button>
                <button onClick={() => navigate("/contact")} className='flex flex-col items-center text-gray-400 hover:text-white text-xs'>
                    <IoMdContact className='text-lg mb-1' />
                    Contact
                </button>
            </div>
        </>
    )
}

export default Navbar