import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Mail, ArrowRight } from 'lucide-react'
import { FaInstagram, FaTwitter, FaYoutube, FaDiscord } from 'react-icons/fa'
import logo from '../assets/teesx-logo-wide.png'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'

const Footer = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const { serverUrl } = useContext(authDataContext)

    const handleSubscribe = async (e) => {
        e.preventDefault()
        if (!email) {
            alert("Please enter a valid email address!")
            return
        }

        try {
            setLoading(true)
            const res = await axios.post(`${serverUrl}/api/user/newsletter/subscribe`, { email })
            alert(res.data.message || "Subscription successful! Welcome to the Core secure list.")
            setEmail('')
        } catch (error) {
            alert(error.response?.data?.message || "Failed to subscribe. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <footer className="w-full bg-[#030812]/90 border-t border-white/5 backdrop-blur-xl relative z-10 font-sans mt-24">
            
            {/* Top glowing ambient effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-gray-400 text-xs">
                
                {/* Brand description */}
                <div className="space-y-5">
                    <div onClick={() => navigate("/")} className="cursor-pointer">
                        <img src={logo} alt="TeesX logo" className="h-[46px] w-auto filter brightness-110 object-contain rounded-lg" />
                        <span className="text-[9px] text-green-400 font-black tracking-widest uppercase block mt-1">Wear your passion</span>
                    </div>
                    <p className="text-gray-500 leading-relaxed">
                        Redefining performance gear through sleek cyberpunk mechanics, glowing weave patterns, and premium athletic engineering for the future generation of sports champions.
                    </p>
                    {/* Social networks links */}
                    <div className="flex items-center gap-3.5 pt-2">
                        {[
                            { icon: <FaInstagram size={16} />, href: 'https://instagram.com' },
                            { icon: <FaTwitter size={16} />, href: 'https://twitter.com' },
                            { icon: <FaYoutube size={16} />, href: 'https://youtube.com' },
                            { icon: <FaDiscord size={16} />, href: 'https://discord.com' }
                        ].map((soc, idx) => (
                            <a 
                                key={idx} 
                                href={soc.href} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-500/30 transition-all duration-300"
                            >
                                {soc.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Collections links */}
                <div className="space-y-4 lg:pl-8">
                    <h4 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Flame size={12} className="text-green-500" /> Collections
                    </h4>
                    <ul className="space-y-2.5 font-bold uppercase tracking-wider text-[10px]">
                        {['Football Kits', 'Basketball Jerseys', 'Stealth cricket', 'Training activewear'].map(item => (
                            <li key={item} onClick={() => navigate('/jersey')} className="hover:text-green-400 cursor-pointer transition-colors duration-200">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Information links */}
                <div className="space-y-4 lg:pl-4">
                    <h4 className="text-white text-xs font-black uppercase tracking-widest">Support Portal</h4>
                    <ul className="space-y-2.5 font-bold uppercase tracking-wider text-[10px]">
                        <li onClick={() => navigate('/about')} className="hover:text-green-400 cursor-pointer transition-colors">Our Ethos</li>
                        <li onClick={() => navigate('/contact')} className="hover:text-green-400 cursor-pointer transition-colors">Contact operations</li>
                        <li className="hover:text-green-400 cursor-pointer transition-colors">Size Calibration</li>
                        <li className="hover:text-green-400 cursor-pointer transition-colors">Shipment Policies</li>
                    </ul>
                </div>

                {/* Newsletter subscription form */}
                <div className="space-y-4">
                    <h4 className="text-white text-xs font-black uppercase tracking-widest">Join the Core</h4>
                    <p className="text-gray-500 leading-relaxed">
                        Join the secure list to receive early access codes, exclusive variant leaks, and flash collection updates.
                    </p>
                    <form onSubmit={handleSubscribe} className="space-y-3">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-green-400/50 transition">
                            <Mail size={14} className="text-gray-500" />
                            <input 
                                type="email" 
                                placeholder="Enter core email" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="bg-transparent outline-none text-white text-xs w-full font-medium"
                                required
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-500 disabled:bg-gray-800 disabled:text-gray-500 text-black py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-1.5 hover:bg-green-400 transition"
                        >
                            {loading ? "INITIALIZING..." : "Initialize Join"} <ArrowRight size={12} />
                        </button>
                    </form>
                </div>

            </div>

            {/* Bottom info row */}
            <div className="border-t border-white/5 py-6 px-6 text-center text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                <p>&copy; {new Date().getFullYear()} TEESX OPERATIONS. All cybernetic assets protected.</p>
            </div>

        </footer>
    )
}

export default Footer
