import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyjwt = asyncHandler( async (req,_,next) => {
   try{ 

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", ""); 

    if(!token){ 
        throw new ApiError(401, "Unauthorized Request");
    }
    const decodedtoken = jwt.verify( token, process.env.ACCESS_TOKEN_SECRET )
    const user = await User.findById(decodedtoken?._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(401, "Invalid access tokken");
    }
    req.user = user;
    next();
}catch(error){
    throw new ApiError(401,error?.message || "Invalid access token")
    }
})