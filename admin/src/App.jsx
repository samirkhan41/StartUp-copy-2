import React from 'react'
import {Routes,Route} from "react-router-dom"
import Home from './pages/Home'
import Login from './pages/Login'
import Orders from './pages/Orders'
import List from "./pages/List"
import Add from './pages/Add'
import Coupons from './pages/Coupons'
import { useContext } from 'react'
import { adminDataContext } from './context/AdminContext'



const App = () => {
  const {adminData} =useContext(adminDataContext)
  return ( 
    <>
  {!adminData ? <Login/> : <>
  
  <Routes>
    <Route path='/' element={<Home/>}/>
   <Route path='add' element={<Add/>}/>
    <Route path='/list' element={<List/>}/>
    <Route path='/login' element={<Login/>}/>
    <Route path='/orders' element={<Orders/>}/>
    <Route path='/coupons' element={<Coupons/>}/>

   </Routes>

   </>
   }
    </>
  )
}

export default App
