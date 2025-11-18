import AdminAuthGuard from "../../../components/AdminAuthGuard";

export default function AdminLogsPage() {
  return (
    <AdminAuthGuard>
      <div>
        <h1>Logs & Monitoring</h1>
        {/* 
          TODO:
          - View Stripe webhook logs
          - View M-Pesa callback logs
          - Show errors from failed payments or recipe uploads
          - Filter/search logs
          - Export logs (CSV)
        */}
        <p>This is where you can view and monitor system logs.</p>
      </div>
    </AdminAuthGuard>
  );
}