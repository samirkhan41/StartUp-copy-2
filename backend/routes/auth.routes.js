import express from 'express'
import { adminLogin, checking, fromBody, googleLogin, login, logout, register } from '../controllers/auth.controller.js'
const authRouter = express.Router()

authRouter.get("/check",checking)
authRouter.post("/registration",register)
authRouter.post("/login",login)
authRouter.get("/logout",logout)
authRouter.post("/adminlogin",adminLogin)
authRouter.post("/formsection",fromBody)
authRouter.post("/googlelogin",googleLogin)

export default authRouter 