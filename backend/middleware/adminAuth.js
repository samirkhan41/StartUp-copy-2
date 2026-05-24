import jwt from 'jsonwebtoken'

const adminAuth =async(req,res,next)=>
{
    try {
        let {token}=req.cookies

        if(!token)
        {
              return res.status(400).json({message:"Unauthorized ,Admin not logged in"})
        }
        let verifyToken =  jwt.verify(token,process.env.JWT_SECRET)
        
        if(!verifyToken)
        {
            return res.status(401).json({message:"Unauthorized ,Admin does not have a Valid Token"})
        }
        req.adminEmail = process.env.ADMIN_EMAIL
        next()

    } 

    catch (error) {
        console.log("Admin auth middleware error ")
        return res.status(500).json({message:`Internal Server Error ${error.message}`})
    }

}

export default adminAuth