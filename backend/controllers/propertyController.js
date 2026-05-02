const Property = require("../models/Property");

// 🔹 Create Property (Owner only)
exports.createProperty = async (req, res) => {
  try {
    const { name, address } = req.body;

    const property = await Property.create({
      name,
      address,
      owner: req.user._id,
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get Properties
exports.getProperties = async (req, res) => {
  try {
    let properties;

    if (req.user.role === "owner") {
      properties = await Property.find({ owner: req.user._id });
    } else {
      properties = await Property.find();
    }

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 🔹 Get Property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }
    res.json(property)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}