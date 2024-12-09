import { ApiResponse } from '../utils/Apiresponse.js';
import { ApiError } from '../utils/ApiError.js';
import {asyncHandler} from '../utils/asynchandler.js';
import { Playlist } from '../models/playlist.model.js';
import { Video } from '../models/video.model.js';
import { response } from 'express';


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name){
        throw new ApiError(400,"Name of Playlist must be Required...");
    }

    const playlist = new Playlist({
        name,
        description,
        videos : [],
        owner : req.user?._id,
        ownerName : req.user?.username
    })

    playlist.save();

    return res
            .status(200)
            .json(new ApiResponse (200, playlist, "success to creat playlist..."))
    

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!userId){
        throw new ApiError(400, "Please enter a userID...");
    }

   const playlists = await Playlist.find({ owner : userId })

   if(playlists.length == 0){
    throw new ApiError(404, "not playlists found...");
   }

    return res
            .status(200)
            .json(new ApiResponse(200, playlists , "Successfully Fetch Playlists..."))
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!playlistId){
        throw new ApiError(400,"Please enter a playlistId...")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found.");
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist , "Successfully fetched playlist"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if( !playlistId || !videoId){
        throw new ApiError(400,"videoId and playlistId are required...")
    }

    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "video not found")
    }
    if(playlist.videos.includes(videoId)){
        throw new ApiError(400,"Video is already in playlist...")
    }

    playlist.videos.push(videoId)

    await playlist.save()

    return res
            .status(200)
            .json(new ApiResponse(200,playlist,"successfully add video to playlist..."))
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if( !playlistId || !videoId){
        throw new ApiError(400,"videoId and playlistId are required...")
    }

    const playlist = await Playlist.findById(playlistId)

    if(playlist.videos.includes(videoId)){
       playlist.videos.remove(videoId)
    }
    else {
        throw new ApiError(400,"Video not in playlist or already removed...") 
    }

    await playlist.save()
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"successfully removed video to playlist..."))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!playlistId){
        throw new ApiError(400, " playlistID is required") 
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId,
                                             { deleted: true },
                                             { new: true })


    if(!playlist){
        throw new ApiError(404, " playlist not found") 
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"successfully delete playlist..."))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $set : {
                  ...(name && { name}),
                  ...(description && { description})
             }
        },
        { new : true});

        if (!playlist) {
            throw new ApiError(404, "Playlist not found.");
        }
    
    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Playlist Detail updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}