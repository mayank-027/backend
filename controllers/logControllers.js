// controllers/LogController.js
const ChatLog = require("../models/ChatLog");

// @desc Create a new chat log
exports.createLog = async (req, res) => {
  try {
    const { message, reply } = req.body;
    const user_id = req.user._id;
    const log = await ChatLog.create({ user_id, message, reply });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: "Failed to create log" });
  }
};

// @desc Get all logs for the user
exports.getLogs = async (req, res) => {
  const user_id = req.user._id;

  try {
    const logs = await ChatLog.find({ user_id }).sort({ timestamp: 1 }); // 👈 ascending order
    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

// @desc Update a specific log
exports.updateLog = async (req, res) => {
  try {
    const updatedLog = await ChatLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedLog);
  } catch (err) {
    res.status(500).json({ error: "Failed to update log" });
  }
};

// @desc Delete a specific log
exports.deleteLog = async (req, res) => {
  try {
    await ChatLog.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete log" });
  }
};

// @desc Delete all logs for the current user
exports.deleteAllLogs = async (req, res) => {
  const user_id = req.user._id;
  try {
    const result = await ChatLog.deleteMany({ user_id });
    res.status(200).json({
      message: "All chat logs deleted successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Error deleting chat logs:", err);
    res.status(500).json({ error: "Failed to delete chat logs." });
  }
};
