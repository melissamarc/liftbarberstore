const cloudinary = require("../config/cloudinary");

async function uploadToCloudinary(filePath, folder) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}

module.exports = uploadToCloudinary;