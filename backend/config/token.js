import jwt from 'jsonwebtoken'
const genToken = async (user) => {
    try {
        let token = jwt.sign({
            id: user._id,
            email: user.email
        },
            process.env.JWT_SECRET,{expiresIn:"7d"})
            return token
    }
    
    catch (error) {
console.log({message:error.message})
    }
}

export default genToken


export const genToken1 = async (email) => {
    try {
        let token =  jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" })
        return token
    }
    catch (error) {
        console.log({ error: error.message })
    }
}