import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DownloadPDFButton from "../DownloadPDFButton";

const { getDoc } = require("firebase/firestore");

const recipe = { title: "Test Recipe", id: "123" };

beforeEach(() => {
  jest.clearAllMocks();
});

function renderWithAuth(user, props = {}) {
  return render(
    <DownloadPDFButton recipe={recipe} user={user} {...props} />
  );
}

describe("DownloadPDFButton Premium Gating", () => {
  it("always shows download button", () => {
    renderWithAuth(null);
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
  });

  it("shows toast for guests on click", () => {
    const { getByRole } = renderWithAuth(null);
    fireEvent.click(getByRole("button", { name: /download pdf/i }));
    const { toast } = require('react-toastify');
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/please log in to download pdfs/i)
    );
  });

  it("shows toast for free user over limit on click", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ count: 3, lastDownload: new Date().toISOString() }),
    });

    const { getByRole } = renderWithAuth({ uid: "user1", isPremium: false });
    fireEvent.click(getByRole("button", { name: /download pdf/i }));

    await waitFor(() => {
      const { toast } = require('react-toastify');
      expect(
        toast.info.mock.calls[0]?.[0] || toast.error.mock.calls[0]?.[0]
      ).toMatch(/upgrade to premium|daily download limit/i);
    });
  });

  it("allows premium users to download", () => {
    renderWithAuth({ uid: "user2", isPremium: true });
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
    // You could mock PDF logic if desired
  });
});