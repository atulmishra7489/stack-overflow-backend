import mongoose from "mongoose";
import validator from "validator"

const userOtpSchema = mongoose.Schema({
    email: {
        type: String, 
        required: true, 
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Not valid Email")
            }
        }
    },
    otp:{
        type: String,
        required:true
    }
    
})

export default mongoose.model("Userotps", userOtpSchema);