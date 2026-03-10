const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "real_estate_media",
    resource_type: "auto", // Important: allows both images and videos
    // allowed_formats: ["jpg", "png", "jpeg", "mp4", "mov", "webm"],
  },
});

module.exports = { cloudinary, storage };
