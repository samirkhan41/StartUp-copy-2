import React, { useState, useEffect, useContext } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingCart, Flame, ShieldAlert, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cartDataContext } from '../context/CartContext';

import WhiteJersey from "../assets/aboutImage.PNG";
import PinkJersey from '../assets/PinkyPonky.png';
import PurpleJersey from '../assets/PurpleImg.png';
import GreenJersey from '../assets/GreenImg.png';
import circleLogo from "../assets/teesx-logo-circle.jpg";

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useContext(cartDataContext);
  const [currentJersey, setCurrentJersey] = useState(WhiteJersey);
  const [activeColor, setActiveColor] = useState('white');
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedEnd = localStorage.getItem('teesx_flash_offer_end');
    const now = Date.now();
    
    if (savedEnd) {
      const remaining = Math.max(0, Math.floor((Number(savedEnd) - now) / 1000));
      if (remaining > 0) {
        return remaining;
      }
    }
    
    const newEnd = now + 86400 * 1000;
    localStorage.setItem('teesx_flash_offer_end', newEnd.toString());
    return 86400;
  });

  // Countdown timer log
  useEffect(() => {
    const timer = setInterval(() => {
      const savedEnd = localStorage.getItem('teesx_flash_offer_end');
      const now = Date.now();
      
      if (savedEnd) {
        const remaining = Math.max(0, Math.floor((Number(savedEnd) - now) / 1000));
        if (remaining > 0) {
          setTimeLeft(remaining);
        } else {
          const newEnd = now + 86400 * 1000;
          localStorage.setItem('teesx_flash_offer_end', newEnd.toString());
          setTimeLeft(86400);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3D Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-90deg", "90deg"]);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["20deg", "-20deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const colors = [
    { id: 'white', bg: 'bg-white', img: WhiteJersey, price: 899, name: "TeesX Vortex Classic" },
    { id: 'pink', bg: 'bg-[#ff0095]', img: PinkJersey, price: 899, name: "Apex Pro Crimson" },
    { id: 'purple', bg: 'bg-[#8a2be2]', img: PurpleJersey, price: 949, name: "Elite Performance Purple" },
    { id: 'green', bg: 'bg-[#00ff41]', img: GreenJersey, price: 899, name: "Vortex Strike Emerald" },
  ];

  const activeProduct = colors.find(c => c.id === activeColor) || colors[0];

  return (
    <div className="min-h-screen bg-[#02060d] text-white font-sans overflow-x-hidden relative selection:bg-green-500 selection:text-black">

      {/* Background Decor */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none z-0">
        <h1 className="text-[22vw] font-black italic tracking-tighter text-white">TEESX</h1>
      </div>

      <div className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between px-6 lg:px-12 pt-36 pb-12 z-10 min-h-screen">

        {/* LEFT SECTION: Brand Hero */}
        <div className="w-full lg:w-1/2 flex flex-col items-start justify-center text-left">

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest"
            >
              <Flame size={12} className="animate-pulse" /> 2026 CYBERPUNK COLLECTION
            </motion.div>
            
            {/* Elegant Rotating Logo Badge */}
            <motion.img 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, rotate: 360 }}
              transition={{ 
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                rotate: { repeat: Infinity, duration: 25, ease: "linear" } 
              }}
              src={circleLogo} 
              alt="TeesX Brand Seal" 
              className="w-9 h-9 rounded-full border border-white/10 shadow-lg object-contain bg-white p-0.5"
            />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[8vw] lg:text-[95px] font-black italic text-white leading-[0.85] uppercase mb-6"
          >
            WEAR <br />
            <span className="text-transparent" style={{ WebkitTextStroke: "2px #22c55e" }}>
              YOUR FUTURE
            </span>
          </motion.h2>

          <p className="text-gray-400 text-xs sm:text-sm max-w-md mb-8 leading-relaxed">
            Unleash peak athletic performance with dynamic lightweight threads, glowing neon fiber weaves, and moisture-wicking technology. Engineered for turf legends.
          </p>

          {/* Countdown Clock Offer */}
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-4 mb-10 w-fit">
            <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider flex items-center gap-1">
              <ShieldAlert size={12} /> FLASH OFFER
            </span>
            <div className="text-sm font-bold text-white font-mono bg-black/40 border border-white/10 px-3 py-1 rounded-xl">
              {formatTime(timeLeft)}
            </div>
            <span className="text-[10px] text-gray-500">50% off applied at checkout</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <button
              onClick={() => addToCart({ name: activeProduct.name, price: activeProduct.price, image: activeProduct.img }, 'M')}
              className="bg-green-500 text-black px-8 py-4 rounded-xl font-black uppercase flex items-center gap-3 hover:bg-green-400 transition-all active:scale-95 text-xs tracking-wider"
            >
              <ShoppingCart size={16} /> Add to Bag
            </button>
            <button
              onClick={() => navigate('/jersey')}
              className="bg-transparent border border-green-500/30 text-green-400 px-8 py-4 rounded-xl font-black uppercase hover:bg-green-500/10 transition-all active:scale-95 text-xs tracking-wider"
            >
              Explore Gear
            </button>
          </div>

          {/* Color Switcher */}
          <div>
            <p className="text-green-400 font-bold text-xs uppercase mb-4 tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} /> Choose futuristic theme color:
            </p>
            <div className="flex gap-4">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => {
                    setCurrentJersey(color.img);
                    setActiveColor(color.id);
                  }}
                  className={`w-9 h-9 rounded-full ${color.bg} transition-all duration-300 transform hover:scale-125 ${activeColor === color.id ? 'ring-4 ring-green-400 scale-110' : 'ring-2 ring-white/20'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: 3D rotating model */}
        <div
          className="relative w-full lg:w-1/2 h-[55vh] lg:h-full flex items-center justify-center cursor-move"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: "1500px" }}
        >
          {/* Shadow glow floor */}
          <div
            className={`absolute bottom-10 w-[80%] h-[100px] bg-gradient-to-t ${activeColor === 'white' ? 'from-white/10' :
                activeColor === 'pink' ? 'from-pink-500/15' :
                  activeColor === 'purple' ? 'from-purple-500/15' :
                    'from-green-500/15'
              } to-transparent rounded-[100%] blur-[25px] transition-all duration-700 -z-1`}
            style={{ transform: "rotateX(60deg)" }}
          />

          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative flex items-center justify-center z-10"
          >
            <motion.img
              key={activeColor}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              src={currentJersey}
              alt="Elite Jersey"
              className="w-full max-w-[420px] lg:max-w-[550px] object-contain drop-shadow-[0_50px_60px_rgba(34,197,94,0.25)] pointer-events-none"
            />

            <div
              className="absolute top-1/4 -right-2 bg-green-500 text-black px-4 py-1.5 rounded-full font-black text-[10px] uppercase italic shadow-lg tracking-wider"
              style={{ transform: "translateZ(30px)" }}
            >
              Exclusive Drop
            </div>
          </motion.div>

          {/* Pricing tag */}
          <div className="absolute bottom-6 right-0 lg:right-6 flex items-baseline gap-2 text-white bg-black/40 border border-white/5 backdrop-blur-md px-5 py-3 rounded-2xl">
            <span className="text-4xl font-black italic">₹{activeProduct.price}</span>
            <div className="text-[9px] uppercase font-bold text-green-400 leading-none">
              TEESX <br /> SERIES 2026
            </div>
          </div>
        </div>

      </div>

      {/* Futuristic Perks Bar */}
      <div className="bg-[#050b14]/50 border-y border-white/5 py-10 w-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-left">
          <div className="flex items-start gap-4 p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
            <Trophy className="text-green-400 w-8 h-8" />
            <div>
              <p className="font-bold text-white uppercase tracking-wider">Champion Quality</p>
              <p className="text-gray-500 mt-1 text-[11px]">Engineered to resist wear and tear on the turf.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
            <TrendingUp className="text-green-400 w-8 h-8" />
            <div>
              <p className="font-bold text-white uppercase tracking-wider">Cyberpunk aesthetics</p>
              <p className="text-gray-500 mt-1 text-[11px]">Sleek dark themes with vibrant neon highlight lines.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
            <Sparkles className="text-green-400 w-8 h-8" />
            <div>
              <p className="font-bold text-white uppercase tracking-wider">Fast SandBox Shipping</p>
              <p className="text-gray-500 mt-1 text-[11px]">Real-time package timelines with invoice downloads.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;