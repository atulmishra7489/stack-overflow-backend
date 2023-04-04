import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

const userSchema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    about: {type: String },
    tags: {type: [String] },
    joinedOn: {type: Date, default: Date.now },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ]
})
// token generate
userSchema.methods.generateAuthtoken = async function(){
    try {
        let newtoken = jwt.sign({_id:this._id},process.env.JWT_SECRET,{
            expiresIn:"1d"
        });

        this.tokens = this.tokens.concat({token:newtoken});
        await this.save();
        return newtoken;
    } catch (error) {
        res.status(400).json(error)
    }
}

export default mongoose.model("Users", userSchema);