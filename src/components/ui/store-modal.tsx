"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { AlertCircle, Loader2, Building2 } from "lucide-react";
import { MapPicker } from "./map-picker";

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  store?: any; // If provided, we are in Edit mode
}

export function StoreModal({ isOpen, onClose, onSuccess, store }: StoreModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type_id: "",
    company_id: "",
    latitude: "",
    longitude: ""
  });

  const [storeTypes, setStoreTypes] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchStoreTypes();
      fetchCompanies();
      if (store) {
        setFormData({
          name: store.name || "",
          address: store.address || "",
          type_id: store.type_id || "",
          company_id: store.company_id || "",
          latitude: store.latitude?.toString() || "",
          longitude: store.longitude?.toString() || ""
        });
      } else {
        setFormData({
          name: "",
          address: "",
          type_id: "",
          company_id: "",
          latitude: "",
          longitude: ""
        });
      }
    }
  }, [isOpen, store]);

  const fetchStoreTypes = async () => {
    const { data } = await supabase.from("store_types").select("*").order("name");
    if (data) setStoreTypes(data);
  };

  const fetchCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").order("name");
    if (data) setCompanies(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const latitude = formData.latitude.trim() ? parseFloat(formData.latitude) : null;
      const longitude = formData.longitude.trim() ? parseFloat(formData.longitude) : null;

      const payload: any = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        type_id: formData.type_id || null,
        company_id: formData.company_id || null,
        latitude,
        longitude,
      };

      console.log("Submitting store payload:", payload);

      let result;
      if (store) {
        result = await supabase
          .from("stores")
          .update(payload)
          .eq("id", store.id);
      } else {
        result = await supabase
          .from("stores")
          .insert([payload]);
      }

      if (result.error) {
        console.error("Supabase error:", result.error);
        throw result.error;
      }

      console.log("Store saved successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Submit catch error:", err);
      setError(err.message || "Something went wrong while saving the store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={store ? "Edit Store" : "Add New Store"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Store Name</label>
            <input
              required
              type="text"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. Downtown SuperMart"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Store Type</label>
            <select
              className="w-full rounded-xl border border-white/[0.08] bg-gray-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
              value={formData.type_id}
              onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
            >
              <option value="">Select Type</option>
              {storeTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Company Assignment</label>
          <div className="relative">
            <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <select
              required
              className="w-full rounded-xl border border-white/[0.08] bg-gray-900 py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
              value={formData.company_id}
              onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
            >
              <option value="">Select Company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Store Address</label>
          <input
            required
            type="text"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="e.g. 123 Main St, New York"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="py-2">
          <MapPicker 
            latitude={formData.latitude ? parseFloat(formData.latitude) : null}
            longitude={formData.longitude ? parseFloat(formData.longitude) : null}
            address={formData.address}
            onLocationChange={(lat: number, lng: number, addr: string) => {
              setFormData({
                ...formData,
                latitude: lat.toString(),
                longitude: lng.toString(),
                address: addr
              });
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Manual Latitude</label>
            <input
              type="number"
              step="any"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="40.7128"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Manual Longitude</label>
            <input
              type="number"
              step="any"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="-74.0060"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {store ? "Save Changes" : "Create Store"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
