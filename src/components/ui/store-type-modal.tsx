"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { Plus, Trash2, Edit2, Check, X, Loader2, AlertCircle } from "lucide-react";

interface StoreTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StoreTypeModal({ isOpen, onClose }: StoreTypeModalProps) {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTypeName, setNewTypeName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchTypes();
    }
  }, [isOpen]);

  const fetchTypes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("store_types")
      .select("*")
      .order("name");
    
    if (error) setError(error.message);
    else setTypes(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newTypeName.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from("store_types")
      .insert([{ name: newTypeName.trim() }]);
    
    if (error) setError(error.message);
    else {
      setNewTypeName("");
      fetchTypes();
    }
    setLoading(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from("store_types")
      .update({ name: editName.trim() })
      .eq("id", id);
    
    if (error) setError(error.message);
    else {
      setEditingId(null);
      fetchTypes();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? Stores associated with this type will lose their classification.")) return;
    setLoading(true);
    const { error } = await supabase
      .from("store_types")
      .delete()
      .eq("id", id);
    
    if (error) setError(error.message);
    else fetchTypes();
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Store Types">
      <div className="space-y-6 pt-2">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        {/* Add New Type */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New store type name..."
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={loading || !newTypeName.trim()}
            className="rounded-xl bg-indigo-500 p-2 text-white transition-all hover:bg-indigo-600 disabled:opacity-50"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* List of Types */}
        <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
          {loading && types.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-indigo-500" />
            </div>
          ) : (
            types.map((type) => (
              <div
                key={type.id}
                className="group flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 transition-all hover:bg-white/[0.06]"
              >
                {editingId === type.id ? (
                  <div className="flex flex-1 gap-2">
                    <input
                      autoFocus
                      type="text"
                      className="flex-1 bg-transparent text-sm text-white outline-none"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(type.id)}
                    />
                    <button onClick={() => handleUpdate(type.id)} className="text-emerald-400">
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-gray-200">{type.name}</span>
                    <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setEditingId(type.id);
                          setEditName(type.name);
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(type.id)}
                        className="text-gray-400 hover:text-rose-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
          {!loading && types.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">No types created yet.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
