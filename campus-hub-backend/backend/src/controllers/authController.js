const User = require('../models/User');
const { signToken, sanitizeUser } = require('../services/authService');
const { sendWelcomeNotification } = require('../services/notificationService');

async function register(req, res, next) {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'fullName, email, and password are required' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const user = await User.create({ fullName, email, password, role });
    await sendWelcomeNotification(user);

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await User.verifyPassword(user, password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  me
};
