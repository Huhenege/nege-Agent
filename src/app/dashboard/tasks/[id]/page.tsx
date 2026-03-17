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
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ReviewModal } from "@/components/ui/review-modal";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
  reward_points: number;
  stores: {
    name: string;
    address: string;
  };
}

interface Submission {
  id: string;
  status: string;
  photo_urls: string[];
  notes: string;
  review_notes: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    console.log("Fetching task details for ID:", id);

    try {
      // Fetch task details
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select(`
          *,
          stores (name, address)
        `)
        .eq("id", id)
        .single();

      if (taskError) {
        console.error("Task fetch error:", taskError);
        throw taskError;
      }
      console.log("Task data received:", taskData);
      setTask(taskData);

      // Fetch submissions
      console.log("Fetching submissions for task_id:", id);
      const { data: submissionData, error: subError } = await supabase
        .from("submissions")
        .select("*")
        .eq("task_id", id)
        .order("created_at", { ascending: false });

      if (subError) {
        console.error("Submissions fetch error:", subError);
        throw subError;
      }
      console.log("Raw submission data:", submissionData);

      if (submissionData && submissionData.length > 0) {
        // Fetch profiles ... (kept as is)
        const userIds = [...new Set(submissionData.map(s => s.user_id).filter(Boolean))];
        let profileMap: any = {};
        const { data: profileData } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
        if (profileData) profileData.forEach(p => profileMap[p.id] = p.full_name);
        
        const missingIds = userIds.filter(id => !profileMap[id]);
        if (missingIds.length > 0) {
          const { data: companyUserData } = await supabase.from("company_users").select("id, full_name").in("id", missingIds);
          if (companyUserData) companyUserData.forEach(p => { if (p.full_name) profileMap[p.id] = p.full_name; });
        }

        // Generate Signed URLs for private bucket 'task-photos'
        console.log("Generating signed URLs for submissions...");
        const processedSubmissions = await Promise.all(submissionData.map(async (s) => {
          const signedPhotos = await Promise.all((s.photo_urls || []).map(async (url: string) => {
            let relativePath = url;
            if (url.includes("/public/task-photos/")) {
              relativePath = url.split("/public/task-photos/")[1];
            } else if (url.includes("/object/task-photos/")) {
              relativePath = url.split("/object/task-photos/")[1];
            } else if (url.startsWith("http")) {
              // It's already a full URL, but if it's broken, we still want to try signing if it's our bucket
              if (url.includes("supabase.co") && url.includes("task-photos")) {
                relativePath = url.split(/task-photos\//)[1];
                if (relativePath.includes("?")) relativePath = relativePath.split("?")[0];
              } else {
                return url;
              }
            }

            console.log("Creating signed URL for path:", relativePath);
            const { data, error } = await supabase.storage
              .from("task-photos")
              .createSignedUrl(relativePath, 3600);

            if (error) {
              console.error("Signed URL error for", relativePath, ":", error.message);
              return url;
            }
            console.log("Signed URL created successfully");
            return data.signedUrl;
          }));

          const agentName = profileMap[s.user_id] || "Unknown Agent";
          console.log(`Agent name for ${s.user_id}: ${agentName}`);

          return {
            ...s,
            photo_urls: signedPhotos,
            profiles: { full_name: agentName }
          };
        }));

        console.log("All submissions processed with signed URLs");
        setSubmissions(processedSubmissions);
      } else {
        console.log("No submissions found for this task.");
        setSubmissions([]);
      }
    } catch (err: any) {
      console.error("FetchData caught error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openReview = (submission: any) => {
    setSelectedSubmission(submission);
    setIsReviewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-gray-500">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
        <p className="text-lg animate-pulse font-medium">Fetching task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-gray-500">
        <AlertCircle size={48} className="text-rose-500" />
        <p className="text-xl font-semibold">Task not found</p>
        <button 
          onClick={() => router.back()}
          className="mt-2 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <ArrowLeft size={18} />
          Go back to tasks
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-gray-900/50 text-gray-400 transition-all hover:border-white/10 hover:text-white"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
        </button>
        <PageHeader 
          title={task.title} 
          description={task.stores?.name}
        />
      </div>

      {/* Task Info Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/[0.06] bg-gray-900/40 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-lg font-semibold text-white">Description</h3>
            <p className="text-gray-400 leading-relaxed">
              {task.description || "No description provided for this task."}
            </p>
          </div>

          {/* Submissions Section */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Submissions
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400">
                  {submissions.length}
                </span>
              </h3>
            </div>

            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-gray-900/20 py-16 text-center">
                <div className="mb-4 rounded-full bg-gray-800/50 p-4 text-gray-500">
                  <MessageSquare size={32} />
                </div>
                <h4 className="text-lg font-medium text-white">No submissions yet</h4>
                <p className="max-w-xs text-sm text-gray-500">
                  When field agents complete this task, their submissions will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {submissions.map((submission) => (
                  <div 
                    key={submission.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gray-900/40 transition-all hover:border-white/10 hover:bg-gray-900/60"
                  >
                    <div className="p-6">
                      {/* Submission Header */}
                      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400 ring-1 ring-white/10">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{submission.profiles?.full_name || "Unknown Agent"}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                              <Calendar size={12} />
                              {new Date(submission.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={submission.status} />
                          {submission.status === "submitted" && (
                            <button 
                              onClick={() => openReview(submission)}
                              className="rounded-lg bg-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-600 active:scale-[0.98]"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {submission.notes && (
                        <div className="mb-6 rounded-xl bg-black/20 p-4 text-sm text-gray-300 ring-1 ring-white/5">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Agent Notes</p>
                          {submission.notes}
                        </div>
                      )}

                      {/* Photo Grid */}
                      {submission.photo_urls && submission.photo_urls.length > 0 && (
                        <div className="mb-6">
                          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Attached Photos</p>
                          <div className="flex flex-wrap gap-3">
                            {submission.photo_urls.map((url, idx) => (
                                <div 
                                  key={idx}
                                  className="group/photo relative h-32 w-32 cursor-pointer overflow-hidden rounded-xl ring-1 ring-white/10 transition-all hover:ring-indigo-500/50"
                                >
                                  <img 
                                    src={url} 
                                    alt={`Submission ${idx + 1}`}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover/photo:scale-110"
                                    onError={(e) => {
                                      console.error(`Failed to load image: ${url}`);
                                    }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/photo:opacity-100">
                                    <ImageIcon size={20} className="text-white" />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Review Section */}
                      {submission.review_notes && (
                        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm text-indigo-200/80">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400">Review Feedback</p>
                          {submission.review_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.06] bg-gray-900/40 p-6 backdrop-blur-sm">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-500">Task Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-white/5">
                  <StatusBadge status={task.status} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-500">Current Status</p>
                  <p className="text-sm font-semibold text-white capitalize">{task.status}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-white/5">
                  <Trophy size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-500">Reward</p>
                  <p className="text-sm font-semibold text-white">{task.reward_points} Points</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-white/5">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-500">Due Date</p>
                  <p className="text-sm font-semibold text-white">{new Date(task.due_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 ring-1 ring-white/5">
                  <StoreIcon size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-500">Store</p>
                  <p className="text-sm font-semibold text-white">{task.stores?.name}</p>
                  <p className="text-[10px] text-gray-500">{task.stores?.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={fetchData}
        submission={selectedSubmission}
      />
    </div>
  );
}
