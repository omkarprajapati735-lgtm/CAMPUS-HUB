const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    fullName: user.full_name || user.fullName,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatar_url || user.avatarUrl,
    createdAt: user.created_at || user.createdAt,
    updatedAt: user.updated_at || user.updatedAt
  };
}

module.exports = {
  signToken,
  sanitizeUser
};
