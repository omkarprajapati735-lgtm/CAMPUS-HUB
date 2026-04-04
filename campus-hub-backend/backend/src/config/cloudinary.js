const cloudinary = require('cloudinary').v2;
const env = require('./env');

if (env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true
  });
} else {
  console.warn('[cloudinary] Cloudinary credentials are missing. Uploads will be disabled.');
}

module.exports = cloudinary;
