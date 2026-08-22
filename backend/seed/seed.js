require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Zone = require('../models/Zone');
const RateCard = require('../models/RateCard');

/**
 * Seeds the minimum configuration data needed for the app to function:
 * - 1 admin user
 * - 2 zones with pincode mappings
 * - 2 rate cards (B2B, B2C)
 * - 2 sample delivery agents (one per zone)
 *
 * Does NOT seed fake orders - orders must be created through the real
 * application flow so pricing/zone-detection/assignment are exercised for real.
 */
async function seed() {
  await connectDB();

  console.log('[Seed] Clearing existing config data (users, zones, rate cards)...');
  await User.deleteMany({});
  await Zone.deleteMany({});
  await RateCard.deleteMany({});

  console.log('[Seed] Creating admin user...');
  const admin = await User.create({
    name: 'System Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@lastmile.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
    phone: '+910000000000',
    role: 'admin',
  });

  console.log('[Seed] Creating zones...');
  const zoneNorth = await Zone.create({
    name: 'Zone North',
    description: 'Northern metro area',
    pincodes: ['110001', '110002', '110003', '201301'],
    areas: ['Delhi', 'Noida'],
  });

  const zoneSouth = await Zone.create({
    name: 'Zone South',
    description: 'Southern metro area',
    pincodes: ['560001', '560002', '560100', '600001'],
    areas: ['Bengaluru', 'Chennai'],
  });

  console.log('[Seed] Creating rate cards (B2C, B2B)...');
  await RateCard.create({
    orderType: 'B2C',
    baseFare: 40,
    baseWeightKg: 0.5,
    perKgIntraZone: 15,
    perKgInterZone: 25,
    codSurchargeType: 'flat',
    codSurchargeValue: 20,
    updatedBy: admin._id,
  });

  await RateCard.create({
    orderType: 'B2B',
    baseFare: 60,
    baseWeightKg: 1,
    perKgIntraZone: 12,
    perKgInterZone: 20,
    codSurchargeType: 'percentage',
    codSurchargeValue: 2, // 2%
    updatedBy: admin._id,
  });

  console.log('[Seed] Creating sample delivery agents...');
  await User.create({
    name: 'Agent Ravi Kumar',
    email: 'ravi.agent@lastmile.com',
    password: 'Agent@12345',
    phone: '+919000000001',
    role: 'agent',
    agentProfile: {
      isAvailable: true,
      zone: zoneNorth._id,
      currentLocation: { lat: 28.6139, lng: 77.209 },
    },
  });

  await User.create({
    name: 'Agent Priya Sharma',
    email: 'priya.agent@lastmile.com',
    password: 'Agent@12345',
    phone: '+919000000002',
    role: 'agent',
    agentProfile: {
      isAvailable: true,
      zone: zoneSouth._id,
      currentLocation: { lat: 12.9716, lng: 77.5946 },
    },
  });

  console.log('[Seed] Creating a sample customer account for testing...');
  await User.create({
    name: 'Test Customer',
    email: 'customer@lastmile.com',
    password: 'Customer@12345',
    phone: '+919000000099',
    role: 'customer',
  });

  console.log('\n[Seed] Done! Login credentials:');
  console.log(`  Admin:    ${admin.email} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin@12345'}`);
  console.log('  Agent:    ravi.agent@lastmile.com / Agent@12345 (Zone North)');
  console.log('  Agent:    priya.agent@lastmile.com / Agent@12345 (Zone South)');
  console.log('  Customer: customer@lastmile.com / Customer@12345');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
