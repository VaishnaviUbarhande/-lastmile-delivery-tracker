const User = require('../models/User');

/**
 * Haversine distance in km between two lat/lng points.
 */
function distanceKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.asin(Math.sqrt(h));
}
function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Finds the best available agent for an order's pickup point.
 *
 * Strategy:
 *  1. Candidate pool = agents who are available (isAvailable=true) AND
 *     belong to the pickup zone (agentProfile.zone === pickupZoneId).
 *  2. If any candidates have currentLocation set, rank by haversine distance
 *     to the pickup address lat/lng (nearest first).
 *  3. If no candidates have location data, rank by lowest activeOrderCount
 *     (load balancing) as a fallback.
 *  4. If no agents in the pickup zone are available, widen the pool to ALL
 *     available agents system-wide (better to assign a farther agent than
 *     leave the order unassigned), ranked the same way.
 *
 * @param {Object} params
 * @param {ObjectId} params.pickupZoneId
 * @param {Object} params.pickupLocation - { lat, lng } (optional)
 * @returns {Promise<Object|null>} the chosen agent User document, or null if none available
 */
async function findNearestAvailableAgent({ pickupZoneId, pickupLocation }) {
  let candidates = await User.find({
    role: 'agent',
    isActive: true,
    'agentProfile.isAvailable': true,
    'agentProfile.zone': pickupZoneId,
  });

  let widened = false;
  if (candidates.length === 0) {
    candidates = await User.find({
      role: 'agent',
      isActive: true,
      'agentProfile.isAvailable': true,
    });
    widened = true;
  }

  if (candidates.length === 0) return { agent: null, widened };

  const haveLocation =
    pickupLocation &&
    typeof pickupLocation.lat === 'number' &&
    typeof pickupLocation.lng === 'number';

  let ranked;
  if (haveLocation) {
    const withDistance = candidates.map((agent) => {
      const loc = agent.agentProfile.currentLocation;
      const dist =
        loc && typeof loc.lat === 'number' && typeof loc.lng === 'number'
          ? distanceKm(pickupLocation, loc)
          : Infinity;
      return { agent, dist };
    });
    withDistance.sort((a, b) => {
      if (a.dist !== b.dist) return a.dist - b.dist;
      return a.agent.agentProfile.activeOrderCount - b.agent.agentProfile.activeOrderCount;
    });
    ranked = withDistance.map((x) => x.agent);
  } else {
    ranked = [...candidates].sort(
      (a, b) => a.agentProfile.activeOrderCount - b.agentProfile.activeOrderCount
    );
  }

  return { agent: ranked[0], widened };
}

module.exports = { findNearestAvailableAgent, distanceKm };
