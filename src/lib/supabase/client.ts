import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: "admin" | "company_admin" | "company_user";
          created_at: string;
          updated_at: string;
        };
      };
      field_users: {
        Row: {
          id: string;
          phone: string | null;
          total_points: number;
          completed_tasks: number;
          approval_rate: number;
          created_at: string;
        };
      };
      company_users: {
        Row: {
          id: string;
          company_id: string | null;
          job_title: string | null;
          created_at: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          access_level: string;
          created_at: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          plan: "free" | "pro" | "enterprise";
          created_at: string;
        };
      };
      stores: {
        Row: {
          id: string;
          name: string;
          address: string;
          type_id: string | null;
          latitude: number | null;
          longitude: number | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
      };
      store_types: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          company_id: string;
          store_id: string;
          status: "pending" | "in_progress" | "completed" | "reviewed";
          due_date: string;
          created_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          sku: string | null;
          category: string | null;
          image_url: string | null;
          created_at: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          photo_url: string;
          notes: string | null;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
      };
    };
  };
};
