import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isTutor from "../middlewares/isTutor.js";
import {
  requestWithdrawal,
  getTutorWithdrawals
} from "../controllers/withdrawalController.js";

const withdrawalRouter = express.Router();

withdrawalRouter.post("/request", isAuth, isTutor, requestWithdrawal);
withdrawalRouter.get("/history", isAuth, isTutor, getTutorWithdrawals);

export default withdrawalRouter;
