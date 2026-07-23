import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isTutor from "../middlewares/isTutor.js";
import {
  createCoupon,
  getTutorCoupons,
  deleteCoupon,
  validateCoupon
} from "../controllers/couponController.js";

const couponRouter = express.Router();

couponRouter.post("/create", isAuth, isTutor, createCoupon);
couponRouter.get("/tutor-list", isAuth, isTutor, getTutorCoupons);
couponRouter.delete("/:couponId", isAuth, isTutor, deleteCoupon);
couponRouter.post("/validate", isAuth, validateCoupon);

export default couponRouter;
