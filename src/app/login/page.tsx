"use client";

import React, { useState, useEffect } from "react";
import { Zap, Chrome, AlertCircle, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth/provider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard/overview");
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        await signUp(email, password, fullName, companyName);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "An error occurred with Google Sign In");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-950 px-4">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/30">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Solar<span className="text-indigo-400">Omega</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Retail Store Task Platform
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-8 backdrop-blur-xl">
          <h2 className="mb-6 text-lg font-semibold text-white">
            {isRegister ? "Create a new account" : "Sign in to your account"}
          </h2>
          
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <>
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-400">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="John Doe"
                    required={isRegister}
                  />
                </div>
                <div>
                  <label htmlFor="companyName" className="mb-2 block text-sm font-medium text-gray-400">
                    Organization Name
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Your Company Co."
                      required={isRegister}
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-400">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-white/[0.1] bg-white/[0.04] text-indigo-500 focus:ring-indigo-500/20" />
                <span className="text-xs text-gray-400">Remember me</span>
              </label>
              {!isRegister && (
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300">
                  Forgot password?
                </a>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {isRegister ? "Creating account..." : "Signing in..."}
                </span>
              ) : (
                isRegister ? "Sign Up" : "Sign In"
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 before:h-px before:flex-1 before:bg-white/[0.06] after:h-px after:flex-1 after:bg-white/[0.06]">
            <span className="text-xs text-gray-500">or continue with</span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.06] active:scale-[0.98]"
          >
            <Chrome size={18} />
            Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-400">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              {isRegister ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
