# Item CRUD Architecture

A unified design for creating, reading, updating, and deleting all 7 item types. Type-specific logic lives in components; mutations and queries are type-agnostic.

---

## File Structure

```
src/
├── actions/
│   └── items.ts                    # All item mutations (create, update, delete, toggle)
│
├── lib/db/
│   └── items.ts                    # All item queries (extend existing file)
│
├── app/(dashboard)/
│   └── items/
│       └── [type]/
│           └── page.tsx            # Server component — fetches items by type, renders list
│
└── components/
    └── items/
        ├── ItemList.tsx            # Maps items → ItemCard (client, handles empty state)
        ├── ItemCard.tsx            # Single item card, adapts by contentType
        ├── ItemDrawer.tsx          # Slide-in sheet for view + edit (client)
        ├── ItemForm.tsx            # Create/edit form, adapts fields by contentType (client)
        ├── ContentPreview.tsx      # Renders item content by contentType (TEXT/FILE/URL)
        └── DeleteItemDialog.tsx    # Confirm-before-delete dialog (client)
```

---

## Routing: `/items/[type]`

The dynamic segment maps plural URL slugs to system type names:

| URL                  | `params.type` | System type name |
|----------------------|---------------|------------------|
| `/items/snippets`    | `snippets`    | `snippet`        |
| `/items/prompts`     | `prompts`     | `prompt`         |
| `/items/commands`    | `commands`    | `command`        |
| `/items/notes`       | `notes`       | `note`           |
| `/items/files`       | `files`       | `file`           |
| `/items/images`      | `images`      | `image`          |
| `/items/links`       | `links`       | `link`           |

The page strips the trailing `s` (e.g. `snippets → snippet`) to look up the item type. If the slug is unrecognised, `notFound()` is called.

```typescript
// src/app/(dashboard)/items/[type]/page.tsx (shape only)
export default async function ItemTypePage({ params }: { params: { type: string } }) {
  const typeName = params.type.replace(/s$/, '');          // "snippets" → "snippet"
  const session  = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [itemType, items] = await Promise.all([
    getItemTypeByName(typeName),                           // 404 guard
    getItemsByType(session.user.id, typeName),
  ]);

  if (!itemType) notFound();

  return <ItemList items={items} itemType={itemType} />;
}
```

---

## Data Fetching: `src/lib/db/items.ts`

Add these functions to the existing file (alongside `getPinnedItems` / `getRecentItems`).

```typescript
// New types
export type ItemFull = {
  id: string;
  title: string;
  contentType: 'TEXT' | 'FILE' | 'URL';
  content:     string | null;
  fileUrl:     string | null;
  fileName:    string | null;
  fileSize:    number | null;
  url:         string | null;
  description: string | null;
  language:    string | null;
  isFavorite:  boolean;
  isPinned:    boolean;
  createdAt:   Date;
  updatedAt:   Date;
  tags:        string[];
  collections: Array<{ id: string; name: string }>;
  itemType: { id: string; name: string; icon: string; color: string };
};

// New functions
export async function getItemTypeByName(name: string) { ... }
export async function getItemsByType(userId: string, typeName: string): Promise<ItemFull[]> { ... }
export async function getItemById(userId: string, itemId: string): Promise<ItemFull | null> { ... }
```

Queries include `tags`, `collections.collection`, and `itemType`. Ownership is always filtered by `userId`.

---

## Mutations: `src/actions/items.ts`

All actions follow the existing `{ success: true } | { success: false; error: string }` pattern from `src/actions/profile.ts`. Session is obtained via `auth()` at the top of each action.

### Zod schemas (input validation)

```typescript
// Base fields shared by all types
const BaseItemSchema = z.object({
  title:         z.string().min(1).max(200),
  description:   z.string().max(500).optional(),
  tags:          z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
});

// Extended per ContentType
const TextItemSchema = BaseItemSchema.extend({
  contentType: z.literal('TEXT'),
  content:     z.string().min(1),
  language:    z.string().optional(),
  itemTypeId:  z.string(),
});

const UrlItemSchema = BaseItemSchema.extend({
  contentType: z.literal('URL'),
  url:         z.string().url(),
  itemTypeId:  z.string(),
});

const FileItemSchema = BaseItemSchema.extend({
  contentType: z.literal('FILE'),
  fileUrl:     z.string().url(),
  fileName:    z.string(),
  fileSize:    z.number().int().positive(),
  itemTypeId:  z.string(),
});

const CreateItemSchema = z.discriminatedUnion('contentType', [
  TextItemSchema, UrlItemSchema, FileItemSchema,
]);
```

### Exported actions

| Action                                    | DB operation                                              |
|-------------------------------------------|-----------------------------------------------------------|
| `createItemAction(data)`                  | `prisma.item.create` + tag upserts + collection links     |
| `updateItemAction(id, data)`              | `prisma.item.update` + tag sync + collection sync         |
| `deleteItemAction(id)`                    | `prisma.item.delete` (cascades ItemCollection rows)       |
| `toggleFavoriteAction(id)`                | Flips `isFavorite` boolean                                |
| `togglePinAction(id)`                     | Flips `isPinned` boolean                                  |

All actions verify ownership (`userId` on the item) before mutating.

---

## Components

### `ItemList.tsx` — client component

- Receives `items: ItemFull[]` and `itemType` as props
- Renders a grid of `<ItemCard>` components
- Owns "New Item" button that opens `<ItemDrawer>` in create mode
- Shows empty state when `items.length === 0`

### `ItemCard.tsx` — client component

Displays a single item row/card. Adapts by `contentType`:

| ContentType | Preview shown                                    |
|-------------|--------------------------------------------------|
| `TEXT`      | First ~120 chars of `content`, syntax-highlighted|
| `FILE`      | `fileName` + file size badge                     |
| `URL`       | Domain extracted from `url`                      |

Common to all: type icon chip, title, tags, favorite/pin indicators, date, action menu (edit, delete).

Clicking the card opens `<ItemDrawer>` in view mode.

### `ItemDrawer.tsx` — client component

Shadcn `Sheet` (slide-in from right). Two modes:
- **View mode** — renders `<ContentPreview>`, metadata, tags, collection memberships; Edit/Delete buttons
- **Edit mode** — renders `<ItemForm>` pre-populated; Cancel returns to view mode

### `ItemForm.tsx` — client component

Single form that adapts its fields by `contentType`:

```
All types:
  - Title (text input)
  - Description (textarea, optional)
  - Tags (tag input)
  - Collections (multi-select)

TEXT types (snippet, prompt, command, note):
  + Content (markdown/code editor)
  + Language (select, optional — shown for snippet & command)

URL type (link):
  + URL (url input)

FILE types (file, image):
  + File upload input → uploads to R2 → stores fileUrl/fileName/fileSize
```

On submit, calls `createItemAction` or `updateItemAction`. Displays errors inline via toast.

### `ContentPreview.tsx` — server-safe, no `'use client'`

Pure display. Switches on `contentType`:
- `TEXT`: syntax-highlighted code block (or markdown render for notes/prompts)
- `URL`: external link with favicon and description
- `FILE`: download link; `<img>` tag for images

### `DeleteItemDialog.tsx` — client component

Shadcn `AlertDialog`. Calls `deleteItemAction(id)` on confirm.

---

## Where Type-Specific Logic Lives

| Concern                         | Location                          | Rationale                                      |
|---------------------------------|-----------------------------------|------------------------------------------------|
| Field set per contentType       | `ItemForm.tsx`                    | UI concern; form shape drives DB shape         |
| Content rendering               | `ContentPreview.tsx`              | Pure display; no mutation logic                |
| Preview in card                 | `ItemCard.tsx`                    | Row/card layout differs per type               |
| Validation schema               | `src/actions/items.ts` (Zod)      | One place for all input rules                  |
| DB write (all types)            | `src/actions/items.ts`            | Single action handles all ContentType variants |
| DB read (all types)             | `src/lib/db/items.ts`             | Single query function, filtered by type        |
| Type icon/color mapping         | `src/lib/constants/item-types.ts` | Single source of truth, imported everywhere    |

Actions contain **zero** type-specific branching beyond what Zod's `discriminatedUnion` already handles. The discriminated schema means TypeScript knows which fields are present at compile time.

---

## Tag & Collection Sync

Tags are global (`Tag` table, `name` is unique). On create/update:
1. `upsert` each tag name → get IDs
2. `item.update({ tags: { set: tagIds } })` — replaces the full tag set

Collections are linked via `ItemCollection`. On create/update:
1. Delete all existing `ItemCollection` rows for the item
2. Create new rows for each `collectionId` in the input

---

## Zod + Server Action Wiring (pattern)

```typescript
// src/actions/items.ts
'use server';

export async function createItemAction(
  rawData: unknown
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' };

  const parsed = CreateItemSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const data = parsed.data;
  // ... prisma.item.create(...)
  return { success: true, id: created.id };
}
```

Client components call the action, check `result.success`, and display a toast on either outcome.
