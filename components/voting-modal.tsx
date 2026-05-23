"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  X,
  Minus,
  Plus,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Participant {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  totalVotes: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PaymentResponse {
  success: boolean;
  message?: string;
  payment: {
    email: string;
    amountInKobo: number;
    reference: string;
  };
}

interface PaystackTransaction {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
}

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant | null;
  category: Category | null;
}

const VOTE_PRICE = 200;

export function VotingModal({
  isOpen,
  onClose,
  participant,
  category,
}: VotingModalProps) {
  const [step, setStep] = useState<"voting" | "success">("voting");
  const [voteCount, setVoteCount] = useState(1);
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("voter_email") || "";
    }
    return "";
  });
  const [isEmailRequired, setIsEmailRequired] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("voter_email");
    }
    return true;
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const Router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Handle modal state changes (opening/closing)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 10);
      return () => clearTimeout(timer);
    } else {
      // Reset state when modal is closed
      setShowContent(false);
      setStep("voting");
      setVoteCount(1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !participant || !category) return null;

  const totalAmount = voteCount * VOTE_PRICE;

  const handleIncrement = () => setVoteCount((prev) => prev + 1);
  const handleDecrement = () =>
    setVoteCount((prev) => (prev > 1 ? prev - 1 : 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setVoteCount(value);
    } else if (e.target.value === "") {
      setVoteCount(0);
    }
  };

  const handleInputBlur = () => {
    if (voteCount < 1) {
      setVoteCount(1);
    }
  };

  const handlePayNow = async () => {
    if (isEmailRequired) {
      if (!email) {
        toast.error("Please enter your email to continue.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address.");
        return;
      }
    }

    setIsInitializing(true);

    try {
      const PaystackPop = (await import("@paystack/inline-js")).default;

      if (!PaystackPop) {
        throw new Error("PaystackPop not found");
      }
      
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          participantSlug: participant.slug,
          categorySlug: category.slug,
          voteCount,
        }),
      });

      const data: PaymentResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to initialize payment");
      }

      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        email: data.payment.email,
        amount: data.payment.amountInKobo,
        reference: data.payment.reference,
        onSuccess: (_transaction: PaystackTransaction) => {
          // Store email for future use
          localStorage.setItem("voter_email", email);
          setIsEmailRequired(false);
          // Show success step
          setStep("success");
          Router.refresh();
        },
        onCancel: () => {
          setIsInitializing(false);
        },
      });
    } catch (error) {
      console.error("Payment initialization failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full h-[80vh] sm:max-w-xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500 ease-out ${
          showContent
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-50 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-slate-600" />
        </button>

        <div className="flex h-full flex-col relative overflow-hidden">
          {/* Main Voting View */}
          <div
            className={`flex flex-col h-full transition-transform duration-500 ease-in-out ${
              step === "success" ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            {/* Participant Image (40% of modal) */}
            <div className="relative h-[80%] w-full overflow-hidden">
              {participant.imageUrl ? (
                <Image
                  src={participant.imageUrl}
                  alt={participant.name}
                  fill
                  className="object-contain object-top"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-400 font-medium">
                    No Image Available
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>

            {/* Voting Details */}
            <div className="flex-1 p-8 flex flex-col justify-between -mt-8 relative bg-white rounded-t-3xl">
              <div>
                <div className="mb-6">
                  <p className="text-amber-600 font-bold uppercase tracking-wider text-sm mb-1">
                    {category.name}
                  </p>
                  <h2 className="text-base font-black text-slate-900 leading-tight">
                    Vote for {participant.name}
                  </h2>
                </div>

                {isEmailRequired && (
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Enter your email to continue
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voter@example.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-amber-500 focus:ring-0 outline-none transition-colors text-black placeholder:text-gray-300"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl mb-6">
                  <div className="flex flex-col flex-1 mr-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Number of Votes
                    </span>
                    <input
                      type="number"
                      value={voteCount === 0 ? "" : voteCount}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      min="1"
                      className="bg-transparent text-xl font-black text-slate-900 border-none focus:ring-0 px-2 w-full outline-gray-400/20 "
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDecrement}
                      className="w-9 h-9 flex items-center justify-center bg-white border-2 border-slate-200 rounded-xl hover:border-amber-500 text-amber-500 transition-all active:scale-95 shadow-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleIncrement}
                      className="w-9 h-9 flex items-center justify-center bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all active:scale-95 shadow-md shadow-amber-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-slate-500 font-medium">
                    Total Amount
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    ₦{totalAmount.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handlePayNow}
                  disabled={isInitializing || (isEmailRequired && !email)}
                  className="w-full py-3 bg-orange-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 hover:bg-orange-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInitializing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Pay Now
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Success Screen View (Sliding from right) */}
          <div
            className={`absolute inset-0 flex flex-col h-full bg-white transition-transform duration-500 ease-in-out ${
              step === "success" ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-14 h-14 text-emerald-500" />
              </div>

              <h2 className="text-3xl font-black text-slate-900 mb-4">
                Vote Confirmed!
              </h2>

              <p className="text-slate-600 text-lg mb-8 max-w-xs mx-auto leading-relaxed">
                Awesome!{" "}
                <span className="text-amber-600 font-bold">{voteCount}</span>{" "}
                {voteCount === 1 ? "vote has" : "votes have"} been successfully
                added to{" "}
                <span className="text-slate-900 font-bold">
                  {participant.name}
                </span>
                .
              </p>

              <div className="w-full space-y-4">
                <button
                  onClick={() => setStep("voting")}
                  className="w-full py-3 bg-orange-500 text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all active:scale-[0.98]"
                >
                  Vote Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
