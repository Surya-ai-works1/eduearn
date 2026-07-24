import { genToken } from "../configs/token.js"
import validator from "validator"
import jwt from "jsonwebtoken"

import bcrypt from "bcryptjs"
import User from "../models/userModel.js"

import sendMail from "../configs/Mail.js"



export const signUp=async (req,res)=>{
 
    try {

        let {name,email,password,role}= req.body
        let existUser= await User.findOne({email})
        if(existUser){
            return res.status(400).json({message:"email already exist"})
        }
        if(!validator.isEmail(email)){
            return res.status(400).json({message:"Please enter valid Email"})
        }
        if(password.length < 8){
            return res.status(400).json({message:"Please enter a Strong Password"})
        }
        
        let hashPassword = await bcrypt.hash(password,10)
        let user = await User.create({
            name ,
            email ,
            password:hashPassword ,
            role,
           
            })
        let token = await genToken(user._id)
        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(201).json(user)

    } catch (error) {
        console.log("signUp error")
        return res.status(500).json({message:`signUp Error ${error}`})
    }
}

export const login=async(req,res)=>{
    try {
        let {email,password}= req.body
        let user= await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"user does not exist"})
        }
        if(user.isActive === false){
            return res.status(403).json({message:"Your account has been suspended by an administrator."})
        }
        let isMatch =await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message:"incorrect Password"})
        }
        let token =await genToken(user._id)
        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json(user)

    } catch (error) {
        console.log("login error")
        return res.status(500).json({message:`login Error ${error}`})
    }
}




export const logOut = async(req,res)=>{
    try {
        await res.clearCookie("token")
        return res.status(200).json({message:"logOut Successfully"})
    } catch (error) {
        return res.status(500).json({message:`logout Error ${error}`})
    }
}


export const googleSignup = async (req,res) => {
    try {
        const {name , email , role} = req.body
        let user= await User.findOne({email})
        if(user && user.isActive === false){
            return res.status(403).json({message:"Your account has been suspended by an administrator."})
        }
        if(!user){
            user = await User.create({
            name , email ,role
        })
        }
        let token =await genToken(user._id)
        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json(user)


    } catch (error) {
        console.log(error)
         return res.status(500).json({message:`googleSignup  ${error}`})
    }
    
}

export const sendOtp = async (req,res) => {
    try {
        const {email} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()

        user.resetOtp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        user.isOtpVerifed = false; 

        await user.save()
        await sendMail(email,otp)
        return res.status(200).json({message:"Email Successfully send"})
    } catch (error) {

        return res.status(500).json({message:`send otp error ${error}`})
        
    }
}

export const verifyOtp = async (req,res) => {
    try {
        const {email,otp} = req.body
        const user = await User.findOne({email})
        if(!user || user.resetOtp!=otp || user.otpExpires<Date.now() ){
            return res.status(400).json({message:"Invalid OTP"})
        }
        user.isOtpVerifed=true
        user.resetOtp=undefined
        user.otpExpires=undefined
        await user.save()
        return res.status(200).json({message:"OTP varified "})


    } catch (error) {
         return res.status(500).json({message:`Varify otp error ${error}`})
    }
}

export const resetPassword = async (req,res) => {
    try {
        const {email ,password } =  req.body
         const user = await User.findOne({email})
        if(!user || !user.isOtpVerifed ){
            return res.status(404).json({message:"OTP verfication required"})
        }

        const hashPassword = await bcrypt.hash(password,10)
        user.password = hashPassword
        user.isOtpVerifed=false
        await user.save()
        return res.status(200).json({message:"Password Reset Successfully"})
    } catch (error) {
        return res.status(500).json({message:`Reset Password error ${error}`})
    }
}
export const bridgeSession = async (req, res) => {
    try {
        let email, role, name, photoUrl;

        // Skip validation ONLY if explicit dev flag is enabled and we are not in production
        if (process.env.NODE_ENV !== "production" && process.env.DEV_DISABLE_JWT_VALIDATION === "true") {
            console.warn("LMS Auth Bridge: DEV_DISABLE_JWT_VALIDATION active, skipping JWT checks");
            email = req.body.email;
            role = req.body.role || "student";
            name = req.body.name || email?.split("@")[0] || "Test User";
            photoUrl = req.body.photoUrl || "";
            if (!email) {
                return res.status(400).json({ message: "Email is required in bypass mode" });
            }
        } else {
            // AUTHORITATIVE JWT CHECK
            const authHeader = req.headers.authorization;
            const tokenFromPayload = req.body.token;
            const supabaseToken = authHeader && authHeader.startsWith("Bearer ") 
                ? authHeader.substring(7) 
                : tokenFromPayload;

            if (!supabaseToken) {
                console.warn("LMS Auth Bridge: Missing authorization token");
                return res.status(401).json({ message: "Authorization token is required." });
            }

            const jwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;
            if (!jwtSecret) {
                console.error("SUPABASE_JWT_SECRET is not configured on the server.");
                return res.status(500).json({ message: "Server configuration error." });
            }

            let decoded;
            try {
                decoded = jwt.verify(supabaseToken, jwtSecret);
            } catch (jwtErr) {
                console.warn("LMS Auth Bridge: JWT validation failed:", jwtErr.message);
                return res.status(401).json({ message: `Invalid or expired Supabase token: ${jwtErr.message}` });
            }

            email = decoded.email;
            const metadata = decoded.user_metadata || {};
            role = metadata.role || "student";
            name = metadata.fullName || metadata.full_name || email.split("@")[0];
            photoUrl = metadata.avatarUrl || metadata.avatar_url || "";

            if (!email) {
                return res.status(400).json({ message: "Email not found in token payload." });
            }
        }

        // Role mapping:
        // learner -> student
        // tutor -> educator
        // admin -> admin
        let mappedRole = "student";
        if (role === "tutor" || role === "educator") {
            mappedRole = "educator";
        } else if (role === "admin") {
            mappedRole = "admin";
        } else if (role === "learner" || role === "student") {
            mappedRole = "student";
        } else {
            return res.status(400).json({ message: `Invalid role: ${role}` });
        }

        // Search MongoDB by email
        let user = await User.findOne({ email });

        if (user) {
            if (user.isActive === false) {
                return res.status(403).json({ message: "Your account is suspended by an administrator." });
            }
            
            // Update profile details if changed
            let updated = false;
            if (name && user.name !== name) {
                user.name = name;
                updated = true;
            }
            if (user.role !== mappedRole) {
                user.role = mappedRole;
                updated = true;
            }
            if (photoUrl && user.photoUrl !== photoUrl) {
                user.photoUrl = photoUrl;
                updated = true;
            }
            
            if (updated) {
                await user.save();
            }
        } else {
            // Create user automatically if missing
            const tempPassword = Math.random().toString(36).slice(-8);
            const hashPassword = await bcrypt.hash(tempPassword, 10);
            
            user = await User.create({
                name: name || email.split("@")[0],
                email,
                password: hashPassword,
                role: mappedRole,
                photoUrl: photoUrl || "",
                isVerified: true
            });
        }

        // Generate the LMS JWT
        const token = await genToken(user._id);

        // Store the LMS authentication cookie securely
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // In local development
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json(user);

    } catch (error) {
        console.error("bridgeSession error:", error);
        return res.status(500).json({ message: `Bridge session error: ${error.message}` });
    }
};