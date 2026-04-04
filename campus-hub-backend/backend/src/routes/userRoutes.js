const express = require('express');
const multer = require('multer');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  listNotifications,
  markNotificationRead
} = require('../controllers/userController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);
router.get('/notifications', authMiddleware, listNotifications);
router.patch('/notifications/:id/read', authMiddleware, markNotificationRead);

module.exports = router;
