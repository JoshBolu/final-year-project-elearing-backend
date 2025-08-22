import { StatusCodes } from "http-status-codes";
import Course from "../models/course.model.js";
import PastQuestion from "../models/pastQuestion.model.js";
import cloudinary from "../library/cloudinary.js";

export const getAllPastQuestions = async (req, res) => {
    try {
        const pastQuestions = await PastQuestion.find();
        res.status(StatusCodes.OK).json({
        success: true,
        data: pastQuestions,
        });
    } catch (error){
        console.log(`Error fetching all past questions: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: error.message});
    }
}

export const createPastQuestion = async(req, res) => {
    try {
        const { courseCode, year, imagePath } = req.body;
        if(!courseCode || !year || !imagePath){
            return res.status(StatusCodes.BAD_REQUEST).json({message: "Please provide courseCode, year, and imagePath"
            });
        }  

        // Check if the pastQuestion already exists w
        const existingPastQuestion = await PastQuestion.findOne({ courseCode, year })
        if(existingPastQuestion){
            return res.status(StatusCodes.BAD_REQUEST).json({message: "Past question for this course and year already exists"});
        }
        let cloudinaryResponse = null;

        cloudinaryResponse = await cloudinary.uploader.upload(imagePath, {
          folder: "past_questions",
        });
        
        const pastQuestion = await PastQuestion.create({
          courseCode,
          year,
          imageUrl: cloudinaryResponse?.secure_url
            ? cloudinaryResponse.secure_url
            : ""
        });

        res.status(StatusCodes.CREATED).json(pastQuestion);
    } catch (error) {
        console.log(`Error creating past questions: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: error});
    }
}

export const getPastQuestionsPerCourse = async(req, res) => {
    try {
        const courseCode = req.params.courseCode;
        if(!courseCode) {
            return res.status(StatusCodes.BAD_REQUEST).json({message: "Please provide courseId"});
        }
        const pastQuestions = await PastQuestion.find({ courseCode: courseCode })

        if(!pastQuestions || pastQuestions.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({message: "No past questions found for this course"});
        }

        res.status(StatusCodes.OK).json({pastQuestions})
    } catch (error) {
        console.log(`Error fetching past questions for course: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: error.message});
    }
}

export const deletePastQuestion = async(req, res) => {
    try {
        const pastQuestion = await PastQuestion.findById(req.params.id);
        if(!pastQuestion){
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Past question not found" });
        }

        const publicId = pastQuestion.imageUrl.split("/").pop().split(".")[0];
        try {
            await cloudinary.uploader.destroy(`past_questions/${publicId}`);
            console.log(`Error deleting image from Cloudinary: ${error}`);
                        
        } catch (error) {
            console.log(`Error deleting image from Cloudinary: ${error.message}`);
        }
        await PastQuestion.findByIdAndDelete(req.params.id);
        res.status(StatusCodes.OK).json({message: "Past question deleted successfully"});
    } catch (error) {
        console.log(`Error deleting past question: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: error.message});        
    }
}