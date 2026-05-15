import { approveAdminAction, rejectAdminAction } from "@/app/admin/actions";

type Props = {
  userId: string;
};

export function ApprovalButtons({ userId }: Props) {
  const approveAction = approveAdminAction.bind(null, userId);
  const rejectAction = rejectAdminAction.bind(null, userId);

  return (
    <div className="flex items-center justify-end gap-2">
      <form action={approveAction}>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm shadow-emerald-500/20 transition hover:bg-emerald-700 hover:shadow-emerald-500/30"
        >
          Approve
        </button>
      </form>
      <form action={rejectAction}>
        <button
          type="submit"
          className="rounded-lg bg-rose-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm shadow-rose-500/20 transition hover:bg-rose-700 hover:shadow-rose-500/30"
        >
          Reject
        </button>
      </form>
    </div>
  );
}
