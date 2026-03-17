"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "company_admin" | "company_user";

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  companyId: string | null;
  // Specialized fields can be added here
  jobTitle?: string | null;
  accessLevel?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setSupabaseUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Session error:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setSupabaseUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // 1. Fetch base profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, avatar_url")
        .eq("id", userId)
        .single();

      if (profileError || !profile) return;

      let authUser: AuthUser = {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        fullName: profile.full_name,
        companyId: null,
      };

      // 2. Fetch specialized data based on role
      if (profile.role === "admin") {
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (adminData) {
          authUser.accessLevel = adminData.access_level;
        }
      } else if (profile.role === "company_admin" || profile.role === "company_user") {
        const { data: companyUserData } = await supabase
          .from("company_users")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (companyUserData) {
          authUser.companyId = companyUserData.company_id;
          authUser.jobTitle = companyUserData.job_title;
        }
      }

      setUser(authUser);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string, companyName?: string) => {
    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: companyName ? 'company_admin' : 'company_user'
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Authentication failed");

    const userId = authData.user.id;

    // 2. If companyName is provided, it's a new organization registration
    if (companyName) {
      // Create Company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({ name: companyName })
        .select()
        .single();
      
      if (companyError) throw companyError;

      // Link User to Company in company_users
      const { error: linkError } = await supabase
        .from("company_users")
        .insert({
          id: userId,
          company_id: company.id,
          job_title: "Administrator"
        });
      
      if (linkError) throw linkError;
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      // 1. Set loading to block UI if necessary
      setLoading(true);
      
      // 2. Clear local state immediately for fast response
      setUser(null);
      setSupabaseUser(null);

      // 3. Perform server-side sign out
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signOut error:", error.message);
      }
      
      // 4. Force clear any lingering localStorage items related to auth
      if (typeof window !== "undefined") {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes("supabase.auth.token")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error("Critical signOut error:", error);
    } finally {
      setLoading(false);
      // Redirection is usually handled by the component or router
    }
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
