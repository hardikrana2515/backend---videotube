import { Router } from "express";
import  {   registerUser,
            loginuser, 
            logoutuser,
            refreshAccessToken,
            changeuserpassword ,
            UpdateDetail,
            GetcurrentUser,
            UpdateAvatar,
            UpdateCoverImg,
            getUserchannel,
            getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyjwt } from "../middleware/auth.middleware.js";


const  router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1 
        },
        {
            name: 'coverImage',
            maxCount: 1 
        }
    ]),
    registerUser
);

router.route('/login').post(loginuser)

router.route('/logout').post(verifyjwt,logoutuser)

router.route('/refresh-Token').post(refreshAccessToken)

router.route('/change-Password').post(verifyjwt,changeuserpassword);

router.route('/current-user').get(verifyjwt,GetcurrentUser);

router.route('/Upadate-Detail').patch(verifyjwt,UpdateDetail);

router.route('/Upadate-Avatar-Img').patch(verifyjwt,upload.single("avatar"),UpdateAvatar)

router.route('/Update-Cover-Img').patch(verifyjwt,upload.single("coverImage"),UpdateCoverImg)

router.route('/Channel/:username').get(verifyjwt,getUserchannel)

router.route('/watchHistory').get(verifyjwt,getWatchHistory)



export default router;