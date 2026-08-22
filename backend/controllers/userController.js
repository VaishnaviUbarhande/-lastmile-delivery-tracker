const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc  Admin creates an agent or another admin
// @route POST /api/users (admin)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, zone } = req.body;

  if (!name || !email || !password || !phone || !role) {
    res.status(400);
    throw new Error('name, email, password, phone and role are required');
  }
  if (!['agent', 'admin', 'customer'].includes(role)) {
    res.status(400);
    throw new Error("role must be 'agent', 'admin' or 'customer'");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const userData = { name, email, password, phone, role };
  if (role === 'agent') {
    userData.agentProfile = { isAvailable: true, zone: zone || null };
  }

  const user = await User.create(userData);
  const safeUser = await User.findById(user._id);
  res.status(201).json({ success: true, data: safeUser });
});

// @desc  List users, filterable by role
// @route GET /api/users?role=agent
const getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  const users = await User.find(filter).populate('agentProfile.zone', 'name').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

// @desc  Update agent availability / location (agent self-service, or admin)
// @route PUT /api/users/:id/agent-profile  { isAvailable, lat, lng, zone }
const updateAgentProfile = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target || target.role !== 'agent') {
    res.status(404);
    throw new Error('Agent not found');
  }
  if (req.user.role === 'agent' && String(req.user._id) !== String(target._id)) {
    res.status(403);
    throw new Error('Agents can only update their own profile');
  }

  const { isAvailable, lat, lng, zone } = req.body;
  if (isAvailable !== undefined) target.agentProfile.isAvailable = isAvailable;
  if (lat !== undefined && lng !== undefined) {
    target.agentProfile.currentLocation = { lat, lng };
  }
  if (zone !== undefined && req.user.role === 'admin') {
    target.agentProfile.zone = zone;
  }

  await target.save();
  res.json({ success: true, data: target });
});

// @desc  Admin activates/deactivates any user
// @route PUT /api/users/:id/active  { isActive }
const setUserActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: !!isActive },
    { new: true }
  );
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

module.exports = { createUser, getUsers, updateAgentProfile, setUserActive };
