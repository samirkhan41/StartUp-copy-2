import mongoose from "mongoose"
import jwt from 'jsonwebtoken'

const dbConnect = async ()=>
{
try {
   await mongoose.connect(process.env.MONGO_URL)
   console.log("Database is Connected")
} 
catch (error) {
    console.log({message:error.message})
}
}

export default dbConnect



