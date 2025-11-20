'use client';
import { useEffect, useState } from "react";
import AdminAuthGuard from "../../../components/AdminAuthGuard";
import AdminHeader from "../../../components/AdminHeader";
import AdminFooter from "../../../components/AdminFooter";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      const q = query(collection(db, "payments"), orderBy("paid_at", "desc"));
      const snap = await getDocs(q);
      setPayments(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
      setLoading(false);
    }
    fetchPayments();
  }, []);

  // Filter by reference, email, or user ID
  const filteredPayments = payments.filter(
    p =>
      (p.reference && p.reference.toLowerCase().includes(search.toLowerCase())) ||
      (p.uid && p.uid.toLowerCase().includes(search.toLowerCase())) ||
      (p.raw?.customer?.email && p.raw.customer.email.toLowerCase().includes(search.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Export Payments as CSV
  function exportPaymentsCSV() {
    const headers = [
      "Reference",
      "User ID",
      "Email",
      "Amount",
      "Currency",
      "Status",
      "Channel",
      "Paid At",
      "Receipt",
      "Fees"
    ];
    const rows = filteredPayments.map(p => [
      p.reference || "",
      p.uid || "",
      p.raw?.customer?.email || p.email || "",
      p.amount
        ? `KES ${p.amount}`
        : p.requested_amount
        ? `KES ${p.requested_amount}`
        : "",
      p.currency || "",
      p.status || "",
      p.channel || p.authorization?.brand || p.bank || "",
      p.paid_at?.toDate
        ? p.paid_at.toDate().toLocaleString()
        : p.paid_at
        ? new Date(p.paid_at).toLocaleString()
        : p.paidAt
        ? new Date(p.paidAt).toLocaleString()
        : p.createdAt?.toDate
        ? p.createdAt.toDate().toLocaleString()
        : p.createdAt
        ? new Date(p.createdAt).toLocaleString()
        : "",
      // Defensive: check top-level, raw, and raw.data for receipt_number
      p.receipt_number ||
        p.raw?.receipt_number ||
        p.raw?.data?.receipt_number ||
        "-",
      // Defensive: check top-level, raw, and raw.data for fees (divide by 100 if number)
      typeof p.fees === "number"
        ? `KES ${(p.fees / 100).toFixed(2)}`
        : typeof p.raw?.fees === "number"
        ? `KES ${(p.raw.fees / 100).toFixed(2)}`
        : typeof p.raw?.data?.fees === "number"
        ? `KES ${(p.raw.data.fees / 100).toFixed(2)}`
        : ""
    ]);
    const csvContent =
      [headers, ...rows].map(e => e.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen flex flex-col bg-[#181818] pt-20">
        <AdminHeader />
        <main className="flex-1 max-w-6xl mx-auto py-6 px-2 sm:py-12 sm:px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Payments & Subscriptions</h1>
          <div className="mb-4 sm:mb-6">
            <input
              type="text"
              placeholder="Search by reference, email, or user ID"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-96 px-4 py-2 rounded bg-[#232323] text-white border border-gray-700"
            />
          </div>
          <div className="rounded-lg shadow">
            <table className="w-full bg-[#232323] text-white text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left">Reference</th>
                  <th className="px-2 sm:px-4 py-2 text-left">User ID</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Email</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Amount</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Currency</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Status</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Channel</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Paid At</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Receipt</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Fees</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8">
                      <span className="animate-pulse">Loading payments...</span>
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(payment => (
                    <tr key={payment.id} className="border-t border-gray-700">
                      <td className="px-2 sm:px-4 py-2">{payment.reference || "-"}</td>
                      <td className="px-2 sm:px-4 py-2">{payment.uid || "-"}</td>
                      <td className="px-2 sm:px-4 py-2">
                        {payment.raw?.customer?.email || payment.email || "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        {payment.amount
                          ? `KES ${payment.amount}`
                          : payment.requested_amount
                          ? `KES ${payment.requested_amount}`
                          : "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2">{payment.currency || "-"}</td>
                      <td className="px-2 sm:px-4 py-2">
                        {payment.status === "success" ? (
                          <span className="text-green-400 font-semibold">Success</span>
                        ) : (
                          <span className="text-red-400 font-semibold">{payment.status || "Failed"}</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-2">{payment.channel || payment.authorization?.brand || payment.bank || "-"}</td>
                      <td className="px-2 sm:px-4 py-2">
                        {payment.paid_at?.toDate
                          ? payment.paid_at.toDate().toLocaleString()
                          : payment.paid_at
                          ? new Date(payment.paid_at).toLocaleString()
                          : payment.paidAt
                          ? new Date(payment.paidAt).toLocaleString()
                          : payment.createdAt?.toDate
                          ? payment.createdAt.toDate().toLocaleString()
                          : payment.createdAt
                          ? new Date(payment.createdAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        {payment.receipt_number ||
                          payment.raw?.receipt_number ||
                          payment.raw?.data?.receipt_number ||
                          "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        {typeof payment.fees === "number"
                          ? `KES ${(payment.fees / 100).toFixed(2)}`
                          : typeof payment.raw?.fees === "number"
                          ? `KES ${(payment.raw.fees / 100).toFixed(2)}`
                          : typeof payment.raw?.data?.fees === "number"
                          ? `KES ${(payment.raw.data.fees / 100).toFixed(2)}`
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Export Payments Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={exportPaymentsCSV}
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm"
            >
              Export Payments (CSV)
            </button>
          </div>
        </main>
        <AdminFooter />
      </div>
    </AdminAuthGuard>
  );
}