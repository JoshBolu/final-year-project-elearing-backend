import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: {
        type: String, 
        required: ["true", "quiz title is required"] 
    },
    courseCode: { 
        type: String, 
        required: ["true", "course code is required"] 
    },
    questions: [
      {
        questionText: { 
            type: String, 
            required: ["true", "You must provide a question"] },
        options: { type: [String], required: true }, // multiple choice options
        answer: { type: String, required: true } // index of correct option
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
