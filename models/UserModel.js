const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  underManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User',allow: '', default: null,optional: true },
  userType: { type: String, default: 'User' }, // Admin, Manager, User
  token:    { type: String, default: '' },
  team:     { type: String }, // optional: team id/name
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
