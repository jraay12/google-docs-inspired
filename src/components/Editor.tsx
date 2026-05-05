"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";

type Props = {
  content: string;
  onChange: (value: string) => void;
  onImport?: () => void;
  readOnly?: boolean;
};

const ToolbarButton = ({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-[11px] font-mono tracking-widest uppercase border transition-all duration-100 cursor-pointer
      ${
        active
          ? "bg-[#1a1a1a] text-[#f5f2ed] border-[#1a1a1a]"
          : "bg-transparent text-[#999] border-[#e0dbd3] hover:border-[#a07850] hover:text-[#a07850]"
      }`}
  >
    {children}
  </button>
);

export default function Editor({
  content,
  onChange,
  onImport,
  readOnly,
}: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content || "<p></p>",
    immediatelyRender: false,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  if (!editor) return null;

  return (
    <div className="flex flex-col flex-1">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex gap-1.5 mb-4 flex-wrap p-3 bg-[#faf8f5] border border-[#e0dbd3] border-b-0 items-center">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            B
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <em style={{ fontFamily: "'Instrument Serif', serif" }}>I</em>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          >
            <span className="underline">U</span>
          </ToolbarButton>

          <div className="w-px bg-[#e0dbd3] mx-1 self-stretch" />

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive("heading", { level: 1 })}
          >
            H1
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
          >
            H2
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive("heading", { level: 3 })}
          >
            H3
          </ToolbarButton>

          <div className="w-px bg-[#e0dbd3] mx-1 self-stretch" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            • List
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            1. List
          </ToolbarButton>

          <div className="ml-auto" />

          <ToolbarButton onClick={() => onImport?.()}>+ Import</ToolbarButton>
        </div>
      )}

      {/* Editor area */}
      <div
        className={`flex-1 border border-[#e0dbd3] px-10 py-8 min-h-[480px] transition-colors duration-150 ${
          readOnly
            ? "bg-[#faf8f5] cursor-default select-none"
            : "bg-white cursor-text focus-within:border-[#a07850]"
        }`}
        onClick={() => !readOnly && editor.commands.focus()}
      >
        <style>{`
        .tiptap { outline: none; min-height: 440px; font-family: 'DM Mono', monospace; font-size: 13.5px; line-height: 1.85; color: #333; caret-color: #a07850; }
        .tiptap p { margin-bottom: 0.75em; }
        .tiptap h1 { font-family: 'Instrument Serif', serif; font-size: 2rem; font-weight: 400; color: #1a1a1a; line-height: 1.2; margin-bottom: 0.5em; margin-top: 0.25em; }
        .tiptap h2 { font-family: 'Instrument Serif', serif; font-size: 1.4rem; font-weight: 400; color: #1a1a1a; line-height: 1.3; margin-bottom: 0.5em; margin-top: 0.25em; }
        .tiptap h3 { font-family: 'Instrument Serif', serif; font-size: 1.1rem; font-weight: 400; color: #1a1a1a; margin-bottom: 0.4em; margin-top: 0.2em; }
        .tiptap ul { list-style: disc; padding-left: 1.4em; margin-bottom: 0.75em; }
        .tiptap ol { list-style: decimal; padding-left: 1.4em; margin-bottom: 0.75em; }
        .tiptap li { margin-bottom: 0.2em; }
        .tiptap strong { color: #1a1a1a; }
        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #ccc; pointer-events: none; float: left; height: 0; }
        .tiptap.ProseMirror[contenteditable="false"] { opacity: 0.75; }
      `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
