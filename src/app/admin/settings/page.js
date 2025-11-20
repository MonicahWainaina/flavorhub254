'use client';

import { useEffect, useState } from "react";
import AdminAuthGuard from "../../../components/AdminAuthGuard";
import AdminHeader from "../../../components/AdminHeader";
import AdminFooter from "../../../components/AdminFooter";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const SETTINGS_DOC = "global";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    pdfEnabled: true,
    smartCookingEnabled: true,
    ttsEnabled: true,
    announcement: "",
    allowedDomains: "",
    premiumPrice: "",
    verboseLogging: false,
    analyticsKey: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Load settings from Firestore
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const docRef = doc(db, "admin_settings", SETTINGS_DOC);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setSettings({ ...settings, ...snap.data() });
        }
      } catch (err) {
        // Optionally handle error
      }
      setLoading(false);
    }
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  // Save settings to Firestore
  async function handleSave() {
    setSaving(true);
    setSaveMsg("");
    try {
      const docRef = doc(db, "admin_settings", SETTINGS_DOC);
      await setDoc(docRef, settings, { merge: true });
      setSaveMsg("Settings saved!");
    } catch (err) {
      setSaveMsg("Error saving settings.");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 2000);
  }

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    setSettings(s => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen flex flex-col bg-[#181818] pt-20">
        <AdminHeader />
        <main className="flex-1 max-w-2xl mx-auto w-full py-6 px-2 sm:py-12 sm:px-4">
          <div className="bg-[#232323] rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Admin Settings</h1>
            {loading ? (
              <div className="text-gray-400">Loading settings...</div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSave();
                }}
                className="space-y-6"
              >
                {/* Feature Toggles */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-2">Feature Toggles</h2>
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      name="pdfEnabled"
                      checked={settings.pdfEnabled}
                      onChange={handleChange}
                    />
                    Enable PDF Download (browser)
                  </label>
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      name="smartCookingEnabled"
                      checked={settings.smartCookingEnabled}
                      onChange={handleChange}
                    />
                    Enable Smart Cooking (browser)
                  </label>
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      name="ttsEnabled"
                      checked={settings.ttsEnabled}
                      onChange={handleChange}
                    />
                    Enable Audio Instructions (TTS)
                  </label>
                </section>

                {/* Announcements */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-2">Announcement</h2>
                  <input
                    type="text"
                    name="announcement"
                    value={settings.announcement}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                    placeholder="Site-wide announcement (shown to all users)"
                  />
                </section>

                {/* Access Controls */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-2">Access Controls</h2>
                  <input
                    type="text"
                    name="allowedDomains"
                    value={settings.allowedDomains}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                    placeholder="Allowed email domains (comma separated, optional)"
                  />
                </section>

                {/* Payment Controls */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-2">Payment Controls</h2>
                  <input
                    type="number"
                    name="premiumPrice"
                    value={settings.premiumPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                    placeholder="Premium price (KES)"
                    min={0}
                  />
                </section>

                {/* Security & Logging */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-2">Security & Logging</h2>
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      name="verboseLogging"
                      checked={settings.verboseLogging}
                      onChange={handleChange}
                    />
                    Enable Verbose Logging
                  </label>
                </section>

                {/* Integrations */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-2">Integrations</h2>
                  <input
                    type="text"
                    name="analyticsKey"
                    value={settings.analyticsKey}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-[#181818] border border-gray-700 text-white"
                    placeholder="Analytics API Key (optional)"
                  />
                </section>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm"
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </button>
                  {saveMsg && (
                    <span className="text-sm text-green-400">{saveMsg}</span>
                  )}
                </div>
              </form>
            )}

            {/* Read-only Info */}
            <div className="mt-8 text-gray-400 text-xs">
              <div>PDF: {settings.pdfEnabled ? "Enabled" : "Disabled"} (browser)</div>
              <div>Audio: {settings.ttsEnabled ? "Enabled" : "Disabled"} (backend)</div>
              <div>Smart Cooking: {settings.smartCookingEnabled ? "Enabled" : "Disabled"} (browser)</div>
              <div>Premium price: {settings.premiumPrice ? `KES ${settings.premiumPrice}` : "Not set"}</div>
              <div>Allowed domains: {settings.allowedDomains || "Any"}</div>
              <div>Verbose logging: {settings.verboseLogging ? "On" : "Off"}</div>
              <div>Analytics Key: {settings.analyticsKey ? "Set" : "Not set"}</div>
            </div>
          </div>
        </main>
        <AdminFooter />
      </div>
    </AdminAuthGuard>
  );
}