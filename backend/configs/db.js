import mongoose from "mongoose";
import dns from "dns";

const connectDb = async () => {
    try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        const mongoUrl = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/eduearn";
        await mongoose.connect(mongoUrl)
        console.log("DB connected")
    } catch (error) {
        console.log("DB error:", error)
    }
}
export default connectDb