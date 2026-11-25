import cloudinary from "../config/cloudinary";

export async function deleteCloudinaryImages(publicIds:string[]){

    await Promise.allSettled(publicIds.map((a)=> cloudinary.uploader.destroy(a)))
}