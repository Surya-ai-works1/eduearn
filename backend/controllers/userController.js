import uploadOnCloudinary from "../configs/cloudinary.js";
import User from "../models/userModel.js";

export const getCurrentUser = async (req,res) => {
    try {
        const user = await User.findById(req.userId).select("-password").populate("enrolledCourses")
         if(!user){
            return res.status(400).json({message:"user does not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"get current user error"})
    }
}

export const UpdateProfile = async (req,res) => {
    try {
        const userId = req.userId
        const {name , description} = req.body
        let photoUrl
        if(req.file){
           photoUrl =await uploadOnCloudinary(req.file.path)
        }
        const updateFields = { name, description };
        if (photoUrl) {
           updateFields.photoUrl = photoUrl;
        }
        const user = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
         console.log(error);
       return res.status(500).json({message:`Update Profile Error  ${error}`})
    }
}

// Apply for Tutor status
export const applyTutor = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.tutorVerificationStatus === "verified") {
      return res.status(400).json({ message: "You are already a verified tutor" });
    }

    user.tutorVerificationStatus = "pending";
    await user.save();

    return res.status(200).json({ message: "Tutor application submitted successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to submit tutor application" });
  }
};

// Toggle Wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.wishlist.indexOf(courseId);
    if (index > -1) {
      // Remove
      user.wishlist.splice(index, 1);
      await user.save();
      return res.status(200).json({ message: "Removed from wishlist", wishlist: user.wishlist });
    } else {
      // Add
      user.wishlist.push(courseId);
      await user.save();
      return res.status(200).json({ message: "Added to wishlist", wishlist: user.wishlist });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to toggle wishlist" });
  }
};

// Get Wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user.wishlist);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

// Get Global Gamification Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find({}, "name photoUrl xp coins streak role")
      .sort({ xp: -1 })
      .limit(10);
    return res.status(200).json(topUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch leaderboard." });
  }
};
