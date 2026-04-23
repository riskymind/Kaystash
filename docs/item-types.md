# Item Types

All 7 system item types in KayStash. System types are immutable (`isSystem: true`, `userId: null`).

---

## Per-Type Reference

### Snippet
| Field   | Value            |
|---------|------------------|
| Icon    | `Code` (Lucide)  |
| Color   | `#3b82f6` (blue) |
| ContentType | `TEXT`      |
| Route   | `/items/snippets` |
| Pro-only | No             |

**Purpose:** Store reusable code blocks. The `language` field enables syntax highlighting.  
**Key fields used:** `content`, `language`, `tags`

---

### Prompt
| Field   | Value               |
|---------|---------------------|
| Icon    | `Sparkles` (Lucide) |
| Color   | `#8b5cf6` (purple)  |
| ContentType | `TEXT`         |
| Route   | `/items/prompts`    |
| Pro-only | No                 |

**Purpose:** Save AI prompts and system messages for reuse.  
**Key fields used:** `content`, `description`, `tags`

---

### Command
| Field   | Value               |
|---------|---------------------|
| Icon    | `Terminal` (Lucide) |
| Color   | `#f97316` (orange)  |
| ContentType | `TEXT`         |
| Route   | `/items/commands`   |
| Pro-only | No                 |

**Purpose:** Store shell commands and CLI invocations. `language` is typically `"bash"`.  
**Key fields used:** `content`, `language`, `tags`

---

### Note
| Field   | Value                  |
|---------|------------------------|
| Icon    | `StickyNote` (Lucide)  |
| Color   | `#fde047` (yellow)     |
| ContentType | `TEXT`            |
| Route   | `/items/notes`         |
| Pro-only | No                    |

**Purpose:** Free-form markdown notes and documentation.  
**Key fields used:** `content`, `description`, `tags`

---

### File
| Field   | Value            |
|---------|------------------|
| Icon    | `File` (Lucide)  |
| Color   | `#6b7280` (gray) |
| ContentType | `FILE`      |
| Route   | `/items/files`   |
| Pro-only | **Yes**         |

**Purpose:** Upload and store arbitrary files (context files, documents, etc.) via Cloudflare R2.  
**Key fields used:** `fileUrl`, `fileName`, `fileSize`

---

### Image
| Field   | Value             |
|---------|-------------------|
| Icon    | `Image` (Lucide)  |
| Color   | `#ec4899` (pink)  |
| ContentType | `FILE`       |
| Route   | `/items/images`   |
| Pro-only | **Yes**          |

**Purpose:** Upload and store images via Cloudflare R2.  
**Key fields used:** `fileUrl`, `fileName`, `fileSize`

---

### Link
| Field   | Value               |
|---------|---------------------|
| Icon    | `Link` (Lucide)     |
| Color   | `#10b981` (emerald) |
| ContentType | `URL`          |
| Route   | `/items/links`      |
| Pro-only | No                 |

**Purpose:** Bookmark URLs — docs, references, resources.  
**Key fields used:** `url`, `description`, `tags`

---

## ContentType Classification

| ContentType | Types                          | Storage field(s)                    |
|-------------|--------------------------------|-------------------------------------|
| `TEXT`      | snippet, prompt, command, note | `content` (db.Text), `language`     |
| `FILE`      | file, image                    | `fileUrl`, `fileName`, `fileSize`   |
| `URL`       | link                           | `url`                               |

---

## Shared Properties

Every item — regardless of type — carries these fields:

| Field         | Type      | Notes                                     |
|---------------|-----------|-------------------------------------------|
| `id`          | String    | cuid                                      |
| `title`       | String    | Required                                  |
| `contentType` | Enum      | TEXT / FILE / URL                         |
| `description` | String?   | Optional free-text summary                |
| `isFavorite`  | Boolean   | User can star items                       |
| `isPinned`    | Boolean   | Pinned items appear at top of dashboard   |
| `createdAt`   | DateTime  | Auto-set                                  |
| `updatedAt`   | DateTime  | Auto-updated                              |
| `userId`      | String FK | Owner                                     |
| `itemTypeId`  | String FK | Points to one of the 7 system types       |
| `tags`        | Tag[]     | Many-to-many; used for search/filter      |
| `collections` | ItemCollection[] | Many-to-many collection membership |

---

## Display Differences

| ContentType | Rendering                                                        |
|-------------|------------------------------------------------------------------|
| `TEXT`      | Markdown editor; syntax highlighting when `language` is set      |
| `FILE`      | File viewer / downloader; thumbnail for images                   |
| `URL`       | External link; description shown as preview text                 |

The item's `itemType.color` is used throughout the UI for the accent border, icon fill, and type chip color.
