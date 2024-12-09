
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/Database.js";

dotenv.config({
    path : './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port  ${process.env.PORT}`)
    })
})
.catch((e)=>{
    console.log("conection error with Database",e);
}) 