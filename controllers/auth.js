import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer'

import dotenv from 'dotenv'

import Users from '../models/auth.js'
import Userotps from '../models/User model.js';

dotenv.config();
// email config
const tarnsporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try{
        const existinguser = await Users.findOne({ email });

        if(existinguser){
            return res.status(400).json({ message: "User already Exists."})
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        
        const newUser = await Users.create({ name, email, password: hashedPassword }) 
        
        const token = jwt.sign({ email: newUser.email, id:newUser._id}, process.env.JWT_SECRET , { expiresIn: '1h'});
        
        res.status(200).json({ result: newUser, token })
    } catch(error){
        res.status(500).json({error:"Something went worng...",error})
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existinguser = await Users.findOne({ email });

        if(!existinguser){
            return res.status(404).json({ message: "User doesn't exist."})
        }

        const isPasswordCrt = await bcrypt.compare(password, existinguser.password)
        
        if(!isPasswordCrt){
            return res.status(400).json({message : "Invalid credentials"})
        }
        const token = jwt.sign({ email: existinguser.email, id:existinguser._id}, process.env.JWT_SECRET , { expiresIn: '1h'});
        
        res.status(200).json({ result: existinguser, token })
    } catch (error)  {
        res.status(500).json("Something went worng...")
    }
}

// /** GET: http://localhost:8080/api/generateOTP */
// export async function generateOTP(req,res){
//     req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false})
//     res.status(201).send({ code: req.app.locals.OTP })
// }

export const generateOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ error: "Please Enter Your Email" })
    }


    try {
        const presuer = await Users.findOne({ email: email });

        if (presuer) {
            const OTP = Math.floor(100000 + Math.random() * 900000);

            const existEmail = await Userotps.findOne({ email: email });


            if (existEmail) {
                const updateData = await Userotps.findByIdAndUpdate({ _id: existEmail._id }, {
                    otp: OTP
                }, { new: true }
                );
                await updateData.save();

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Sending Eamil For Otp Validation",
                    text: `OTP:- ${OTP}`
                }


                tarnsporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log("error", error);
                        res.status(400).json({ error: "email not send" })
                    } else {
                        console.log("Email sent", info.response);
                        res.status(200).json({ message: "Email sent Successfully" })
                    }
                })

            } else {

                const saveOtpData = new Userotps({
                    email, otp: OTP
                });

                await saveOtpData.save();
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Sending Eamil For Otp Validation",
                    text: `OTP:- ${OTP}`
                }

                tarnsporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log("error", error);
                        res.status(400).json({ error: "email not send" })
                    } else {
                        console.log("Email sent", info.response);
                        res.status(200).json({ message: "Email sent Successfully" })
                    }
                })
            }
        } else {
            res.status(400).json({ error: "This User Not Exist In our Db" })
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid Details", error })
    }
};


// /** GET: http://localhost:8080/api/verifyOTP */
// export async function verifyOTP(req,res){
//     const { code } = req.query;
//     if(parseInt(req.app.locals.OTP) === parseInt(code)){
//         req.app.locals.OTP = null; // reset the OTP value
//         req.app.locals.resetSession = true; // start session for reset password
//         return res.status(201).send({ msg: 'Verify Successsfully!'})
//     }
//     return res.status(400).send({ error: "Invalid OTP"});
// }
export const verifyOTP = async(req,res)=>{
    const {email,otp} = req.body;

    if(!otp || !email){
        res.status(400).json({ error: "Please Enter Your OTP and email" })
    }

    try {
        const otpverification = await Userotps.findOne({email:email});

        if(otpverification.otp === otp){
            const preuser = await Users.findOne({email:email});

            // // token generate
            const token = await preuser.generateAuthtoken();
           res.status(200).json({message:"User Login Succesfully Done",userToken:token});
        //    res.status(200).json({message:"User Login Succesfully Done"});

        }else{
            res.status(400).json({error:"Invalid Otp"})
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid Details", error })
    }
}


// // successfully redirect user when OTP is valid
// /** GET: http://localhost:8080/api/createResetSession */
// export async function createResetSession(req,res){
//    if(req.app.locals.resetSession){
//         return res.status(201).send({ flag : req.app.locals.resetSession})
//    }
//    return res.status(440).send({error : "Session expired!"})
// }