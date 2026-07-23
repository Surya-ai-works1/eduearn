import User from "../models/userModel.js";

const isTutor = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized. Please authenticate first." });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.role !== "educator" && user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Educator role required." });
    }
    // Enforce admin verification check for tutors
    if (user.role === "educator" && user.tutorVerificationStatus !== "verified") {
      return res.status(403).json({ message: "Access denied. Educator account is not verified by admin." });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Tutor auth middleware error:", error);
    return res.status(500).json({ message: "Internal server error in tutor authorization middleware." });
  }
};

export default isTutor;
