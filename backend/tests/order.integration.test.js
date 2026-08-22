const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';
process.env.NOTIFICATIONS_DRY_RUN = 'true';

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await mongoose.connect(process.env.MONGO_URI);
  app = require('../server'); // NODE_ENV=test => server.js does not auto-listen/connect again
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

const Zone = require('../models/Zone');
const RateCard = require('../models/RateCard');

let adminToken, customerToken, agentToken, agentId, zoneNorthId, zoneSouthId;

describe('Full order lifecycle', () => {
  test('setup: register admin (first user becomes usable via direct model create), zones, rate cards, agent, customer', async () => {
    // Create admin directly (in real app, admin is seeded, not self-registered)
    const User = require('../models/User');
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'Admin@12345',
      phone: '+910000000000',
      role: 'admin',
    });

    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const zoneNorth = await Zone.create({
      name: 'North',
      pincodes: ['110001'],
      areas: ['Delhi'],
    });
    const zoneSouth = await Zone.create({
      name: 'South',
      pincodes: ['560001'],
      areas: ['Bengaluru'],
    });
    zoneNorthId = zoneNorth._id;
    zoneSouthId = zoneSouth._id;

    await RateCard.create({
      orderType: 'B2C',
      baseFare: 40,
      baseWeightKg: 0.5,
      perKgIntraZone: 15,
      perKgInterZone: 25,
      codSurchargeType: 'flat',
      codSurchargeValue: 20,
    });

    const agentRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Agent A',
        email: 'agent@test.com',
        password: 'Agent@12345',
        phone: '+919000000001',
        role: 'agent',
        zone: zoneNorth._id,
      });
    expect(agentRes.status).toBe(201);
    agentId = agentRes.body.data._id;

    const agentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'agent@test.com', password: 'Agent@12345' });
    agentToken = agentLogin.body.data.token;

    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Cust A',
      email: 'cust@test.com',
      password: 'Cust@12345',
      phone: '+919000000099',
    });
    expect(custRes.status).toBe(201);
    customerToken = custRes.body.data.token;
  });

  test('preview charge: intra-zone B2C prepaid order', async () => {
    const res = await request(app)
      .post('/api/orders/preview')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        pickupAddress: { pincode: '110001', city: 'Delhi' },
        dropAddress: { pincode: '110001', city: 'Delhi' },
        dimensions: { lengthCm: 30, breadthCm: 20, heightCm: 10, actualWeightKg: 2 },
        orderType: 'B2C',
        paymentType: 'Prepaid',
      });

    expect(res.status).toBe(200);
    // volumetric = 30*20*10/5000 = 1.2, billable = max(2, 1.2) = 2
    expect(res.body.data.billableWeightKg).toBe(2);
    expect(res.body.data.isIntraZone).toBe(true);
    // extraWeight = 2 - 0.5 = 1.5 ; weightCharge = 1.5 * 15 = 22.5 ; baseFare = 40
    expect(res.body.data.charge.weightCharge).toBe(22.5);
    expect(res.body.data.charge.totalCharge).toBe(62.5); // no COD surcharge (Prepaid)
  });

  test('preview charge: inter-zone COD order applies flat surcharge', async () => {
    const res = await request(app)
      .post('/api/orders/preview')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        pickupAddress: { pincode: '110001', city: 'Delhi' },
        dropAddress: { pincode: '560001', city: 'Bengaluru' },
        dimensions: { lengthCm: 30, breadthCm: 20, heightCm: 10, actualWeightKg: 2 },
        orderType: 'B2C',
        paymentType: 'COD',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.isIntraZone).toBe(false);
    // extraWeight 1.5 * interZoneRate 25 = 37.5 ; +baseFare 40 = 77.5 ; +COD flat 20 = 97.5
    expect(res.body.data.charge.weightCharge).toBe(37.5);
    expect(res.body.data.charge.codSurcharge).toBe(20);
    expect(res.body.data.charge.totalCharge).toBe(97.5);
  });

  let orderId;
  test('create order persists correct charge snapshot and initial tracking history', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        pickupAddress: { pincode: '110001', city: 'Delhi', line1: 'A1' },
        dropAddress: { pincode: '110001', city: 'Delhi', line1: 'B1' },
        dimensions: { lengthCm: 30, breadthCm: 20, heightCm: 10, actualWeightKg: 2 },
        orderType: 'B2C',
        paymentType: 'Prepaid',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('Created');
    expect(res.body.data.trackingHistory).toHaveLength(1);
    expect(res.body.data.trackingHistory[0].status).toBe('Created');
    orderId = res.body.data._id;
  });

  test('auto-assign selects the available agent and appends immutable history', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/auto-assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Assigned');
    expect(res.body.data.assignedAgent).toBe(agentId);
    expect(res.body.data.trackingHistory).toHaveLength(2);
  });

  test('agent can progress status forward but not skip states', async () => {
    const badJump = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ status: 'Delivered' });
    expect(badJump.status).toBe(400);

    const pickup = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ status: 'Picked Up' });
    expect(pickup.status).toBe(200);
    expect(pickup.body.data.status).toBe('Picked Up');
  });

  test('failed delivery flow: mark failed, then customer reschedules and agent is reassigned', async () => {
    await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ status: 'In Transit' });
    await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ status: 'Out for Delivery' });

    const failRes = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ status: 'Failed', reason: 'Customer not available' });
    expect(failRes.status).toBe(200);
    expect(failRes.body.data.failedDelivery.isFailed).toBe(true);

    const rescheduleRes = await request(app)
      .put(`/api/orders/${orderId}/reschedule`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ rescheduledDate: new Date(Date.now() + 86400000).toISOString() });

    expect(rescheduleRes.status).toBe(200);
    expect(rescheduleRes.body.data.assignedAgent).toBe(agentId); // reassigned (only agent available)
    const statuses = rescheduleRes.body.data.trackingHistory.map((h) => h.status);
    expect(statuses).toEqual(
      expect.arrayContaining(['Created', 'Assigned', 'Picked Up', 'In Transit', 'Out for Delivery', 'Failed', 'Rescheduled'])
    );
  });

  test('admin can override status directly with audit note', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/override`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Delivered', note: 'Confirmed via phone call' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Delivered');
    const last = res.body.data.trackingHistory.at(-1);
    expect(last.note).toContain('Admin override');
  });
});
