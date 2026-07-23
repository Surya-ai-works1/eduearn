import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  getPendingTutors,
  verifyTutor,
  getPendingCourses,
  approveCourse,
  getAllWithdrawals,
  processWithdrawal,
  getAiLogs,
  toggleUserStatus,
  deleteCommunityPost
} from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.get("/stats", isAuth, isAdmin, getPlatformStats);
adminRouter.get("/users", isAuth, isAdmin, getAllUsers);
adminRouter.post("/users/role", isAuth, isAdmin, updateUserRole);
adminRouter.post("/users/status", isAuth, isAdmin, toggleUserStatus);
adminRouter.get("/tutors/pending", isAuth, isAdmin, getPendingTutors);
adminRouter.post("/tutors/verify", isAuth, isAdmin, verifyTutor);
adminRouter.get("/courses/pending", isAuth, isAdmin, getPendingCourses);
adminRouter.post("/courses/approve", isAuth, isAdmin, approveCourse);
adminRouter.get("/withdrawals", isAuth, isAdmin, getAllWithdrawals);
adminRouter.post("/withdrawals/process", isAuth, isAdmin, processWithdrawal);
adminRouter.get("/ai-logs", isAuth, isAdmin, getAiLogs);
adminRouter.delete("/community/post/:postId", isAuth, isAdmin, deleteCommunityPost);

export default adminRouter;
