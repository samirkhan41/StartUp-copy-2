import React, { createContext, useContext, useEffect, useState } from 'react'
import { authDataContext } from './AuthContext'
import axios from 'axios'



export const userDataContext = createContext()

const UserContext = ({ children }) => {
  const [userData, setUserData] = useState("")
  const {serverUrl}= useContext(authDataContext)

  const getCurrentUser = async()=>
  {
    try {
      
      const result = await axios.get(serverUrl+"/api/user/getcurrentuser",
        {
          withCredentials:true
        })

      console.log(result.data)
      setUserData(result.data)

    } catch (error) {
      
      setUserData(null)
      console.log({message:error.message})
    }
  }

  useEffect (() => {
    getCurrentUser()
},[])

  const value=
  {
    userData,setUserData,getCurrentUser
  }
  return (
  
    <>

      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </>
  )
}

export default UserContext
