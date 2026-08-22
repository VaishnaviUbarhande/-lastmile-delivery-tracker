const mongoose = require('mongoose');

/**
 * A Zone groups a set of areas/pincodes under one logistics zone.
 * Admin creates zones and assigns pincodes/areas to each zone.
 * Zone detection for an order = look up the pincode (or area name) of the
 * pickup/drop address against this collection.
 */
const zoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    // Pincodes mapped to this zone. A pincode can only belong to one zone
    // (enforced in the controller, not schema, since Mongo can't do cross-doc uniqueness easily).
    pincodes: [{ type: String, trim: true }],
    // Optional human-readable area/city names mapped to this zone
    areas: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

zoneSchema.index({ pincodes: 1 });

module.exports = mongoose.model('Zone', zoneSchema);
