"use client";

import { useState } from "react";
import { Upload, Check } from "lucide-react";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

interface EditParticipantFormProps {
  participant: {
    id: string;
    name: string;
    bio: string;
    imageUrl: string;
    categorySlugs: string[];
  };
  categories: CategoryOption[];
  onSuccess?: () => void;
}

export function EditParticipantForm({
  participant,
  categories,
  onSuccess,
}: EditParticipantFormProps) {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setMessage("");
    setIsSuccess(false);

    try {
      // Use standard form submission for the image and details
      // If there's an image, we might need to handle it differently
      // but for simplicity and to match the requirement of using API routes:

      const payload = new FormData();
      payload.append("name", formData.get("name") as string);
      payload.append("bio", formData.get("bio") as string);

      const categorySlugs = formData.getAll("categorySlugs");
      categorySlugs.forEach((slug) =>
        payload.append("categorySlugs[]", slug as string),
      );

      const imageFile = formData.get("image") as File;
      if (imageFile && imageFile.size > 0) {
        payload.append("image", imageFile);
      }

      // Note: Standard JSON API doesn't handle files well without multipart/form-data
      // I'll use a direct PATCH request with the FormData
      const response = await fetch(
        `/api/admin/participants/${participant.id}`,
        {
          method: "PATCH",
          // Browser automatically sets content-type to multipart/form-data with boundary
          body: payload,
        },
      );

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast.success("Participant updated successfully.");
        router.refresh();
        if (onSuccess) {
          setTimeout(onSuccess, 1000);
        }
      } else {
        toast.error(data.message || "Failed to update participant.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6 p-6">
      <fieldset disabled={isPending} className="space-y-6">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Full Name
          </span>
          <input
            name="name"
            required
            defaultValue={participant.name}
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
                  defaultChecked={participant.categorySlugs.includes(
                    category.slug,
                  )}
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
            defaultValue={participant.bio}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            placeholder="A short introduction..."
          />
        </label>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Profile Image (Leave blank to keep current)
          </span>
          <div className="relative group">
            <input
              name="image"
              type="file"
              accept="image/*"
              className="hidden"
              id="edit-participant-image-api"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFileName(file.name);
              }}
            />
            <label
              htmlFor="edit-participant-image-api"
              className="flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group overflow-hidden"
            >
              {participant.imageUrl && !fileName ? (
                <div className="relative w-full h-full">
                  <img
                    src={participant.imageUrl}
                    alt="Current profile"
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm font-bold text-slate-900 dark:text-white bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-full">
                      Click to change
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {fileName || "Choose an image"}
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>
      </fieldset>

      {message && (
        <p
          className={`text-sm font-medium ${isSuccess ? "text-emerald-600" : "text-rose-600"}`}
        >
          {message}
        </p>
      )}

      <FormSubmitButton
        label="Update Participant"
        pendingLabel="Updating..."
        isPending={isPending}
      />
    </form>
  );
}
