import { Video } from '../models/video.model.js';
import { asyncHandler } from '../utils/asynchandler.js';
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/Apiresponse.js"
import {uploadCloudinary}  from "../utils/cloudinary.js"
import { isValidObjectId } from 'mongoose';

const getallVideos = asyncHandler(async (req,res) => {

    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const user = await User.findById(req.user?._id)

    const filter = {}


        if(query){
         filter.$or =[{
            title:{$regex: query, $options: 'i'},
            description:{$regex: query, $options: 'i'},
            username : {$regex : query, $options: 'i'}
            }]}
        // }else
        // {
        //     throw new ApiError('400',"this field is required ...")
        // }

        if(userId && isValidObjectId(userId)) { 
            filter.userId = userId
        }
        // }else{
        //     throw new ApiError('400',"this field is required !!")
        // }

        const sortOptions = { [sortBy]: sortType === 'desc' ? -1 : 1 };
        
        const video = await Video.find(filter).sort(sortOptions)
        const totalVideos = await Video.countDocuments(filter);

        return res
                .status(200)
                .json(new ApiResponse(200,video, "Videos fetched successfully"))
    
})

const CreateVideo = asyncHandler(async (req, res) => {
    // console.log(req.body)
    const { title,description } = req.body;

    if(!title || !description){
        throw new ApiError('400'," Title and Discription must be required..")
    }

    const thumbnailLocalpath = req.files?.thumbnail[0]?.path;
    let thumbnailurl = "";
    if( thumbnailLocalpath){
        try{
        thumbnailurl = await uploadCloudinary(thumbnailLocalpath);
        }catch(error){
            throw new ApiError('500',"Upload Failed  because of some issue...")
        }
    }
    console.log(thumbnailurl.url)
    const Vidlocalpath = req.files?.videoFile[0]?.path;

    if( !Vidlocalpath  )
    {
        throw new ApiError('400'," Video File Must be Required...")
    }
    
    let videourl;
        try{
        videourl = await uploadCloudinary(Vidlocalpath);
        }catch(error){
            throw new ApiError('500',"Upload Failed  because of some issue...")
        }
        console.log(videourl.url)
    
  
    const video = new Video ({
        title,
        description,
        videoFile : videourl.url ,
        thumbnail : thumbnailurl.url || "" ,
        userid : req.user._id
    })
    await video.save();
    return res
            .status(200)
            .json(new ApiResponse(200,video,"Video uploded successfully..."))

});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set : {
                  ...(title && { title}),
                  ...(description && { description})
             }
        },
        { new : true});

        if (!video) {
            throw new ApiError(404, "Video not found.");
        }
    
    return res
            .status(200)
            .json(new ApiResponse(200, video, "Video Detail updated successfully"))
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findByIdAndDelete(videoId)

    if(!video)
    {
        throw new ApiError(404, "Video not found")
    }
  return  res
    .status(200)
    .json(new ApiResponse(200, video, "Video Detail deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)
    if(!video)
        {
            throw new ApiError(404, "Video not found")
        }
        video.isPublished = !video.isPublished

        video.save()

 return res
            .status(200)
            .json(new ApiResponse(200,video,"Video's published status is changed"))

})
export { getallVideos,
         CreateVideo,
         updateVideo,
         deleteVideo,
         togglePublishStatus
 }