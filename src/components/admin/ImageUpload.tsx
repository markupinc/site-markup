"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  bucket: string;
  path: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
  multiple?: boolean;
}

export default function ImageUpload({
  bucket,
  path,
  onUpload,
  currentUrl,
  multiple = false,
}: ImageUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState({ done: 0, total: 0 });
  const [preview, setPreview] = useState<string | null>(
    !multiple && currentUrl ? currentUrl : null
  );
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${path}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

      const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        console.error("Upload error:", error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    },
    [bucket, path, supabase]
  );

  const handleFiles = useCallback(
    async (files: FileList) => {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      setUploading(true);
      setUploadCount({ done: 0, total: imageFiles.length });

      for (let i = 0; i < imageFiles.length; i++) {
        const url = await uploadFile(imageFiles[i]);
        if (url) {
          onUpload(url);
          if (!multiple) setPreview(url);
        }
        setUploadCount({ done: i + 1, total: imageFiles.length });
      }

      setTimeout(() => {
        setUploading(false);
        setUploadCount({ done: 0, total: 0 });
      }, 500);
    },
    [uploadFile, onUpload, multiple]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <div>
      {/* Single image preview (only for non-multiple mode) */}
      {!multiple && preview && (
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
            ×
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
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
              Enviando {uploadCount.done}/{uploadCount.total}...
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
                  width: `${uploadCount.total > 0 ? (uploadCount.done / uploadCount.total) * 100 : 0}%`,
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
              {multiple
                ? "Arraste imagens ou clique para selecionar (múltiplas)"
                : "Arraste uma imagem ou clique para selecionar"}
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
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
