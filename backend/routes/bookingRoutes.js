const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBookings,
  cancelBooking,
} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { updateBookingStatus } = require("../controllers/bookingController");

router.put("/:id/status", protect, updateBookingStatus);

// tenant books
router.post("/", protect, authorizeRoles("tenant"), createBooking);

// view bookings
router.get("/", protect, getBookings);

//delete Booking
router.delete("/:id",protect,cancelBooking);

module.exports = router;