"use client";

import { useEffect, useState } from "react";
import { Upload, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { FormSubmitButton } from "@/components/admin/form-submit-button";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  categories: CategoryOption[];
  onSuccess?: () => void;
};

export function CreateParticipantForm({ categories, onSuccess }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await fetch("/api/admin/participants", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast.success("Participant registered successfully.");
        setFileName(null);
        router.refresh();
        if (onSuccess) {
          setTimeout(onSuccess, 1000);
        }
      } else {
        toast.error(data.message || "Failed to register participant.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      action={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 lg:p-10 shadow-sm"
    >
      <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Add Participant
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Onboard a new contestant to the platform.
        </p>
      </div>

      <fieldset disabled={isPending} className="space-y-6">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Full Name
          </span>
          <input
            name="name"
            required
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="e.g. Jane Doe"
          />
        </label>

        <div className="space-y-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Categories
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((category) => (
              <label
                key={category.id}
                className="relative flex items-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/30 has-[:checked]:border-blue-200 dark:has-[:checked]:border-blue-800 group"
              >
                <input
                  type="checkbox"
                  name="categorySlugs"
                  value={category.slug}
                  className="peer sr-only"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-has-[:checked]:text-blue-600 dark:group-has-[:checked]:text-blue-400">
                    {category.name}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    {category.slug}
                  </p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center bg-white dark:bg-slate-900 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors">
                  <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </label>
            ))}
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Bio / Description
          </span>
          <textarea
            name="bio"
            rows={4}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            placeholder="A short introduction..."
          />
        </label>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Profile Image
          </span>
          <div className="relative group">
            <input
              name="image"
              type="file"
              accept="image/*"
              className="hidden"
              id="participant-image"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFileName(file.name);
              }}
            />
            <label
              htmlFor="participant-image"
              className="flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group overflow-hidden"
            >
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {fileName || "Choose an image"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  PNG, JPG or WEBP (Max. 50MB)
                </p>
              </div>
            </label>
          </div>
        </div>
      </fieldset>

      <p
        aria-live="polite"
        className={`min-h-5 text-sm font-medium ${isSuccess ? "text-emerald-600" : "text-rose-600"}`}
      >
        {message}
      </p>

      <FormSubmitButton
        label="Register Participant"
        pendingLabel="Registering..."
        isPending={isPending}
      />
    </form>
  );
}
