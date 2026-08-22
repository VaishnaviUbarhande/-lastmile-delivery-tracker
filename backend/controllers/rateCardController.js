const asyncHandler = require('express-async-handler');
const RateCard = require('../models/RateCard');

// @route POST /api/rate-cards (admin) - upsert rate card for an order type
const upsertRateCard = asyncHandler(async (req, res) => {
  const {
    orderType,
    baseFare,
    baseWeightKg,
    perKgIntraZone,
    perKgInterZone,
    codSurchargeType,
    codSurchargeValue,
  } = req.body;

  if (!['B2B', 'B2C'].includes(orderType)) {
    res.status(400);
    throw new Error("orderType must be 'B2B' or 'B2C'");
  }
  if (
    [baseFare, perKgIntraZone, perKgInterZone].some(
      (v) => v === undefined || v === null || isNaN(v) || v < 0
    )
  ) {
    res.status(400);
    throw new Error('baseFare, perKgIntraZone and perKgInterZone must be valid non-negative numbers');
  }

  const update = {
    baseFare,
    perKgIntraZone,
    perKgInterZone,
    isActive: true,
    updatedBy: req.user._id,
  };
  if (baseWeightKg !== undefined) update.baseWeightKg = baseWeightKg;
  if (codSurchargeType !== undefined) update.codSurchargeType = codSurchargeType;
  if (codSurchargeValue !== undefined) update.codSurchargeValue = codSurchargeValue;

  const rateCard = await RateCard.findOneAndUpdate({ orderType }, update, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  res.json({ success: true, data: rateCard });
});

// @route GET /api/rate-cards
const getRateCards = asyncHandler(async (req, res) => {
  const rateCards = await RateCard.find().sort({ orderType: 1 });
  res.json({ success: true, data: rateCards });
});

module.exports = { upsertRateCard, getRateCards };
