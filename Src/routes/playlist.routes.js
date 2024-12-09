import { Router } from "express";

import { 
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist} from "../controllers/playlist.controller.js"

import { upload } from "../middleware/multer.middleware.js";
import { verifyjwt } from "../middleware/auth.middleware.js";


const  router = Router();

router.use(verifyjwt);

router.route('/creatplaylist').post( createPlaylist )
router.route('/userplaylistslist/:userId').get(getUserPlaylists)
router.route('/getPlaylists/:playlistId').get(getPlaylistById)
router.route('/AddvideoinPlaylist/:playlistId/add-video/:videoId').patch(addVideoToPlaylist)
router.route('/RemovevideofromPlaylist/:playlistId/add-video/:videoId').patch(removeVideoFromPlaylist)
router.route('/deletePlaylist/:playlistId').patch(deletePlaylist)
router.route('/updatplaylistdetail/:playlistId').patch(updatePlaylist)

export default router