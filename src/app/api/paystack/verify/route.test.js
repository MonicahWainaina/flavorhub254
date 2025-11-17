process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nFAKEKEY\\n-----END PRIVATE KEY-----\\n';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_123';

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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
const updateMock = jest.fn();
const setMock = jest.fn();
const firestoreMock = jest.fn(() => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: setMock,
      update: updateMock,
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

describe('Paystack Verify Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should verify a successful payment and update Firestore', async () => {
    // Mock fetch to return a successful Paystack verification
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            status: true,
            data: {
              status: 'success',
              amount: 25000,
              currency: 'KES',
              channel: 'card',
              paid_at: Date.now() / 1000,
            },
          }),
      })
    );

    const req = {
      json: async () => ({ reference: 'ref123', uid: 'user123' }),
    };

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(setMock).toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalled();
  });

  it('should return 400 if payment is not verified', async () => {
    // Mock fetch to return a failed Paystack verification
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            status: false,
            data: {},
          }),
      })
    );

    const req = {
      json: async () => ({ reference: 'ref123', uid: 'user123' }),
    };

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(setMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });
});