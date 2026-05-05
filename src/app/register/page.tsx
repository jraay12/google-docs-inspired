"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) return;
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f5f2ed] font-mono flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-10">
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#aaa]">
            Workspace
          </span>
          <h1
            className="text-4xl font-normal text-[#1a1a1a] mt-1"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Get <em className="text-[#a07850]" style={{ fontStyle: "italic" }}>started.</em>
          </h1>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-[0.15em] uppercase text-[#999]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-[#e0dbd3] px-3.5 py-3 font-mono text-[13px] text-[#1a1a1a] outline-none placeholder-[#ccc] focus:border-[#a07850] transition-colors duration-150"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-[0.15em] uppercase text-[#999]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-[#e0dbd3] px-3.5 py-3 font-mono text-[13px] text-[#1a1a1a] outline-none placeholder-[#ccc] focus:border-[#a07850] transition-colors duration-150"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-[0.15em] uppercase text-[#999]">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="••••••••"
              className="w-full bg-white border border-[#e0dbd3] px-3.5 py-3 font-mono text-[13px] text-[#1a1a1a] outline-none placeholder-[#ccc] focus:border-[#a07850] transition-colors duration-150"
            />
          </div>

          {error && (
            <p className="text-[11px] tracking-wide text-red-400 uppercase">
              ✕ {error}
            </p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading || !email || !password || !confirm}
            className="w-full bg-[#1a1a1a] text-[#f5f2ed] py-3 text-[11px] font-medium tracking-widest uppercase transition-all duration-150 hover:bg-[#a07850] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none font-mono mt-1"
          >
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-[#bbb] tracking-wide mt-8 text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#a07850] hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}