"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const MenuButton = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      padding: "6px 10px",
      borderRadius: 4,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 500,
      background: active ? "rgba(255,255,255,0.15)" : "transparent",
      color: active ? "#fff" : "rgba(255,255,255,0.5)",
      transition: "all 0.15s",
    }}
    onMouseEnter={(e) => {
      if (!active)
        (e.target as HTMLElement).style.background = "rgba(255,255,255,0.08)";
    }}
    onMouseLeave={(e) => {
      if (!active)
        (e.target as HTMLElement).style.background = "transparent";
    }}
  >
    {children}
  </button>
);

const Divider = () => (
  <div
    style={{
      width: 1,
      height: 20,
      background: "rgba(255,255,255,0.1)",
      margin: "0 4px",
    }}
  />
);

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Comece a escrever...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      ImageExt.configure({
        HTMLAttributes: { style: "max-width: 100%; height: auto; border-radius: 8px;" },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style:
          "min-height: 400px; padding: 20px; outline: none; color: #fff; font-size: 15px; line-height: 1.7;",
      },
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL do link:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImageUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL da imagem:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addImageUpload = useCallback(() => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `blog/editor/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("blog")
        .upload(path, file, { upsert: true });
      if (error) {
        alert("Erro no upload: " + error.message);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("blog")
        .getPublicUrl(path);
      editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        overflow: "hidden",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          padding: "8px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        {/* Headings */}
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Título"
        >
          H2
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Subtítulo"
        >
          H3
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          active={editor.isActive("heading", { level: 4 })}
          title="Subtítulo menor"
        >
          H4
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
          title="Parágrafo"
        >
          P
        </MenuButton>

        <Divider />

        {/* Formatting */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Negrito"
        >
          <strong>B</strong>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Itálico"
        >
          <em>I</em>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Sublinhado"
        >
          <u>U</u>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Riscado"
        >
          <s>S</s>
        </MenuButton>

        <Divider />

        {/* Alignment */}
        <MenuButton
          onClick={() =>
            editor.chain().focus().setTextAlign("left").run()
          }
          active={editor.isActive({ textAlign: "left" })}
          title="Alinhar à esquerda"
        >
          ≡
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor.chain().focus().setTextAlign("center").run()
          }
          active={editor.isActive({ textAlign: "center" })}
          title="Centralizar"
        >
          ≡
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor.chain().focus().setTextAlign("right").run()
          }
          active={editor.isActive({ textAlign: "right" })}
          title="Alinhar à direita"
        >
          ≡
        </MenuButton>

        <Divider />

        {/* Lists */}
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          active={editor.isActive("bulletList")}
          title="Lista"
        >
          • Lista
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          active={editor.isActive("orderedList")}
          title="Lista numerada"
        >
          1. Lista
        </MenuButton>

        <Divider />

        {/* Blocks */}
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
          active={editor.isActive("blockquote")}
          title="Citação"
        >
          " Citação
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor.chain().focus().setHorizontalRule().run()
          }
          title="Linha divisória"
        >
          ─
        </MenuButton>

        <Divider />

        {/* Media */}
        <MenuButton onClick={addLink} active={editor.isActive("link")} title="Link">
          🔗 Link
        </MenuButton>
        {editor.isActive("link") && (
          <MenuButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remover link"
          >
            ✕
          </MenuButton>
        )}
        <MenuButton onClick={addImageUpload} title="Upload de imagem">
          📤 Upload
        </MenuButton>
        <MenuButton onClick={addImageUrl} title="Imagem por URL">
          🖼 URL
        </MenuButton>
      </div>

      {/* Editor content */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .ProseMirror p.is-editor-empty:first-child::before {
              content: attr(data-placeholder);
              float: left;
              color: rgba(255,255,255,0.25);
              pointer-events: none;
              height: 0;
            }
            .ProseMirror h2 { font-size: 28px; font-weight: 600; margin: 24px 0 12px; color: #fff; }
            .ProseMirror h3 { font-size: 22px; font-weight: 600; margin: 20px 0 10px; color: #fff; }
            .ProseMirror h4 { font-size: 18px; font-weight: 600; margin: 16px 0 8px; color: #fff; }
            .ProseMirror p { margin: 8px 0; }
            .ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 8px 0; }
            .ProseMirror li { margin: 4px 0; }
            .ProseMirror blockquote {
              border-left: 3px solid rgba(255,255,255,0.2);
              padding-left: 16px;
              margin: 16px 0;
              color: rgba(255,255,255,0.7);
              font-style: italic;
            }
            .ProseMirror a { color: #1CB8E8; text-decoration: underline; }
            .ProseMirror img { margin: 16px 0; }
            .ProseMirror hr {
              border: none;
              border-top: 1px solid rgba(255,255,255,0.1);
              margin: 24px 0;
            }
            .ProseMirror:focus { outline: none; }
          `,
        }}
      />
      <EditorContent editor={editor} />
    </div>
  );
}