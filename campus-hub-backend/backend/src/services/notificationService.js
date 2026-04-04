const Notification = require('../models/Notification');

async function sendWelcomeNotification(user) {
  return Notification.create({
    userId: user.id,
    title: 'Welcome to Campus Hub',
    message: `Hi ${user.fullName || user.full_name || 'there'}, your account is ready.`,
    type: 'success',
    metadata: { source: 'auth' }
  });
}

async function sendCampusUpdateNotification(userId, campusName) {
  return Notification.create({
    userId,
    title: 'Campus Updated',
    message: `${campusName} has new updates.`,
    type: 'info',
    metadata: { source: 'campus' }
  });
}

module.exports = {
  sendWelcomeNotification,
  sendCampusUpdateNotification
};
