const express = require("express");
const router = express.Router();

const {
  createRequest,
  getRequests,
  updateRequestStatus,
} = require("../controllers/requestController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Tenant creates request
router.post("/", protect, authorizeRoles("tenant"), createRequest);

// Both can view
router.get("/", protect, getRequests);

// Owner updates status
router.put("/:id", protect, authorizeRoles("owner"), updateRequestStatus);

module.exports = router;