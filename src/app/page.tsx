"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Home() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sharingDoc, setSharingDoc] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [shareRole, setShareRole] = useState<Record<string, string>>({});
  const [sharing, setSharing] = useState(false);
  const [sharedWith, setSharedWith] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.replace("/login");
    }
    setCurrentUser(JSON.parse(user!));
  }, []);

  const fetchDocs = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    setLoading(true);
    const res = await fetch(`/api/documents?userId=${user.id}`);
    const data = await res.json();
    setDocs(data);
    setLoading(false);
  };

  const handleFileUpload = async (file: File) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const formData = new FormData();

    formData.append("file", file);
    formData.append("ownerId", user.id);

    await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });

    await fetchDocs();
  };

  const openModal = () => {
    setTitle("");
    setModalOpen(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTitle("");
  };

  const createDoc = async () => {
    if (!title.trim()) return;
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    setCreating(true);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), ownerId: user.id }),
    });
    const doc = await res.json();
    setCreating(false);
    closeModal();
    await fetchDocs();
    router.push(`/documents/${doc.id}`);
  };

  const startRename = (e: React.MouseEvent, doc: any) => {
    e.stopPropagation();
    setRenamingId(doc.id);
    setRenameValue(doc.title || "");
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const commitRename = async (id: string) => {
    if (!renameValue.trim()) return cancelRename();
    await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: renameValue.trim() }),
    });
    setRenamingId(null);
    fetchDocs();
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const openShare = async (e: React.MouseEvent, doc: any) => {
    e.stopPropagation();
    setSharingDoc(doc);

    const [usersRes, accessRes] = await Promise.all([
      fetch("/api/user"),
      fetch(`/api/documents/${doc.id}/access`),
    ]);

    const allUsers = await usersRes.json();
    const existing = await accessRes.json();

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUsers(allUsers.filter((u: any) => u.id !== currentUser.id));

    const roleMap: Record<string, string> = {};
    existing.forEach((a: any) => {
      roleMap[a.userId] = a.role;
    });
    setShareRole(roleMap);
    setSharedWith(existing.map((a: any) => a.userId));
  };

  const closeShare = () => {
    setSharingDoc(null);
    setUsers([]);
    setShareRole({});
    setSharedWith([]);
  };

  const toggleUser = (userId: string) => {
    setSharedWith((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
    setShareRole((prev) => ({
      ...prev,
      [userId]: prev[userId] || "viewer",
    }));
  };

  const setRole = (userId: string, role: string) => {
    setShareRole((prev) => ({ ...prev, [userId]: role }));
  };

  const commitShare = async () => {
    if (!sharingDoc) return;
    setSharing(true);

    await fetch(`/api/documents/${sharingDoc.id}/access`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        sharedWith.map((userId) => ({
          userId,
          role: shareRole[userId] || "viewer",
        })),
      ),
    });

    setSharing(false);
    closeShare();
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "Enter" && modalOpen) createDoc();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen, title]);

  return (
    <div className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] font-mono px-10 py-12">
      {/* Header */}
      <header className="flex items-end justify-between border-b border-[#ddd8d0] pb-7 mb-12">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] tracking-[0.2em] text-[#aaa] uppercase">
            Workspace
          </span>
          <h1
            className="text-5xl font-normal leading-none tracking-tight text-[#1a1a1a]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            My{" "}
            <em
              className="text-[#a07850]"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
              }}
            >
              Documents
            </em>
          </h1>
        </div>
        <div className="flex flex-col items-end gap-3">
          {/* User row */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#aaa] tracking-wide font-mono">
              {currentUser?.email}
            </span>
            <button
              onClick={() => {
                localStorage.clear();
                router.replace("/login");
              }}
              className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase font-mono text-[#999] border border-[#e0dbd3] px-3 py-1.5 hover:border-[#c0392b] hover:text-[#c0392b] transition-all duration-150 bg-transparent cursor-pointer"
            >
              <span className="text-[13px] leading-none">⎋</span>
              Sign out
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openModal}
              className="flex items-center gap-2 bg-[#1a1a1a] text-[#f5f2ed] px-5 py-3 text-[11px] font-medium tracking-widest uppercase transition-all duration-150 hover:bg-[#a07850] hover:-translate-y-px active:translate-y-0 cursor-pointer border-none"
            >
              <span className="text-lg font-light leading-none">+</span>
              New Document
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-transparent border border-[#e0dbd3] text-[#1a1a1a] px-5 py-3 text-[11px] font-medium tracking-widest uppercase transition-all duration-150 hover:border-[#a07850] hover:text-[#a07850]"
            >
              Upload File
            </button>
          </div>
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      {/* Doc count */}
      {!loading && docs.length > 0 && (
        <p className="text-[11px] tracking-[0.12em] uppercase text-[#bbb] mb-5">
          <span className="text-[#888]">{docs.length}</span> document
          {docs.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex gap-1.5 justify-center py-16">
          {[0, 200, 400].map((delay) => (
            <div
              key={delay}
              className="w-1 h-1 rounded-full bg-[#ccc] animate-pulse"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && docs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#ccc] text-center">
          <span className="text-4xl opacity-30 mb-2">◻</span>
          <p className="text-[11px] tracking-widest uppercase">
            No documents yet
          </p>
          <p className="text-[11px] tracking-widest uppercase text-[#bbb]">
            Create your first document above
          </p>
        </div>
      )}

      {/* Document list */}
      {!loading && docs.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {docs.map((doc, i) => (
            <li
              key={doc.id}
              onClick={() =>
                renamingId !== doc.id && router.push(`/documents/${doc.id}`)
              }
              className={`group grid items-center gap-5 px-5 py-[18px] bg-white border border-transparent transition-all duration-100 ${
                renamingId === doc.id
                  ? "border-[#e0dbd3] cursor-default"
                  : "cursor-pointer hover:bg-[#faf8f5] hover:border-[#e8e2d9] hover:translate-x-1 hover:shadow-[2px_0_0_#a07850]"
              }`}
              style={{
                gridTemplateColumns: "32px 1fr auto",
                animationDelay: `${i * 40}ms`,
              }}
            >
              <span className="text-[10px] text-[#ccc] font-medium text-right tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>

              {renamingId === doc.id ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => commitRename(doc.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename(doc.id);
                    if (e.key === "Escape") cancelRename();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent border-b border-[#a07850] outline-none font-mono text-[#1a1a1a] text-lg w-full pb-0.5"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                  maxLength={80}
                />
              ) : (
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="text-[#666] text-lg font-normal transition-colors duration-100 group-hover:text-[#1a1a1a] truncate"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    {doc.title || "Untitled Document"}
                  </span>
                  <span
                    className={`shrink-0 text-[9px] tracking-widest uppercase px-1.5 py-0.5 border ${
                      doc.ownerId === currentUser?.id
                        ? "text-[#a07850] border-[#e8d5bc] bg-[#fdf9f5]"
                        : "text-[#bbb] border-[#e0dbd3] bg-white"
                    }`}
                  >
                    {doc.ownerId === currentUser?.id ? "owner" : "member"}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {doc.ownerId === currentUser?.id && (
                  <>
                    <button
                      onClick={(e) => openShare(e, doc)}
                      className="opacity-0 group-hover:opacity-100 text-[#ccc] hover:text-[#a07850] text-xs tracking-widest uppercase transition-all duration-100 bg-transparent border-none cursor-pointer font-mono px-1"
                    >
                      share
                    </button>
                    <button
                      onClick={(e) => startRename(e, doc)}
                      className="opacity-0 group-hover:opacity-100 text-[#ccc] hover:text-[#a07850] text-xs tracking-widest uppercase transition-all duration-100 bg-transparent border-none cursor-pointer font-mono px-1"
                    >
                      rename
                    </button>
                  </>
                )}
                <span className="text-[#ccc] text-sm transition-all duration-100 group-hover:text-[#a07850] group-hover:translate-x-1">
                  →
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal overlay */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
          modalOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(245,242,237,0.75)",
          backdropFilter: "blur(4px)",
        }}
        onClick={(e) => e.target === e.currentTarget && closeModal()}
      >
        <div
          className={`bg-white border border-[#e0dbd3] p-10 w-full max-w-md shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-transform duration-200 ${
            modalOpen ? "translate-y-0" : "translate-y-3"
          }`}
        >
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#aaa] mb-1.5">
            New Document
          </p>
          <h2
            className="text-[1.6rem] font-normal text-[#1a1a1a] mb-7"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            What's it about?
          </h2>

          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-[10px] tracking-[0.15em] uppercase text-[#999]">
              Document Title
            </label>
            <input
              ref={inputRef}
              type="text"
              maxLength={80}
              placeholder="e.g. Q4 Strategy Overview"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#faf8f5] border border-[#e0dbd3] px-3.5 py-3 font-mono text-[13px] text-[#1a1a1a] outline-none placeholder-[#ccc] focus:border-[#a07850] transition-colors duration-150"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-2.5 font-mono text-[11px] tracking-[0.08em] uppercase bg-transparent border border-[#e0dbd3] text-[#999] cursor-pointer transition-all hover:border-[#ccc] hover:text-[#666]"
            >
              Cancel
            </button>
            <button
              onClick={createDoc}
              disabled={!title.trim() || creating}
              className="px-5 py-2.5 font-mono text-[11px] tracking-[0.08em] uppercase bg-[#1a1a1a] text-[#f5f2ed] border-none cursor-pointer transition-all hover:bg-[#a07850] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {creating ? "Creating…" : "Create →"}
            </button>
          </div>
        </div>
      </div>

      {/* Share modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
          sharingDoc
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(245,242,237,0.75)",
          backdropFilter: "blur(4px)",
        }}
        onClick={(e) => e.target === e.currentTarget && closeShare()}
      >
        <div
          className={`bg-white border border-[#e0dbd3] p-10 w-full max-w-md shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-transform duration-200 ${sharingDoc ? "translate-y-0" : "translate-y-3"}`}
        >
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#aaa] mb-1.5">
            Share Document
          </p>
          <h2
            className="text-[1.6rem] font-normal text-[#1a1a1a] mb-1"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {sharingDoc?.title || "Untitled"}
          </h2>
          <p className="text-[11px] text-[#bbb] tracking-wide mb-7">
            Select users and assign their access level.
          </p>

          {/* User list */}
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-6">
            {users.length === 0 && (
              <p className="text-[11px] text-[#ccc] tracking-widest uppercase text-center py-6">
                No other users found
              </p>
            )}
            {users.map((u) => {
              const selected = sharedWith.includes(u.id);
              return (
                <div
                  key={u.id}
                  className={`flex items-center justify-between px-4 py-3 border transition-all duration-100 cursor-pointer ${
                    selected
                      ? "border-[#a07850] bg-[#fdf9f5]"
                      : "border-[#e0dbd3] bg-white hover:border-[#ccc]"
                  }`}
                  onClick={() => toggleUser(u.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${selected ? "bg-[#a07850]" : "bg-[#e0dbd3]"}`}
                    />
                    <span className="text-[13px] text-[#1a1a1a] font-mono">
                      {u.email}
                    </span>
                  </div>

                  {/* Role toggle — only when selected */}
                  {selected && (
                    <div
                      className="flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {["viewer", "editor"].map((role) => (
                        <button
                          key={role}
                          onClick={() => setRole(u.id, role)}
                          className={`px-2.5 py-1 text-[10px] tracking-widest uppercase border transition-all cursor-pointer font-mono ${
                            shareRole[u.id] === role
                              ? "bg-[#1a1a1a] text-[#f5f2ed] border-[#1a1a1a]"
                              : "bg-transparent text-[#999] border-[#e0dbd3] hover:border-[#a07850] hover:text-[#a07850]"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={closeShare}
              className="px-4 py-2.5 font-mono text-[11px] tracking-[0.08em] uppercase bg-transparent border border-[#e0dbd3] text-[#999] cursor-pointer transition-all hover:border-[#ccc] hover:text-[#666]"
            >
              Cancel
            </button>
            <button
              onClick={commitShare}
              disabled={sharing}
              className="px-5 py-2.5 font-mono text-[11px] tracking-[0.08em] uppercase bg-[#1a1a1a] text-[#f5f2ed] border-none cursor-pointer transition-all hover:bg-[#a07850] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sharing ? "Saving…" : "Save Access →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
