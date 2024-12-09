import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError} from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken"
import mongoose, { Aggregate } from "mongoose";

const generateAccessRefreshToken = async (userId) =>{
       
  const user =  await User.findById(userId);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({validateBeforeSave : false})

  return {accessToken, refreshToken}
}

const registerUser = asyncHandler(async (req, res) => {

  //console.log('Files received:', req.files);

    const { fullName , email , username , password } = req.body; 
    
    if([fullName, email, username, password].some((field) => field?.trim() == "" ))
      {
        throw new ApiError(400,"All fields must filled ");
    }
 
    const userExisted = await User.findOne({
        $or : [{email},{username}]
    })


    if(userExisted){
      throw new ApiError(409,"User already exists")
    }


    const avatarlocalpath = req.files?.avatar[0]?.path
  
    let coverImagelocalpath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){

      coverImagelocalpath = req.files.coverImage[0].path
    }
    console.log("Avatar local path:", avatarlocalpath);
    console.log("Cover image local path:", coverImagelocalpath); 

    if(!avatarlocalpath){
      throw new ApiError(400,"Avatar is required field");
    } 

    const avatar =await uploadCloudinary(avatarlocalpath);
    const coverImage =await uploadCloudinary(coverImagelocalpath);
    
    if(!avatar){
      throw new ApiError(400,"Avatar is must required field"); 
    }

    const user = await User.create({
      fullName,
      avatar : avatar.url,
      coverImage : coverImage.url || "",
      password,
      email,
      username: username.toLowerCase()

    })

    const usercreated = await User.findById(user._id).select("-password -refreshToken");


    if(!usercreated){
      throw new ApiError(500,"Something went wrong during user creation")
    }

    return res.status(201).json(
      new ApiResponse(200,usercreated,"Successfully Registered User")
    )
})

const loginuser = asyncHandler(async (req,res) => {

  const { email,password,username } = req.body

  if(!(email || username)){
    throw new ApiError(400,"Please enter an email address or username");
  }

  const user = await User.findOne({
    $or : [{email},{username}]
})

  if(!user){
    throw new ApiError(404,"User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid password");
  }
   
  const {accessToken, refreshToken} = await generateAccessRefreshToken(user._id)

  const loggedinUser = await User.findById(user._id).select("-password -refreshToken");

  const Option = {
      httpOnly: true,
      secure : true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, Option)
  .cookie("refreshToken", refreshToken, Option)
  .json( 
    new ApiResponse(
      200,{
        user : loggedinUser,accessToken,refreshToken
      },
      "User Successfully logged In."
    )
  )



})

const logoutuser = asyncHandler(async (req, res) =>{
        await User.findByIdAndUpdate(req.user._id,{
            $unset : {
              refreshToken : 1
            }
        },
          {
            new : true,
          })
        
    const Option = {
      httpOnly: true,
      secure : true
    }
  
    return res
          .status(200)
          .clearCookie("accessToken", Option)
          .clearCookie("refreshToken", Option)
          .json(new ApiResponse(200,{},"User Logged Out" ))
})

const refreshAccessToken = asyncHandler(async (req, res) =>{

   try {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingToken) {
      throw new ApiError(401,"Unauthoruthorized request ....");
    }

    const decodedRefreshToken = jwt.verify(incomingToken,process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedRefreshToken?._id)
    
    if(!user){
      throw new ApiError(401,"Invalid refreshtoken")
    }
    if( incomingToken!== user?.refreshToken){
      throw new ApiError(401,"refreshtoken is expired or used");
    }

    const option = {
      httpOnly : true,
      secure : true
    }

    const {newRefreshToken,accessToken} = await generateAccessRefreshToken(user._id)
    return res
          .status(200)
          .cookie("accessToken",accessToken, option)
          .cookie("refreshToken", newRefreshToken, option)
          .json(new ApiResponse(
            200,
            {accessToken,refreshToken: newRefreshToken},
            "Access token is refreshed"
    ))
  }catch(error){
      throw new ApiError(401,error?.message || "Invalid refreshtoken")
  }

})

const changeuserpassword = asyncHandler(async(req,res) => {

   const { oldPassword , newPassword } = req.body;

    // console.log(oldPassword + " " + newPassword);

   const user = await User.findById(req.user?._id);
   const isoldPassword = user.isPasswordCorrect(oldPassword)

   if(!isoldPassword){
        throw new  ApiError('400',"Invalid Password...")       
   }

   user.password = newPassword;
   await user.save({validateBeforeSave : false})

   return res
          .status(200)
          .json(new ApiResponse(200,{},"Password changed successfully" ) )

})

const GetcurrentUser = asyncHandler(async(req,res) => {
  return res
          .status(200)
          .json(new ApiResponse (200,req.user,"Current user Fetched..."))
});

const UpdateDetail = asyncHandler(async(req,res) =>{

  const { email , fullName , username    } = req.body;

  if( !email || !fullName || !username ){
    throw new ApiError('400',"This Fields are required")
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set : {
        fullName,
        email : email,
        username,
    }},
    {
      new : true
    }
  ).select("-password")

  return res
        .status(200)
        .json(new ApiResponse (200,user, "Datail is updated"));
})

 const UpdateAvatar = asyncHandler(async(req,res) =>{

  const avatarlocalpath = req.file?.path

  if(!avatarlocalpath){
    throw new ApiError(400,"Avataar is required for update") 
  }
  
  const avatar = await uploadCloudinary(avatarlocalpath)

  if(!avatar.url){
    throw new ApiError(400,"error while uploading avatar")
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
      { 
        $set : {
          avatar : avatar.url
        }
      },
      {new : true}
 ).select("-password")

 return res
        .status(200)
        .json(new ApiResponse (200,user,"Avatar image is updated"))
});

const UpdateCoverImg = asyncHandler(async(req,res) =>{

  const CoverImglocalpath = req.file?.path

  if(!CoverImglocalpath){
    throw new ApiError(400,"Cover Imagee is required for update") 
  }
  
  const coverImage = await uploadCloudinary(CoverImglocalpath)

  if(!coverImage.url){
    throw new ApiError(400,"error while uploading Cover Image")
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
      { 
        $set : {
          coverImage : coverImage.url
        }
      },
      {new : true}
 ).select("-password")

 return res
        .status(200)
        .json(new ApiResponse (200,user,"Cover Image image is updated"))
});

const getUserchannel = asyncHandler(async (req, res) => {
      const {username} = req.params

      if(!(username?.trim())){
            throw new ApiError(400,"username is missing")
      }

      const channel = await User.aggregate([
        {
          $match:{
              username: username?.toLowerCase()
          }
        },
          {
            $lookup: {
            from : "Subcription",
            localField : "_id",
            foreignField : "channel",
            as : "subscribers"
          }
        },
          {
            $lookup: {
            from : "Subcription",
            localField : "_id",
            foreignField : "subscriber",
            as : "subscribeto"
          }
        },
        {
          $addFields:{
            subscribersCount :{
              $size : "$subscribers"
            },
            ChannelsubscribetoCount :{
              $size : "$subscribeto"
            },
            isSubscribed :{
              $cond : {
                if :{ $in : [req.user?._id, "$subscribers.subscribers"]},
                then : true,
                else : false
              }
            }        
         }
      },
        {
        $project :{
          fullName:1,
          username:1,
          avatar:1,
          coverImage:1,
          email:1,
          subscribersCount:1,
          isSubscribed:1,
          ChannelsubscribetoCount:1
        }
      }
      ])
    if(!channel?.length){
      throw new ApiError(400,"channel does not exist")

    }

    return res
            .status(200)
            .json( new ApiResponse(200, channel[0],"channel fetched successfully"))

});

const getWatchHistory = asyncHandler(async(req,res) => {

  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup :{
        from :"Video",
        localField : "watchHistory",
        foreignField : "_id",
        as : "watchHistory",
        pipeline : [{

          $lookup : {
            from : "user",
            localField : "owner",
            foreignField : "_id",
            as : "owner",
            pipeline :[{
              $project : {
                fullName: 1,
                username: 1,
                avatar: 1
              }
            }
          ]
        }
       },
       {
        $addFields : {
          owner : {
            $first : "$owner",
          }
        }
       }
      ]
     }
    }
  ])

  return res
          .status(200)
          .json(new ApiResponse(200,user[0],"watch History fetch successfully"))
          
})


  export{ registerUser, 
     loginuser,
     logoutuser ,
     refreshAccessToken ,
     changeuserpassword ,
     UpdateDetail,
     GetcurrentUser,
     UpdateAvatar,
     UpdateCoverImg,
     getUserchannel,
     getWatchHistory };
  