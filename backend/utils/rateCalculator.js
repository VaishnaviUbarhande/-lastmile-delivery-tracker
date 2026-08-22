const RateCard = require('../models/RateCard');

const VOLUMETRIC_DIVISOR = 5000;

/**
 * Calculates volumetric weight in kg.
 * Formula: (L x B x H in cm) / 5000
 */
function calculateVolumetricWeight({ lengthCm, breadthCm, heightCm }) {
  const volumetric = (lengthCm * breadthCm * heightCm) / VOLUMETRIC_DIVISOR;
  return round2(volumetric);
}

/**
 * Billable weight = higher of actual vs volumetric weight.
 */
function calculateBillableWeight(actualWeightKg, volumetricWeightKg) {
  return round2(Math.max(actualWeightKg, volumetricWeightKg));
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Full charge calculation for an order.
 *
 * @param {Object} params
 * @param {String} params.orderType - 'B2B' | 'B2C'
 * @param {String} params.paymentType - 'Prepaid' | 'COD'
 * @param {Boolean} params.isIntraZone - true if pickup & drop zone are the same
 * @param {Number} params.billableWeightKg
 * @returns {Object} charge breakdown
 */
async function calculateCharge({ orderType, paymentType, isIntraZone, billableWeightKg }) {
  const rateCard = await RateCard.findOne({ orderType, isActive: true });

  if (!rateCard) {
    const err = new Error(
      `No active rate card configured for order type '${orderType}'. Admin must configure rate cards before orders can be placed.`
    );
    err.statusCode = 422;
    throw err;
  }

  const perKgRate = isIntraZone ? rateCard.perKgIntraZone : rateCard.perKgInterZone;

  const extraWeight = Math.max(0, billableWeightKg - rateCard.baseWeightKg);
  const weightCharge = round2(extraWeight * perKgRate);
  const baseFare = round2(rateCard.baseFare);

  let codSurcharge = 0;
  if (paymentType === 'COD') {
    if (rateCard.codSurchargeType === 'flat') {
      codSurcharge = round2(rateCard.codSurchargeValue);
    } else {
      // percentage of (baseFare + weightCharge)
      codSurcharge = round2(((baseFare + weightCharge) * rateCard.codSurchargeValue) / 100);
    }
  }

  const totalCharge = round2(baseFare + weightCharge + codSurcharge);

  return {
    baseFare,
    weightCharge,
    codSurcharge,
    totalCharge,
    rateCardUsed: rateCard._id,
    isIntraZone,
    perKgRateApplied: perKgRate,
    billableWeightKg,
  };
}

module.exports = {
  calculateVolumetricWeight,
  calculateBillableWeight,
  calculateCharge,
  round2,
};
