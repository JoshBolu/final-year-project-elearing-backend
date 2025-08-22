import mongoose from "mongoose";

const PastQuestionSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: [true, "Course code is required"]
    },
    year: {
        type: String,
        required: [true, "Year is required"]
    },
    imageUrl: {
        type: String, // Cloudinary URL
        required: [true, "Image URL is required"]    
    }
}, {timestamps: true});

const PastQuestion = mongoose.model("PastQuestion", PastQuestionSchema);
export default PastQuestion;