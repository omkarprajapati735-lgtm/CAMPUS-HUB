const User = require('../models/User');
const Notification = require('../models/Notification');
const { sanitizeUser } = require('../services/authService');
const { uploadImage } = require('../services/fileService');

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updates = {
      fullName: req.body.fullName,
      role: req.body.role
    };

    if (req.file?.path) {
      const upload = await uploadImage(req.file.path, 'campus-hub/avatars');
      updates.avatarUrl = upload.secure_url;
    }

    const user = await User.update(req.user.id, updates);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      message: 'Profile updated',
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

async function listNotifications(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const notifications = await Notification.listByUser(req.user.id, { limit, offset });
    return res.json({ notifications });
  } catch (error) {
    return next(error);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.markRead(req.params.id, req.user.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    return res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  listNotifications,
  markNotificationRead
};
