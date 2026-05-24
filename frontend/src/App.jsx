import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Singnup from './pages/Singnup'
import About from './pages/About'
import Login from './pages/Login'
import Navbar from './pages/Navbar'
import Contact from './pages/Contact'
import Jersey from './pages/Jersey'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import OrderTrackingPortal from './pages/OrderTrackingPortal'
import Chatbot from './components/Chatbot'
import Footer from './components/Footer'

const App = () => {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Singnup />} />
                <Route path='/' element={<Home />} />
                <Route path='/about' element={<About />} />
                <Route path='/contact' element={<Contact />} />
                <Route path='/jersey' element={<Jersey />} />
                <Route path='/checkout' element={<Checkout />} />
                <Route path='/orders/track' element={<OrderTrackingPortal />} />
                <Route path='/orders/track/:orderId' element={<OrderTracking />} />
            </Routes>
            <Footer />
            <Chatbot />
        </>
    )
}

export default App
