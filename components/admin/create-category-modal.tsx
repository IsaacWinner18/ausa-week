"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { CreateCategoryForm } from "@/components/admin/create-category-form";

export function CreateCategoryModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition active:scale-95"
      >
        <Plus className="w-4 h-4" />
        <span>Add Category</span>
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Create New Category"
      >
        <CreateCategoryForm onSuccess={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}
