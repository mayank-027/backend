const Grievance = require("../models/Grievance");
const Department = require("../models/Department");

const categoryToDepartment = {
  Academic: "ACAD001",
  Administration: "ADMIN001",
  Infrastructure: "INFRA001",
  Hostel: "HOSTEL001",
  General: "GEN001",
};

exports.createGrievance = async (req, res) => {
  try {
    const { title, description, category, priority, photo } = req.body;

    if (!title || !description || !category || !priority) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: title, description, category, and priority.",
      });
    }

    const attachments = photo ? [photo] : [];

    // Find department by category
    const departmentId = categoryToDepartment[category];
    let department = null;
    if (departmentId) {
      department = await Department.findOne({ departmentId });
    }

    // ✅ Check if grievance already exists for this user with same title
    let existingGrievance = await Grievance.findOne({
      submittedBy: req.user.id,
      title: { $regex: new RegExp("^" + title + "$", "i") },
    });

    if (existingGrievance) {
      // 🔁 Update the existing grievance
      existingGrievance.description = description;
      existingGrievance.category = category;
      existingGrievance.priority = priority;
      existingGrievance.attachments = attachments;
      existingGrievance.department = department ? department._id : undefined;

      await existingGrievance.save();

      // Send SMS to user after grievance is created
    try {
      const user = await User.findById(req.user.id);
      if (user && user.phoneNumber) {
        await sendSMS(
          `+91${user.phoneNumber}`,
          `Dear ${user.name}, your grievance "${grievance.title}" has been registered successfully!`
        );
      }
    } catch (smsError) {
      console.error('Failed to send SMS:', smsError);
      // Do not throw, just log the error
    }

      return res.status(200).json({
        success: true,
        message: "Grievance updated successfully.",
        data: existingGrievance,
      });
    }

    // ➕ Create a new grievance if not found
    const newGrievance = new Grievance({
      title,
      description,
      category,
      priority,
      submittedBy: req.user.id,
      attachments,
      department: department ? department._id : undefined,
    });

    await newGrievance.save();

    return res.status(201).json({
      success: true,
      message: "Grievance created successfully.",
      data: newGrievance,
    });
  } catch (err) {
    console.error("Grievance creation error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get all grievances
// @route   GET /api/grievances
// @access  Private
exports.getGrievances = async (req, res) => {
  try {
    let query =
      req.user.role !== "admin"
        ? Grievance.find({ submittedBy: req.user.id })
        : Grievance.find();

    if (req.query.status) query = query.find({ status: req.query.status });
    if (req.query.category)
      query = query.find({ category: req.query.category });
    if (req.query.priority)
      query = query.find({ priority: req.query.priority });
    query = req.query.sort
      ? query.sort(req.query.sort.split(",").join(" "))
      : query.sort("-createdAt");

    const grievances = await query
      .populate("submittedBy", "name email studentId department")
      .populate("assignedTo", "name email");

    res.status(200).json({
      success: true,
      count: grievances.length,
      data: grievances,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single grievance
// @route   GET /api/grievances/:id
// @access  Private
exports.getGrievance = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate("submittedBy", "name email studentId department")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name email role");

    if (!grievance)
      return res
        .status(404)
        .json({ success: false, message: "Grievance not found" });

    if (
      req.user.role !== "admin" &&
      grievance.submittedBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this grievance",
      });
    }

    res.status(200).json({ success: true, data: grievance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/grievances/g/:grievanceNumber
exports.getByGravienceNumber = async (req, res) => {
  try {
    const grievance = await Grievance.findOne({
      grievanceNumber: req.params.grievanceNumber,
    })
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email");

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    res.json(grievance);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/grievances/name/:title
exports.getByGravienceTitle = async (req, res) => {
  try {
    const grievance = await Grievance.findOne({
      title: req.params.title,
    })
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email");

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    res.json(grievance);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Update grievance
// @route   PUT /api/grievances/:id
// @access  Private
exports.updateGrievance = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance)
      return res
        .status(404)
        .json({ success: false, message: "Grievance not found" });

    // Check permission: only admin or the user who submitted can update
    if (
      req.user.role !== "admin" &&
      grievance.submittedBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this grievance",
      });
    }

    // Admin can reject (delete)
    if (req.user.role === "admin" && req.body.status === "Rejected") {
      await Grievance.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        success: true,
        message: "Grievance rejected and deleted.",
      });
    }

    // Admin can update status directly
    if (req.user.role === "admin" && req.body.status) {
      grievance.status = req.body.status;
    }

    // Non-admin or editable fields
    if (req.user.role !== "admin") {
      const { title, description, category, priority, photo } = req.body;

      if (title) grievance.title = title;
      if (description) grievance.description = description;
      if (category) grievance.category = category;
      if (priority) grievance.priority = priority;

      // Update department if category is changed
      if (category && categoryToDepartment[category]) {
        const department = await Department.findOne({
          departmentId: categoryToDepartment[category],
        });
        if (department) grievance.department = department._id;
      }

      // Handle photo/attachment (overwrite or push based on your logic)
      if (photo) {
        grievance.attachments.push(photo);
      }
    }

    await grievance.save();

    res.status(200).json({ success: true, data: grievance });
  } catch (err) {
    console.error("Update grievance error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
};

// @desc    Delete grievance
// @route   DELETE /api/grievances/:id
exports.deleteGrievance = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res
        .status(404)
        .json({ success: false, message: "Grievance not found" });
    }

    // Only admin or the user who submitted it can delete
    if (
      req.user.role !== "admin" &&
      grievance.submittedBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this grievance",
      });
    }

    await Grievance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Grievance deleted successfully",
    });
  } catch (err) {
    console.error("Delete grievance error:", err);
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};

// @desc    Add comment to grievance
// @route   POST /api/grievances/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance)
      return res
        .status(404)
        .json({ success: false, message: "Grievance not found" });

    if (
      req.user.role !== "admin" &&
      grievance.submittedBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to comment" });
    }

    grievance.comments.push({ text: req.body.text, user: req.user.id });
    await grievance.save();

    res.status(200).json({ success: true, data: grievance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
