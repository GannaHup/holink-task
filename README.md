# 🔗 HoLink — Link-in-Bio Manager

A modern **link-in-bio** application (à la Linktree) built as a frontend skill test. HoLink lets users manage a personal profile with a collection of links that can be shared via a public page — all running client-side with `localStorage` persistence.

---

## 🛠 Tech Stack

| Technology                  | Purpose                                       |
| --------------------------- | --------------------------------------------- |
| **Vue 3** (Composition API) | UI framework with `<script setup>` syntax     |
| **TypeScript**              | Type safety across the entire codebase        |
| **Pinia**                   | Centralized state management                  |
| **Vue Router 5**            | Client-side routing with layout system        |
| **Tailwind CSS v4**         | Utility-first styling via `@tailwindcss/vite` |
| **@tabler/icons-vue**       | Consistent iconography                        |
| **Vite 8**                  | Lightning-fast dev server & build tooling     |

---

## 🚀 Setup & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type-check the project
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Lint & auto-fix
npm run lint

# Format code
npm run format
```

> **Node requirement:** `^20.19.0 || >=22.12.0`

---

## ✅ Features Completed

- 🏠 **Dashboard** — Tabbed interface with **Profile Editor** and **Link Manager**
- 👤 **Profile Editor** — Edit username, display name, bio, and avatar URL with live validation
- 🔗 **Link CRUD** — Add, inline-edit, delete, and toggle active/inactive for each link
- 🌐 **Public Profile Page** — Clean, responsive page at `/:username` showing all active links
- 🔄 **Link Reordering** — Move links up/down to control display order
- 🔍 **Search & Filter** — Real-time filtering across link titles and URLs
- ↩️ **Undo Delete** — 5-second soft-delete window with one-click restore
- 🏷️ **Auto Platform Detection** — Automatically identifies Instagram, YouTube, TikTok, WhatsApp, and major marketplaces
- 🎨 **Platform-Specific Theming** — Color-coded icons per detected platform
- 🔔 **Toast Notifications** — Non-intrusive success/error feedback on actions
- 📱 **Responsive Design** — Mobile-first layout that adapts to all screen sizes
- 🧭 **404 Page** — Graceful handling for unknown usernames and routes
- 💾 **localStorage Persistence** — All data survives page reloads with no backend required

---

## 🧠 Advanced Logic Implemented

### 1. 🔗 URL Parser & Platform Detector (`linkUtils.ts`)

The `normalizeUrl()` function performs a 3-step validation pipeline:

1. **Dangerous protocol rejection** — Blocks `javascript:`, `data:`, and `file:` URLs for security
2. **Protocol auto-prepending** — If no `http://` or `https://` is present, `https://` is automatically added
3. **URL Constructor validation** — Uses the native `URL` API to verify the final URL is well-formed

The `detectPlatform()` function extracts the hostname from the URL and matches it against a curated regex pattern list supporting:

- **Social:** Instagram, YouTube (includes `youtu.be`), TikTok
- **Messaging:** WhatsApp (`wa.me` + `whatsapp.com`)
- **Marketplace:** Tokopedia, Shopee, Bukalapak, Lazada (with multi-TLD support)
- **Fallback:** Returns `'website'` for valid but unrecognized URLs, `'unknown'` for empty input

```ts
// Example flow:
normalizeUrl('instagram.com/johndoe')
// → { isValid: true, normalizedUrl: 'https://instagram.com/johndoe' }

detectPlatform('https://instagram.com/johndoe')
// → 'instagram'
```

### 2. ✅ Slug Validation (`linkUtils.ts`)

Usernames are validated with strict rules to ensure clean, URL-safe slugs:

- **Allowed characters:** lowercase `a–z`, digits `0–9`, dash `-`, underscore `_`
- **Length constraint:** 3–30 characters
- **Regex pattern:** `^[a-z0-9_-]+$`

The router's `beforeEach` guard further enforces that only existing usernames resolve to a public profile — invalid ones redirect to the 404 page.

### 3. ↩️ Undo Delete (Pinia Store)

Instead of permanently removing a link, the delete flow uses a **soft-delete pattern**:

1. **On delete** → the removed link is stored in `lastDeletedLink` state and a 5-second countdown begins
2. **During countdown** → a toast with "Undo" button is displayed
3. **On undo** → `undoDeleteLink()` re-inserts the link at its original position
4. **After timeout** → `lastDeletedLink` is cleared and the delete becomes permanent

```ts
// In Pinia store:
lastDeletedLink: null as HoLinkItem | null // holds the soft-deleted link
hasUndoableDelete // getter: true while undo window is active
undoDeleteLink() // action: restores the link
```

### 4. 🔍 Search & Filter (Pinia Store)

A reactive search system powered by Pinia getters:

- **`searchQuery`** — reactive string state bound to the search input
- **`sortedLinks`** — getter that returns links sorted by their `order` field
- **`filteredLinks`** — getter that chains off `sortedLinks` and performs case-insensitive matching against both `title` and `url`

This ensures the search always operates on the correctly ordered list, and the UI simply consumes `filteredLinks` without additional logic.

---

## 🏗 Technical Explanation

### Component Architecture & State Separation

```
src/
├── App.vue                    # Root — applies layout based on route.meta.layout
├── layouts/
│   └── MainLayout.vue         # Shell with navigation (used by Dashboard)
├── views/
│   ├── DashboardView.vue      # Main app page (Profile Editor + Link Manager tabs)
│   ├── PublicProfileView.vue  # Public-facing link page (no nav shell)
│   └── NotFoundView.vue       # 404 fallback
├── stores/
│   └── holink-store.ts        # Single Pinia store — all app state
├── utils/
│   └── linkUtils.ts           # Pure functions: URL normalization, platform detection, slug validation
├── types/
│   └── index.ts               # TypeScript interfaces (HoLinkUser, HoLinkItem, Platform)
└── router/
    └── index.ts               # Routes + beforeEach guard for username validation
```

**State separation is clean:**

- `holink-store.ts` owns **all** application state (`currentUser`, `searchQuery`, `lastDeletedLink`)
- Views are **stateless consumers** — they read from the store and dispatch actions
- Utility functions in `linkUtils.ts` are **pure** with no side effects — easily testable

### URL Validation & Normalization Flow

```
User Input → normalizeUrl()
                ├── Reject empty string
                ├── Reject dangerous protocols (javascript:, data:, file:)
                ├── Auto-prepend https:// if missing protocol
                └── Validate via URL constructor → return { isValid, normalizedUrl, error }
            → detectPlatform()
                ├── Parse hostname from URL
                ├── Match against PLATFORM_PATTERNS regex array
                └── Return Platform type ('instagram' | 'youtube' | ... | 'website')
```

This pipeline runs every time a link is added or edited, ensuring data integrity at the point of entry.

### Data Consistency Between Dashboard & Public Page

Both pages share a **single source of truth** — the Pinia store:

1. **Dashboard** modifies state → Pinia actions update `currentUser` → changes are persisted to `localStorage`
2. **Public Profile** reads from the same `currentUser` state → always reflects the latest data
3. On page load, `initialize()` reads from `localStorage` (or creates mock data) → populates reactive state

Because there's only one store instance (Singleton pattern via Pinia), there's no possibility of state drift between views. The `router.beforeEach` guard ensures the public page only renders for valid, existing usernames.

### API-Ready Architecture 🌐

The current `localStorage` implementation is intentionally designed as a **drop-in persistence layer** that can be swapped for a REST API:

```ts
// Current (localStorage):
async addLink(link: Omit<HoLinkItem, 'id'>) {
  // ... validation ...
  currentUser.links.push(newLink)
  this.saveToStorage()
}

// Future (REST API):
async addLink(link: Omit<HoLinkItem, 'id'>) {
  // ... same validation ...
  const response = await axios.post('/api/links', newLink)
  currentUser.links.push(response.data)
}
```

The **migration path is minimal** because:

- All business logic (validation, normalization, platform detection) lives in **pure utility functions** — unchanged by the data source
- Pinia **actions** are the only place that touch persistence — a simple find-and-replace swaps `localStorage` calls for `axios` calls
- TypeScript interfaces (`HoLinkUser`, `HoLinkItem`) double as API contract types
- The store's getter layer (`sortedLinks`, `filteredLinks`) is completely agnostic to the data source

---

## ⚠️ Known Limitations & Future Improvements

| Area                   | Current State              | Planned Improvement                                                               |
| ---------------------- | -------------------------- | --------------------------------------------------------------------------------- |
| 🔄 **Link Reordering** | Up/Down buttons            | Replace with `vuedraggable` for smooth drag-and-drop reordering                   |
| 🧪 **Testing**         | No automated tests         | Add **Vitest** unit tests for `linkUtils.ts` pure functions + Pinia store actions |
| 🔐 **Authentication**  | Single mock user           | Add login/signup flow with JWT-based auth                                         |
| 🌐 **Backend**         | `localStorage` only        | Connect to a REST API (Express/Fastify + PostgreSQL)                              |
| 📊 **Analytics**       | Console-only event logging | Build a proper analytics dashboard with chart visualizations                      |
| 🎨 **Themes**          | Single color scheme        | Add customizable themes/branding per user profile                                 |

---

## 📁 Project Structure

```
holink-task/
├── public/                     # Static assets
├── src/
│   ├── assets/main.css         # Global styles (Tailwind directives)
│   ├── components/             # Reusable components
│   ├── constants/              # App-wide constants
│   ├── layouts/MainLayout.vue  # Dashboard shell layout
│   ├── router/index.ts         # Route definitions + guards
│   ├── stores/holink-store.ts  # Pinia store (single source of truth)
│   ├── types/index.ts          # TypeScript type definitions
│   ├── utils/linkUtils.ts      # Pure utility functions
│   └── views/                  # Page-level components
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite + Tailwind plugin config
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```

---

> Built with ❤️ as a frontend skill test submission.
