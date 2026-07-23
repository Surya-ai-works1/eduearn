import express from "express"
import isAuth from "../middlewares/isAuth.js"
import isTutor from "../middlewares/isTutor.js"
import { 
  createCourse, 
  createLecture, 
  editCourse, 
  editLecture, 
  getCourseById, 
  getCourseLecture, 
  getCreatorById, 
  getCreatorCourses, 
  getPublishedCourses, 
  removeCourse, 
  removeLecture,
  updateLectureProgress,
  getCourseProgress,
  createCourseWithSyllabus
} from "../controllers/courseController.js"
import upload from "../middlewares/multer.js"

let courseRouter = express.Router()

courseRouter.post("/create", isAuth, isTutor, createCourse)
courseRouter.post("/create-with-syllabus", isAuth, isTutor, createCourseWithSyllabus)
courseRouter.get("/getpublishedcoures",getPublishedCourses)
courseRouter.get("/getcreatorcourses", isAuth, isTutor, getCreatorCourses)
courseRouter.post("/editcourse/:courseId", isAuth, isTutor, upload.single("thumbnail"), editCourse)
courseRouter.get("/getcourse/:courseId",isAuth,getCourseById)
courseRouter.delete("/removecourse/:courseId", isAuth, isTutor, removeCourse)
courseRouter.post("/createlecture/:courseId", isAuth, isTutor, createLecture)
courseRouter.get("/getcourselecture/:courseId",isAuth,getCourseLecture)
courseRouter.post("/editlecture/:lectureId", isAuth, isTutor, upload.single("videoUrl"), editLecture)
courseRouter.delete("/removelecture/:lectureId", isAuth, isTutor, removeLecture)
courseRouter.post("/getcreator",isAuth,getCreatorById)

// Student Progress tracking
courseRouter.post("/progress/update", isAuth, updateLectureProgress)
courseRouter.get("/progress/:courseId", isAuth, getCourseProgress)







export default courseRouter