import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors(
    {
        origin : process.env.CORS_ORIGIN,
        credentials :true
    }
));

app.use(express.json({limit : "10mb" }));
app.use(express.urlencoded({extended : true , limit : "10mb"}));
app.use(express.static("public"))
app.use(cookieParser());



import UserRouter from './routes/user.routes.js';
import VideoRouter from './routes/video.route.js';
import PlaylistRouter  from './routes/playlist.routes.js';
app.use("/api/v1/users",UserRouter)
app.use("/api/v1/videos",VideoRouter);
app.use("/api/v1/playlists",PlaylistRouter);

export {app}
