const Booking = require("../models/Booking");
const Amenity = require("../models/Amenity");
const Property = require("../models/Property");

// Create Booking (Tenant only)
exports.createBooking = async (req, res) => {
  try {
    const { amenityId, booking_date, check_in, check_out } = req.body;

    if (!amenityId || !booking_date || !check_in || !check_out) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const amenity = await Amenity.findById(amenityId);
    if (!amenity) {
      return res.status(404).json({ message: "Amenity not found" });
    }

    // check tenant belongs to the same property as the amenity
    if (req.user.property.toString() !== amenity.property.toString()) {
      return res.status(403).json({ message: "You can only book amenities in your own building" });
    }

    // prevent double booking
    const existing = await Booking.findOne({
      amenity: amenityId,
      booking_date: new Date(booking_date),
      status: { $in: ['pending', 'approved'] }, // ✅ ignore rejected/cancelled
      $or: [
        {
          check_in: { $lt: check_out },
          check_out: { $gt: check_in }
        }
      ]
    })

    if (existing) {
      return res.status(400).json({ message: "This slot is already booked" });
    }

    const booking = await Booking.create({
      amenity: amenityId,
      tenant: req.user._id,
      booking_date: new Date(booking_date),
      check_in,
      check_out,
    })

    const io = req.app.get("io");
    if (io) io.emit("bookingCreated", booking);

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Bookings (filtered by property)
exports.getBookings = async (req, res) => {
  try {
    let bookings;

    if (req.user.role === "tenant") {
      bookings = await Booking.find({ tenant: req.user._id })
        .populate("amenity", "name")
        .populate("tenant", "name email");
    } else {
      // owner sees bookings for their properties only
      const ownerProperties = await Property.find({ owner: req.user._id });
      const propertyIds = ownerProperties.map(p => p._id);

      const amenities = await Amenity.find({ property: { $in: propertyIds } });
      const amenityIds = amenities.map(a => a._id);

      bookings = await Booking.find({ amenity: { $in: amenityIds } })
        .populate("amenity", "name")
        .populate("tenant", "name email");
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Booking Status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    const io = req.app.get("io");
    if (io) io.emit("bookingUpdated", booking);

    res.json({ message: "Status updated", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      req.user.role !== "owner" &&
      booking.tenant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await booking.deleteOne();

    const io = req.app.get("io");
    if (io) io.emit("bookingDeleted", booking._id);

    res.json({ message: "Booking cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};