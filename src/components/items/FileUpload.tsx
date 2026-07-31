'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { UploadCloud, X, File as FileIcon, Loader2 } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { deleteUploadedFileAction } from '@/actions/items';
import {
  IMAGE_MAX_SIZE_BYTES,
  FILE_MAX_SIZE_BYTES,
  IMAGE_MIME_TYPES,
  FILE_EXTENSIONS,
  formatFileSize,
} from '@/lib/constants/file-upload';

export type UploadedFileMetadata = {
  url: string;
  key: string;
  name: string;
  size: number;
  mimeType: string;
};

interface FileUploadProps {
  endpoint: 'imageUploader' | 'fileUploader';
  value: UploadedFileMetadata | null;
  onChange: (file: UploadedFileMetadata | null) => void;
  disabled?: boolean;
}

function validateFile(file: File, endpoint: 'imageUploader' | 'fileUploader'): string | null {
  if (endpoint === 'imageUploader') {
    if (!IMAGE_MIME_TYPES.includes(file.type)) return 'Unsupported image type.';
    if (file.size > IMAGE_MAX_SIZE_BYTES) return 'Image exceeds the 5 MB limit.';
  } else {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !FILE_EXTENSIONS.includes(ext)) return `Unsupported file type: .${ext ?? 'unknown'}`;
    if (file.size > FILE_MAX_SIZE_BYTES) return 'File exceeds the 10 MB limit.';
  }
  return null;
}

export function FileUpload({ endpoint, value, onChange, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [removing, setRemoving] = useState(false);

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onUploadProgress: setProgress,
    onClientUploadComplete: (res) => {
      const uploaded = res[0];
      if (!uploaded) return;
      onChange({
        url: uploaded.serverData.url,
        key: uploaded.serverData.key,
        name: uploaded.serverData.name,
        size: uploaded.serverData.size,
        mimeType: uploaded.serverData.mimeType,
      });
      setProgress(0);
    },
    onUploadError: (error) => {
      toast.error(error.message || 'Upload failed. Please try again.');
      setProgress(0);
    },
  });

  async function handleFiles(files: FileList | File[]) {
    const file = Array.from(files)[0];
    if (!file) return;

    const error = validateFile(file, endpoint);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      await startUpload([file]);
    } catch {
      toast.error('Upload failed. Check your connection and try again.');
      setProgress(0);
    }
  }

  async function handleRemove() {
    if (!value) return;
    setRemoving(true);
    const result = await deleteUploadedFileAction(value.key);
    setRemoving(false);
    if (!result.success) {
      toast.error('Could not delete the file. Please try again.');
      return;
    }
    onChange(null);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    handleFiles(e.dataTransfer.files);
  }

  const accept = endpoint === 'imageUploader' ? IMAGE_MIME_TYPES.join(',') : undefined;
  const helpText =
    endpoint === 'imageUploader'
      ? 'PNG, JPG, GIF, WEBP or SVG up to 5 MB'
      : 'PDF, TXT, MD, JSON, YAML, XML, CSV, TOML or INI up to 10 MB';

  if (value) {
    const isImage = endpoint === 'imageUploader';
    return (
      <div className="rounded-md border border-border bg-background p-3">
        <div className="flex items-center gap-3">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value.url}
              alt={value.name}
              className="size-14 rounded-md object-cover border border-border shrink-0"
            />
          ) : (
            <div className="size-14 rounded-md bg-muted flex items-center justify-center shrink-0">
              <FileIcon className="size-6 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{value.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(value.size)}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || removing}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50 shrink-0"
            title="Remove"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isUploading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
        } ${disabled || isUploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {isUploading ? (
          <>
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Uploading… {progress}%</p>
            <div className="w-full max-w-40 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : (
          <>
            <UploadCloud className="size-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-[10px] text-muted-foreground">{helpText}</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
