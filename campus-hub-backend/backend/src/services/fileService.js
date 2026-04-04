const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

async function uploadImage(filePath, folder = 'campus-hub') {
  if (!filePath) {
    throw new Error('filePath is required');
  }

  if (!cloudinary.config().cloud_name) {
    // Fallback for local/dev; use a file:// style URL so the rest of the app can continue.
    return {
      secure_url: `file://${path.resolve(filePath)}`
    };
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image'
  });

  return result;
}

async function removeLocalFile(filePath) {
  if (!filePath) return;
  await fs.promises.unlink(filePath).catch(() => {});
}

module.exports = {
  uploadImage,
  removeLocalFile
};
