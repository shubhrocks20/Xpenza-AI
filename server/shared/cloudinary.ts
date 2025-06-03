import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_URL } from '../config';



cloudinary.config({
  cloudinary_url: CLOUDINARY_URL,
});


export const uploadOnCloudinary = async (fileBuffer : any) => {
    try {
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error("No file buffer provided");
      }
  
      
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "auto" }, (error, result) => {
            if (error) {
              reject(error);
            } else {
            if(result)
              resolve(result.url);
            }
          })
          .end(fileBuffer);
      });
    } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
      throw error;
    }
  };
 