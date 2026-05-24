import userData from "../models/user.model.js"
import validator from 'validator'
import bcrypt from 'bcrypt'
import genToken, { genToken1 } from "../config/token.js"
import formData from "../models/form.model.js"


export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(304).json({ message: "bsdk wala poora fill kar " })
        }
        const existUser = await userData.findOne({ email })
        if (existUser) {
            return res.status(400).json({ message: "User already exist" })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email" })

        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" })
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const user = await userData.create({
            name,
            email,
            password: hashPassword
        })
        let token = await genToken(user._id)

        res.cookie("token", token,
            {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000

            })


        return res.status(201).json({ message: "User registered successfully", user })

    }
    catch (error) {
        return res.status(500).json({ message: `Signup failed ${error.message}` })
    }
}


//it is for checking the server 

export const checking = (req, res) => {
    res.send("Hello this is from checkig route")
}


//from here it is for login process

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "behn ke lode pehle tu data to fill kar " })
        }
        const user = await userData.findOne({ email }).select("+password")
        if (!user) {
            return res.status(400).json({ message: "Invalid email " })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" })
        }
        let token = await genToken(user)

        res.cookie("token", token,
            {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
        return res.status(200).json({ message: "Login successful", user })

    }
    catch (error) {
        return res.status(500).json({ message: `Login failed ${error.message}` })
    }
}

//it is for logout functionlaity

export const logout = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "Logout successful" })
    }
    catch (error) {
        return res.status(500).json({ message: `Logout failed ${error.message}` })
    }

}

//admin login ki bakchodi 

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        console.log(req.body)
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            let token = await genToken1(email)
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 1 * 24 * 60 * 60 * 1000
            })
            return res.status(200).json({ message: "Admin login successful", token })

        }

        return res.status(400).json({ message: "Invalid admin credentials" })



    }
    catch (error) {
        return res.status(500).json({ message: `Admin login failed ${error.message}` })
    }


}

// here is the from data section 

export const fromBody = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, message } = req.body
        if (!firstName || !lastName || !email || !phoneNumber || !message) {
            return res.status(400).json({ message: "brother please fill all the details in the form" })
        }
        const dataOfUser = await formData.create(
            {
                firstName,
                lastName,
                email,
                phoneNumber,
                message
            }
        )
        return res.status(201).json({ message: "user is created successfully", data: dataOfUser })
    }
    catch (error) {
        return res.status(400).json({ message: "server error from the formData section", errorMessage: error.message })
    }
}

//from here it is the google login section 

export const googleLogin = async (req, res) => {
    try {
        const { name, email } = req.body
        let user = await userData.findOne({ email })
        if (!user) {
            user = await userData.create({
                name,
                email
            })
        }

        let token = await genToken(user)
        res.cookie("token", token,
            {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
        return res.status(200).json({ message: "Login successful", user })
    }

    catch (error) {

        return res.status(400).json({ mesage: "Google logn error hai bhai ", loginError: error.message })
    }
}
