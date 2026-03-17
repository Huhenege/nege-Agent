"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { AlertCircle, Loader2, Calendar, Store, Package, Trophy, Info } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: any;
  companyId: string;
}

export function TaskModal({ isOpen, onClose, onSuccess, task, companyId }: TaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    store_id: "",
    due_date: "",
    priority: "medium",
    reward_points: 100,
    selected_products: [] as string[]
  });

  useEffect(() => {
    if (isOpen && companyId) {
      fetchData();
      if (task) {
        setFormData({
          title: task.title || "",
          description: task.description || "",
          store_id: task.store_id || "",
          due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "",
          priority: task.priority || "medium",
          reward_points: task.reward_points || 100,
          selected_products: task.task_products?.map((tp: any) => tp.product_id) || []
        });
      } else {
        setFormData({
          title: "",
          description: "",
          store_id: "",
          due_date: "",
          priority: "medium",
          reward_points: 100,
          selected_products: []
        });
      }
    }
  }, [isOpen, task, companyId]);

  const fetchData = async () => {
    const [storesRes, productsRes] = await Promise.all([
      supabase.from("stores").select("id, name").eq("is_active", true).order("name"),
      supabase.from("products").select("id, name").eq("company_id", companyId).order("name")
    ]);
    if (storesRes.data) setStores(storesRes.data);
    if (productsRes.data) setProducts(productsRes.data);
  };

  const handleProductToggle = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_products: prev.selected_products.includes(productId)
        ? prev.selected_products.filter(id => id !== productId)
        : [...prev.selected_products, productId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const taskPayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      instructions: formData.description.trim(), // Send to instructions column too
      store_id: formData.store_id,
      due_date: formData.due_date,
      priority: formData.priority,
      reward_points: formData.reward_points,
      company_id: companyId,
      status: task?.status || "pending"
    };

    try {
      let taskId = task?.id;

      if (task) {
        const { error: taskErr } = await supabase.from("tasks").update(taskPayload).eq("id", task.id);
        if (taskErr) throw taskErr;
        
        // Clear products
        await supabase.from("task_products").delete().eq("task_id", taskId);
      } else {
        const { data: newTask, error: taskErr } = await supabase.from("tasks").insert([taskPayload]).select().single();
        if (taskErr) throw taskErr;
        taskId = newTask.id;
      }

      // Insert products
      if (formData.selected_products.length > 0) {
        const productPayload = formData.selected_products.map(pid => ({
          task_id: taskId,
          product_id: pid
        }));
        const { error: prodErr } = await supabase.from("task_products").insert(productPayload);
        if (prodErr) throw prodErr;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? "Edit Task" : "Create Audit Task"}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Task Title</label>
          <input
            required
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
            placeholder="e.g. Shelf Audit - Central Supermarket"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 overflow-hidden">
            <label className="text-sm font-medium text-gray-400">Target Store</label>
            <div className="relative">
              <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <select
                required
                className="w-full rounded-xl border border-white/[0.08] bg-gray-900 py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
                value={formData.store_id}
                onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
              >
                <option value="">Select Store</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Due Date</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                required
                type="date"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Reward Points</label>
            <div className="relative">
              <Trophy size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="number"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
                value={isNaN(formData.reward_points) ? "" : formData.reward_points}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData({ ...formData, reward_points: isNaN(val) ? 0 : val });
                }}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Priority</label>
            <select
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5 text-ellipsis">
          <label className="text-sm font-medium text-gray-400">Products to Audit</label>
          <div className="flex max-h-[120px] flex-wrap gap-2 overflow-y-auto rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            {products.length === 0 ? (
              <p className="text-xs text-gray-500">No products found. Add products first.</p>
            ) : (
              products.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProductToggle(p.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all ${
                    formData.selected_products.includes(p.id)
                      ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
                      : "border-white/[0.08] bg-white/[0.04] text-gray-400 hover:border-white/20"
                  }`}
                >
                  <Package size={12} />
                  {p.name}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Description / Instructions</label>
          <textarea
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 min-h-[80px]"
            placeholder="What should the reporter do? e.g. Take 3 photos of the shelf..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-white">Cancel</button>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl disabled:opacity-50">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {task ? "Save Changes" : "Publish Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
