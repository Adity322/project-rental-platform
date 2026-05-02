const Amenity = require("../models/Amenity");
const Property = require("../models/Property");

// Create Amenity (Owner only)
exports.createAmenity = async (req, res) => {
  try {
    const { name, propertyId } = req.body;

    if (!name || !propertyId) {
      return res.status(400).json({ message: "Name and propertyId are required" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only add amenities to your own property" });
    }

    const existing = await Amenity.findOne({ name, property: propertyId });
    if (existing) {
      return res.status(400).json({ message: "Amenity already exists in this property" });
    }

    const amenity = await Amenity.create({
      name,
      property: propertyId,
      availability_status: "available",
    });

    res.status(201).json(amenity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Amenities (filtered by property)
exports.getAmenities = async (req, res) => {
  try {
    let amenities;

    if (req.user.role === "owner") {
      // owner sees amenities of their own properties only
      const ownerProperties = await Property.find({ owner: req.user._id });
      const propertyIds = ownerProperties.map(p => p._id);

      amenities = await Amenity.find({ property: { $in: propertyIds } })
        .populate("property", "name address");
    } else {
      // tenant sees amenities of their property only
      if (!req.user.property) {
        return res.json([]);
      }

      amenities = await Amenity.find({ property: req.user.property })
        .populate("property", "name address");
    }

    res.json(amenities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Amenity (Owner only)
exports.deleteAmenity = async (req, res) => {
  try {
    const amenity = await Amenity.findById(req.params.id).populate("property");
    if (!amenity) {
      return res.status(404).json({ message: "Amenity not found" });
    }

    if (amenity.property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own property amenities" });
    }

    await amenity.deleteOne();
    res.json({ message: "Amenity deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};