jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/', 
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import FlavorBotPage from "../page";

// --- Mock AuthContext ---
let testUser = null;
jest.mock('@/context/AuthContext', () => {
  const React = require('react');
  return {
    AuthContext: {
      Provider: ({ value, children }) => <div>{children}</div>,
    },
    useAuth: () => ({ user: testUser }),
  };
});

import { AuthContext } from "@/context/AuthContext";

// Helper to render with auth context and set global user for Firestore mock
function renderWithAuth(user) {
  global.__TEST_USER__ = user;
  testUser = user;
  return render(
    <AuthContext.Provider value={{ user }}>
      <FlavorBotPage />
    </AuthContext.Provider>
  );
}

describe("Chat History Privacy", () => {
  it("shows no chat history for guests", async () => {
    renderWithAuth(null);
    // Wait for the UI to settle (e.g., "Loading..." disappears)
    // and check that no chat message is shown
    expect(screen.queryByText(/hello from/i)).not.toBeInTheDocument();
  });

  it("shows only logged-in user's chat history", async () => {
    renderWithAuth({ uid: "user1" });

    // Simulate clicking "+ New Chat" to start a session
    const newChatBtn = await screen.findByRole('button', { name: /\+ new chat/i });
    await userEvent.click(newChatBtn);

    // Find all elements with the message text
    const allMsgs = await screen.findAllByText(/hello from user1/i, {}, { timeout: 2000 });

    // At least one should be in the chat area (aria-label="Your message")
    const chatMsg = allMsgs.find(
      (el) => el.getAttribute('aria-label') === 'Your message'
    );
    expect(chatMsg).toBeInTheDocument();

    expect(screen.queryByText(/hello from user2/i)).not.toBeInTheDocument();
  });
});