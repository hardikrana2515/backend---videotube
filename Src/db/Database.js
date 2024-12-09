import mongoose from "mongoose";
import {Db_Name} from "../constant.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${Db_Name}`)
        console.log(`Connected At DB Host : ${connectionInstance.connection.host}`);
    }
    catch (e) {
        console.log("Connection Error With Database",e);
        process.exit(1);
        } 
}

export default connectDB