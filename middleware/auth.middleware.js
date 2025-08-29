import { StatusCodes } from "http-status-codes"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken
        if(!accessToken){
            return res.status(StatusCodes.UNAUTHORIZED).json({message: 'Unauthorized - No access token provided'})
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
            const user = await User.findById(decoded._id).select("-password")
            
            if(!user){
                return res.status(StatusCodes.UNAUTHORIZED).json({message: 'Unauthorized - User not found'})
            }
            req.user = user
            next()
        } 
        catch (error) {
            if(error.name === 'TokenExpiredError'){
                return res.status(StatusCodes.UNAUTHORIZED).json({message: 'Unauthorized - Access Token Expired'})
            }
        }

    } 
    catch (error) {
        console.log(`Error in protectRoute: ${error.message}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message})            
    }
    
}

export const adminRoute = async (req, res, next) => {
    try{
        if(req.user && req.user.role !== 'admin'){
            return res.status(StatusCodes.FORBIDDEN).json({message: "FORBIDDEN - Admin Only"})
        }
        next()
    }
    catch(error){
        console.log(`Error in adminRoute: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message})
    }
}