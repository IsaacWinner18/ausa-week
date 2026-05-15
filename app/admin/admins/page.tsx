import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { ApprovalButtons } from "@/components/admin/approval-buttons";
import { getCurrentAdminUser } from "@/lib/admin";
import { redirect } from "next/navigation";

export default async function AdminManagementPage() {
  const currentUser = await getCurrentAdminUser();
  if (
    !currentUser ||
    !currentUser.isAdmin ||
    currentUser.adminStatus !== "approved"
  ) {
    redirect("/admin/login");
  }

  await connectToDatabase();
  const admins = await UserModel.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Admin Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Approve or manage administrative access.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Admin</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Requested</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {admins.map((admin: any) => (
                <tr
                  key={admin._id.toString()}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {admin.name || "Unnamed Admin"}
                      </p>
                      <p className="text-xs text-slate-500">{admin.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.adminStatus === "approved"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {admin.adminStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {admin.adminStatus === "pending" && (
                      <ApprovalButtons userId={admin._id.toString()} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
