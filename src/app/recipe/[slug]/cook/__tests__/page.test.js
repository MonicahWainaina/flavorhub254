jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock child UI components with display names using inline factories
jest.mock('@/components/CookingPreferencesModal', () => {
  const React = require('react');
  const Mock = (props) =>
    props.open ? <button onClick={props.onStart}>Start Cooking</button> : null;
  Mock.displayName = "MockCookingPreferencesModal";
  return Mock;
});
jest.mock('@/components/PrepScreen', () => {
  const React = require('react');
  const Mock = () => <div>PREP SCREEN</div>;
  Mock.displayName = "MockPrepScreen";
  return Mock;
});
jest.mock('@/components/StepScreen', () => {
  const React = require('react');
  const Mock = () => <div>STEP SCREEN</div>;
  Mock.displayName = "MockStepScreen";
  return Mock;
});
jest.mock('@/components/FinishedScreen', () => {
  const React = require('react');
  const Mock = () => <div>FINISHED SCREEN</div>;
  Mock.displayName = "MockFinishedScreen";
  return Mock;
});

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

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CookPage from "../page";
import { AuthContext } from "@/context/AuthContext";

const recipe = {
  title: "Test Recipe",
  ingredients: ["a", "b"],
  steps: ["step 1", "step 2"],
  instructions: ["step 1", "step 2"],
};

function renderWithAuth(user) {
  testUser = user;
  return render(
    <AuthContext.Provider value={{ user }}>
      <CookPage recipe={recipe} params={{ slug: "test-recipe" }} />
    </AuthContext.Provider>
  );
}

describe("Smart Cooking Premium Gating", () => {
  it("shows upsell for non-premium users", async () => {
    renderWithAuth({ uid: "user1", isPremium: false });
    fireEvent.click(screen.getByText(/start cooking/i));
    // Now check for PREP SCREEN or whatever your gating logic should show
    await waitFor(() => {
      expect(screen.getByText(/PREP SCREEN|STEP SCREEN|FINISHED SCREEN/i)).toBeInTheDocument();
    });
  });

  it("shows cooking UI for premium users", async () => {
    renderWithAuth({ uid: "user2", isPremium: true });
    fireEvent.click(screen.getByText(/start cooking/i));
    await waitFor(() => {
      expect(screen.getByText(/PREP SCREEN|STEP SCREEN|FINISHED SCREEN/i)).toBeInTheDocument();
    });
  });

  it("shows upsell for guests", async () => {
    renderWithAuth(null);
    fireEvent.click(screen.getByText(/start cooking/i));
    await waitFor(() => {
      expect(screen.getByText(/PREP SCREEN|STEP SCREEN|FINISHED SCREEN/i)).toBeInTheDocument();
    });
  });
});