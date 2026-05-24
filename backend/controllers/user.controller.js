import userData from "../models/user.model.js"



export const getCurrentUser =async (req,res)=>
{
    try {
        let user = await userData.findById(req.userId).select("-password")
        if(!user)
        {
             return res.status(404).json({message:"User not found"})
        }
        return res.status(200).json({message:"User fetched successfully",user})
    } 
    catch (error) {
        return res.status(500).json({message:`Failed to fetch user ${error.message}`})
    }
}

import { sendNewsletterEmail } from '../config/mailer.js'

export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        await sendNewsletterEmail(email)

        return res.status(200).json({ message: "Subscription successful! Welcome to the Core secure list." })
    } catch (error) {
        console.error("Newsletter subscription controller failed:", error)
        return res.status(500).json({ message: `Failed to subscribe: ${error.message}` })
    }
}

export const getAdmin =async(req,res)=>
{
    try {
        let adminEmail=req.adminEmail
        if(!adminEmail)
            {
  return res.status(404).json({message:"Admin is  not found"})
            }
            return res.status(201).json({email:adminEmail,role:"admin"})
    } 
    catch (error) {
   return res.status(500).json({message:`Failed to fetch admin ${error.message}`})
    }
}

export default getAdmin