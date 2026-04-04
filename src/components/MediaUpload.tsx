import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, Video } from "lucide-react";
import { MediaType } from "../types";

interface MediaUploadProps {
  onMediaSelect: (file: File, type: MediaType) => void;
}

export default function MediaUpload({ onMediaSelect }: MediaUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const type = file.type.startsWith("video/") ? "video" : 
                   file.type.startsWith("audio/") ? "audio" : "image";
      onMediaSelect(file, type as MediaType);
    }
  }, [onMediaSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
    multiple: false,
  } as any);

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all cursor-pointer
        ${isDragActive ? "border-blue-500 bg-blue-50/10" : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50"}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4 text-zinc-400">
        <div className="p-4 rounded-full bg-zinc-800/50">
          <Upload className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-zinc-200">
            {isDragActive ? "Drop it here!" : "Upload Media"}
          </p>
          <p className="text-sm">Drag & drop or click to select</p>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1 text-xs">
            <ImageIcon className="w-3 h-3" /> Photo
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Video className="w-3 h-3" /> Video
          </div>
        </div>
      </div>
    </div>
  );
}
