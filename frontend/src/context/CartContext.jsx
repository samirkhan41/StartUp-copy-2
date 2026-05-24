import React, { createContext, useState, useEffect } from 'react'

export const cartDataContext = createContext()

const CartContext = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const local = localStorage.getItem('teesx_cart')
        return local ? JSON.parse(local) : []
    })

    const [wishlist, setWishlist] = useState(() => {
        const local = localStorage.getItem('teesx_wishlist')
        return local ? JSON.parse(local) : []
    })

    const [coupon, setCoupon] = useState(null)
    const [recentlyViewed, setRecentlyViewed] = useState(() => {
        const local = localStorage.getItem('teesx_recent')
        return local ? JSON.parse(local) : []
    })

    const [isDarkMode, setIsDarkMode] = useState(true) // Default to premium dark mode

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark')
            document.documentElement.style.colorScheme = 'dark'
        } else {
            document.documentElement.classList.remove('dark')
            document.documentElement.style.colorScheme = 'light'
        }
    }, [isDarkMode])

    useEffect(() => {
        localStorage.setItem('teesx_cart', JSON.stringify(cartItems))
    }, [cartItems])

    useEffect(() => {
        localStorage.setItem('teesx_wishlist', JSON.stringify(wishlist))
    }, [wishlist])

    useEffect(() => {
        localStorage.setItem('teesx_recent', JSON.stringify(recentlyViewed))
    }, [recentlyViewed])

    const addToCart = (product, size) => {
        setCartItems(prev => {
            const existingIndex = prev.findIndex(item => item.name === product.name && item.size === size)
            if (existingIndex > -1) {
                const updated = [...prev]
                updated[existingIndex].quantity += 1
                return updated
            }
            return [...prev, { ...product, size, quantity: 1 }]
        })
    }

    const removeFromCart = (name, size) => {
        setCartItems(prev => prev.filter(item => !(item.name === name && item.size === size)))
    }

    const updateQuantity = (name, size, quantity) => {
        if (quantity <= 0) {
            removeFromCart(name, size)
            return
        }
        setCartItems(prev => prev.map(item => 
            (item.name === name && item.size === size) ? { ...item, quantity } : item
        ))
    }

    const clearCart = () => {
        setCartItems([])
        setCoupon(null)
    }

    const toggleWishlist = (product) => {
        setWishlist(prev => {
            const exists = prev.some(item => item.name === product.name)
            if (exists) {
                return prev.filter(item => item.name !== product.name)
            }
            return [...prev, product]
        })
    }

    const addRecentlyViewed = (product) => {
        setRecentlyViewed(prev => {
            const filtered = prev.filter(item => item.name !== product.name)
            return [product, ...filtered].slice(0, 4)
        })
    }

    // Totals calculations
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    let discount = 0
    if (coupon) {
        const minAmount = coupon.minCartAmount ?? 0
        if (subtotal >= minAmount) {
            const calculatedDiscount = (subtotal * coupon.discountPercentage) / 100
            discount = coupon.maxDiscount ? Math.min(calculatedDiscount, coupon.maxDiscount) : calculatedDiscount
        }
    }

    const total = Math.max(subtotal - discount, 0)

    const value = {
        cartItems,
        wishlist,
        coupon,
        recentlyViewed,
        isDarkMode,
        setIsDarkMode,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        addRecentlyViewed,
        setCoupon,
        subtotal,
        discount,
        total
    }

    return (
        <cartDataContext.Provider value={value}>
            <div className={isDarkMode ? 'dark bg-[#02060d] text-white min-h-screen' : 'bg-white text-black min-h-screen'}>
                {children}
            </div>
        </cartDataContext.Provider>
    )
}

export default CartContext
