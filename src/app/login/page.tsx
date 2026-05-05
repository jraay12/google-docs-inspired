"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/login", {
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

    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.id,
        email: data.email,
      }),
    );

    router.push("/");
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
            Welcome{" "}
            <em className="text-[#a07850]" style={{ fontStyle: "italic" }}>
              back.
            </em>
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
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full bg-[#1a1a1a] text-[#f5f2ed] py-3 text-[11px] font-medium tracking-widest uppercase transition-all duration-150 hover:bg-[#a07850] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none font-mono mt-1"
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-[#bbb] tracking-wide mt-8 text-center">
          No account?{" "}
          <Link
            href="/register"
            className="text-[#a07850] hover:underline transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
