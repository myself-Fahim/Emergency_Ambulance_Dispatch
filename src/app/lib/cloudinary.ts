import { v2 as Cloudinary } from "cloudinary";
import config from "../config";

Cloudinary.config({
	cloud_name: config.cloudinary_user,
	api_key: config.cloudinary_key,
	api_secret: config.cloudinary_secret,
});

export const cloudinary = Cloudinary;
