import React from 'react'
import { createContext } from 'react'


export const authDataContext = createContext()
const AuthContext = ({ children }) => {
    const serverUrl = "https://startup-copy-2-backend.onrender.com"
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
