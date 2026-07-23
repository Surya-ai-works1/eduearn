import mongoose from "mongoose";

const aiLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    feature: {
      type: String, // e.g. 'chat', 'notes', 'planner', 'quiz', 'course-creator'
      required: true
    },
    prompt: {
      type: String
    },
    response: {
      type: String
    },
    provider: {
      type: String,
      default: "gemini"
    },
    model: {
      type: String,
      default: "gemini-2.5-flash"
    },
    tokensUsed: {
      type: Number,
      default: 0
    },
    executionTime: {
      type: Number, // in milliseconds
      default: 0
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

aiLogSchema.index({ user: 1, requestedAt: -1 });
aiLogSchema.index({ user: 1, isFavorite: 1, requestedAt: -1 });

const AiLog = mongoose.model("AiLog", aiLogSchema);
export default AiLog;
