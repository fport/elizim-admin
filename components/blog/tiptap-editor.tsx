"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import UnderlineExtension from "@tiptap/extension-underline";
import { useEffect, useRef } from "react";
import { EditorToolbar } from "./editor-toolbar";
import { uploadApi } from "@/lib/api";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Icerik yazin...",
  editable = true,
}: TiptapEditorProps) {
  const isUpdatingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      Placeholder.configure({ placeholder }),
      UnderlineExtension,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      if (!isUpdatingRef.current) {
        onChange(editor.getHTML());
      }
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      isUpdatingRef.current = true;
      editor.commands.setContent(content);
      isUpdatingRef.current = false;
    }
  }, [content, editor]);

  async function handleImageInsert() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      try {
        const url = await uploadApi.uploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        alert("Gorsel yuklenemedi");
      }
    };
    input.click();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted/30">
      <EditorToolbar editor={editor} onImageInsert={handleImageInsert} />
      <EditorContent
        editor={editor}
        className="tiptap-content min-h-[300px] px-4 py-3 text-sm text-foreground focus-within:outline-none"
      />
    </div>
  );
}
