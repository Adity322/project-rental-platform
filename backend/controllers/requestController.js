const Request = require("../models/Request");
const Property = require("../models/Property");

// Create request (Tenant only)
exports.createRequest = async (req, res) => {
  try {
    const { propertyId, description, category, priority } = req.body

    const request = await Request.create({
      propertyId,
      tenant: req.user._id,
      description,
      category,
      priority,
    })

    const populatedRequest = await Request.findById(request._id)
      .populate('tenant', 'name email')

    const io = req.app.get('io')
    if (io) {
      io.emit('requestCreated', populatedRequest)
    }

    res.status(201).json(populatedRequest)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
// Update status (Owner only)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body
    const request = await Request.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    request.status = status

    // set resolved_at when completed
    if (status === 'completed') {
      request.resolved_at = new Date()
    } else {
      request.resolved_at = null
    }

    await request.save()

    const populatedRequest = await Request.findById(request._id)
      .populate('tenant', 'name email')

    const io = req.app.get('io')
    if (io) {
      io.emit('requestUpdated', populatedRequest)
    }

    res.json(populatedRequest)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
// Get requests (filtered by property)
exports.getRequests = async (req, res) => {
  try {
    let requests

    if (req.user.role === 'tenant') {
      requests = await Request.find({ tenant: req.user._id })
        .populate('tenant', 'name email')
        .sort({ createdAt: -1 })
    } else {
      const ownerProperties = await Property.find({ owner: req.user._id })
      const propertyIds = ownerProperties.map(p => p._id.toString())

      const allRequests = await Request.find()
        .populate('tenant', 'name email')
        .sort({ createdAt: -1 })

      // safely filter — skip requests with no propertyId
      requests = allRequests.filter(r =>
        r.propertyId && propertyIds.includes(r.propertyId.toString())
      )
    }

    res.json(requests)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}