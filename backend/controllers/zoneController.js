const asyncHandler = require('express-async-handler');
const Zone = require('../models/Zone');

// @route POST /api/zones (admin)
const createZone = asyncHandler(async (req, res) => {
  const { name, description, pincodes = [], areas = [] } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Zone name is required');
  }

  const conflict = await Zone.findOne({
    pincodes: { $in: pincodes },
    isActive: true,
  });
  if (conflict) {
    res.status(400);
    throw new Error(
      `One or more pincodes already belong to zone '${conflict.name}'. A pincode can only belong to one zone.`
    );
  }

  const zone = await Zone.create({ name, description, pincodes, areas });
  res.status(201).json({ success: true, data: zone });
});

// @route GET /api/zones (any authenticated)
const getZones = asyncHandler(async (req, res) => {
  const zones = await Zone.find().sort({ name: 1 });
  res.json({ success: true, data: zones });
});

// @route GET /api/zones/:id
const getZoneById = asyncHandler(async (req, res) => {
  const zone = await Zone.findById(req.params.id);
  if (!zone) {
    res.status(404);
    throw new Error('Zone not found');
  }
  res.json({ success: true, data: zone });
});

// @route PUT /api/zones/:id (admin)
const updateZone = asyncHandler(async (req, res) => {
  const { name, description, pincodes, areas, isActive } = req.body;
  const zone = await Zone.findById(req.params.id);
  if (!zone) {
    res.status(404);
    throw new Error('Zone not found');
  }

  if (pincodes) {
    const conflict = await Zone.findOne({
      _id: { $ne: zone._id },
      pincodes: { $in: pincodes },
      isActive: true,
    });
    if (conflict) {
      res.status(400);
      throw new Error(`One or more pincodes already belong to zone '${conflict.name}'`);
    }
    zone.pincodes = pincodes;
  }

  if (name !== undefined) zone.name = name;
  if (description !== undefined) zone.description = description;
  if (areas !== undefined) zone.areas = areas;
  if (isActive !== undefined) zone.isActive = isActive;

  await zone.save();
  res.json({ success: true, data: zone });
});

// @route DELETE /api/zones/:id (admin) - soft delete
const deleteZone = asyncHandler(async (req, res) => {
  const zone = await Zone.findById(req.params.id);
  if (!zone) {
    res.status(404);
    throw new Error('Zone not found');
  }
  zone.isActive = false;
  await zone.save();
  res.json({ success: true, message: 'Zone deactivated' });
});

module.exports = { createZone, getZones, getZoneById, updateZone, deleteZone };
