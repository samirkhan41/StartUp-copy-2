
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContext from './context/AuthContext.jsx'
import UserContext from "./context/UserContext.jsx"
import CartContext from './context/CartContext.jsx'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <AuthContext>
            <UserContext>
                <CartContext>
                    <App />
                </CartContext>
            </UserContext>
        </AuthContext>
    </BrowserRouter>
)
