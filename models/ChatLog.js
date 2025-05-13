// models/ChatLog.js
const mongoose = require("mongoose");

const chatLogSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  message: { type: String, required: true },
  reply: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ChatLog", chatLogSchema);
