import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { getCurrentUser, UpdateProfile, applyTutor, toggleWishlist, getWishlist, getLeaderboard } from "../controllers/userController.js"
import upload from "../middlewares/multer.js"

let userRouter = express.Router()

userRouter.get("/currentuser",isAuth,getCurrentUser)
userRouter.post("/updateprofile",isAuth,upload.single("photoUrl"),UpdateProfile)
userRouter.post("/apply-tutor", isAuth, applyTutor)
userRouter.post("/wishlist/toggle", isAuth, toggleWishlist)
userRouter.get("/wishlist", isAuth, getWishlist)
userRouter.get("/leaderboard", isAuth, getLeaderboard)

export default userRouter;