import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { ApiResponse } from "../utils/ApiResponse.js"
import { adminUsers } from '../model/adminUser.model.js'

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try { 
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json(
                new ApiResponse(401, "No Token Found", "TOKEN ERROR", false)
            )
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await adminUsers.findOne(decodedToken?._userName)
        if (!user) {
            return res.status(401).json(
                new ApiResponse(401, "Invalid Access Token", "TOKEN ERROR")
            )
        }
        req.user = user.dataValues;
        next()
    } catch (error) {
        return res.status(401).json(
            new ApiResponse(401, error, "TOKEN ERROR")
        )
    }  
})