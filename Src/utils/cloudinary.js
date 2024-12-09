import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET
    });

    
const uploadCloudinary = async (localFilepath) => {
    try{
        if(!localFilepath) return null;


        const response = await cloudinary.uploader.upload(
            localFilepath,{
                 resource_type : "auto"
            })
        console.log("file is uploaded successfully",response.url);

       if (fs.existsSync(localFilepath)) {
        fs.unlinkSync(localFilepath);
    }

    return response;
       

    }catch(e){
        console.error("Cloudinary upload failed:", e)
        if (fs.existsSync(localFilepath)) {
            fs.unlinkSync(localFilepath);
        }
        return null;
    }
}

export {uploadCloudinary} 