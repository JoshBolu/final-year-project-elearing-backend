import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: ["true", "User ID is required"],
    },
    courseCode: {
      type: String,
      required: ["true", "courseCode is required"],
    },
    score: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("QuizAttempt", quizAttemptSchema);