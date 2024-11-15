import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
    cloud_name: process.env.C_NAME,
    api_key: process.env.C_KEY,
    api_secret: process.env.C_SECRETKEY
  });
  
export default cloudinary;
