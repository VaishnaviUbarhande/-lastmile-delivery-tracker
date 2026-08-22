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
 * - 1 sample customer account for testing
 *
 * IDEMPOTENT: this script is safe to run multiple times. It creates anything
 * that's missing but never deletes or overwrites existing users/zones/rate
 * cards. An earlier version of this script wiped all users on every run,
 * which silently orphaned any orders already placed (their customer/agent
 * references pointed at now-deleted IDs). This version preserves existing
 * data instead.
 *
 * Does NOT seed fake orders - orders must be created through the real
 * application flow so pricing/zone-detection/assignment are exercised for real.
 */
async function upsertUser(criteria, data, label) {
  const existing = await User.findOne(criteria);
  if (existing) {
    console.log(`[Seed] ${label} already exists (${existing.email}) - skipping, left unchanged.`);
    return existing;
  }
  const created = await User.create(data); // .create() triggers the password-hashing pre-save hook
  console.log(`[Seed] Created ${label}: ${created.email}`);
  return created;
}

async function upsertZone(name, data) {
  const existing = await Zone.findOne({ name });
  if (existing) {
    console.log(`[Seed] Zone "${name}" already exists - skipping, left unchanged.`);
    return existing;
  }
  const created = await Zone.create({ name, ...data });
  console.log(`[Seed] Created zone: ${name}`);
  return created;
}

async function upsertRateCard(orderType, data) {
  const existing = await RateCard.findOne({ orderType });
  if (existing) {
    console.log(`[Seed] Rate card for ${orderType} already exists - skipping, left unchanged.`);
    return existing;
  }
  const created = await RateCard.create({ orderType, ...data });
  console.log(`[Seed] Created rate card: ${orderType}`);
  return created;
}

async function seed() {
  await connectDB();

  console.log('[Seed] Starting idempotent seed (existing data will NOT be deleted)...\n');

  const admin = await upsertUser(
    { email: (process.env.SEED_ADMIN_EMAIL || 'admin@lastmile.com').toLowerCase() },
    {
      name: 'System Admin',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@lastmile.com',
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
      phone: '+910000000000',
      role: 'admin',
    },
    'Admin'
  );

  const zoneNorth = await upsertZone('Zone North', {
    description: 'Northern metro area',
    pincodes: ['110001', '110002', '110003', '201301'],
    areas: ['Delhi', 'Noida'],
  });

  const zoneSouth = await upsertZone('Zone South', {
    description: 'Southern metro area',
    pincodes: ['560001', '560002', '560100', '600001'],
    areas: ['Bengaluru', 'Chennai'],
  });

  await upsertRateCard('B2C', {
    baseFare: 40,
    baseWeightKg: 0.5,
    perKgIntraZone: 15,
    perKgInterZone: 25,
    codSurchargeType: 'flat',
    codSurchargeValue: 20,
    updatedBy: admin._id,
  });

  await upsertRateCard('B2B', {
    baseFare: 60,
    baseWeightKg: 1,
    perKgIntraZone: 12,
    perKgInterZone: 20,
    codSurchargeType: 'percentage',
    codSurchargeValue: 2, // 2%
    updatedBy: admin._id,
  });

  await upsertUser(
    { email: 'ravi.agent@lastmile.com' },
    {
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
    },
    'Agent Ravi Kumar'
  );

  await upsertUser(
    { email: 'priya.agent@lastmile.com' },
    {
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
    },
    'Agent Priya Sharma'
  );

  await upsertUser(
    { email: 'customer@lastmile.com' },
    {
      name: 'Test Customer',
      email: 'customer@lastmile.com',
      password: 'Customer@12345',
      phone: '+919000000099',
      role: 'customer',
    },
    'Test Customer'
  );

  console.log('\n[Seed] Done! Login credentials (accounts that already existed keep their');
  console.log('       ORIGINAL password, even if .env has a different value now):');
  console.log(
    `  Admin:    ${process.env.SEED_ADMIN_EMAIL || 'admin@lastmile.com'} / ${
      process.env.SEED_ADMIN_PASSWORD || 'Admin@12345'
    } (or original password if this account pre-existed)`
  );
  console.log('  Agent:    ravi.agent@lastmile.com / Agent@12345 (Zone North)');
  console.log('  Agent:    priya.agent@lastmile.com / Agent@12345 (Zone South)');
  console.log('  Customer: customer@lastmile.com / Customer@12345');
  console.log('\n[Seed] NOTE: this script no longer deletes existing data. To fully reset the');
  console.log('       database from scratch, manually drop the database/collections yourself.');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});


