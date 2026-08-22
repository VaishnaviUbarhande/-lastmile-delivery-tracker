const Zone = require('../models/Zone');

/**
 * Detects the zone for a given address by matching its pincode (primary)
 * or city/area name (fallback) against admin-configured zones.
 * No hardcoding - purely driven by the Zone collection.
 *
 * @param {Object} address - { pincode, city }
 * @returns {Promise<Object>} matched Zone document
 * @throws Error if no zone matches (order cannot be priced without a zone)
 */
async function detectZone(address) {
  const { pincode, city } = address;

  let zone = await Zone.findOne({ pincodes: pincode, isActive: true });

  if (!zone && city) {
    zone = await Zone.findOne({
      areas: { $regex: new RegExp(`^${escapeRegex(city)}$`, 'i') },
      isActive: true,
    });
  }

  if (!zone) {
    const err = new Error(
      `Unable to detect delivery zone for pincode '${pincode}'${
        city ? ` / city '${city}'` : ''
      }. Admin must map this pincode to a zone.`
    );
    err.statusCode = 422;
    throw err;
  }

  return zone;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { detectZone };
