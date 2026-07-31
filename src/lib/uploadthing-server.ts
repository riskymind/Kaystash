import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

export async function deleteUploadThingFile(key: string): Promise<boolean> {
  try {
    const result = await utapi.deleteFiles(key);
    return result.success;
  } catch {
    return false;
  }
}
