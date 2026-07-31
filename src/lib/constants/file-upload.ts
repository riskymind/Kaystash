export const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const FILE_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const IMAGE_MIME_TYPES: string[] = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export const FILE_EXTENSIONS: string[] = [
  'pdf',
  'txt',
  'md',
  'json',
  'yaml',
  'yml',
  'xml',
  'csv',
  'toml',
  'ini',
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
