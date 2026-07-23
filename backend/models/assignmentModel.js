import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
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
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture"
    },
    fileUrl: {
      type: String // Optional PDF/Doc upload url
    },
    dueDate: {
      type: Date
    }
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
