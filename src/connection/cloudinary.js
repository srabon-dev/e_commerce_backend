const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
const uploadImageToCloudinary = async (fileBuffer, public_id = null) => {
  return new Promise((resolve, reject) => {
    let uploadOptions = { resource_type: "auto" }; // Auto-detect the resource type (image, video, etc.)
    if (public_id) {
      // If public_id is provided, overwrite the existing image
      uploadOptions = { ...uploadOptions, public_id, overwrite: true };
    }

    cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error("Cloudinary upload failed:", error);
        reject(new Error("Failed to upload image"));
      } else {
        resolve(result); // Resolve the result when upload is successful
      }
    }).end(fileBuffer);
  });
};

module.exports = { uploadImageToCloudinary };
