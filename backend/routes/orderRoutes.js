const express = require('express');
const router = express.Router();
const {
  previewCharge,
  createOrder,
  getOrders,
  getOrderById,
  assignAgentManually,
  autoAssignAgent,
  updateOrderStatus,
  rescheduleDelivery,
  adminOverrideStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/preview', authorize('customer', 'admin'), previewCharge);
router.post('/', authorize('customer', 'admin'), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

router.put('/:id/assign', authorize('admin'), assignAgentManually);
router.put('/:id/auto-assign', authorize('admin'), autoAssignAgent);
router.put('/:id/status', authorize('agent', 'admin'), updateOrderStatus);
router.put('/:id/reschedule', authorize('customer', 'admin'), rescheduleDelivery);
router.put('/:id/override', authorize('admin'), adminOverrideStatus);

module.exports = router;
