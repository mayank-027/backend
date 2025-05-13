const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Department = require('../models/Department');

exports.protect = async (req, res, next) => {
  try {
    let token;
    console.log("token: ", req.headers.authorization);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user = await User.findById(decoded.id);
      if (!user) {
        user = await Department.findById(decoded.id);
      }
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route',
        });
      }
      req.user = user;
      req.user.role = decoded.role;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
}; 