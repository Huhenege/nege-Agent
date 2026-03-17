"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  ArrowLeft, 
  Calendar, 
  Store as StoreIcon, 
  Trophy, 
  Package, 
  Clock, 
  User, 
  MessageSquare,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function AdminSubmissionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("submissions")
        .select(`
          *,
          tasks (
            title,
            description,
            reward_points,
            stores (name, address)
          ),
          profiles (full_name, email)
        `)
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Handle signed URLs for photos
      const signedPhotos = await Promise.all((data.photo_urls || []).map(async (url: string) => {
        let relativePath = url;
        if (url.includes("task-photos/")) {
          relativePath = url.split("task-photos/")[1].split("?")[0];
        }
        const { data: signedData } = await supabase.storage
          .from("task-photos")
          .createSignedUrl(relativePath, 3600);
        return signedData?.signedUrl || url;
      }));

      setSubmission({ ...data, photo_urls: signedPhotos });
      setReviewNotes(data.review_notes || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    setSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from("submissions")
        .update({
          status,
          review_notes: reviewNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", id);

      if (updateError) throw updateError;
      
      // If approved, we might want to award points (logic for that should be here)
      
      fetchData(); // Refresh
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-gray-500">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
        <p className="text-lg animate-pulse font-medium">Fetching submission details...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-gray-500">
        <AlertCircle size={48} className="text-rose-500" />
        <p className="text-xl font-semibold">Submission not found</p>
        <button onClick={() => router.back()} className="text-indigo-400 hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-gray-900/50 text-gray-400 transition-all hover:border-white/10 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title={`Review #${submission.id.slice(0, 8)}`} 
          description={submission.tasks?.title}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          <div className="rounded-2xl border border-white/[0.06] bg-gray-900/40 p-6">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-500">Submitted Photos</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {submission.photo_urls?.map((url: string, idx: number) => (
                <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-white/10">
                  <img src={url} alt="Submission" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-white/[0.06] bg-gray-900/40 p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-500">Agent Notes</h3>
            <p className="text-gray-300 leading-relaxed italic border-l-2 border-indigo-500 pl-4">
              "{submission.notes || "No notes provided."}"
            </p>
          </div>

          {/* Review Logic */}
          {submission.status === 'submitted' && (
            <div className="rounded-2xl border border-white/[0.06] bg-indigo-500/5 p-6 ring-1 ring-indigo-500/20">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-indigo-400">Review Feedback</h3>
              <textarea
                className="mb-4 w-full rounded-xl border border-white/[0.08] bg-black/20 p-4 text-sm text-white outline-none focus:border-indigo-500/50 min-h-[100px]"
                placeholder="Add feedback for the agent..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => handleReview('approved')}
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  Approve Submission
                </button>
                <button 
                  onClick={() => handleReview('rejected')}
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-600 disabled:opacity-50"
                >
                  <XCircle size={18} />
                  Reject Submission
                </button>
              </div>
            </div>
          )}

          {submission.status !== 'submitted' && (
            <div className="rounded-2xl border border-white/[0.06] bg-gray-900/40 p-6">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-gray-500">Resolution</h3>
              <div className="flex items-center gap-3 mb-4">
                <StatusBadge status={submission.status} />
                <span className="text-xs text-gray-500">Reviewed on {new Date(submission.reviewed_at!).toLocaleString()}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="font-bold text-gray-500">Feedback: </span>
                {submission.review_notes || "No feedback provided."}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.06] bg-gray-900/40 p-6 backdrop-blur-sm">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-500">Details</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 ring-1 ring-white/5">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-500">Agent</p>
                  <p className="text-sm font-semibold text-white">{submission.profiles?.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-white/5">
                  <StoreIcon size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-500">Store</p>
                  <p className="text-sm font-semibold text-white">{submission.tasks?.stores?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-white/5">
                  <Trophy size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-500">Possible Reward</p>
                  <p className="text-sm font-semibold text-white">{submission.tasks?.reward_points} Points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
