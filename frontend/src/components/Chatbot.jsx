import React, { useState, useRef, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, User, Sparkles, ShoppingBag, Zap } from 'lucide-react'
import { cartDataContext } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

// ─── FULL KNOWLEDGE BASE ────────────────────────────────────────────────────────
const PRODUCTS = [
    { name: "Vortex Strike Jersey", price: 899, category: "Football", rating: 4.8, color: "green", image: "green" },
    { name: "Apex Pro Jersey", price: 899, category: "Football", rating: 4.9, color: "pink", image: "pink" },
    { name: "Elite Performance Jersey", price: 949, category: "Basketball", rating: 4.7, color: "purple", image: "purple" },
    { name: "Stealth Edition Jersey", price: 849, category: "Cricket", rating: 4.5, color: "white", image: "white" },
    { name: "Thunder Bolt Jersey", price: 899, category: "Volleyball", rating: 4.6, color: "green", image: "green" },
    { name: "Crimson Fury Jersey", price: 899, category: "Football", rating: 4.8, color: "pink", image: "pink" },
    { name: "Phantom Jersey", price: 849, category: "Cricket", rating: 4.4, color: "purple", image: "purple" },
    { name: "Ion Energy Jersey", price: 899, category: "Volleyball", rating: 4.7, color: "white", image: "white" },
    { name: "TeesX Vortex Classic", price: 899, category: "Football", rating: 4.8, color: "white", image: "white" },
    { name: "Apex Pro Crimson", price: 899, category: "Football", rating: 4.9, color: "pink", image: "pink" },
    { name: "Elite Performance Purple", price: 949, category: "Basketball", rating: 4.7, color: "purple", image: "purple" },
    { name: "Vortex Strike Emerald", price: 899, category: "Football", rating: 4.8, color: "green", image: "green" }
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
const CATEGORIES = ['Football', 'Basketball', 'Cricket', 'Volleyball']
const PAYMENT_METHODS = ['COD (Cash on Delivery)', 'Stripe (Credit/Debit Card)', 'Razorpay (UPI/Cards)', 'Direct UPI QR Code']

const SIZE_GUIDE = {
    'XS': { chest: '34"', length: '26"', weight: '< 50 kg' },
    'S': { chest: '36"', length: '27"', weight: '50-60 kg' },
    'M': { chest: '38"', length: '28"', weight: '60-70 kg' },
    'L': { chest: '40"', length: '29"', weight: '70-80 kg' },
    'XL': { chest: '42"', length: '30"', weight: '80-90 kg' },
    '2XL': { chest: '44"', length: '31"', weight: '90-100 kg' },
    '3XL': { chest: '46"', length: '32"', weight: '100+ kg' },
}

// ─── QUICK ACTION CHIPS ─────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
    '🔥 Best sellers',
    '📏 Size guide',
    '🏷️ Coupons',
    '🚚 Shipping info',
    '💳 Payment options',
    '📦 Track order',
]

// ─── INTELLIGENT RESPONSE ENGINE ────────────────────────────────────────────────
function generateResponse(query) {
    const q = query.toLowerCase().trim()
    let text = ''
    let suggestions = []
    let navigateTo = null

    // ─── GREETINGS ──────────────────────────────────────────────────────────────
    if (/^(hi|hey|hello|sup|yo|hola|namaste|salam|assalam|howdy|good\s*(morning|evening|afternoon|night))/.test(q)) {
        const greetings = [
            "Hey there, Champ! ⚽ Welcome to TeesX — India's premium cyberpunk jersey brand! I can help you find the perfect jersey, check sizes, track orders, apply coupons, and more. What's on your mind?",
            "Hello! 🔥 I'm the TeesX AI Stylist. Ready to find you the perfect kit for turf domination? Ask me anything about our jerseys, sizes, payments, or orders!",
            "Yo Champ! 🏆 Welcome to TeesX 2026 Cyberpunk Collection! I know everything about our jerseys. Want recommendations, size help, or order tracking?"
        ]
        text = greetings[Math.floor(Math.random() * greetings.length)]
    }

    // ─── PRODUCT RECOMMENDATIONS / BEST SELLERS ─────────────────────────────────
    else if (/best\s*sell|popular|trending|recommend|suggest|top|hot|favourite|favorite|what.*buy|which.*jersey|kaunsi|konsi|best/.test(q)) {
        text = "🔥 Here are our top-selling jerseys that customers absolutely love! Each one is crafted with AeroDry™ moisture-wicking fibers and premium recycled polyester:"
        suggestions = [
            { name: "Apex Pro Jersey", price: 899, image: "pink" },
            { name: "Vortex Strike Jersey", price: 899, image: "green" },
            { name: "Elite Performance Jersey", price: 949, image: "purple" }
        ]
    }

    // ─── SPECIFIC COLOR QUERIES ─────────────────────────────────────────────────
    else if (/pink|magenta|crimson|rose|hot\s*pink/.test(q)) {
        text = "💗 Our Pink & Crimson jerseys are absolute fire on the pitch! These are crowd favourites:"
        suggestions = [
            { name: "Apex Pro Jersey", price: 899, image: "pink" },
            { name: "Crimson Fury Jersey", price: 899, image: "pink" },
            { name: "Apex Pro Crimson", price: 899, image: "pink" }
        ]
    }
    else if (/green|emerald|lime|neon\s*green|hara/.test(q)) {
        text = "💚 Green represents champion energy! Our Emerald & Strike collection is a hot-seller:"
        suggestions = [
            { name: "Vortex Strike Jersey", price: 899, image: "green" },
            { name: "Vortex Strike Emerald", price: 899, image: "green" },
            { name: "Thunder Bolt Jersey", price: 899, image: "green" }
        ]
    }
    else if (/purple|violet|lavender|magenta.*blue/.test(q)) {
        text = "💜 Purple radiates elite performance energy! Check out our Purple collection:"
        suggestions = [
            { name: "Elite Performance Jersey", price: 949, image: "purple" },
            { name: "Phantom Jersey", price: 849, image: "purple" },
            { name: "Elite Performance Purple", price: 949, image: "purple" }
        ]
    }
    else if (/white|classic|plain|safed|neutral/.test(q)) {
        text = "⚪ Our classic White/Stealth jerseys are timeless — perfect for versatility and team matching:"
        suggestions = [
            { name: "Stealth Edition Jersey", price: 849, image: "white" },
            { name: "TeesX Vortex Classic", price: 899, image: "white" },
            { name: "Ion Energy Jersey", price: 899, image: "white" }
        ]
    }

    // ─── CATEGORY-BASED QUERIES ─────────────────────────────────────────────────
    else if (/football|soccer|turf|pitch/.test(q)) {
        text = "⚽ Our Football Collection is engineered for turf supremacy! Lightweight, breathable, and built to perform:"
        suggestions = PRODUCTS.filter(p => p.category === 'Football').slice(0, 3).map(p => ({ name: p.name, price: p.price, image: p.color }))
    }
    else if (/basketball|basket|dunk|court|nba/.test(q)) {
        text = "🏀 Our Basketball jerseys feature sleeveless ergonomic cuts and max ventilation:"
        suggestions = PRODUCTS.filter(p => p.category === 'Basketball').slice(0, 3).map(p => ({ name: p.name, price: p.price, image: p.color }))
    }
    else if (/cricket|bat|bowl|ipl|test\s*match/.test(q)) {
        text = "🏏 Our Cricket collection combines breathable fabrics with durable stitching for long innings:"
        suggestions = PRODUCTS.filter(p => p.category === 'Cricket').slice(0, 3).map(p => ({ name: p.name, price: p.price, image: p.color }))
    }
    else if (/volleyball|volley|beach|spike/.test(q)) {
        text = "🏐 Our Volleyball jerseys are ultra-light at just 140g with maximum stretch for vertical leaps:"
        suggestions = PRODUCTS.filter(p => p.category === 'Volleyball').slice(0, 3).map(p => ({ name: p.name, price: p.price, image: p.color }))
    }

    // ─── PRICING QUERIES ────────────────────────────────────────────────────────
    else if (/price|cost|kitna|kitne|kya\s*rate|rate|afford|budget|cheap|expensive|sast[ai]|mehenga|range/.test(q)) {
        text = "💰 Our pricing is super competitive!\n\n• Most jerseys: ₹849 - ₹949\n• Stealth/Phantom (Budget picks): ₹849\n• Elite Performance (Premium): ₹949\n• Standard collection: ₹899\n\n🏷️ Plus, you can use coupon codes at checkout for up to 50% off! Right now there's a FLASH OFFER running — 50% off applied automatically. Want me to show specific jerseys in your budget?"
    }

    // ─── SIZE GUIDE ─────────────────────────────────────────────────────────────
    else if (/size|sizing|measurement|chest|fit|loose|tight|kitna\s*bada|body|height|weight|kaunsa\s*size|konsa\s*size|size\s*chart|size\s*guide|naap/.test(q)) {
        text = "📏 **TeesX Size Guide:**\n\n" +
            "• XS — Chest: 34\", Length: 26\" (< 50 kg)\n" +
            "• S — Chest: 36\", Length: 27\" (50-60 kg)\n" +
            "• M — Chest: 38\", Length: 28\" (60-70 kg)\n" +
            "• L — Chest: 40\", Length: 29\" (70-80 kg)\n" +
            "• XL — Chest: 42\", Length: 30\" (80-90 kg)\n" +
            "• 2XL — Chest: 44\", Length: 31\" (90-100 kg)\n" +
            "• 3XL — Chest: 46\", Length: 32\" (100+ kg)\n\n" +
            "💡 Pro tip: For a loose athletic fit on the turf, we recommend ordering ONE SIZE UP! All our jerseys feature an Athletic Tailored fit with 100% Recycled Polyester."
    }

    // ─── ORDER TRACKING ─────────────────────────────────────────────────────────
    else if (/track|tracking|status|where.*order|order.*kahan|mera\s*order|delivery\s*status|kab\s*aayega|kab\s*milega|order.*status|shipped|dispatch/.test(q)) {
        text = "📦 To track your order:\n\n1️⃣ Click your **Profile Avatar** (top-right in the navbar)\n2️⃣ Select **\"Track Orders\"**\n3️⃣ You'll see a real-time tracking timeline with live status updates!\n\n🔄 Order statuses flow: **Placed → Packed → Shipped → Out for Delivery → Delivered**\n\nEach status has timestamps and descriptions. You can also access the tracking portal directly from the **Order Tracking Portal** page!"
        navigateTo = '/orders/track'
    }

    // ─── PAYMENT METHODS ────────────────────────────────────────────────────────
    else if (/payment|pay|cod|cash|card|credit|debit|stripe|razorpay|upi|qr|bhim|gpay|google\s*pay|phone\s*pe|paytm|net\s*banking|online\s*payment|kaise\s*pay/.test(q)) {
        text = "💳 We support 4 payment methods for your convenience:\n\n" +
            "1️⃣ **Cash on Delivery (COD)** — Zero charges, pay at doorstep\n" +
            "2️⃣ **Stripe** — Credit/Debit card terminal (Visa, Mastercard, etc.)\n" +
            "3️⃣ **Razorpay** — UPI, Cards, and Netbanking via official SDK\n" +
            "4️⃣ **Direct UPI QR Code** — Scan & pay with BHIM, GPay, PhonePe, or Paytm\n\n" +
            "🔒 All transactions are secured with encrypted sandbox gateway. Test card number: 4242 4242 4242 4242"
    }

    // ─── COUPON / DISCOUNT QUERIES ──────────────────────────────────────────────
    else if (/coupon|discount|promo|code|offer|sale|voucher|off|deal|chhoot|save|bahut\s*mehenga/.test(q)) {
        text = "🏷️ Great news! Here are our active coupon codes:\n\n" +
            "• **CHAMP20** — 20% off your order!\n" +
            "• **FOOTYFIT50** — Whopping 50% off!\n\n" +
            "📌 To apply: Go to Checkout → look for the **\"Promo Coupon Code\"** field on the right side → enter your code → click **Apply**!\n\n" +
            "🔥 PLUS: There's a FLASH OFFER running right now with a countdown timer on the homepage — 50% off applied at checkout!"
    }

    // ─── SHIPPING / DELIVERY INFO ───────────────────────────────────────────────
    else if (/ship|shipping|deliver|delivery|dispatch|days|time|fast|express|kab\s*tak|kitne\s*din|free\s*delivery/.test(q)) {
        text = "🚚 **TeesX Shipping Info:**\n\n" +
            "• We ship across **all of India** 🇮🇳\n" +
            "• Standard delivery: **3-5 business days**\n" +
            "• Metro cities: **2-3 business days**\n" +
            "• Real-time tracking with **live timeline updates**\n" +
            "• Invoice downloads available\n" +
            "• Delivered via **FootyFit Premium Courier** services\n\n" +
            "📦 Your package timeline updates live through: Placed → Packed → Shipped → Out for Delivery → Delivered"
    }

    // ─── RETURN / EXCHANGE / REFUND ─────────────────────────────────────────────
    else if (/return|exchange|refund|replace|wrong\s*size|change|wapas|badal|money\s*back/.test(q)) {
        text = "🔄 **TeesX Return & Exchange Policy:**\n\n" +
            "• 7-day easy return window from delivery date\n" +
            "• Size exchanges available (subject to stock)\n" +
            "• Refund processed to original payment method\n" +
            "• For COD orders — refund via bank transfer\n" +
            "• Product must be unused with original tags\n\n" +
            "📞 For returns, please reach out via our **Contact page** or email us directly. We'll get it sorted in 24-48 hours!"
    }

    // ─── MATERIAL / FABRIC QUERIES ──────────────────────────────────────────────
    else if (/fabric|material|quality|cloth|cotton|polyester|breathable|moisture|sweat|comfortable|durability|wash|care|dhone|kapda/.test(q)) {
        text = "🧵 **TeesX Jersey Specifications:**\n\n" +
            "• **Fabric:** 100% Recycled Polyester\n" +
            "• **Technology:** AeroDry™ moisture-wicking fibers\n" +
            "• **Weight:** Ultra-light 140g\n" +
            "• **Fit:** Athletic Tailored cut\n" +
            "• **Ventilation:** Ultra-breathable mesh panels\n" +
            "• **Seams:** Ergonomic flatlock anti-chafing seams\n" +
            "• **Durability:** Double-stitched reinforcements\n\n" +
            "🧼 **Care Instructions:**\n" +
            "• Machine wash cold\n" +
            "• Do not bleach\n" +
            "• Tumble dry low\n" +
            "• Iron on low heat\n" +
            "• Do not dry clean"
    }

    // ─── CHECKOUT HELP ──────────────────────────────────────────────────────────
    else if (/checkout|how.*buy|how.*order|kaise.*order|kaise.*kharid|purchase|buy.*now|cart|bag|add.*cart/.test(q)) {
        text = "🛒 **How to Order from TeesX:**\n\n" +
            "1️⃣ Browse jerseys on the **Jerseys page** — filter by category, size, and price\n" +
            "2️⃣ Click **\"Add to Bag\"** on any jersey you like\n" +
            "3️⃣ Click the **Cart icon** (top-right) to review your bag\n" +
            "4️⃣ Click **\"Secure Checkout\"**\n" +
            "5️⃣ Enter shipping address → Select payment → Review & confirm!\n\n" +
            "💡 You can also add jerseys directly from me! Just ask for a color or category and I'll show product cards with instant \"Add to Bag\" buttons."
        navigateTo = '/jersey'
    }

    // ─── LOGIN / ACCOUNT HELP ───────────────────────────────────────────────────
    else if (/login|signup|sign\s*up|register|account|log\s*in|password|google.*login|social.*login/.test(q)) {
        text = "🔐 **Account & Login:**\n\n" +
            "• **Sign up** with Name, Email & Password (min 8 characters)\n" +
            "• **Google Login** supported — one-click sign in!\n" +
            "• You need to be logged in to place orders and post reviews\n" +
            "• Profile shows in the navbar with your initial letter\n\n" +
            "👉 Go to the **Login** or **Signup** page from the profile icon in the navbar."
        navigateTo = '/login'
    }

    // ─── ABOUT THE BRAND ────────────────────────────────────────────────────────
    else if (/about|brand|teesx|who.*are|company|story|kaun\s*ho|kya\s*hai|mission|vision/.test(q)) {
        text = "🏢 **About TeesX:**\n\n" +
            "TeesX is India's premium cyberpunk athletic jersey brand. We don't just make jerseys — **we create identity!**\n\n" +
            "🎯 Our mission: Redefine performance gear through sleek cyberpunk mechanics, glowing weave patterns, and premium athletic engineering.\n\n" +
            "✨ **Core Values:**\n" +
            "• Premium Quality — High quality fabric for maximum comfort\n" +
            "• Crafted with Care — Expertly designed with precision\n" +
            "• Built to Perform — Made for durability, made to win\n\n" +
            "🏷️ 2026 Cyberpunk Collection is LIVE now!"
    }

    // ─── CONTACT / SUPPORT ──────────────────────────────────────────────────────
    else if (/contact|support|help|email|phone|call|number|complaint|issue|problem|sampark|madad/.test(q)) {
        text = "📞 **Contact TeesX Support:**\n\n" +
            "You can reach us via:\n" +
            "• **Contact Form** on our website (Contact page)\n" +
            "• Fill in your Name, Email, Phone & Message\n" +
            "• We respond within **24 hours**!\n\n" +
            "🌐 **Social Media:**\n" +
            "• Instagram, Twitter, YouTube, Discord — links in the footer!\n\n" +
            "📧 **Newsletter:** Join the Core secure list for exclusive drops and flash collection updates!"
        navigateTo = '/contact'
    }

    // ─── REVIEW / RATING QUERIES ────────────────────────────────────────────────
    else if (/review|rating|feedback|stars?|rated|comment|experience|kaisa\s*hai/.test(q)) {
        text = "⭐ **Product Reviews & Ratings:**\n\n" +
            "All our jerseys are highly rated (4.4 - 4.9 stars)!\n\n" +
            "📝 **To write a review:**\n" +
            "1️⃣ Go to the **Jerseys page**\n" +
            "2️⃣ Click **\"View Ratings\"** on any jersey card\n" +
            "3️⃣ Read existing reviews and submit your own!\n" +
            "4️⃣ Select star rating (1-5) and add your comment\n\n" +
            "⚠️ You must be **logged in** to post a review."
    }

    // ─── WISHLIST QUERIES ───────────────────────────────────────────────────────
    else if (/wishlist|wish\s*list|save.*later|favourite|favorite|heart|dil|pasand/.test(q)) {
        text = "❤️ **Wishlist Feature:**\n\n" +
            "• Click the **Heart icon** on any jersey card to add/remove from wishlist\n" +
            "• Your wishlist is saved locally — persists across sessions!\n" +
            "• You can also wishlist from the product detail modal\n" +
            "• Wishlisted items show a filled red heart"
    }

    // ─── DARK MODE / THEME ──────────────────────────────────────────────────────
    else if (/dark\s*mode|light\s*mode|theme|mode|night\s*mode|brightness|sun|moon/.test(q)) {
        text = "🌙 **Theme Switching:**\n\n" +
            "• Click the **Sun/Moon icon** in the navbar to toggle between Dark & Light mode\n" +
            "• Default is our premium **Dark Cyberpunk** theme\n" +
            "• The entire site adapts instantly!"
    }

    // ─── ALL PRODUCTS LISTING ───────────────────────────────────────────────────
    else if (/all.*jersey|all.*product|show.*all|sab|sabhi|poora\s*collection|full\s*catalog|kitne.*jersey/.test(q)) {
        text = "📋 **Full TeesX Collection (8 Core Jerseys):**\n\n" +
            "⚽ Football: Vortex Strike (₹899), Apex Pro (₹899), Crimson Fury (₹899)\n" +
            "🏀 Basketball: Elite Performance (₹949)\n" +
            "🏏 Cricket: Stealth Edition (₹849), Phantom (₹849)\n" +
            "🏐 Volleyball: Thunder Bolt (₹899), Ion Energy (₹899)\n\n" +
            "Plus the **2026 Cyberpunk Homepage variants:** TeesX Vortex Classic, Apex Pro Crimson, Elite Performance Purple, Vortex Strike Emerald\n\n" +
            "Want me to show you specific jerseys with add-to-cart buttons?"
    }

    // ─── SPECIFIC PRODUCT QUERIES ───────────────────────────────────────────────
    else if (/vortex/.test(q)) {
        text = "⚡ The **Vortex Strike Jersey** is our signature football kit! Green neon design with AeroDry™ tech. It's the #1 pick for competitive turf matches."
        suggestions = [{ name: "Vortex Strike Jersey", price: 899, image: "green" }]
    }
    else if (/apex/.test(q)) {
        text = "🌟 The **Apex Pro Jersey** is our highest-rated jersey (4.9 stars)! Hot pink Crimson design that stands out on any pitch. Absolute crowd favourite!"
        suggestions = [{ name: "Apex Pro Jersey", price: 899, image: "pink" }]
    }
    else if (/elite/.test(q)) {
        text = "💜 The **Elite Performance Jersey** is our premium Basketball pick at ₹949. Purple colorway with maximum ventilation mesh panels."
        suggestions = [{ name: "Elite Performance Jersey", price: 949, image: "purple" }]
    }
    else if (/stealth/.test(q)) {
        text = "🤍 The **Stealth Edition Jersey** is our budget-friendly Cricket classic at ₹849. Clean white design, perfect for team matching!"
        suggestions = [{ name: "Stealth Edition Jersey", price: 849, image: "white" }]
    }
    else if (/thunder/.test(q)) {
        text = "⚡ The **Thunder Bolt Jersey** is built for explosive Volleyball action! Ultra-light 140g with maximum stretch. Green power!"
        suggestions = [{ name: "Thunder Bolt Jersey", price: 899, image: "green" }]
    }
    else if (/crimson|fury/.test(q)) {
        text = "🔥 The **Crimson Fury Jersey** is pure fire! Hot pink Football kit rated 4.8 stars. Makes you unforgettable on the pitch."
        suggestions = [{ name: "Crimson Fury Jersey", price: 899, image: "pink" }]
    }
    else if (/phantom/.test(q)) {
        text = "👻 The **Phantom Jersey** is our stealthy Cricket option at just ₹849. Purple design with mystery vibes. Budget + premium quality!"
        suggestions = [{ name: "Phantom Jersey", price: 849, image: "purple" }]
    }
    else if (/ion|energy/.test(q)) {
        text = "⚡ The **Ion Energy Jersey** powers up your Volleyball game! Classic white design, 4.7 rating, built for high-energy rallies."
        suggestions = [{ name: "Ion Energy Jersey", price: 899, image: "white" }]
    }

    // ─── CHEAPEST / MOST EXPENSIVE ──────────────────────────────────────────────
    else if (/cheap|sasta|budget|low.*price|affordable|kam\s*price|lowest/.test(q)) {
        text = "💸 Our most affordable jerseys start at just **₹849**! Here are the best budget picks:"
        suggestions = [
            { name: "Stealth Edition Jersey", price: 849, image: "white" },
            { name: "Phantom Jersey", price: 849, image: "purple" }
        ]
    }
    else if (/expensive|premium|costly|luxury|mehenga|high.*end|top.*tier/.test(q)) {
        text = "👑 Our premium top-tier jersey is the **Elite Performance** collection at ₹949. Highest quality, best-in-class materials!"
        suggestions = [
            { name: "Elite Performance Jersey", price: 949, image: "purple" },
            { name: "Elite Performance Purple", price: 949, image: "purple" }
        ]
    }

    // ─── COMPARISON QUERIES ─────────────────────────────────────────────────────
    else if (/compare|difference|vs|better|which.*one|kon.*accha|kaun.*best/.test(q)) {
        text = "⚖️ **Quick Comparison:**\n\n" +
            "| Jersey | Price | Rating | Category |\n" +
            "|--------|-------|--------|----------|\n" +
            "| Apex Pro | ₹899 | ⭐4.9 | Football |\n" +
            "| Vortex Strike | ₹899 | ⭐4.8 | Football |\n" +
            "| Elite Performance | ₹949 | ⭐4.7 | Basketball |\n" +
            "| Stealth Edition | ₹849 | ⭐4.5 | Cricket |\n\n" +
            "🏆 **Best overall:** Apex Pro (highest rated)\n" +
            "💰 **Best value:** Stealth Edition (lowest price)\n" +
            "🌟 **Premium pick:** Elite Performance"
    }

    // ─── AVAILABILITY / STOCK ───────────────────────────────────────────────────
    else if (/stock|available|availability|milega|mil\s*jayega|out.*stock/.test(q)) {
        text = "✅ All jerseys in our collection are currently **in stock** and available in all sizes (XS to 3XL)! New products are added by our admin team and sync instantly to the catalog. Shop now before the FLASH OFFER expires!"
    }

    // ─── CUSTOMIZATION QUERIES ──────────────────────────────────────────────────
    else if (/custom|customize|personalize|name.*print|number|jersey.*name|naam|apna\s*naam/.test(q)) {
        text = "👕 Currently, TeesX offers our signature pre-designed cyberpunk collection. Custom name/number printing is not yet available but is coming soon in our next collection update! Stay tuned by joining our newsletter in the footer!"
    }

    // ─── BULK / TEAM ORDERS ─────────────────────────────────────────────────────
    else if (/bulk|team|group|wholesale|quantity|school|college|order.*multiple|bahut\s*saare/.test(q)) {
        text = "👥 For bulk/team orders:\n\n" +
            "• You can add multiple jerseys and quantities to your cart\n" +
            "• Apply coupon codes for team discounts\n" +
            "• For very large orders (50+), reach out via our **Contact page** for custom team pricing!\n" +
            "• We support all sports: Football, Basketball, Cricket, Volleyball"
    }

    // ─── NEWSLETTER / UPDATES ───────────────────────────────────────────────────
    else if (/newsletter|subscribe|updates|notification|notify|new\s*launch|new\s*collection/.test(q)) {
        text = "📧 **Join the TeesX Core Secure List!**\n\n" +
            "Subscribe to our newsletter (in the website footer) to receive:\n" +
            "• 🎯 Early access codes\n" +
            "• 🔥 Exclusive variant leaks\n" +
            "• ⚡ Flash collection updates\n" +
            "• 🏷️ Special coupon drops\n\n" +
            "Just enter your email in the footer's **\"Join the Core\"** section!"
    }

    // ─── ADMIN PANEL QUERIES ────────────────────────────────────────────────────
    else if (/admin|dashboard|manage|add.*product|delete.*product/.test(q)) {
        text = "🔧 The **Admin Panel** is a separate app for store management:\n\n" +
            "• Add new products with image upload (via Cloudinary)\n" +
            "• Delete products from catalog\n" +
            "• Manage orders and update status\n" +
            "• Create/manage coupon codes\n" +
            "• View analytics\n\n" +
            "⚠️ Admin access requires special credentials. This is not accessible from the customer-facing site."
    }

    // ─── THANK YOU / BYE ────────────────────────────────────────────────────────
    else if (/thanks|thank|bye|goodbye|tata|alvida|dhanyawad|shukriya/.test(q)) {
        const farewells = [
            "You're welcome, Champ! ⚽ Wear your passion, dominate the turf! Come back anytime. 🏆",
            "Anytime! 🔥 Happy shopping at TeesX. May your game be as fire as your jersey! 💪",
            "Glad I could help! 🏆 See you soon, legend. Don't forget to check out the FLASH OFFER before it expires! ⏰"
        ]
        text = farewells[Math.floor(Math.random() * farewells.length)]
    }

    // ─── FUNNY / RANDOM ─────────────────────────────────────────────────────────
    else if (/joke|funny|bore|bored|mazak|haha|lol/.test(q)) {
        text = "😄 Here's one: Why did the footballer bring string to the game? Because he wanted to tie the score! ⚽\n\nAnyway, want me to show you some fire jerseys to cheer up your wardrobe? 🔥"
    }

    // ─── WHO ARE YOU / BOT IDENTITY ─────────────────────────────────────────────
    else if (/who.*you|what.*you|kaun.*ho|kya.*ho|are.*you.*bot|ai|artificial|robot/.test(q)) {
        text = "🤖 I'm the **TeesX AI Stylist** — your personal jersey shopping assistant!\n\n" +
            "I'm trained on the complete TeesX 2026 Cyberpunk Collection and can help you with:\n" +
            "• 🔍 Finding the perfect jersey\n" +
            "• 📏 Size recommendations\n" +
            "• 💳 Payment guidance\n" +
            "• 📦 Order tracking\n" +
            "• 🏷️ Coupon codes\n" +
            "• 🧵 Material & care info\n" +
            "• And much more!\n\n" +
            "Try asking me anything!"
    }

    // ─── HINDI / HINGLISH SUPPORT ───────────────────────────────────────────────
    else if (/jersey\s*dikhao|dikhao|batao|bhai|yaar|bro|kuch.*acha|accha\s*wala/.test(q)) {
        text = "Bhai, yeh raha TeesX ka sabse fire collection! 🔥 Abhi grab karo, flash offer chal raha hai:"
        suggestions = [
            { name: "Apex Pro Jersey", price: 899, image: "pink" },
            { name: "Vortex Strike Jersey", price: 899, image: "green" },
            { name: "Stealth Edition Jersey", price: 849, image: "white" }
        ]
    }

    // ─── SEARCH FOR SPECIFIC TEXT IN PRODUCTS ───────────────────────────────────
    else if (q.length > 2) {
        const matchedProducts = PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.color.toLowerCase().includes(q)
        )
        if (matchedProducts.length > 0) {
            text = `🔍 Found ${matchedProducts.length} matching jersey(s) for "${query}":`
            suggestions = matchedProducts.slice(0, 3).map(p => ({ name: p.name, price: p.price, image: p.color }))
        }
    }

    // ─── FALLBACK ───────────────────────────────────────────────────────────────
    if (!text) {
        text = "🤔 I'm not sure I understood that, but I'm fully trained on everything TeesX! Try asking me about:\n\n" +
            "• 🔥 \"Best sellers\" or \"recommend a jersey\"\n" +
            "• 🎨 A color: \"pink\", \"green\", \"purple\", \"white\"\n" +
            "• ⚽ A sport: \"football\", \"basketball\", \"cricket\"\n" +
            "• 📏 \"Size guide\" or \"what size should I buy?\"\n" +
            "• 💳 \"Payment options\" or \"how to pay\"\n" +
            "• 📦 \"Track my order\"\n" +
            "• 🏷️ \"Coupon codes\" or \"discounts\"\n" +
            "• 🧵 \"Material quality\" or \"fabric info\"\n" +
            "• 🚚 \"Shipping info\" or \"delivery time\"\n" +
            "• 🔄 \"Return policy\"\n\n" +
            "Or simply type a jersey name like \"Vortex\" or \"Apex\"!"
    }

    return { text, suggestions, navigateTo }
}

// ─── CHATBOT COMPONENT ──────────────────────────────────────────────────────────
const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: 'Hey Champ! ⚽ I\'m the **TeesX AI Stylist** — fully trained on our entire 2026 Cyberpunk Collection! I can help you find jerseys, check sizes, track orders, apply coupons, and much more. What can I do for you today?',
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [hasUnread, setHasUnread] = useState(true)
    const [isTyping, setIsTyping] = useState(false)
    const { addToCart } = useContext(cartDataContext)
    const navigate = useNavigate()

    const chatEndRef = useRef(null)

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isTyping])

    const handleSendMessage = (overrideText) => {
        const messageText = overrideText || inputValue
        if (!messageText.trim()) return

        const userMsg = { sender: 'user', text: messageText }
        setMessages(prev => [...prev, userMsg])
        setInputValue('')
        setIsTyping(true)

        // Simulate realistic typing delay
        const delay = Math.min(600 + messageText.length * 15, 1800)
        setTimeout(() => {
            const response = generateResponse(messageText)
            const botMsg = {
                sender: 'bot',
                text: response.text,
                suggestions: response.suggestions,
                navigateTo: response.navigateTo
            }
            setIsTyping(false)
            setMessages(prev => [...prev, botMsg])
        }, delay)
    }

    const handleQuickAction = (action) => {
        handleSendMessage(action)
    }

    return (
        <div className="fixed bottom-24 right-6 z-[99999] font-sans">
            {/* Toggle Button */}
            <motion.button
                onClick={() => {
                    setIsOpen(!isOpen)
                    setHasUnread(false)
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-full bg-linear-to-r from-green-400 to-emerald-600 text-black flex items-center justify-center shadow-[0_8px_30px_rgba(52,211,153,0.4)] relative"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {hasUnread && !isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] rounded-3xl border border-white/10 bg-black/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 bg-linear-to-r from-neutral-900 to-black border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 relative">
                                    <Bot size={18} />
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm flex items-center gap-1">
                                        TeesX Assistant <Sparkles size={12} className="text-green-400" />
                                    </h3>
                                    <p className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
                                        <Zap size={8} /> Online
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Message Panel */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'bg-green-500 text-black font-semibold rounded-tr-none'
                                            : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'
                                    }`}>
                                        <div className="flex items-center gap-1.5 mb-1 opacity-70">
                                            {msg.sender === 'user' ? <User size={10} /> : <Bot size={10} />}
                                            <span className="text-[9px] uppercase font-bold tracking-wider">
                                                {msg.sender === 'user' ? 'You' : 'TeesX AI'}
                                            </span>
                                        </div>
                                        <p className="whitespace-pre-line">{msg.text}</p>

                                        {/* Navigation link if available */}
                                        {msg.navigateTo && (
                                            <button
                                                onClick={() => {
                                                    navigate(msg.navigateTo)
                                                    setIsOpen(false)
                                                }}
                                                className="mt-2 text-[10px] bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider hover:bg-green-500/30 transition flex items-center gap-1"
                                            >
                                                <Zap size={10} /> Go to Page →
                                            </button>
                                        )}

                                        {/* Suggested product cards */}
                                        {msg.suggestions && msg.suggestions.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {msg.suggestions.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between bg-black/40 border border-white/5 p-2.5 rounded-xl hover:border-green-500/30 transition">
                                                        <div>
                                                            <p className="font-bold text-white text-[10px]">{item.name}</p>
                                                            <p className="text-green-400 text-[10px] font-mono">₹{item.price}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => addToCart(item, 'M')}
                                                            className="bg-green-500 hover:bg-green-400 text-black p-1.5 rounded-lg transition flex items-center gap-1"
                                                        >
                                                            <ShoppingBag size={12} />
                                                            <span className="text-[8px] font-bold">ADD</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Quick Action Chips — only show at start */}
                        {messages.length <= 2 && (
                            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                                {QUICK_ACTIONS.map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickAction(action)}
                                        className="text-[9px] bg-white/5 border border-white/10 text-gray-300 px-2.5 py-1.5 rounded-lg font-bold hover:bg-green-500/10 hover:border-green-500/20 hover:text-green-400 transition"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 bg-neutral-950/60 border-t border-white/5 flex gap-2">
                            <input
                                type="text"
                                placeholder="Ask me anything about TeesX..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-green-400/50"
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!inputValue.trim()}
                                className="bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 text-black px-3.5 rounded-xl flex items-center justify-center transition"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Chatbot
