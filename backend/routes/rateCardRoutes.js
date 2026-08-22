const express = require('express');
const router = express.Router();
const { upsertRateCard, getRateCards } = require('../controllers/rateCardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getRateCards);
router.post('/', authorize('admin'), upsertRateCard);

module.exports = router;
