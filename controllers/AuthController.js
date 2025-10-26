const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { add } = require('../utils/jwtBlackListed');
const nodemailer = require('nodemailer');
const Joi = require('joi');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



const signup = async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required().trim(),
    email: Joi.string()
      .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
      .required()
      .trim(),
    password: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .trim()
      .messages({
        'string.pattern.base': 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
        'string.empty': 'Password is required'
      }),
    userType: Joi.string().valid('admin', 'manager', 'user').default('user'),
    underManager: Joi.string().hex().length(24).required().trim(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { username, email, password, userType, underManager } = value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email' });

  if (password.length < 8) return res.status(400).json({ message: 'Password must be 8+ chars' });

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) return res.status(409).json({ message: 'User exists name and eamil must different' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hashed, userType: userType || 'user', underManager: underManager || null });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Account created',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #333; text-align: center;">Account Notification</h2>
      
      <p style="font-size: 16px; color: #555;">Hello <strong>${username}</strong>,</p>
      
      <p style="font-size: 16px; color: #555;">
        Your account has been <strong style="color: green;">successfully registered</strong> on our platform. 
        Welcome aboard!
      </p>

      <p style="font-size: 16px; color: #555;">
        Or, if you were trying to log in, your login was <strong style="color: green;">successful</strong>.
      </p>

      <div style="text-align: center; margin: 20px 0;">
        <a href=${process.env.FRONTEND_URL} style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Login</a>
      </div>

      <p style="font-size: 14px; color: #999; text-align: center;">
        If you did not perform this action, please contact our support immediately.
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">
        © 2025 TaskManagement. All rights reserved.
      </p>
    </div>`

  };
  transporter.sendMail(mailOptions);
  res.status(201).json({ id: user._id, username: user.username, email: user.email });
};

const login = async (req, res) => {
  const schema = Joi.object({
    identifier: Joi.string()
      .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
      .required()
      .trim(),
    password: Joi.string().required().trim(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { identifier, password } = value;
  const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
  if (!user) return res.status(401).json({ message: 'Invalid email' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid password' });

  const payload = { id: user._id, userType: user.userType, email: user.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
  user.token = token;
  user.save();
  const mailOption = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Login Notification',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #333; text-align: center;">Login Notification</h2>
      
      <p style="font-size: 16px; color: #555;">Hello <strong>${user.username}</strong>,</p>
      
      <p style="font-size: 16px; color: #555;">
        Your login was <strong style="color: green;">successful</strong> on our platform. 
        Welcome aboard!
      </p>

      <div style="text-align: center; margin: 20px 0;">
        <a href=${process.env.FRONTEND_URL} style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
      </div>

      <p style="font-size: 14px; color: #999; text-align: center;">
        If you did not perform this action, please contact our support immediately.
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">
        © 2025 TaskManagement. All rights reserved.
      </p>
    </div>`
  }
  transporter.sendMail(mailOption);
  return res.status(200).json({ status: '200', data: user });
};

const logout = async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.split(' ')[1];
  if (token) add(token);
  res.json({ message: 'Logged out' });
};

const profile = async (req, res) => {
  const user = req.user;
  res.json({
    id: user._id, username: user.username, email: user.email, userType: user.userType, team: user.team
  });
};

const allusers = async (req, res) => {
  const users = await User.find({ userType: 'user' });
  res.json(users);
};
const getManagerUsers = async (req, res) => {
  const users = await User.find({ userType: 'user', underManager: req.user._id });
  res.json(users);
};
const allmanagers = async (req, res) => {
  const users = await User.find({ userType: 'manager' });
  res.json(users);
};

module.exports = { signup, login, logout, profile, allusers, allmanagers, getManagerUsers };
