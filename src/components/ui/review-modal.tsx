"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { AlertCircle, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  submission: any;
}

export function ReviewModal({ isOpen, onClose, onSuccess, submission }: ReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const handleReview = async (newStatus: "approved" | "rejected") => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("submissions")
        .update({
          status: newStatus,
          review_notes: reviewNotes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", submission.id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Submission">
      <div className="space-y-4 pt-2">
        <div className="rounded-xl bg-white/[0.04] p-4 text-sm">
          <p className="text-gray-400">Agent: <span className="text-white font-medium">{submission?.profiles?.full_name}</span></p>
          <p className="text-gray-400 mt-1">Submitted: <span className="text-white font-medium">{new Date(submission?.created_at).toLocaleString()}</span></p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Feedback / Review Notes</label>
          <textarea
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 min-h-[120px]"
            placeholder="Add some feedback for the agent (optional)..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm text-gray-500 hover:text-white"
          >
            Cancel
          </button>
          
          <button 
            onClick={() => handleReview("rejected")}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/10 px-6 py-2.5 text-sm font-semibold text-rose-400 shadow-lg transition-all hover:bg-rose-500/20 disabled:opacity-50"
          >
            <XCircle size={18} />
            Reject
          </button>

          <button 
            onClick={() => handleReview("approved")}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            Approve
          </button>
        </div>
      </div>
    </Modal>
  );
}
