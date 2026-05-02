const express = require("express");
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
} = require("../controllers/propertyController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("owner"), createProperty);
router.get("/", protect, getProperties);
router.get("/:id", protect, getPropertyById);

module.exports = router;