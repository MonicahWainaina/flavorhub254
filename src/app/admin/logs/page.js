'use client';

import { useEffect, useState } from "react";
import AdminAuthGuard from "../../../components/AdminAuthGuard";
import AdminHeader from "../../../components/AdminHeader";
import AdminFooter from "../../../components/AdminFooter";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";

const PAGE_SIZE = 50;

const LOG_TYPES = [
  { label: "FlavorBot Logs", value: "flavorbot_logs" },
  { label: "TTS Usage Logs", value: "tts_usage_logs" },
  { label: "Paystack Webhook Logs", value: "paystack_webhook_logs" },
  { label: "Error Logs", value: "error_logs" },
];

export default function AdminLogsPage() {
  const [logType, setLogType] = useState(LOG_TYPES[0].value);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [firstDoc, setFirstDoc] = useState(null);
  const [pageStack, setPageStack] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    // Reset pagination when log type changes
    setPageStack([]);
    fetchLogs("next", null, logType);
    // eslint-disable-next-line
  }, [logType]);

  async function fetchLogs(direction = "next", refDoc = null, collectionName = logType) {
    setLoading(true);
    let q = query(
      collection(db, collectionName),
      orderBy("timestamp", "desc"),
      limit(PAGE_SIZE)
    );
    if (direction === "next" && refDoc) {
      q = query(
        collection(db, collectionName),
        orderBy("timestamp", "desc"),
        startAfter(refDoc),
        limit(PAGE_SIZE)
      );
    }
    const snap = await getDocs(q);
    setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setFirstDoc(snap.docs[0] || null);
    setLastDoc(snap.docs[snap.docs.length - 1] || null);

    // Check if there is a next page
    if (snap.docs.length === PAGE_SIZE) {
      const nextQ = query(
        collection(db, collectionName),
        orderBy("timestamp", "desc"),
        startAfter(snap.docs[snap.docs.length - 1]),
        limit(1)
      );
      const nextSnap = await getDocs(nextQ);
      setHasNext(!nextSnap.empty);
    } else {
      setHasNext(false);
    }
    setHasPrev(pageStack.length > 0);
    setLoading(false);
  }

  function handleNextPage() {
    setPageStack(stack => [...stack, firstDoc]);
    fetchLogs("next", lastDoc, logType);
  }

  function handlePrevPage() {
    const prevStack = [...pageStack];
    const prevDoc = prevStack.pop();
    setPageStack(prevStack);
    fetchLogs("next", prevDoc, logType);
  }

  // Render table headers and rows based on log type
  function renderTable() {
    if (logType === "flavorbot_logs") {
      return (
        <table className="w-full text-white text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="px-2 sm:px-4 py-2 text-left">Timestamp</th>
              <th className="px-2 sm:px-4 py-2 text-left">Prompt</th>
              <th className="px-2 sm:px-4 py-2 text-left">Prompt Type</th>
              <th className="px-2 sm:px-4 py-2 text-left">User Type</th>
              <th className="px-2 sm:px-4 py-2 text-left">Blocked</th>
              <th className="px-2 sm:px-4 py-2 text-left">UID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <span className="animate-pulse">Loading logs...</span>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  No logs found.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-t border-gray-700">
                  <td className="px-2 sm:px-4 py-2">
                    {log.timestamp?.toDate
                      ? log.timestamp.toDate().toLocaleString()
                      : log.timestamp
                      ? new Date(log.timestamp).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-2 sm:px-4 py-2">{log.prompt || "-"}</td>
                  <td className="px-2 sm:px-4 py-2">{log.promptType || "-"}</td>
                  <td className="px-2 sm:px-4 py-2">{log.userType || "-"}</td>
                  <td className="px-2 sm:px-4 py-2">
                    {log.blocked === true ? (
                      <span className="text-red-400 font-semibold">Yes</span>
                    ) : (
                      <span className="text-green-400 font-semibold">No</span>
                    )}
                  </td>
                  <td className="px-2 sm:px-4 py-2">{log.uid || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }
    if (logType === "tts_usage_logs") {
      return (
        <table className="w-full text-white text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="px-2 sm:px-4 py-2 text-left">Timestamp</th>
              <th className="px-2 sm:px-4 py-2 text-left">Recipe Slug</th>
              <th className="px-2 sm:px-4 py-2 text-left">Text</th>
              <th className="px-2 sm:px-4 py-2 text-left">User ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  <span className="animate-pulse">Loading logs...</span>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  No logs found.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-t border-gray-700">
                  <td className="px-2 sm:px-4 py-2">
                    {log.timestamp?.toDate
                      ? log.timestamp.toDate().toLocaleString()
                      : log.timestamp
                      ? new Date(log.timestamp).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-2 sm:px-4 py-2">{log.recipeSlug || "-"}</td>
                  <td className="px-2 sm:px-4 py-2">
                    {log.text
                      ? log.text.length > 60
                        ? log.text.slice(0, 60) + "…"
                        : log.text
                      : "-"}
                  </td>
                  <td className="px-2 sm:px-4 py-2">{log.userId || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }
    if (logType === "paystack_webhook_logs") {
      return (
        <table className="w-full text-white text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="px-2 sm:px-4 py-2 text-left">Timestamp</th>
              <th className="px-2 sm:px-4 py-2 text-left">Event</th>
              <th className="px-2 sm:px-4 py-2 text-left">Reference</th>
              <th className="px-2 sm:px-4 py-2 text-left">Status</th>
              <th className="px-2 sm:px-4 py-2 text-left">User ID</th>
              <th className="px-2 sm:px-4 py-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <span className="animate-pulse">Loading logs...</span>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  No logs found.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-t border-gray-700">
                  <td className="px-2 sm:px-4 py-2">
                    {log.timestamp?.toDate
                      ? log.timestamp.toDate().toLocaleString()
                      : log.timestamp
                      ? new Date(log.timestamp).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-2 sm:px-4 py-2">{log.event || "-"}</td>
                  <td className="px-2 sm:px-4 py-2">{log.reference || "-"}</td>
                  <td className="px-2 sm:px-4 py-2">{log.status || "-"}</td>
                  <td className="px-2 sm:px-4 py-2">{log.userId || "-"}</td>
                  <td className="px-2 sm:px-4 py-2">
                    <button
                      onClick={() => alert(JSON.stringify(log.raw, null, 2))}
                      className="text-blue-400 underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }
    if (logType === "error_logs") {
      return (
        <table className="w-full text-white text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="px-2 sm:px-4 py-2 text-left">Timestamp</th>
              <th className="px-2 sm:px-4 py-2 text-left">Error</th>
              <th className="px-2 sm:px-4 py-2 text-left">Message</th>
              <th className="px-2 sm:px-4 py-2 text-left">User ID</th>
              <th className="px-2 sm:px-4 py-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <span className="animate-pulse">Loading logs...</span>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  No logs found.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-t border-gray-700">
                  <td className="px-2 sm:px-4 py-2">
                    {log.timestamp?.toDate
                      ? log.timestamp.toDate().toLocaleString()
                      : log.timestamp
                      ? new Date(log.timestamp).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-2 sm:px-4 py-2">{log.error || "-"}</td>
                  <td className="px-2 sm:px-4 py-2">
                    {log.message
                      ? log.message.length > 60
                        ? log.message.slice(0, 60) + "…"
                        : log.message
                      : "-"}
                  </td>
                  <td className="px-2 sm:px-4 py-2">{log.userId || "-"}</td>
                  <td className="px-2 sm:px-4 py-2">
                    <button
                      onClick={() => alert(JSON.stringify(log.details || log, null, 2))}
                      className="text-blue-400 underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }
    return null;
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen flex flex-col bg-[#181818] pt-20">
        <AdminHeader />
        <main className="flex-1 max-w-6xl mx-auto py-6 px-2 sm:py-12 sm:px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Logs & Monitoring</h1>
          <div className="mb-4">
            <label className="text-white mr-2 font-semibold">Log Type:</label>
            <select
              value={logType}
              onChange={e => setLogType(e.target.value)}
              className="bg-[#232323] text-white border border-gray-700 rounded px-3 py-2"
            >
              {LOG_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-lg shadow bg-[#232323]">
            {renderTable()}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrevPage}
              disabled={!hasPrev}
              className={`px-4 py-2 rounded text-sm ${
                hasPrev
                  ? "bg-blue-700 hover:bg-blue-800 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!hasNext}
              className={`px-4 py-2 rounded text-sm ${
                hasNext
                  ? "bg-blue-700 hover:bg-blue-800 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </main>
        <AdminFooter />
      </div>
    </AdminAuthGuard>
  );
}