const { calculateVolumetricWeight, calculateBillableWeight, round2 } = require('../utils/rateCalculator');

describe('Rate Calculation Engine - pure functions', () => {
  test('calculateVolumetricWeight uses L x B x H / 5000', () => {
    const vw = calculateVolumetricWeight({ lengthCm: 30, breadthCm: 20, heightCm: 10 });
    // 30*20*10 = 6000 / 5000 = 1.2
    expect(vw).toBe(1.2);
  });

  test('calculateBillableWeight returns the higher of actual vs volumetric', () => {
    expect(calculateBillableWeight(2, 1.2)).toBe(2); // actual wins
    expect(calculateBillableWeight(0.5, 1.2)).toBe(1.2); // volumetric wins
    expect(calculateBillableWeight(1.2, 1.2)).toBe(1.2); // equal
  });

  test('round2 rounds to 2 decimal places', () => {
    expect(round2(10.005)).toBeCloseTo(10.01, 2);
    expect(round2(10.004)).toBe(10);
  });
});

describe('Rate Calculation Engine - calculateCharge (integration, requires DB)', () => {
  // These tests assume a RateCard has been seeded/created for 'B2C' and 'B2B'
  // as documented in tests/setup + seed script. They are written as integration
  // tests to be run against mongodb-memory-server (see tests/order.test.js for
  // full DB-backed setup) rather than mocked, since correctness of the DB lookup
  // itself (isActive filter, orderType match) is part of what needs verifying.
  test.todo('applies intra-zone rate when pickup and drop zones match');
  test.todo('applies inter-zone rate when pickup and drop zones differ');
  test.todo('applies flat COD surcharge for COD orders');
  test.todo('applies percentage COD surcharge for COD orders');
  test.todo('throws a clear error when no active rate card exists for the order type');
});
