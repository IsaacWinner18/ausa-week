import { connectToDatabase } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import { CreateCategoryForm } from "@/components/admin/create-category-form";
import { CreateCategoryModal } from "@/components/admin/create-category-modal";
import { CategoryActions } from "@/components/admin/category-actions";
import { getCurrentAdminUser } from "@/lib/admin";
import { redirect } from "next/navigation";

export default async function AdminCategoriesPage() {
  const currentUser = await getCurrentAdminUser();
  if (
    !currentUser ||
    !currentUser.isAdmin ||
    currentUser.adminStatus !== "approved"
  ) {
    redirect("/admin/login");
  }

  await connectToDatabase();
  const categories = await CategoryModel.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Categories
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage voting categories and slugs.
          </p>
        </div>
        <div className="lg:hidden">
          <CreateCategoryModal />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-8 items-start">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Slug</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {categories.map((category: any) => (
                  <tr
                    key={category._id.toString()}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
                  >
                    <td className="px-6 py-4">
                      {category.isActive ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {category.name}
                    </td>
                    <td className="px-6 py-4">
                      <code className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <CategoryActions
                        category={{
                          id: category._id.toString(),
                          name: category.name,
                          description: category.description ?? "",
                          isActive: category.isActive,
                        }}
                      />
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                    >
                      No categories found. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="hidden lg:block sticky top-8">
          <CreateCategoryForm />
        </aside>
      </div>
    </div>
  );
}
