"use client";

import { useState } from "react";
import { Edit2, Trash2, Power, Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { EditCategoryForm } from "@/components/admin/edit-category-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CategoryActionsProps {
  category: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
  };
}

export function CategoryActions({ category }: CategoryActionsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      if (response.ok) {
        toast.success(
          `Category ${category.isActive ? "deactivated" : "activated"} successfully.`,
        );
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update status.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this category? This action cannot be undone.",
      )
    ) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Category deleted successfully.");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete category.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleToggleStatus}
          disabled={isLoading}
          className={`p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
            category.isActive
              ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title={category.isActive ? "Deactivate" : "Activate"}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Power className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => setIsEditModalOpen(true)}
          disabled={isLoading}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Category"
      >
        <EditCategoryForm
          category={category}
          onSuccess={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </>
  );
}
