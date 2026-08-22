const express = require('express');
const router = express.Router();
const { createZone, getZones, getZoneById, updateZone, deleteZone } = require('../controllers/zoneController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getZones);
router.get('/:id', getZoneById);
router.post('/', authorize('admin'), createZone);
router.put('/:id', authorize('admin'), updateZone);
router.delete('/:id', authorize('admin'), deleteZone);

module.exports = router;
