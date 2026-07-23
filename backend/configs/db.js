import mongoose from "mongoose";
import dns from "dns";

const connectDb = async () => {
    try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB connected")
    } catch (error) {
        console.log("DB error:", error)
    }
}
export default connectDb