const express = require("express");
const router = express.Router();
const {
  createGrievance,
  getGrievances,
  getGrievance,
  updateGrievance,
  addComment,
  getByGravienceNumber,
  deleteGrievance,
  getByGravienceTitle,
  // getAttachment, // ❌ REMOVE this line
} = require("../controllers/grievanceController");
const { protect } = require("../middleware/auth");

// Protect all routes
router.use(protect);

// Routes
router.route("/").post(createGrievance).get(getGrievances);

router
  .route("/:id")
  .get(getGrievance)
  .put(updateGrievance)
  .delete(deleteGrievance);

router.route("/g/:grievanceNumber").get(getByGravienceNumber);
router.route("/name/:title").get(getByGravienceTitle);

router.post("/:id/comments", addComment);

module.exports = router;
