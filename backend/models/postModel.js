import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    postType: {
      type: String,
      enum: ["Question", "Discussion", "Announcement", "Study Note", "Resource", "Project Showcase"],
      default: "Discussion"
    },
    category: {
      type: String,
      default: "General"
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    isPinned: {
      type: Boolean,
      default: false
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },
    studyGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyGroup"
    }
  },
  { timestamps: true }
);

postSchema.index({ studyGroup: 1, createdAt: -1 });
postSchema.index({ course: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);
export default Post;
