# HoLink

HoLink is a **link-in-bio** style web application (similar to Linktree) where users can register, log in, manage their profile, and curate a list of links. The app is fully client-side, persisting all data in the browser via `localStorage`.

---

## Tech Stack Used

| Category             | Technology                                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework            | [Vue 3](https://vuejs.org/) (Composition API, `<script setup lang="ts">`)                                                                                                                 |
| Language             | [TypeScript](https://www.typescriptlang.org/)                                                                                                                                             |
| Build Tool           | [Vite](https://vite.dev/)                                                                                                                                                                 |
| State Management     | [Pinia](https://pinia.vuejs.org/)                                                                                                                                                         |
| Routing              | [Vue Router](https://router.vuejs.org/)                                                                                                                                                   |
| Styling              | [Tailwind CSS v4](https://tailwindcss.com/), [tw-animate-css](https://www.npmjs.com/package/tw-animate-css), [class-variance-authority](https://cva.style/docs), `clsx`, `tailwind-merge` |
| Icons                | [`@tabler/icons-vue`](https://tabler-icons.io/)                                                                                                                                           |
| Drag & Drop          | [`vue-draggable-plus`](https://github.com/algora-io/vue-draggable-plus)                                                                                                                   |
| SEO / Head           | [`@vueuse/head`](https://github.com/vueuse/head)                                                                                                                                          |
| Linting & Formatting | ESLint, Prettier                                                                                                                                                                          |
| Unit Testing         | [Vitest](https://vitest.dev/) + [`@vue/test-utils`](https://test-utils.vue.org/)                                                                                                          |
| E2E Testing          | [Playwright](https://playwright.dev/)                                                                                                                                                     |
| Git Hooks            | [Lefthook](https://github.com/evilmartians/lefthook)                                                                                                                                      |
| Type Checking        | [`vue-tsc`](https://github.com/vuejs/language-tools)                                                                                                                                      |
| Persistence          | Browser `localStorage` (no backend)                                                                                                                                                       |

---

## How to Run the Project

### Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0` (see `engines` in `package.json`)
- A package manager — **npm** is used in the commands below (the project also ships a `bun.lock`)

### Installation

```bash
npm install
```

### Development

Start the Vite dev server:

```bash
npm run dev
```

Then open the URL printed in the terminal (typically `http://localhost:5173`).

### Production Build

Build the app with type checking included:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Linting, Formatting & Type Checking

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run type-check` | Run `vue-tsc` to verify TypeScript types |
| `npm run lint`       | Run ESLint (with auto-fix)               |
| `npm run format`     | Format `src/` with Prettier              |

### Testing

| Command                 | Description                         |
| ----------------------- | ----------------------------------- |
| `bun run test`          | Run unit tests (Vitest)             |
| `bun run test:coverage` | Run unit tests with coverage report |
| `npx playwright test`   | Run E2E tests (Playwright)          |

**Unit tests** cover URL normalization, platform detection, link validation, and profile validation — 42 tests total.

**E2E tests** cover the full link management flow: add, edit, delete, and undo (run `npm run dev` first).

### Git Hooks

**Lefthook** is used to ensure code quality. Before every commit, it automatically runs:
- **Linting** (ESLint)
- **Type Checking** (vue-tsc)
- **Unit Testing** (Vitest)

If any of these fail, the commit is blocked.

---

## Main Features Completed

### Authentication

- **Register** a new account with username, password, and confirm-password validation.
- **Login** with username + password, including redirect handling (`?redirect=...`).
- **Logout** from the dashboard.
- **Route guards** — the dashboard requires authentication; unauthenticated users are redirected to `/login`.

### Profile Management

- Edit profile details: **username**, **display name**, **bio**, and **avatar URL**.
- Live preview of the public profile.
- SEO-friendly document head management via `@vueuse/head`.

### Link Management

- **Add** links with a title and URL.
- **Edit** existing links inline.
- **Delete** links.
- **Toggle** a link's active/inactive state (inactive links can be hidden from the public view).
- **Search/filter** links by title or URL.

### Public Profile

- Shareable public profile page at `/:username`.
- Shows the user's avatar, name, bio, and active links.
- Loading skeleton for a polished loading experience.

### UX / UI

- **Dark / light theme** toggle with persisted preference.
- **Toast notifications** for success and error feedback.
- **Tabs** UI for switching between Profile and Links management.
- Reusable UI component library (`Button`, `Input`, `Textarea`, `Switch`, `Modal`, `Tabs`).
- **404 Not Found** page for unknown routes.

---

## Advanced Logic Features Implemented

- **Drag-and-drop reordering** — Links can be reordered via drag-and-drop (`vue-draggable-plus`) and the new order is persisted. Manual **move up / move down** controls are also available.
- **Soft-delete with undo** — Deleting a link marks it as pending; users get an **undo** window before the deletion is confirmed, preventing accidental data loss.
- **Automatic platform detection** — URLs are analyzed to detect the platform (`instagram`, `youtube`, `tiktok`, `whatsapp`, `marketplace`, `website`, or `unknown`), with a matching icon rendered per link.
- **URL normalization & validation** — Input URLs are validated and normalized (stored alongside the raw URL) before being saved.
- **Analytics logging** — Events such as `profile_saved`, `link_added`, `link_clicked`, and `public_profile_viewed` are logged to `localStorage`, including:
  - Detected device type (mobile/desktop).
  - URL domain extraction.
  - **Field-level change diffing** for profile updates (only changed fields are reported).
- **Simulated async latency** — Mutations (e.g., profile save, login, register) simulate network latency to demonstrate realistic loading states.
- **Session persistence** — The current session and full user registry are persisted in `localStorage`, so the app survives page reloads.

---

## Known Limitations or Trade-offs

- **No backend** — All data (users, links, sessions, analytics) lives in the browser's `localStorage`. Data is **not shared across devices or browsers**.
- **Plaintext passwords** — Passwords are stored in plaintext in `localStorage`. This is acceptable for a demo/skill test, but **must never** be done in production.
- **No real API layer** — There is no network communication; everything is mocked client-side.
- **Single-user-per-browser scope** — The "database" is local to each browser instance.

---

## What Would Be Improved If Given More Time

- **Integrate a real API** using **Axios** and **TanStack Query for Vue** (`@tanstack/vue-query`) for data fetching, caching, and optimistic updates.
- **Validation with Zod schemas** — Replace manual validators with Zod (Standard Schema) for strongly-typed, reusable validation across forms.
- **Implement TanStack Form** (`@tanstack/vue-form`) for more robust, scalable form state management and validation.
- **Improve the UI** — Polish the visual design, spacing, animations, and overall responsiveness.
- **Add a sidebar & bottom bar** — Introduce a sidebar navigation for desktop and a bottom bar for mobile to improve navigation and layout structure.
