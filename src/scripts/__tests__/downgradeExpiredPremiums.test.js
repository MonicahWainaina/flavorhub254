const updateMock = jest.fn();

function makeWhereChain(getImpl) {
  // Each .where() returns an object with .where() and .get()
  const chain = {
    where: jest.fn(() => chain),
    get: getImpl,
  };
  return chain;
}

const collectionMock = jest.fn(() => makeWhereChain(jest.fn()));
const firestoreMock = jest.fn(() => ({
  collection: collectionMock,
}));
firestoreMock.FieldValue = { serverTimestamp: jest.fn() };
firestoreMock.Timestamp = { fromDate: jest.fn() };

jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  firestore: firestoreMock,
}));
jest.mock('../serviceAccountKey.json', () => ({}), { virtual: true });

// Prevent process.exit from killing Jest
beforeAll(() => {
  jest.spyOn(process, 'exit').mockImplementation(() => {});
});

afterAll(() => {
  process.exit.mockRestore();
});

describe('downgradeExpiredPremiums script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('downgrades users whose premium has expired', async () => {
    // Mock Firestore query snapshot
    const expiredUser = {
      id: 'user1',
      data: () => ({
        isPremium: true,
        premiumExpires: { seconds: Math.floor(Date.now() / 1000) - 1000 },
      }),
      ref: {
        update: jest.fn(),
      },
    };
    const notExpiredUser = {
      id: 'user2',
      data: () => ({
        isPremium: true,
        premiumExpires: { seconds: Math.floor(Date.now() / 1000) + 1000 },
      }),
      ref: {
        update: jest.fn(),
      },
    };
    const getMock = jest.fn(() =>
      Promise.resolve({
        docs: [expiredUser, notExpiredUser],
        forEach: (cb) => {
          cb(expiredUser);
          cb(notExpiredUser);
        },
      })
    );

    // Patch the Firestore mock to use our getMock for this test
    collectionMock.mockReturnValue(makeWhereChain(getMock));

    // Import and run the script
    const script = require('../downgradeExpiredPremiums');
    await script.main?.();

    // Only expiredUser should be downgraded
    expect(expiredUser.ref.update).toHaveBeenCalledWith({
      isPremium: false,
    });
    expect(notExpiredUser.ref.update).not.toHaveBeenCalled();
  });
});