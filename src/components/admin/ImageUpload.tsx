"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  bucket: string;
  path: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
}

export default function ImageUpload({ bucket, path, onUpload, currentUrl }: ImageUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);

      const fileExt = file.name.split(".").pop();
      const fileName = `${path}/${Date.now()}.${fileExt}`;

      // Simulate progress since Supabase JS doesn't expose upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90));
      }, 200);

      const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

      clearInterval(progressInterval);

      if (error) {
        console.error("Upload error:", error);
        setUploading(false);
        setProgress(0);
        alert("Erro ao fazer upload: " + error.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;

      setProgress(100);
      setPreview(publicUrl);
      onUpload(publicUrl);

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    },
    [bucket, path, onUpload, supabase]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <div>
      {preview && (
        <div style={{ marginBottom: "12px", position: "relative" }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: "200px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onUpload("");
            }}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            x
          </button>
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${dragOver ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "8px",
          padding: "24px",
          textAlign: "center",
          cursor: uploading ? "default" : "pointer",
          backgroundColor: dragOver ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
          transition: "all 0.2s",
        }}
      >
        {uploading ? (
          <div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
              Enviando...
            </p>
            <div
              style={{
                height: "4px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  backgroundColor: "#b8945f",
                  borderRadius: "2px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>
              Arraste uma imagem ou clique para selecionar
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
              PNG, JPG ou WebP
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
