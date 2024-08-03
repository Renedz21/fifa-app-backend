import { v2 as cloudinary } from "cloudinary";
import { envs } from "../constants/environment";

cloudinary.config({
  cloud_name: envs.CLOUDINARY_CLOUD_NAME,
  api_key: envs.CLOUDINARY_API_KEY,
  api_secret: envs.CLOUDINARY_API_SECRET,
});

const uploadImage = async (folder: string, file: any) => {
  const photoUrl = await cloudinary.uploader.upload(file, {
    folder: folder,
  });

  return photoUrl.url;
};

export default uploadImage;
