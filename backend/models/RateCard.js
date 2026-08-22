const mongoose = require('mongoose');

/**
 * Rate cards are fully admin-configurable, no hardcoded pricing.
 * One active rate card per orderType (B2B / B2C).
 *
 * Pricing model:
 *  - baseFare: flat fare included for the first `baseWeightKg` kg
 *  - perKgIntraZone: rate per kg beyond baseWeightKg for pickup & drop in the SAME zone
 *  - perKgInterZone: rate per kg beyond baseWeightKg for pickup & drop in DIFFERENT zones
 *  - codSurchargeType: 'flat' | 'percentage'
 *  - codSurchargeValue: value applied on top of freight when payment type = COD
 */
const rateCardSchema = new mongoose.Schema(
  {
    orderType: {
      type: String,
      enum: ['B2B', 'B2C'],
      required: true,
      unique: true, // one active rate card per order type
    },
    baseFare: { type: Number, required: true, min: 0 },
    baseWeightKg: { type: Number, required: true, min: 0, default: 0.5 },
    perKgIntraZone: { type: Number, required: true, min: 0 },
    perKgInterZone: { type: Number, required: true, min: 0 },
    codSurchargeType: {
      type: String,
      enum: ['flat', 'percentage'],
      default: 'flat',
    },
    codSurchargeValue: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RateCard', rateCardSchema);
