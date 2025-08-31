import { StatusCodes } from "http-status-codes"
import { redis } from "../library/redis.js";
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

const generateTokens = (_id, userName) => {
  const accessToken = jwt.sign(
    { _id, userName },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { _id, userName },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (_id, refreshToken) => {
  await redis.set(
    `refresh_token: ${_id}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevents XSS attacks, cross-site scripting attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevents XSS attacks, cross-site scripting attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const signUp = async (req, res) => {
  const { userName,email, password, level, semester, levelSemesterTag } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(StatusCodes.BAD_REQUEST).send({message: "User already exists"});
    }

    const user = await User.create({ userName, email, password, level, semester, levelSemesterTag });

    const { accessToken, refreshToken } = generateTokens(user._id, user.userName);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(StatusCodes.CREATED).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        level: user.level,
        semester: user.semester,
        levelSemesterTag: user.levelSemesterTag,
        role: user.role,

      },
      message: "User created successfully",
    });
  } catch (err) {
    console.log(`Error in signup controller ${err.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

export const login = async(req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(user && (await user.comparePassword(password))){
            const { accessToken, refreshToken } = generateTokens(user._id, user.userName)
            
            await storeRefreshToken(user._id, refreshToken)
            setCookies(res, accessToken, refreshToken);
            res.status(StatusCodes.OK).json({
              user: {
                _id: user._id,
                userName: user.userName,
                email: user.email,
                level: user.level,
                semester: user.semester,
                levelSemesterTag: user.levelSemesterTag,
                role: user.role,
              },
              message: "User logged in successfully",
            });   
        }
        else{
            res.status(StatusCodes.BAD_REQUEST).json({message: "Invalid email or password"})
        } 
    }
    catch(err){
        console.log(`Error in login controller ${err.message}`)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message});
    }
} 

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token: ${decoded._id}`);
    }
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    res.status(StatusCodes.OK).json({ message: "Logged out Successfully" });
  } catch (err) {
    console.log(`Error in logout controller ${err.message}`);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server Error", error: err.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token: ${decoded._id}`);

    if (storedToken !== refreshToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { _id: decoded._id, userName: decoded.userName },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res
      .status(StatusCodes.OK)
      .json({ accessToken, message: "Access token refreshed successfully" });
  } catch (err) {
    console.log(`Error in refreshToken controller ${err.message}`);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.status(StatusCodes.OK).json(req.user);
  } catch (error) {
    console.log(`Error in getProfile controller ${error.message}`);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { level, semester, levelSemesterTag } = req.body;
    const _id = req.user._id;    
    
    const user = await User.findById(_id);
    if(!user){
      return res.status(StatusCodes.NOT_FOUND).json({message: "User not found"})
    }
    user.level = level;
    user.semester = semester;
    user.levelSemesterTag = levelSemesterTag;
    user.save();
    res.status(StatusCodes.OK).json({message: "Profile updated successfully", user})
  } catch (error) {
    console.log(`Error in updateProfile controller ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}