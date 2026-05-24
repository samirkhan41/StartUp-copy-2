import React, { useContext, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, ListOrdered, ShieldAlert, LogOut, Tag, Menu, X } from 'lucide-react'
import logo from '../assets/teesx-logo-wide.png'
import { adminDataContext } from '../context/AdminContext'

const Sidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { setAdminData } = useContext(adminDataContext)
    const [isOpen, setIsOpen] = useState(false)

    const menuItems = [
        { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { label: 'Add Product', path: '/add', icon: <PlusCircle size={18} /> },
        { label: 'Inventory list', path: '/list', icon: <ListOrdered size={18} /> },
        { label: 'Orders manager', path: '/orders', icon: <ShieldAlert size={18} /> },
        { label: 'Coupons center', path: '/coupons', icon: <Tag size={18} /> }
    ]

    const handleLogout = () => {
        setAdminData(null)
        navigate('/login')
    }

    return (
        <>
            {/* Dynamic CSS Margin Override Injector for all Admin Pages on Mobile */}
            
            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 1024px) {
                    .ml-64 {
                        margin-left: 0 !important;
                        padding-top: 5.5rem !important;
                        padding-left: 1.25rem !important;
                        padding-right: 1.25rem !important;
                    }
                }
            `}} />

            {/* Mobile Top Header Bar */}
            <div className="fixed top-4 left-4 right-4 h-14 bg-[#050b14]/90 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-between px-4 z-[998] lg:hidden shadow-2xl">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="TeesX logo" className="h-8 w-auto filter brightness-110" />
                    <span className="text-[8px] text-green-400 font-black tracking-widest uppercase">Admin Ops</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition"
                >
                    {isOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {/* Click-outside Backdrop Overlay for Mobile Drawer */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[997] lg:hidden animate-in fade-in duration-200"
                />
            )}

            {/* Sidebar drawer container */}
            <div className={`fixed top-0 left-0 h-screen w-64 bg-[#050b14]/95 border-r border-white/5 backdrop-blur-xl p-6 flex flex-col justify-between z-[999] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    {/* Logo & Brand Details */}
                    <div onClick={() => { navigate('/'); setIsOpen(false) }} className="cursor-pointer mb-10">
                        <img src={logo} alt="TeesX logo" className="w-32 filter brightness-110 rounded-3xl p-4" />
                        <span className="text-[10px] text-green-400 font-black tracking-widest uppercase block mt-2 ml-1">Admin Operations</span>
                    </div>

                    {/* Navigation menu links */}
                    <nav className="space-y-2">
                        {menuItems.map(item => {
                            const isActive = location.pathname === item.path
                            return (
                                <div
                                    key={item.label}
                                    onClick={() => {
                                        navigate(item.path)
                                        setIsOpen(false)
                                    }}
                                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer text-xs font-bold transition-all uppercase tracking-wider ${isActive
                                            ? 'bg-green-500 text-black shadow-[0_4px_20px_rgba(34,197,94,0.25)]'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                            )
                        })}
                    </nav>
                </div>

                {/* Logout button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition uppercase tracking-wider"
                >
                    <LogOut size={18} />
                    <span>Log Out</span>
                </button>
            </div>
        </>
    )
}

export default Sidebar
