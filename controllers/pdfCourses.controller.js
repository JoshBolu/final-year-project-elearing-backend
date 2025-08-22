import { StatusCodes } from "http-status-codes";
import Course from "../models/course.model.js";
import cloudinary from "../library/cloudinary.js";
// controllers/courseController.js
import dbx from "../library/dropbox.js";

export const getPdfCourses = async(req, res) => {
    try{
        const pdfCourses = await Course.find({ levelSemesterTag: req.user.levelSemesterTag}, {pdfUrl: 1})
        res.status(StatusCodes.OK).json(pdfCourses);
    }
    catch(error){
        console.log(`Error at the getPdfCourses controller ${error}`)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: error.message});
    }
}

export const createPdfCourse = async (req, res) => {
  try {
    const { courseCode, title, levelSemesterTag, description } = req.body;

    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return res.status(StatusCodes.BAD_REQUEST)
        .json({ message: "Course with this code already exists" });
    }

    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST)
        .json({ message: "No file uploaded" });
    }

    // Upload PDF to Dropbox
    const dropboxPath = `/${Date.now()}_${req.file.originalname}`;
    await dbx.filesUpload({
      path: dropboxPath,
      contents: req.file.buffer,
      mode: "add",
      autorename: true,
      mute: false,
    });

    // Create a shared link
    const sharedLinkRes = await dbx.sharingCreateSharedLinkWithSettings({ path: dropboxPath });
    const pdfUrl = sharedLinkRes.result.url.replace("dl=0", "raw=1"); // direct download

    const course = await Course.create({
      courseCode,
      title,
      levelSemesterTag,
      description,
      pdfUrl,
    });

    res.status(StatusCodes.CREATED).json({ message: "PDF uploaded to Dropbox", course });

  } catch (error) {
    console.error("Error uploading to Dropbox:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};



export const deletePdfCourse = async(req, res) => {
    try {
        const course = await Course.findById(req.params.id) 

        console.log(req.params.id);
        
        if(!course){
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Course not found" });
        }

        if(course.pdfUrl){
            const publicId = course.pdfUrl.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`pdfCourses/${publicId}`);
                console.log("deleted pdf from cloudinary");
            } catch (error) {
                console.log(`Error deleting PDF from Cloudinary: ${error.message}`);              
            }
        }
        
        await Course.findByIdAndDelete(req.params.id);
        res.status(StatusCodes.OK).json({ message: "PDF course deleted successfully" });

      
    } catch (error) {
        console.log(`Error at the deletePdfCourse controller ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
}