// Set env vars BEFORE importing the route (important!)
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nFAKEKEY\\n-----END PRIVATE KEY-----\\n';

const crypto = require('crypto');

// Mock NextResponse.json
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, { status } = {}) => ({
      status: status || 200,
      json: async () => data,
    }),
  },
}));

// Mock Firestore and admin
const FieldValue = { serverTimestamp: jest.fn() };
const Timestamp = { fromDate: jest.fn(() => 'mocked-timestamp') };
const firestoreMock = jest.fn(() => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(),
      update: jest.fn(),
    })),
  })),
}));
firestoreMock.FieldValue = FieldValue;
firestoreMock.Timestamp = Timestamp;

jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  firestore: firestoreMock,
}));

const { POST } = require('./route');

describe('Paystack Webhook Route', () => {
  it('should reject invalid signature', async () => {
    const fakeSecret = 'test_secret';
    process.env.PAYSTACK_SECRET_KEY = fakeSecret;

    const body = JSON.stringify({ event: 'charge.success', data: {} });
    const invalidSignature = 'invalid';

    const req = {
      text: async () => body,
      headers: { get: () => invalidSignature },
    };

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Invalid signature');
  });

  it('should accept valid signature and process charge.success', async () => {
    const fakeSecret = 'test_secret';
    process.env.PAYSTACK_SECRET_KEY = fakeSecret;

    const event = {
      event: 'charge.success',
      data: {
        reference: 'ref123',
        amount: 25000,
        currency: 'KES',
        channel: 'card',
        status: 'success',
        paid_at: Date.now() / 1000,
        metadata: { uid: 'user123' },
      },
    };
    const body = JSON.stringify(event);
    const validSignature = crypto.createHmac('sha512', fakeSecret).update(body).digest('hex');

    const req = {
      text: async () => body,
      headers: { get: () => validSignature },
    };

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });
});