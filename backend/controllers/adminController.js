import User from "../models/userModel.js";
import Course from "../models/courseModel.js";
import Withdrawal from "../models/withdrawalModel.js";
import Order from "../models/orderModel.js";
import AiLog from "../models/aiLogModel.js";

// Check if requester is Admin
const isAdminCheck = async (userId) => {
  const user = await User.findById(userId);
  return user && user.role === "admin";
};

// 1. Get Platform Stats
export const getPlatformStats = async (req, res) => {
  try {
    if (!(await isAdminCheck(req.userId))) {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTutors = await User.countDocuments({ role: "educator" });
    const totalCourses = await Course.countDocuments();
    
    // Revenue calculations from Order model
    const paidOrders = await Order.find({ isPaid: true });
    const totalSales = paidOrders.reduce((sum, order) => sum + order.amount, 0);
    
    // Platform fee calculation (e.g. 10% commission fee)
    const platformRevenue = totalSales * 0.10; 
    const tutorRevenue = totalSales * 0.90;

    // AI requests count
    const totalAiRequests = await AiLog.countDocuments();

    return res.status(200).json({
      totalStudents,
      totalTutors,
      totalCourses,
      totalSales,
      platformRevenue,
      tutorRevenue,
      totalAiRequests
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch platform stats" });
  }
};

// 2. Get All Users (with pagination)
export const getAllUsers = async (req, res) => {
  try {
    if (!(await isAdminCheck(req.userId))) {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

// 3. Update User Role
export const updateUserRole = async (req, res) => {
  try {
    if (!(await isAdminCheck(req.userId))) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { userId, role } = req.body;
    if (!["student", "educator", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    return res.status(200).json({ message: "User role updated successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update role" });
  }
};

// 4. Get Pending Tutor Verification requests
export const getPendingTutors = async (req, res) => {
  try {
    if (!(await isAdminCheck(req.userId))) {
      return res.status(403).json({ message: "Access denied" });
    }

    const pendingTutors = await User.find({ tutorVerificationStatus: "pending" }).select("-password");
    return res.status(200).json(pendingTutors);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch pending tutors" });
  }
};

// 5. Verify/Approve Tutor
export const verifyTutor = async (req, res) => {
  try {
    if (!(await isAdminCheck(req.userId))) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { tutorId, status } = req.body; // "verified" or "rejected"
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }

    const tutor = await User.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    tutor.tutorVerificationStatus = status;
    tutor.isVerified = status === "verified";
    if (status === "verified") {
      tutor.role = "educator"; // automatically upgrade student to tutor role upon verification
    }
    await tutor.save();

    return res.status(200).json({ message: `Tutor verification status set to: ${status}`, tutor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update tutor status" });
  }
};

// 6. Get Courses Pending Approval
export const getPendingCourses = async (req, res) => {
  try {
    if (!(await isAdminCheck(req.userId))) {
      return res.status(403).json({ message: "Access denied" });
    }

    const pendingCourses = await Course.find({ approvalStatus: "pending" }).populate("creator", "name email");
    return res.status(200).json(pendingCourses);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch pending courses" });
  }
};

// 7. Approve/Reject Course
export const approveCourse = async (req, res) => {
  try {
    if (!(await isAdminCheck(req.userId))) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { courseId, status } = req.body; // "approved" or "rejected"
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid approval status" });
    }

    const course = await Course.findByIdAndUpdate(courseId, { approvalStatus: status }, { new: true });
    return res.status(200).json({ message: `Course status set to: ${status}`, course });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update course status" });
  }
};

// 8. Get All Withdrawal requests
export const getAllWithdrawals = async (req, res) => {
  try {
    if (!(await isAdminCheck(req.userId))) {
      return res.status(403).json({ message: "Access denied" });
    }

    const withdrawals = await Withdrawal.find().populate("tutor", "name email").sort({ createdAt: -1 });
    return res.status(200).json(withdrawals);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch payouts" });
  }
};

// 9. Process Withdrawal payout
export const processWithdrawal = async (req, res) => {
  try {
    if (!(await isAdminCheck(req.userId))) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { withdrawalId, status } = req.body; // "approved" or "rejected"
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    withdrawal.status = status;
    withdrawal.processedAt = Date.now();
    await withdrawal.save();

    return res.status(200).json({ message: `Payout request ${status}`, withdrawal });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to process withdrawal" });
  }
};

// 10. Get AI Logs
export const getAiLogs = async (req, res) => {
  try {
    if (!(await isAdminCheck(req.userId))) {
      return res.status(403).json({ message: "Access denied" });
    }

    const logs = await AiLog.find().populate("user", "name email role").sort({ createdAt: -1 }).limit(100);
    return res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch AI logs" });
  }
};

// 11. Toggle User Active Status (Suspend/Activate)
export const toggleUserStatus = async (req, res) => {
  try {
    if (!(await isAdminCheck(req.userId))) {
      return res.status(403).json({ message: "Access denied" });
    }
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isActive = !user.isActive;
    await user.save();
    return res.status(200).json({ message: `User status set to ${user.isActive ? 'Active' : 'Suspended'}`, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to toggle user status" });
  }
};

// 12. Moderate Delete Community Post
import Post from "../models/postModel.js";
export const deleteCommunityPost = async (req, res) => {
  try {
    if (!(await isAdminCheck(req.userId))) {
      return res.status(403).json({ message: "Access denied" });
    }
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await post.deleteOne();
    return res.status(200).json({ message: "Post moderated and deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete post" });
  }
};
