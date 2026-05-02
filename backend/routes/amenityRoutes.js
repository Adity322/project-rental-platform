const express = require("express");
const router = express.Router();
const {
  createAmenity,
  getAmenities,
  deleteAmenity
} = require("../controllers/amenityController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("owner"), createAmenity);
router.get("/", protect, getAmenities);
router.delete("/:id", protect, authorizeRoles("owner"), deleteAmenity);

module.exports = router;