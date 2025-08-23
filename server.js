import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();

// database import
import { connectDB } from "./library/db.js";
import cookieParser from "cookie-parser";

// import extra security packages
import helmet from "helmet"; // helps secure Express apps by setting various HTTP headers
import rateLimiter from "express-rate-limit"; // helps limit the number of requests to your API to prevent DDoS attacks
import cors from "cors"; // helps enable Cross-Origin Resource Sharing (CORS) for your API

//routes
import authRoutes from "./routes/auth.route.js";
import coursesPdfRoute from "./routes/coursesPdf.route.js";
import coursePastQuestionsRoute from "./routes/coursePastQuestions.route.js";

app.set("trust proxy", 1); // trust first proxy
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, //15 minutes, default is in milliseconds
    max: 200, // limit each IP to 100 requests per windowMs
  })
);
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         imgSrc: [
//           "'self'",
//           "data:",
//           "https://res.cloudinary.com"
//         ]
//       },
//     },
//   })
// );

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
    credentials: true, // allow credentials (cookies) to be sent with requests
  })
);

app.use(express.json({ limit: "10mb" })); //allows you to parse body of a request
app.use(cookieParser()); // allows you to parse cookies from the request

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", coursesPdfRoute);
app.use("/api/v1/pastQuestions", coursePastQuestionsRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http:localhost://${PORT}`);
});
