const express = require('express');
const router = express.Router();
const departmentAuth = require('../middleware/departmentAuth');
const { getDepartmentGrievances, getAllDepartments } = require('../controllers/departmentController');

// Get grievances for the logged-in department
router.get('/grievances', departmentAuth, getDepartmentGrievances);

// Get all departments for admin use
router.get('/departments', getAllDepartments);

module.exports = router; 