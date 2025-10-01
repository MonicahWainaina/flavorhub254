require('whatwg-fetch');
require('@testing-library/jest-dom');

// Polyfill TextEncoder/TextDecoder for Node.js (for jsPDF, etc.)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Firebase everywhere
jest.mock('./src/lib/firebase', () => ({
  db: {},
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/firestore', () => {
  let testUser = null;
  let testSessions = [];
  let testMessages = [];

  // Allow test files to set these globals
  global.__TEST_USER__ = null;
  global.__TEST_SESSIONS__ = [];
  global.__TEST_MESSAGES__ = [];

  return {
    getDoc: jest.fn((ref) => {
      // Simulate messages for the current session
      if (global.__TEST_USER__?.uid === "user1") {
        return Promise.resolve({
          exists: () => true,
          data: () => ({
            messages: [{ role: "user", content: "Hello from user1" }],
          }),
        });
      }
      return Promise.resolve({
        exists: () => false,
        data: () => ({}),
      });
    }),
    setDoc: jest.fn(),
    doc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    onSnapshot: jest.fn((q, cb) => {
      // Simulate sessions for user1
      if (global.__TEST_USER__?.uid === "user1") {
        cb({
          forEach: (fn) => {
            fn({
              id: "session1",
              data: () => ({
                createdAt: { toDate: () => new Date() },
                messages: [{ role: "user", content: "Hello from user1" }],
              }),
            });
          },
        });
      } else {
        cb({
          forEach: () => {},
        });
      }
      return () => {}; // unsubscribe function
    }),
    getDocs: jest.fn(() =>
      Promise.resolve({
        empty: false,
        size: 1,
        docs: [
          {
            data: () => ({
              instructions: ["step 1", "step 2"],
              steps: ["step 1", "step 2"],
              title: "Test Recipe",
              ingredients: ["a", "b"],
            }),
          },
        ],
      })
    ),
  };
});

// Optionally, mock react-toastify globally
jest.mock('react-toastify', () => ({
  toast: { error: jest.fn(), info: jest.fn() }
}));