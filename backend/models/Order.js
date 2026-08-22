const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

// Immutable tracking history entry - never updated/deleted, only appended.
const trackingHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        'Created',
        'Assigned',
        'Picked Up',
        'In Transit',
        'Out for Delivery',
        'Delivered',
        'Failed',
        'Rescheduled',
        'Reassigned',
        'Cancelled',
      ],
      required: true,
    },
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['customer', 'agent', 'admin', 'system'] },
      name: { type: String },
    },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // human-friendly, e.g. LM-20260822-0001
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // customer or admin (on behalf of)

    pickupAddress: { type: addressSchema, required: true },
    dropAddress: { type: addressSchema, required: true },

    pickupZone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: true },
    dropZone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: true },

    package: {
      lengthCm: { type: Number, required: true, min: 0.1 },
      breadthCm: { type: Number, required: true, min: 0.1 },
      heightCm: { type: Number, required: true, min: 0.1 },
      actualWeightKg: { type: Number, required: true, min: 0.01 },
      volumetricWeightKg: { type: Number, required: true },
      billableWeightKg: { type: Number, required: true },
    },

    orderType: { type: String, enum: ['B2B', 'B2C'], required: true },
    paymentType: { type: String, enum: ['Prepaid', 'COD'], required: true },
    codAmount: { type: Number, default: 0 }, // amount to be collected, only relevant if COD

    charge: {
      baseFare: { type: Number, required: true },
      weightCharge: { type: Number, required: true },
      codSurcharge: { type: Number, required: true, default: 0 },
      totalCharge: { type: Number, required: true },
      rateCardUsed: { type: mongoose.Schema.Types.ObjectId, ref: 'RateCard' },
      isIntraZone: { type: Boolean, required: true },
    },

    status: {
      type: String,
      enum: [
        'Created',
        'Assigned',
        'Picked Up',
        'In Transit',
        'Out for Delivery',
        'Delivered',
        'Failed',
        'Rescheduled',
        'Cancelled',
      ],
      default: 'Created',
    },

    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignmentType: { type: String, enum: ['manual', 'auto', null], default: null },

    failedDelivery: {
      isFailed: { type: Boolean, default: false },
      reason: { type: String, default: '' },
      failedAt: { type: Date },
      rescheduledDate: { type: Date, default: null },
      rescheduleRequestedAt: { type: Date, default: null },
      previousAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },

    trackingHistory: { type: [trackingHistorySchema], default: [] },

    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ assignedAgent: 1 });
orderSchema.index({ pickupZone: 1, dropZone: 1 });

module.exports = mongoose.model('Order', orderSchema);
