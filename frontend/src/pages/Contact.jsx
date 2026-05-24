import React, { useState, useContext } from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaDiscord } from "react-icons/fa";
import { Phone, Mail, Send, Sparkles, MapPin, CheckCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { authDataContext } from "../context/AuthContext";

const Contact = () => {
  const navigate = useNavigate();
  const { serverUrl } = useContext(authDataContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlForm = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !message) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const baseApiUrl = serverUrl || "http://localhost:8000";
      await axios.post(
        `${baseApiUrl}/api/auth/formsection`,
        {
          firstName,
          lastName,
          email,
          phoneNumber: phone,
          message
        },
        { withCredentials: true }
      );

      alert("Message sent successfully ✅");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (error) {
      console.error("Form submission failed", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#02060d] min-h-screen pt-36 pb-16 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden font-sans">
      
      {/* Futurist background glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-900/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-900/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Header Block matching Home and Jersey pages */}
        <div className="text-center space-y-3">
          <p className="text-[10px] text-green-400 uppercase tracking-widest font-black flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="animate-pulse" /> TeesX Customer Squad
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-wide uppercase leading-none">
            Get in touch <span className="text-green-400">with us</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Have questions about custom printing, bulk team jersey orders, or order status tracking? 
            Send us a message and our support team will get back to you in no time!
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">

          {/* LEFT SIDE: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 bg-[#050b14] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="border-b border-white/5 pb-4 mb-6">
                <span className="text-[9px] text-green-400 font-black tracking-widest uppercase block mb-1">Encrypted Channel</span>
                <h2 className="text-lg font-black uppercase tracking-wide italic">Send an Inquiry</h2>
              </div>

              <form onSubmit={handlForm} className="space-y-4">
                
                {/* Name fields row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">First Name *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Samir"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-green-400/50 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Last Name *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Khan"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-green-400/50 transition"
                    />
                  </div>
                </div>

                {/* Email and Phone row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. samir@example.com"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-green-400/50 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone Number (Optional)</label>
                    <div className="flex gap-2">
                      <select className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none text-gray-300">
                        <option value="+91">+91 (IN)</option>
                        <option value="+971">+971 (AE)</option>
                        <option value="+1">+1 (US)</option>
                      </select>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="7857837294"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-green-400/50 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Message field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Your Message *</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="5"
                    placeholder="Describe your query in detail..."
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-green-400/50 transition resize-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-500 text-black px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-green-400 disabled:opacity-50 transition shadow-lg shadow-green-500/20 cursor-pointer w-full sm:w-auto"
                  >
                    <Send size={12} /> {isSubmitting ? "Sending..." : "Submit Inquiry"}
                  </button>
                </div>

              </form>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Support Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[#050b14] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6"
          >
            <div className="space-y-5">
              <div className="border-b border-white/5 pb-4 mb-3">
                <span className="text-[9px] text-green-400 font-black tracking-widest uppercase block mb-1">Corporate Details</span>
                <h2 className="text-lg font-black uppercase tracking-wide italic">TeesX HQ Support</h2>
              </div>

              <div className="space-y-4">
                <InfoBox title="Call Help Desk" value="+91 7857837294" icon={<Phone size={14} className="text-green-400" />} />
                <InfoBox title="Official WhatsApp" value="+91 7857837294" icon={<Phone size={14} className="text-green-400" />} />
                <InfoBox title="Customer Mailroom" value="support@teesx.com" icon={<Mail size={14} className="text-green-400" />} />
                <InfoBox title="Store Headquarters" value="Dehradun, Uttrakhand, India" icon={<MapPin size={14} className="text-green-400" />} />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Connect with community</p>
                <div className="flex gap-3 mt-3">
                  {[
                    { icon: <FaFacebookF size={14} />, href: "https://facebook.com" },
                    { icon: <FaInstagram size={14} />, href: "https://instagram.com" },
                    { icon: <FaTwitter size={14} />, href: "https://twitter.com" },
                    { icon: <FaDiscord size={14} />, href: "https://discord.com" }
                  ].map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-500/30 transition duration-300"
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 flex items-center gap-3">
                <ShieldCheck className="text-green-400 flex-shrink-0" size={18} />
                <div className="min-w-0">
                  <h4 className="text-[10px] font-black text-green-400 uppercase tracking-wider leading-none">100% Secure Support</h4>
                  <p className="text-[9px] text-gray-500 mt-1 leading-normal">Your information is safeguarded under verified SSL transmission.</p>
                </div>
              </div>
            </div>

          </motion.div>

        </div>

      </div>

    </div>
  );
};

// Elegant High-tech InfoBox Component matching Checkout pricing cards
const InfoBox = ({ title, value, icon }) => (
  <div className="bg-white/[0.01] border border-white/5 hover:border-white/10 p-4 rounded-2xl transition flex items-center gap-3">
    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{title}</p>
      <p className="text-xs font-black text-white truncate mt-0.5">{value}</p>
    </div>
  </div>
);

export default Contact;