import Quiz from "../models/quiz.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import { StatusCodes } from "http-status-codes";

// Create quiz
export const createQuiz = async (req, res) => {
  try {
    const { courseCode, title, question, options, answer } = req.body;

    // check if course already exists
    let quiz = await Quiz.findOne({ courseCode });

    if (quiz) {
      // just push new question
      quiz.questions.push({ questionText: question, options, answer });
      await quiz.save();
      return res.status(StatusCodes.OK).json({ message: "Question added", quiz });
    } else {
      // create new course quiz
      quiz = await Quiz.create({
        courseCode,
        title,
        questions: [{ questionText: question, options, answer }],
      });
      return res.status(StatusCodes.OK).json({ message: "Quiz created", quiz });
    }
  } catch (err) {
    console.log(`Error occured in the create quiz controller: ${err}`);    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

// Get all quizzes for a course
export const getCourseQuizzes = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const quiz = await Quiz.findOne({ courseCode }).select("questions");

    if (!quiz) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No quiz found for this course. Admin can create one" });
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No questions found in this quiz" });
    }

    // randomize the questions
    const shuffled = quiz.questions.sort(() => Math.random() - 0.5);

    // pick only 20
    const selectedQuestions = shuffled.slice(0, 20);

    res.status(StatusCodes.OK).json(selectedQuestions);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching course quiz questions",
      error: error.message,
    });
  }
};


// Save quiz attempt score
export const updateQuizAttemptScore = async (req, res) => {
  try {
    const { _id, courseCode, score } = req.body;

    if (!_id || !courseCode || score === null) {
      return res
        .status(400)
        .json({ message: "_id, courseCode and score are required" });
    }

    const attempt = new QuizAttempt({
      _id,
      courseCode,
      score,
    });

    await attempt.save();

    res.status(201).json({
      message: "Quiz attempt recorded successfully",
      attempt,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving quiz attempt", error: error.message });
  }
};