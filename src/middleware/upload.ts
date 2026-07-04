// import multer from "multer"
// import { CloudinaryStorage } from "multer-storage-cloudinary"

// import cloudinary from "../config/cloudinary"

// const storage = new CloudinaryStorage({
//     cloudinary,
//     params:async(req,file)=>{
//         folder: "motocline/services"
//         allowed_formats: ["jpg", "jpeg", "png", "webp"]
//         public_id:`service_${Date.now()}`
//     }
// })
// export const upload = multer({ storage })

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "motocline/services",   
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: `service_${Date.now()}`, 
  }),
});

export const upload = multer({ storage });