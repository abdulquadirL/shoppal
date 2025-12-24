
import { redirect } from "next/navigation";
import OrdersTable from "./OrdersTable";
import StatsCards from "./StatsCards";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <StatsCards />

      <OrdersTable />
    </div>
  );
}
