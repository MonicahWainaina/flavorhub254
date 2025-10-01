import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DownloadAudioButton from "../DownloadAudioButton";

// Mock AuthContext.Provider for tests
jest.mock('@/context/AuthContext', () => {
  const React = require('react');
  return {
    AuthContext: {
      Provider: ({ value, children }) => <div>{children}</div>,
    },
  };
});

import { AuthContext } from "@/context/AuthContext";

const recipe = { audio: { mp3_url: "https://example.com/audio.mp3" }, title: "Test" };

function renderWithAuth(user) {
  return render(
    <AuthContext.Provider value={{ user }}>
      <DownloadAudioButton recipe={recipe} />
    </AuthContext.Provider>
  );
}

describe("DownloadAudioButton Premium Gating", () => {
  it("always shows download button if audio exists", () => {
    renderWithAuth(null);
    expect(screen.getByRole("button", { name: /download audio/i })).toBeInTheDocument();
  });

  it("shows toast for guests on click", () => {
    const { getByRole } = renderWithAuth(null);
    fireEvent.click(getByRole("button", { name: /download audio/i }));
    const { toast } = require('react-toastify');
    expect(toast.info).toHaveBeenCalledWith(
      expect.stringMatching(/please log in and upgrade to premium/i)
    );
  });

  it("shows toast for non-premium users on click", () => {
    const { getByRole } = renderWithAuth({ uid: "user1", isPremium: false });
    fireEvent.click(getByRole("button", { name: /download audio/i }));
    const { toast } = require('react-toastify');
    expect(toast.info).toHaveBeenCalledWith(
      expect.stringMatching(/upgrade to premium/i)
    );
  });

  it("allows premium users to download", () => {
    renderWithAuth({ uid: "user2", isPremium: true });
    expect(screen.getByRole("button", { name: /download audio/i })).toBeInTheDocument();
    // You could mock fetch and test download logic if desired
  });
});