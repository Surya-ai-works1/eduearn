import User from "../models/userModel.js";

const isAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized. Please authenticate first." });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Administrator role required." });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return res.status(500).json({ message: "Internal server error in admin authorization middleware." });
  }
};

export default isAdmin;
