import express from "express"
import {googleSignup, login, logOut, resetPassword, sendOtp, signUp, verifyOtp, bridgeSession } from "../controllers/authController.js"
import { validateRegister, validateLogin } from "../middlewares/validate.js"

const authRouter = express.Router()

authRouter.post("/signup", validateRegister, signUp)

authRouter.post("/login", validateLogin, login)
authRouter.get("/logout",logOut)
authRouter.post("/googlesignup",googleSignup)
authRouter.post("/sendotp",sendOtp)
authRouter.post("/verifyotp",verifyOtp)
authRouter.post("/resetpassword",resetPassword)
authRouter.post("/bridge-session", bridgeSession)

export default authRouter