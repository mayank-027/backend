const Grievance = require('../models/Grievance');

// @desc    Get grievances for the logged-in department
// @route   GET /api/department/grievances
// @access  Private (department)
exports.getDepartmentGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({ department: req.user._id })
      .populate('submittedBy', 'name email studentId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: grievances });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching grievances' });
  }
};

// @desc    Get all departments
// @route   GET /api/department/departments
// @access  Public (or protect as needed)
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await require('../models/Department').find({}, 'name _id departmentId');
    res.json({ success: true, data: departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 