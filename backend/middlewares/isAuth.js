import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const isAuth=async (req,res,next)=>{
    try {
 
      let {token} = req.cookies
     
      if(!token){
        return res.status(400).json({message:"user doesn't have token"})
      }
      let verifyToken = jwt.verify(token,process.env.JWT_SECRET)
      
      if(!verifyToken){
        return res.status(400).json({message:"user doesn't have valid token"})
      }

      const user = await User.findById(verifyToken.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.isActive === false) {
        return res.status(403).json({ message: "Access denied. Your account is suspended." });
      }
  
      req.userId = verifyToken.userId
      next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:`is auth error ${error}`})
    }
}
export default isAuth