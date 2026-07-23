import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isTutor from "../middlewares/isTutor.js";
import {
  createLiveClass,
  getCourseLiveClasses,
  deleteLiveClass
} from "../controllers/liveClassController.js";

const liveClassRouter = express.Router();

liveClassRouter.post("/create", isAuth, isTutor, createLiveClass);
liveClassRouter.get("/course/:courseId", getCourseLiveClasses);
liveClassRouter.delete("/:liveClassId", isAuth, isTutor, deleteLiveClass);

export default liveClassRouter;
