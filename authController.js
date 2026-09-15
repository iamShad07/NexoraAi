const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

const register = async (req, res) => {
  try {
    const { name, emailOrPhone, password, confirmPassword } = req.body;

    if (!name || !emailOrPhone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const isEmail = emailOrPhone.includes('@');
    const email = isEmail ? emailOrPhone.toLowerCase().trim() : null;
    const phone = !isEmail ? emailOrPhone.trim() : null;

    // Check existing user
    let existingUser = null;
    if (email) {
      existingUser = User.findOne({ email });
    } else if (phone) {
      existingUser = User.findOne({ phone });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email or phone number already exists. Please log in.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = User.create({
      name: name.trim(),
      email: email || '',
      phone: phone || '',
      password: passwordHash,
      role: 'USER',
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    });

    // Create JWT
    const token = jwt.sign(
      { id: newUser._id || newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logActivity(newUser._id, 'REGISTER', 'SUCCESS', { email: newUser.email, phone: newUser.phone }, req.ip);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to Nexora AI!',
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ success: false, message: 'Please enter your email or phone and password.' });
    }

    const isEmail = emailOrPhone.includes('@');
    const query = isEmail ? { email: emailOrPhone.toLowerCase().trim() } : { phone: emailOrPhone.trim() };

    const user = User.findOne(query);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check and try again.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact Nexora AI support.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logActivity(user._id, 'LOGIN', 'FAILED', { reason: 'Incorrect password' }, req.ip);
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check and try again.' });
    }

    const token = jwt.sign(
      { id: user._id || user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logActivity(user._id, 'LOGIN', 'SUCCESS', {}, req.ip);

    return res.json({
      success: true,
      message: 'Welcome to Nexora AI',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

const forgotPassword = async (req, res) => {
  const { emailOrPhone } = req.body;
  if (!emailOrPhone) {
    return res.status(400).json({ success: false, message: 'Email or phone is required.' });
  }

  const isEmail = emailOrPhone.includes('@');
  const query = isEmail ? { email: emailOrPhone.toLowerCase().trim() } : { phone: emailOrPhone.trim() };
  const user = User.findOne(query);

  if (!user) {
    // Return friendly message without leaking user existence
    return res.json({
      success: true,
      message: 'If an account exists with that identifier, password reset instructions have been generated.'
    });
  }

  const resetToken = jwt.sign({ id: user._id, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
  return res.json({
    success: true,
    message: 'Password reset link simulated for development/preview mode.',
    resetToken
  });
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Valid token and minimum 6 character password required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset token type.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    User.findByIdAndUpdate(decoded.id, { password: passwordHash });

    return res.json({ success: true, message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
};
