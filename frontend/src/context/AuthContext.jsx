import React, { createContext } from 'react'

export const authDataContext = createContext()
const AuthContext = ({ children }) => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000"
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
