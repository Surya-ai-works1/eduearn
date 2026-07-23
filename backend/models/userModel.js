import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String
      
    },
    description: {
      type: String
    },
    role: {
      type: String,
      enum: ["educator", "student", "admin"],
      required: true
    },
    photoUrl: {
      type: String,
      default: ""
    },
    enrolledCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    bookmarks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture'
    }],
    tutorVerificationStatus: {
      type: String,
      enum: ["none", "pending", "verified", "rejected"],
      default: "none"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    xp: {
      type: Number,
      default: 0
    },
    coins: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date
    },
    resetOtp:{
      type:String
    },
    otpExpires:{
      type:Date
    },
    isOtpVerifed:{
      type:Boolean,
      default:false
    },
    isActive: {
      type: Boolean,
      default: true
    }
    
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
