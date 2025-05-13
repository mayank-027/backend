const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide your phone number'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
  },
  profilePic: {
    type: String,
    default: "",
  },
  studentId: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    unique: true,
    sparse: true,
  },
  course: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 