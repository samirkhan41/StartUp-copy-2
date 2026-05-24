import express from 'express'
import getAdmin, {  getCurrentUser, subscribeNewsletter } from '../controllers/user.controller.js'
import isAuth from '../middleware/isAuth.js'
import adminAuth from '../middleware/adminAuth.js'

const userRoutes = express.Router()

userRoutes.get("/getcurrentuser",isAuth,getCurrentUser)
userRoutes.get("/getadmin",adminAuth,getAdmin)
userRoutes.get("/getAdmin",adminAuth,getAdmin)
userRoutes.post("/newsletter/subscribe", subscribeNewsletter)

export default userRoutes

