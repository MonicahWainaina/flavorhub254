import AdminAuthGuard from "../../../components/AdminAuthGuard";

export default function AdminPaymentsPage() {
  return (
    <AdminAuthGuard>
      <div>
        <h1>Payments & Subscriptions</h1>
        {/* 
          TODO:
          - List all payments and subscriptions
          - Show payment method (M-Pesa/Stripe), amount, date, reference ID
          - Filter by premium status
          - Export payment logs (CSV)
          - Manually override user premium status if needed
        */}
        <p>This is where you can monitor and manage payments.</p>
      </div>
    </AdminAuthGuard>
  );
}