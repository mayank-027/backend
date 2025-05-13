const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const {
  createLog,
  getLogs,
  updateLog,
  deleteLog,
  deleteAllLogs,
} = require("../controllers/logControllers");

router.use(protect);


// Routes that don't require authentication
router.route("/").post(createLog);


// Protected routes
router.route("/").get(getLogs);

// Route for a specific log by ID
router
  .route("delete/:id")
  .put(updateLog) 
  .delete(deleteLog); 

// Route for deleting all logs for a user
router.route("/reset").delete(deleteAllLogs);

module.exports = router;