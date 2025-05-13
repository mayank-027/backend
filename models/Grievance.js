const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema({
  grievanceNumber: {
    type: String,
    unique: true,
  },

  title: {
    type: String,
    required: [true, "Please provide a title for your grievance"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description of your grievance"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Please select a category"],
    enum: ["Academic", "Administration", "Infrastructure", "Hostel", "General"],
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved", "Rejected"],
    default: "Pending",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  attachments: [
    {
      type: String, // Simple string for URL
    },
  ],
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      text: {
        type: String,
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
});

// Update the updatedAt timestamp before saving
grievanceSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();

  // Generate grievanceNumber if not already set
  if (!this.grievanceNumber) {
    // Example format: GRV-20240513-XXXX (date + random 4-digit code)
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    this.grievanceNumber = `GRV-${datePart}-${randomPart}`;
  }

  next();
});

module.exports = mongoose.model("Grievance", grievanceSchema);
