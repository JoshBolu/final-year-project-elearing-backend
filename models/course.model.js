import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, "Course code is required"],
    },
    title: {
      type: String,
      required: [true, "Course title is required"],
    },
    levelSemesterTag: {
      type: String,
      enum: [
        "100/1",
        "100/2",
        "200/1",
        "200/2",
        "300/1",
        "300/2",
        "400/1",
        "400/2",
      ],
      required: [true, "levelSemesterTag is required"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
    },
    pdfUrl: {
      type: String,
      required: [true, "PDF URL is required"],
    }, // Firebase Storage URL
    modules: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Module",
      default: [], // Add default for modules array
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", CourseSchema);
export default Course;
