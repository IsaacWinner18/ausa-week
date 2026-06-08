import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { getAdminDashboardData, getCurrentAdminUser } from "@/lib/admin";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminPage() {
  const currentUser = await getCurrentAdminUser();

  if (!currentUser) {
    redirect("/admin/login");
  }

  const adminUser = currentUser;

  if (!adminUser.isAdmin || adminUser.adminStatus !== "approved") {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center shadow-xl">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Access Pending
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Your admin account is waiting for approval. Please contact a super
            administrator to grant you access.
          </p>
          <div className="flex flex-col gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 break-all">
              Email: {adminUser.email}
            </div>
          </div>
        </div>
      </div>
    );
  }

  await connectToDatabase();
  const dashboardData = await getAdminDashboardData();

  const statCards = [
    {
      label: "Total Revenue",
      value: formatNaira(dashboardData.stats.totalRevenue),
      color: "blue",
    },
    {
      label: "Votes Sold",
      value: dashboardData.stats.totalVotesSold.toLocaleString(),
      color: "emerald",
    },
    {
      label: "Categories",
      value: dashboardData.stats.totalCategories.toString(),
      color: "indigo",
    },
    {
      label: "Participants",
      value: dashboardData.stats.totalParticipants.toString(),
      color: "violet",
    },
    {
      label: "Approved Admins",
      value: dashboardData.stats.totalAdmins.toString(),
      color: "sky",
    },
    {
      label: "Pending Requests",
      value: dashboardData.stats.pendingAdmins.toString(),
      color: "amber",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-10 max-w-full overflow-hidden">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
          Dashboard Overview
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
          Welcome back, {adminUser.name || adminUser.email}.
        </p>
      </header>

      {/* Stats Grid */}
      <section className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition group"
          >
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 group-hover:text-blue-600 transition">
              {card.label}
            </p>
            <p className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white break-words">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      {/* Recent Activity */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
            Recent Transactions
          </h2>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition whitespace-nowrap">
            View All
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Reference</th>
                  <th className="px-6 py-4 font-semibold">Voter</th>
                  <th className="px-6 py-4 font-semibold">Participant</th>
                  <th className="px-6 py-4 font-semibold">Votes</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {dashboardData.recentPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {payment.reference}
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white">
                      {payment.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {payment.participant?.name || "-"}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-tighter">
                          {payment.category?.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {payment.voteCount}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatNaira(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          payment.status === "success"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : payment.status === "pending" ||
                                payment.status === "initialized"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {dashboardData.recentPayments.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic"
                    >
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
