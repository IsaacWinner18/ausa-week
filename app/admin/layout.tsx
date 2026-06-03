import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/admin";
import { AdminSidebar, MobileNav } from "@/components/admin/nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentAdminUser();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {currentUser &&
      currentUser.isAdmin &&
      currentUser.adminStatus === "approved" ? (
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <AdminSidebar
            user={currentUser}
            className="fixed inset-y-0 left-0 w-64 hidden md:flex shadow-xl"
          />

          {/* Mobile Nav */}
          <MobileNav user={currentUser} />

          {/* Main Content */}
          <main className="flex-1 min-w-0 md:ml-64 p-4 md:p-8">{children}</main>
        </div>
      ) : (
        <>{children}</>
      )}
    </div>
  );
}
