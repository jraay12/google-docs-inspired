"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@/src/components/Editor";

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [doc, setDoc] = useState<any>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/documents/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDoc(data);
        setContent(data.content ?? "");
        setSaved(true);
      });
  }, [id]);

  useEffect(() => {
    if (!id || !doc) return;
    setSaved(false);

    const timeout = setTimeout(async () => {
      try {
        setSaving(true);
        await fetch(`/api/documents/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        setSaved(true);
      } catch (err) {
        console.error("Save failed:", err);
      } finally {
        setSaving(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [content, id, doc]);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setContent((prev) => {
      const base = typeof prev === "string" ? prev : "";
      return base + "\n\n" + text;
    });
    e.target.value = "";
  };

  const fetchAttachments = async () => {
    const res = await fetch(`/api/documents/${id}/attachments`);
    const data = await res.json();
    setAttachments(data);
  };

  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAttachment(true);
    const formData = new FormData();
    formData.append("file", file);

    await fetch(`/api/documents/${id}/attachments`, {
      method: "POST",
      body: formData,
    });

    await fetchAttachments();
    setUploadingAttachment(false);
    e.target.value = "";
  };

  useEffect(() => {
    if (!id) return;

    const init = async () => {
      try {
        const docRes = await fetch(`/api/documents/${id}`);
        const docData = await docRes.json();

        setDoc(docData);
        setContent(docData.content ?? "");
        setSaved(true);

        const attRes = await fetch(`/api/documents/${id}/attachments`);
        const attData = await attRes.json().catch(() => []);

        setAttachments(attData);
      } catch (err) {
        console.error("Init load failed:", err);
      }
    };

    init();
  }, [id]);

  if (!doc) {
    return (
      <div className="min-h-screen bg-[#f5f2ed] flex items-center justify-center gap-1.5">
        {[0, 200, 400].map((d) => (
          <div
            key={d}
            className="w-1 h-1 rounded-full bg-[#ccc] animate-pulse"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </div>
    );
  }

  const statusLabel = saving ? "Saving…" : saved ? "Saved" : "Unsaved";
  const dotColor = saving
    ? "bg-[#a07850] animate-pulse"
    : saved
      ? "bg-[#6a9e6a]"
      : "bg-[#ccc]";

  return (
    <div className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] font-mono flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-4 border-b border-[#ddd8d0] bg-[#f5f2ed]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#aaa] text-[11px] tracking-[0.1em] uppercase transition-colors duration-150 hover:text-[#a07850] cursor-pointer bg-transparent border-none font-mono"
          >
            ← Back
          </button>
          <span className="text-[#ddd8d0]">/</span>
          <span className="text-[10px] tracking-[0.18em] uppercase text-[#bbb]">
            Workspace
          </span>
        </div>

        {/* Save status pill */}
        <div className="flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase text-[#aaa] px-3 py-1.5 border border-[#e0dbd3]">
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${dotColor}`}
          />
          {statusLabel}
        </div>
      </nav>

      {/* Editor area */}
      <main className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-10 pt-12 pb-20">
        {/* Doc meta */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#bbb] mb-2">
            Document · #{String(id).padStart(3, "0")}
          </p>
          <h2
            className="text-4xl font-normal text-[#1a1a1a] leading-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {doc.title || "Untitled Document"}
          </h2>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <Editor
            content={content}
            onChange={setContent}
            onImport={() => document.getElementById("importFile")?.click()}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-[10px] text-[#ccc] tracking-[0.08em]">
              {
                (typeof content === "string" ? content : "").replace(
                  /<[^>]*>/g,
                  "",
                ).length
              }{" "}
              characters
            </span>
          </div>
        </div>
        <div className="mt-10 border-t border-[#e0dbd3] pt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#bbb] mb-0.5">
                Attachments
              </p>
              <p className="text-[11px] text-[#ccc]">
                {attachments.length === 0
                  ? "No files attached"
                  : `${attachments.length} file${attachments.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              onClick={() => document.getElementById("attachmentFile")?.click()}
              disabled={uploadingAttachment}
              className="flex items-center gap-2 bg-[#1a1a1a] text-[#f5f2ed] px-4 py-2 text-[11px] font-medium tracking-widest uppercase transition-all duration-150 hover:bg-[#a07850] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none font-mono"
            >
              {uploadingAttachment ? "Uploading…" : "+ Attach File"}
            </button>
          </div>

          {attachments.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {attachments.map((att) => (
                <li
                  key={att.id}
                  className="flex items-center justify-between px-4 py-3 bg-white border border-[#e0dbd3]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#ccc] text-sm">◻</span>
                    <div>
                      <p className="text-[13px] text-[#1a1a1a]">
                        {att.fileName}
                      </p>
                      <p className="text-[10px] text-[#bbb] tracking-wide uppercase mt-0.5">
                        {att.fileType || "unknown type"} ·{" "}
                        {new Date(att.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <input
        type="file"
        accept=".txt,.md"
        id="importFile"
        className="hidden"
        onChange={handleImportFile}
      />

      <input
        type="file"
        id="attachmentFile"
        className="hidden"
        onChange={handleAttachmentUpload}
      />
    </div>
  );
}
