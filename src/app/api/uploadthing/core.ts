import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/auth';
import { FILE_EXTENSIONS, IMAGE_MAX_SIZE_BYTES, FILE_MAX_SIZE_BYTES } from '@/lib/constants/file-upload';

const f = createUploadthing();

async function requireProUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UploadThingError('Unauthorized');
  }
  if (!session.user.isPro) {
    throw new UploadThingError('File and Image uploads are a Pro feature. Upgrade to unlock.');
  }
  return { userId: session.user.id };
}

export const ourFileRouter = {
  // Route config caps at "8MB" (nearest power-of-2 UploadThing accepts) — the exact
  // 5MB spec limit is enforced below in middleware, which runs before upload begins.
  imageUploader: f({
    image: { maxFileSize: '8MB', maxFileCount: 1 },
  })
    .middleware(async ({ files }) => {
      const userData = await requireProUser();
      if ((files[0]?.size ?? 0) > IMAGE_MAX_SIZE_BYTES) {
        throw new UploadThingError('Image exceeds the 5 MB limit.');
      }
      return userData;
    })
    .onUploadComplete(async ({ file }) => ({
      url: file.ufsUrl,
      key: file.key,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    })),

  // Route config caps at "16MB" (nearest power-of-2) — the exact 10MB spec limit
  // and the extension allowlist are enforced below in middleware.
  fileUploader: f({
    blob: { maxFileSize: '16MB', maxFileCount: 1 },
  })
    .middleware(async ({ files }) => {
      const userData = await requireProUser();
      const file = files[0];
      const extension = file?.name.split('.').pop()?.toLowerCase();
      if (!extension || !FILE_EXTENSIONS.includes(extension)) {
        throw new UploadThingError(`Unsupported file type: .${extension ?? 'unknown'}`);
      }
      if ((file?.size ?? 0) > FILE_MAX_SIZE_BYTES) {
        throw new UploadThingError('File exceeds the 10 MB limit.');
      }
      return userData;
    })
    .onUploadComplete(async ({ file }) => ({
      url: file.ufsUrl,
      key: file.key,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
