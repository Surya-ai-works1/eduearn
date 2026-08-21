import "./configs/dnsConfig.js";

import express from "express"
import dotenv from "dotenv"
import connectDb from "./configs/db.js"
import authRouter from "./routes/authRoute.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/userRoute.js"
import courseRouter from "./routes/courseRoute.js"
import paymentRouter from "./routes/paymentRoute.js"
import aiRouter from "./routes/aiRoute.js"
import reviewRouter from "./routes/reviewRoute.js"
import assignmentRouter from "./routes/assignmentRoute.js"
import liveClassRouter from "./routes/liveClassRoute.js"
import withdrawalRouter from "./routes/withdrawalRoute.js"
import adminRouter from "./routes/adminRoute.js"
import couponRouter from "./routes/couponRoute.js"
import communityRouter from "./routes/communityRoute.js"
import rateLimiter from "./middlewares/rateLimiter.js"
import errorHandler from "./middlewares/errorHandler.js"

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

let port = process.env.PORT
let app = express()
app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow same-origin requests (origin is undefined)
        if (!origin) return callback(null, true);

        // Allow allowed list or any Vercel subdomain
        const isAllowed = allowedOrigins.includes(origin) ||
                          origin.endsWith(".vercel.app") ||
                          (origin.startsWith("http") && new URL(origin).hostname.endsWith(".vercel.app"));

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials:true
}))

// Apply Rate Limiting to all API routes
app.use("/api", rateLimiter(150, 15 * 60 * 1000))

// Apply Production Security Headers (Helmet Equivalent)
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/course", courseRouter)
app.use("/api/payment", paymentRouter)
app.use("/api/ai", aiRouter)
app.use("/api/review", reviewRouter)
app.use("/api/assignment", assignmentRouter)
app.use("/api/liveclass", liveClassRouter)
app.use("/api/withdrawal", withdrawalRouter)
app.use("/api/admin", adminRouter)
app.use("/api/coupon", couponRouter)
app.use("/api/community", communityRouter)

app.get("/" , (req,res)=>{
    res.send("Hello From Server")
})

// Global Error Handler Middleware
app.use(errorHandler)

import mongoose from "mongoose";

const server = app.listen(port , ()=>{
    console.log("Server Started")
    connectDb()
})

const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      await mongoose.connection.close(false);
      console.log("MongoDB connection closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception caught:", err);
  gracefulShutdown("uncaughtException");
});

// Unhandled Rejection handler ended
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

