import jwt from 'jsonwebtoken'

const isAuth =async(req,res,next)=>
{
    try {
        let token = req.cookies.token
        if(!token)
        {
           return res.status(400).json({message:"Unauthorized ,User not logged in"})
        }
      let verifyToken =  jwt.verify(token,process.env.JWT_SECRET)

      if(!verifyToken)
      {
          return res.status(401).json({message:"Unauthorized ,User does not have a Valid Token"})
      }
        req.userId = verifyToken.id
     next()
    } 
    catch (error) {
        console.log("isAuth middleware error",error.message)
        return res.status(500).json({message:`isAuth  Error ${error.message}`})
    }
}
export default isAuth