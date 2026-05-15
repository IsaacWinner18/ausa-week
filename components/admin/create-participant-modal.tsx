"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { CreateParticipantForm } from "@/components/admin/create-participant-form";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  categories: CategoryOption[];
};

export function CreateParticipantModal({ categories }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition active:scale-95"
      >
        <Plus className="w-4 h-4" />
        <span>Add Participant</span>
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Register Participant"
      >
        <CreateParticipantForm categories={categories} onSuccess={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}
