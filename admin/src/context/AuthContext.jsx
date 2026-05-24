import React from 'react'
import { createContext } from 'react'


export const authDataContext = createContext()
const AuthContext = ({ children }) => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || "https://startup-copy-2-backend.onrender.com"
    const value = {
        serverUrl
    }
    return (
        <div>
            <authDataContext.Provider value={value}>
                {children}

            </authDataContext.Provider>
        </div>
    )
}

export default AuthContext
