import mongoose from "mongoose";

const liveClassSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    meetingLink: {
      type: String, // Zoom, Google Meet, MS Teams url
      required: true
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in minutes
      default: 60
    }
  },
  { timestamps: true }
);

const LiveClass = mongoose.model("LiveClass", liveClassSchema);
export default LiveClass;
