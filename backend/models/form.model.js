import mongoose  from "mongoose"

const formSchema = new mongoose.Schema(
    {
        firstName:
        {
        type:String,
        required:true
        },
        lastName:
        {
            type:String,
            required:true
        },
        email:
        {
            type:String,
            required:true,
            unique:true
        },
        phoneNumber:
        {
            type:String,
            required:true

        },
        message:
        {
            type:String,
            required:true
        }
    },{timestamps:true}
)

 const formData = mongoose.model("formData",formSchema)

 export default formData
