import { Router } from "express";
import {verifyjwt} from "../middleware/auth.middleware.js"
import { upload } from "../middleware/multer.middleware.js";
import { getallVideos,
         CreateVideo,
         updateVideo,
         deleteVideo,
         togglePublishStatus
 } from "../controllers/video.controller.js";

const router = Router();

router.use(verifyjwt); 

router.route('/').get(getallVideos)
router.route('/createVideo').post(upload.fields([{ name: "videoFile" }, { name: "thumbnail" }]),CreateVideo)
router.route('/updatevideodetail/:videoId').patch(updateVideo)
router.route('/deleteVideo/:videoId').patch(deleteVideo)
router.route('/changevideostatus/:videoId').patch(togglePublishStatus)

export default router;