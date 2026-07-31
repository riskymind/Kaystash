# File Upload with UploadThing

## Overview

Add file and image upload functionality using **UploadThing** for secure file uploads and storage.

## Requirements

- Configure UploadThing with Next.js App Router
- Create UploadThing file router with separate endpoints for images and files
- Stick to `lib/db/items.ts` for all Prisma/database functions
- Create a reusable `FileUpload` component with drag-and-drop support
- Update the Create Item modal to use `FileUpload` for both image and file item types
- Save UploadThing file metadata (URL, key, name, size, MIME type) in the database
- Delete uploaded files from UploadThing when items are deleted
- Add a download button in `ItemDrawer` for file types
- Show upload progress indicator
- Display image preview for images and file information for files
- Prevent form submission until uploads complete
- Handle upload and deletion errors gracefully
- Validate file type and size on both the client and server

## Upload Endpoints

### `imageUploader`

- Maximum File Size: **5 MB**
- Maximum File Count: **1**
- Accept images only

### `fileUploader`

- Maximum File Size: **10 MB**
- Maximum File Count: **1**
- Accept supported document and text files only

## File Constraints

| Type   | Max Size | Extensions                                            |
| ------ | -------- | ----------------------------------------------------- |
| Images | 5 MB     | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`      |
| Files  | 10 MB    | `.pdf`, `.txt`, `.md`, `.json`, `.yaml`, `.yml`, `.xml`, `.csv`, `.toml`, `.ini` |

## MIME Types

**Images:**
- `image/png`
- `image/jpeg`
- `image/gif`
- `image/webp`
- `image/svg+xml`

**Files:**
- `application/pdf`
- `text/plain`
- `text/markdown`
- `application/json`
- `application/x-yaml`
- `text/yaml`
- `application/xml`
- `text/xml`
- `text/csv`
- `application/toml`
- `text/plain` (for `.ini`)

## Stored Metadata

Persist the following UploadThing metadata for each uploaded file:

- `url`
- `key`
- `name`
- `size`
- `mimeType`

> Do **not** store the file itself in the database.

## Delete Flow

When an item is deleted:

1. Retrieve the UploadThing file key from the database.
2. Delete the file using the UploadThing server API.
3. Delete the database record.
4. Gracefully handle failures to prevent orphaned files.

## UI Requirements

### Images

- Drag-and-drop upload area
- Upload progress bar
- Image preview
- Remove/replace image

### Files

- Drag-and-drop upload area
- Upload progress bar
- File icon
- File name
- File size
- Download button
- Remove/replace file

## Error Handling

Handle the following cases gracefully:

- Unsupported file type
- File exceeds maximum size
- Upload failure
- Network interruption
- UploadThing API errors
- File deletion failure

Display clear toast notifications for all upload and deletion events.
```