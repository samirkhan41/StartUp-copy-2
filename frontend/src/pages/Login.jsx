import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Trophy, Zap, Star } from "lucide-react";
import LogoImage from '../assets/newABout.png';
import { FaGoogle, FaFacebook } from "react-icons/fa";

import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { authDataContext } from "../context/AuthContext";
import { userDataContext } from "../context/UserContext";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/Firebase";

// Floating particle component
const FloatingParticle = ({ delay, duration, x, y, size }) => (
  <motion.div
    className="absolute rounded-full bg-green-400/20"
    style={{ width: size, height: size }}
    initial={{ x, y, opacity: 0, scale: 0 }}
    animate={{
      y: [y, y - 120, y],
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const { serverUrl } = useContext(authDataContext)
  const navigate = useNavigate()
  const { getCurrentUser } = useContext(userDataContext)

  const googleLogin = async () => {
    try {
      const response = await signInWithPopup(auth, provider)
      let user = response.user
      let name = user.displayName
      let email = user.email

      const result = await axios.post(serverUrl + "/api/auth/googlelogin",
        {
          name,
          email
        },
        { withCredentials: true }
      )

      console.log(result.data)
      await getCurrentUser()
      navigate('/')
    }
    catch (error) {
      console.log({ message: error.message })
    }
  }
  const formHandled = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await axios.post(serverUrl + "/api/auth/login",
        {
          email,
          password
        }
        ,
        { withCredentials: true }
      )
      console.log(response.data)
      navigate('/')
    }
    catch (error) {
      console.log("mai hun error ")
      console.log({ message: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#02060d] flex items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-lime-400 selection:text-black relative">

      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-green-500/[0.07] rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-lime-400/[0.05] rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/[0.04] rounded-full blur-[100px]"
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 1.5}
            duration={6 + i}
            x={Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)}
            y={Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)}
            size={4 + Math.random() * 6}
          />
        ))}
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* MAIN WRAPPER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-[1100px] rounded-[24px] lg:rounded-[32px] border border-white/[0.08] bg-[#050b14]/80 backdrop-blur-2xl shadow-[0_0_80px_rgba(34,197,94,0.06)] flex flex-col lg:flex-row overflow-hidden"
      >

        {/* LEFT SECTION — Brand Visual */}
        <div className="relative hidden lg:flex w-[45%] flex-col justify-between p-10 overflow-hidden">
          {/* Background image with overlay */}
          <div className="absolute inset-0">
            <img src={LogoImage} alt="TeesX" className="absolute inset-0 w-full h-full object-cover scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050b14]/40 via-[#050b14]/20 to-[#050b14]/90" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] via-transparent to-[#050b14]/30" />
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-green-500 flex items-center justify-center font-black text-black text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)]">TX</div>
            <div>
              <h1 className="text-white text-xl font-black tracking-tight">TeesX</h1>
              <p className="text-green-400 text-[9px] font-bold uppercase tracking-[0.2em]">Premium Sportswear</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative z-10"
          >
            <h2 className="text-white text-5xl xl:text-6xl font-black uppercase italic leading-[0.9] mb-6">
              Wear <br /> Your <br /> <span className="text-green-400">Passion</span>
            </h2>
            <p className="text-gray-300 text-sm font-medium max-w-[280px] leading-relaxed">
              Premium football jerseys engineered for champions who live and breathe the beautiful game.
            </p>
          </motion.div>

          {/* Feature chips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative z-10 flex flex-wrap gap-3"
          >
            {[
              { icon: <ShieldCheck size={14} />, label: "Premium Quality" },
              { icon: <Sparkles size={14} />, label: "Trendy Designs" },
              { icon: <Trophy size={14} />, label: "True Fans" },
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
                <span className="text-green-400">{feat.icon}</span>
                <span className="text-white text-[10px] font-bold uppercase tracking-wider">{feat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 relative">
          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-400/[0.03] blur-[100px] pointer-events-none" />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[420px] relative z-10"
          >
            {/* Mobile logo */}
            <motion.div variants={itemVariants} className="flex lg:hidden items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center font-black text-black text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)]">TX</div>
              <div>
                <h1 className="text-white text-lg font-black tracking-tight">TeesX</h1>
                <p className="text-green-400 text-[8px] font-bold uppercase tracking-[0.2em]">Premium Sportswear</p>
              </div>
            </motion.div>

            {/* Top bar */}
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-10">
              <p className="text-gray-400 text-sm">
                New here?{" "}
                <span
                  onClick={() => navigate("/signup")}
                  className="text-green-400 cursor-pointer font-bold hover:text-green-300 transition-colors"
                >
                  Create Account
                </span>
              </p>
              <button
                type="button"
                onClick={() => window.open("https://startup-copy-2-admin.onrender.com/", "_blank")}
                className="text-[9px] font-black uppercase tracking-widest text-green-400 border border-green-500/20 bg-green-500/5 px-3 py-1.5 rounded-lg hover:bg-green-500/15 transition duration-300 flex items-center gap-1"
              >
                <Zap size={10} /> Admin
              </button>
            </motion.div>

            {/* Heading */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-[2px] bg-green-500 rounded-full" />
                <span className="text-green-400 text-[10px] font-black uppercase tracking-[0.25em]">Welcome Back</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-tight leading-[1.1]">
                Sign In To <br /><span className="text-green-400">Your Account</span>
              </h2>
            </motion.div>

            <form onSubmit={formHandled}>
              <div className="space-y-5">
                {/* EMAIL */}
                <motion.div variants={itemVariants}>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.15em] mb-2 block">Email Address</label>
                  <div className={`flex items-center gap-3 bg-white/[0.03] border rounded-xl px-4 h-14 transition-all duration-300 ${focusedField === 'email' ? 'border-green-400/50 bg-green-400/[0.02] shadow-[0_0_20px_rgba(34,197,94,0.05)]' : 'border-white/[0.08]'}`}>
                    <Mail className={`w-[18px] h-[18px] transition-colors duration-300 ${focusedField === 'email' ? 'text-green-400' : 'text-gray-600'}`} />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      type="email"
                      placeholder="Enter your email"
                      className="bg-transparent outline-none text-white w-full text-sm font-medium placeholder:text-gray-600"
                    />
                  </div>
                </motion.div>

                {/* PASSWORD */}
                <motion.div variants={itemVariants}>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.15em] mb-2 block">Password</label>
                  <div className={`flex items-center gap-3 bg-white/[0.03] border rounded-xl px-4 h-14 transition-all duration-300 ${focusedField === 'password' ? 'border-green-400/50 bg-green-400/[0.02] shadow-[0_0_20px_rgba(34,197,94,0.05)]' : 'border-white/[0.08]'}`}>
                    <Lock className={`w-[18px] h-[18px] transition-colors duration-300 ${focusedField === 'password' ? 'text-green-400' : 'text-gray-600'}`} />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="bg-transparent outline-none text-white w-full text-sm font-medium placeholder:text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-green-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-end">
                  <button type="button" className="text-green-400 text-xs font-bold hover:text-green-300 transition-colors">Forgot Password?</button>
                </motion.div>

                {/* SUBMIT */}
                <motion.div variants={itemVariants}>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-black flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:shadow-[0_0_40px_rgba(34,197,94,0.3)] transition-shadow disabled:opacity-50 relative overflow-hidden group"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative z-10 flex items-center gap-2">
                      {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full" />
                      ) : (
                        <>LOGIN <ArrowRight className="w-4 h-4" /></>
                      )}
                    </span>
                  </motion.button>
                </motion.div>

                {/* Divider */}
                <motion.div variants={itemVariants} className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">Or continue with</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </motion.div>

                {/* Social Login */}
                <motion.div variants={itemVariants} className="flex gap-3">
                  <button
                    type="button"
                    onClick={googleLogin}
                    className="flex-1 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center gap-2 text-gray-400 text-sm font-bold hover:bg-white/[0.06] hover:border-white/15 transition-all hover:text-white group"
                  >
                    <FaGoogle className="text-base group-hover:text-green-400 transition-colors" />
                    <span className="text-xs">Google</span>
                  </button>
                  <button
                    type="button"
                    className="flex-1 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center gap-2 text-gray-400 text-sm font-bold hover:bg-white/[0.06] hover:border-white/15 transition-all hover:text-white group"
                  >
                    <FaFacebook className="text-base group-hover:text-blue-400 transition-colors" />
                    <span className="text-xs">Facebook</span>
                  </button>
                </motion.div>

                {/* Security badge */}
                <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 pt-4">
                  <ShieldCheck size={12} className="text-green-500/40" />
                  <span className="text-[10px] text-gray-600 font-medium">Protected with 256-bit SSL encryption</span>
                </motion.div>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
