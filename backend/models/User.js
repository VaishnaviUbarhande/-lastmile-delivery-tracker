const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['customer', 'agent', 'admin'],
      default: 'customer',
      required: true,
    },
    // --- Agent-specific fields ---
    agentProfile: {
      isAvailable: { type: Boolean, default: true },
      currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
      },
      zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', default: null },
      activeOrderCount: { type: Number, default: 0 }, // orders currently assigned & not yet delivered/failed
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ role: 1 });
userSchema.index({ 'agentProfile.zone': 1, 'agentProfile.isAvailable': 1 });

module.exports = mongoose.model('User', userSchema);
