"use client";

import { useState } from "react";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EditCategoryFormProps {
  category: {
    id: string;
    name: string;
    description: string;
  };
  onSuccess?: () => void;
}

export function EditCategoryForm({
  category,
  onSuccess,
}: EditCategoryFormProps) {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setMessage("");
    setIsSuccess(false);
    setIsPending(true);

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast.success("Category updated successfully.");
        router.refresh();
        if (onSuccess) {
          setTimeout(onSuccess, 1000);
        }
      } else {
        toast.error(data.message || "Failed to update category.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6 p-6">
      <div className="space-y-6">
        <fieldset disabled={isPending} className="space-y-6">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Category Name
            </span>
            <input
              name="name"
              required
              defaultValue={category.name}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g. Best Student"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Description
            </span>
            <textarea
              name="description"
              rows={4}
              defaultValue={category.description}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              placeholder="Optional context for voters..."
            />
          </label>
        </fieldset>
      </div>

      {message && (
        <p
          className={`text-sm font-medium ${isSuccess ? "text-emerald-600" : "text-rose-600"}`}
        >
          {message}
        </p>
      )}

      <FormSubmitButton
        label="Update Category"
        pendingLabel="Updating..."
        isPending={isPending}
      />
    </form>
  );
}
