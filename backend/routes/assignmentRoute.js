import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isTutor from "../middlewares/isTutor.js";
import {
  createAssignment,
  getCourseAssignments,
  submitAssignment,
  getStudentSubmission,
  getAssignmentSubmissions,
  gradeSubmission
} from "../controllers/assignmentController.js";

const assignmentRouter = express.Router();

assignmentRouter.post("/create", isAuth, isTutor, createAssignment);
assignmentRouter.get("/course/:courseId", getCourseAssignments);
assignmentRouter.post("/submit/:assignmentId", isAuth, submitAssignment);
assignmentRouter.get("/student-status/:assignmentId", isAuth, getStudentSubmission);
assignmentRouter.get("/submissions/:assignmentId", isAuth, isTutor, getAssignmentSubmissions);
assignmentRouter.post("/grade/:submissionId", isAuth, isTutor, gradeSubmission);

export default assignmentRouter;
