const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const User = require('../models/User');
const { detectZone } = require('../utils/zoneDetector');
const {
  calculateVolumetricWeight,
  calculateBillableWeight,
  calculateCharge,
} = require('../utils/rateCalculator');
const { findNearestAvailableAgent } = require('../utils/autoAssign');
const { notifyOrderStatusChange } = require('../utils/notificationService');

/**
 * Shared pricing computation used by both the preview endpoint and order creation,
 * so the previewed price is guaranteed identical to the charged price.
 */
async function computePricing({ pickupAddress, dropAddress, dimensions, orderType, paymentType }) {
  const pickupZone = await detectZone(pickupAddress);
  const dropZone = await detectZone(dropAddress);

  const volumetricWeightKg = calculateVolumetricWeight(dimensions);
  const billableWeightKg = calculateBillableWeight(dimensions.actualWeightKg, volumetricWeightKg);
  const isIntraZone = String(pickupZone._id) === String(dropZone._id);

  const charge = await calculateCharge({ orderType, paymentType, isIntraZone, billableWeightKg });

  return { pickupZone, dropZone, volumetricWeightKg, billableWeightKg, isIntraZone, charge };
}

// @desc  Price preview before order confirmation
// @route POST /api/orders/preview
// @access Private (customer, admin)
const previewCharge = asyncHandler(async (req, res) => {
  const { pickupAddress, dropAddress, dimensions, orderType, paymentType } = req.body;

  validateOrderInput({ pickupAddress, dropAddress, dimensions, orderType, paymentType });

  const { pickupZone, dropZone, volumetricWeightKg, billableWeightKg, isIntraZone, charge } =
    await computePricing({ pickupAddress, dropAddress, dimensions, orderType, paymentType });

  res.json({
    success: true,
    data: {
      pickupZone: { id: pickupZone._id, name: pickupZone.name },
      dropZone: { id: dropZone._id, name: dropZone.name },
      isIntraZone,
      volumetricWeightKg,
      billableWeightKg,
      charge,
    },
  });
});

function validateOrderInput({ pickupAddress, dropAddress, dimensions, orderType, paymentType }) {
  const errors = [];
  if (!pickupAddress || !pickupAddress.pincode) errors.push('pickupAddress.pincode is required');
  if (!dropAddress || !dropAddress.pincode) errors.push('dropAddress.pincode is required');
  if (!dimensions || !dimensions.lengthCm || !dimensions.breadthCm || !dimensions.heightCm) {
    errors.push('dimensions (lengthCm, breadthCm, heightCm) are required');
  }
  if (!dimensions || !dimensions.actualWeightKg) errors.push('dimensions.actualWeightKg is required');
  if (!['B2B', 'B2C'].includes(orderType)) errors.push("orderType must be 'B2B' or 'B2C'");
  if (!['Prepaid', 'COD'].includes(paymentType)) errors.push("paymentType must be 'Prepaid' or 'COD'");
  if (errors.length) {
    const err = new Error(errors.join('; '));
    err.statusCode = 400;
    throw err;
  }
}

async function generateOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = await Order.countDocuments({
    orderNumber: { $regex: `^LM-${datePart}-` },
  });
  const seq = String(countToday + 1).padStart(4, '0');
  return `LM-${datePart}-${seq}`;
}

// @desc  Create order (customer places own order, or admin places on behalf of a customer)
// @route POST /api/orders
// @access Private (customer, admin)
const createOrder = asyncHandler(async (req, res) => {
  const { pickupAddress, dropAddress, dimensions, orderType, paymentType, codAmount, customerId } =
    req.body;

  validateOrderInput({ pickupAddress, dropAddress, dimensions, orderType, paymentType });

  let customer = req.user;
  if (req.user.role === 'admin') {
    if (!customerId) {
      res.status(400);
      throw new Error('customerId is required when admin creates an order on behalf of a customer');
    }
    customer = await User.findOne({ _id: customerId, role: 'customer' });
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
  } else if (req.user.role !== 'customer') {
    res.status(403);
    throw new Error('Only customers or admins can create orders');
  }

  if (paymentType === 'COD' && (!codAmount || codAmount <= 0)) {
    res.status(400);
    throw new Error('codAmount is required and must be greater than 0 for COD orders');
  }

  const { pickupZone, dropZone, volumetricWeightKg, billableWeightKg, isIntraZone, charge } =
    await computePricing({ pickupAddress, dropAddress, dimensions, orderType, paymentType });

  const orderNumber = await generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    customer: customer._id,
    createdBy: req.user._id,
    pickupAddress,
    dropAddress,
    pickupZone: pickupZone._id,
    dropZone: dropZone._id,
    package: {
      lengthCm: dimensions.lengthCm,
      breadthCm: dimensions.breadthCm,
      heightCm: dimensions.heightCm,
      actualWeightKg: dimensions.actualWeightKg,
      volumetricWeightKg,
      billableWeightKg,
    },
    orderType,
    paymentType,
    codAmount: paymentType === 'COD' ? codAmount : 0,
    charge,
    status: 'Created',
    trackingHistory: [
      {
        status: 'Created',
        actor: { id: req.user._id, role: req.user.role, name: req.user.name },
        note: 'Order created',
        timestamp: new Date(),
      },
    ],
  });

  res.status(201).json({ success: true, data: order });
});

// @desc  Get orders (role-scoped, with filters)
// @route GET /api/orders?status=&zone=&agent=&page=&limit=
// @access Private
const getOrders = asyncHandler(async (req, res) => {
  const { status, zone, agent, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (req.user.role === 'customer') {
    filter.customer = req.user._id;
  } else if (req.user.role === 'agent') {
    filter.assignedAgent = req.user._id;
  }
  // admin: no implicit filter, sees all orders

  if (status) filter.status = status;
  if (zone) filter.$or = [{ pickupZone: zone }, { dropZone: zone }];
  if (agent && req.user.role === 'admin') filter.assignedAgent = agent;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('assignedAgent', 'name email phone')
      .populate('pickupZone', 'name')
      .populate('dropZone', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  });
});

// @desc  Get single order (with full tracking timeline)
// @route GET /api/orders/:id
// @access Private (owner customer, assigned agent, or admin)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('assignedAgent', 'name email phone')
    .populate('pickupZone', 'name')
    .populate('dropZone', 'name');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isOwner = String(order.customer._id) === String(req.user._id);
  const isAssignedAgent =
    order.assignedAgent && String(order.assignedAgent._id) === String(req.user._id);
  if (req.user.role !== 'admin' && !isOwner && !isAssignedAgent) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, data: order });
});

async function appendHistory(order, status, actor, note = '') {
  order.trackingHistory.push({ status, actor, note, timestamp: new Date() });
}

// @desc  Manually assign an agent to an order
// @route PUT /api/orders/:id/assign  { agentId }
// @access Private (admin)
const assignAgentManually = asyncHandler(async (req, res) => {
  const { agentId } = req.body;
  const order = await Order.findById(req.params.id).populate('customer');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (['Delivered', 'Cancelled'].includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot assign an agent to an order with status '${order.status}'`);
  }

  const agent = await User.findOne({ _id: agentId, role: 'agent', isActive: true });
  if (!agent) {
    res.status(404);
    throw new Error('Agent not found or inactive');
  }

  await doAssignment(order, agent, 'manual', req.user);
  res.json({ success: true, data: order });
});

// @desc  Auto-assign nearest available agent
// @route PUT /api/orders/:id/auto-assign
// @access Private (admin)
const autoAssignAgent = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customer');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (['Delivered', 'Cancelled'].includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot assign an agent to an order with status '${order.status}'`);
  }

  const { agent, widened } = await findNearestAvailableAgent({
    pickupZoneId: order.pickupZone,
    pickupLocation: order.pickupAddress.lat
      ? { lat: order.pickupAddress.lat, lng: order.pickupAddress.lng }
      : null,
  });

  if (!agent) {
    res.status(409);
    throw new Error('No available delivery agents found. Try manual assignment or add more agents.');
  }

  await doAssignment(order, agent, 'auto', req.user);
  res.json({
    success: true,
    data: order,
    meta: { widenedSearch: widened },
  });
});

async function doAssignment(order, agent, assignmentType, actorUser) {
  // release previous agent's load if reassigning
  if (order.assignedAgent && String(order.assignedAgent) !== String(agent._id)) {
    await User.findByIdAndUpdate(order.assignedAgent, { $inc: { 'agentProfile.activeOrderCount': -1 } });
  }

  order.assignedAgent = agent._id;
  order.assignmentType = assignmentType;
  if (order.status === 'Created') order.status = 'Assigned';

  await appendHistory(
    order,
    'Assigned',
    { id: actorUser._id, role: actorUser.role, name: actorUser.name },
    `Assigned to agent ${agent.name} (${assignmentType})`
  );

  await order.save();
  await User.findByIdAndUpdate(agent._id, { $inc: { 'agentProfile.activeOrderCount': 1 } });

  await notifyOrderStatusChange({
    customer: order.customer,
    order,
    status: 'Assigned',
    extra: `Your delivery agent has been assigned: ${agent.name}.`,
  });
}

const STATUS_TRANSITIONS = {
  Created: ['Assigned', 'Cancelled'],
  Assigned: ['Picked Up', 'Cancelled'],
  'Picked Up': ['In Transit', 'Failed'],
  'In Transit': ['Out for Delivery', 'Failed'],
  'Out for Delivery': ['Delivered', 'Failed'],
  Failed: ['Rescheduled'],
  Rescheduled: ['Assigned', 'Picked Up'],
  Delivered: [],
  Cancelled: [],
};

// @desc  Delivery agent updates order status
// @route PUT /api/orders/:id/status  { status, reason? }
// @access Private (agent - must be assigned; admin can also call this but override endpoint is preferred)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const order = await Order.findById(req.params.id).populate('customer');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (req.user.role === 'agent' && String(order.assignedAgent) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You are not the assigned agent for this order');
  }

  const allowedNext = STATUS_TRANSITIONS[order.status] || [];
  if (!allowedNext.includes(status)) {
    res.status(400);
    throw new Error(`Cannot transition order from '${order.status}' to '${status}'`);
  }

  order.status = status;

  if (status === 'Failed') {
    order.failedDelivery.isFailed = true;
    order.failedDelivery.reason = reason || 'Not specified';
    order.failedDelivery.failedAt = new Date();
    order.failedDelivery.previousAgent = order.assignedAgent;
  }

  if (status === 'Delivered') {
    order.deliveredAt = new Date();
    if (order.assignedAgent) {
      await User.findByIdAndUpdate(order.assignedAgent, {
        $inc: { 'agentProfile.activeOrderCount': -1 },
      });
    }
  }

  await appendHistory(
    order,
    status,
    { id: req.user._id, role: req.user.role, name: req.user.name },
    reason || ''
  );

  await order.save();

  await notifyOrderStatusChange({
    customer: order.customer,
    order,
    status,
    extra:
      status === 'Failed'
        ? `Delivery attempt failed: ${order.failedDelivery.reason}. You can reschedule from your dashboard.`
        : '',
  });

  res.json({ success: true, data: order });
});

// @desc  Customer reschedules a failed delivery
// @route PUT /api/orders/:id/reschedule  { rescheduledDate }
// @access Private (customer - owner only)
const rescheduleDelivery = asyncHandler(async (req, res) => {
  const { rescheduledDate } = req.body;
  if (!rescheduledDate) {
    res.status(400);
    throw new Error('rescheduledDate is required');
  }

  const order = await Order.findById(req.params.id).populate('customer');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (String(order.customer._id) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to reschedule this order');
  }
  if (order.status !== 'Failed') {
    res.status(400);
    throw new Error(`Only orders with status 'Failed' can be rescheduled (current: '${order.status}')`);
  }

  order.failedDelivery.rescheduledDate = new Date(rescheduledDate);
  order.failedDelivery.rescheduleRequestedAt = new Date();
  order.status = 'Rescheduled';

  await appendHistory(
    order,
    'Rescheduled',
    { id: req.user._id, role: req.user.role, name: req.user.name },
    `Customer requested reschedule for ${new Date(rescheduledDate).toDateString()}`
  );

  // Auto-reassign agent for the rescheduled attempt (nearest available, excluding failed attempt's own outcome)
  const { agent } = await findNearestAvailableAgent({
    pickupZoneId: order.pickupZone,
    pickupLocation: order.pickupAddress.lat
      ? { lat: order.pickupAddress.lat, lng: order.pickupAddress.lng }
      : null,
  });

  await order.save();

  if (agent) {
    await doAssignment(order, agent, 'auto', req.user);
  }

  await notifyOrderStatusChange({
    customer: order.customer,
    order,
    status: 'Rescheduled',
    extra: `New delivery attempt scheduled for ${new Date(rescheduledDate).toDateString()}.`,
  });

  res.json({ success: true, data: order });
});

// @desc  Admin overrides order status directly (any transition, with audit note)
// @route PUT /api/orders/:id/override  { status, note }
// @access Private (admin)
const adminOverrideStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = Object.keys(STATUS_TRANSITIONS);
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`status must be one of: ${validStatuses.join(', ')}`);
  }

  const order = await Order.findById(req.params.id).populate('customer');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  if (status === 'Delivered') order.deliveredAt = new Date();

  await appendHistory(
    order,
    status,
    { id: req.user._id, role: 'admin', name: req.user.name },
    `Admin override${note ? `: ${note}` : ''}`
  );

  await order.save();

  await notifyOrderStatusChange({
    customer: order.customer,
    order,
    status,
    extra: 'This status was updated by an administrator.',
  });

  res.json({ success: true, data: order });
});

module.exports = {
  previewCharge,
  createOrder,
  getOrders,
  getOrderById,
  assignAgentManually,
  autoAssignAgent,
  updateOrderStatus,
  rescheduleDelivery,
  adminOverrideStatus,
};
