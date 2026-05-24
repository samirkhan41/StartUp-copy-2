import React from 'react'
import { useContext } from 'react'
import { createContext } from 'react'
import { useState } from 'react'
import { authDataContext } from './AuthContext'
import axios from "axios"
import { useEffect } from 'react'

export const adminDataContext = createContext()
const AdminContext = ({ children }) => {

    const [adminData, setAdminData] = useState(null)
    let { serverUrl } = useContext(authDataContext)


    const getAdmin = async () => {
        try {
            const result = await axios.get(serverUrl + "/api/user/getAdmin",
                {
                    withCredentials: true
                }
            )
            console.log(result.data)
            setAdminData(result.data)
        }
        catch (error) {
            setAdminData(null)
            console.log({ message: error.message })
        }
    }

    let value =
    {
adminData,setAdminData,getAdmin
    }


    useEffect(() => {
        getAdmin()
    }, [])
    
    return (
        <div>
            <adminDataContext.Provider value={value} >

                {children}
            </adminDataContext.Provider>
        </div>
    )
}

export default AdminContext
