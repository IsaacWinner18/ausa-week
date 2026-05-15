import { connectToDatabase } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import { ParticipantModel } from "@/models/Participant";
import { CreateParticipantForm } from "@/components/admin/create-participant-form";
import { CreateParticipantModal } from "@/components/admin/create-participant-modal";
import { ParticipantActions } from "@/components/admin/participant-actions";
import { getCurrentAdminUser } from "@/lib/admin";
import { redirect } from "next/navigation";

export default async function AdminParticipantsPage() {
  const currentUser = await getCurrentAdminUser();
  if (
    !currentUser ||
    !currentUser.isAdmin ||
    currentUser.adminStatus !== "approved"
  ) {
    redirect("/admin/login");
  }

  await connectToDatabase();
  const [categories, participants] = await Promise.all([
    CategoryModel.find().sort({ createdAt: -1 }).lean(),
    ParticipantModel.find().sort({ createdAt: -1 }).lean(),
  ]);

  const categoryOptions = categories.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Participants
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage contestants and their categories.
          </p>
        </div>
        <div className="lg:hidden">
          <CreateParticipantModal categories={categoryOptions} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Categories</th>
                  <th className="px-6 py-4 font-semibold text-right">Votes</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {participants.map((participant: any) => (
                  <tr
                    key={participant._id.toString()}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
                  >
                    <td className="px-6 py-4">
                      {participant.isActive ? (
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {participant.imageUrl && (
                          <img
                            src={participant.imageUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        )}
                        <span className="font-medium text-slate-900 dark:text-white">
                          {participant.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {participant.categoryIds.map((catId: any) => {
                          const category = categories.find(
                            (c: any) => c._id.toString() === catId.toString(),
                          );
                          return (
                            <span
                              key={catId.toString()}
                              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                            >
                              {category?.slug || "unknown"}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">
                      {participant.totalVotes || 0}
                    </td>
                    <td className="px-6 py-4">
                      <ParticipantActions
                        participant={{
                          id: participant._id.toString(),
                          name: participant.name,
                          bio: participant.bio || "",
                          imageUrl: participant.imageUrl || "",
                          isActive: participant.isActive,
                          categorySlugs: participant.categoryIds.map((catId: any) => {
                            const category = categories.find(
                              (c: any) => c._id.toString() === catId.toString(),
                            );
                            return category?.slug || "";
                          }).filter(Boolean),
                        }}
                        categories={categoryOptions}
                      />
                    </td>
                  </tr>
                ))}
                {participants.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                    >
                      No participants found. Add some contestants to get
                      started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="hidden lg:block sticky top-8">
          <CreateParticipantForm categories={categoryOptions} />
        </aside>
      </div>
    </div>
  );
}
