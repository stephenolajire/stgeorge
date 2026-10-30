# St. George Catholic Church, Ofatedo: parish website

A public parish website plus an admin dashboard for editing its content.

- `frontend/`: React 19 + TypeScript + Vite, Tailwind CSS v4, TanStack Query, React Router 7, axios, react-toastify, lucide-react, recharts.
- `server/`: Django 6.1 + Django REST Framework, Channels (websockets), SQLite, Docker.

## Running it

- **Server (Docker):** `cd server && docker compose up --build`. Starts Django (runs migrations, then `runserver` on :8000, which serves HTTP and websockets via Daphne) and Redis. The container runs as uid 1000 (`app`), so uploads in `media/` stay owned by the host user.
  - Port 8000 can clash with the user's other project (`stix-server-web-1`). Stop it, or map `"8001:8000"` and set `VITE_API_URL` to match.
- **Server (no Docker):** `cd server && .venv/bin/python manage.py runserver`. Without `REDIS_URL`, live updates use an in-memory layer (single process only).
- **Frontend:** `cd frontend && npm run dev` (http://localhost:5173). `frontend/.env` sets `VITE_API_URL=http://localhost:8000/api`.
- **Tests:** `cd server && .venv/bin/python manage.py test`. Frontend checks: `npx tsc -b && npm run lint && npm run build`.
- **Admin login:** at `/admin/login` (frontend) or Django admin at `:8000/admin/`. Superuser `admin@stgeorge.local`; the user has the password. Never write it into files.

## Conventions the user has asked for

- **Follow the supplied designs strictly** (they send screenshots). Compare against them, e.g. with Playwright screenshots.
- **No mock data.** Content comes from the API. Fixed page copy is fine in `utils/*Content.ts`.
- **Plain text only** for all editable text (no rich-text editors). The server strips HTML (`core/text.py`). Blank lines separate paragraphs; the frontend splits them with `toParagraphs()`.
- **Admin page editors follow the About page pattern:** one card per section of the public page, in the same order. Text fields save with "Save Changes"; repeatable items are cards with an **Add Card** button, saved immediately in a popup (see `components/admin/parishLife/`).
- **Reusable Tailwind styling lives in `@theme` / `@utility` in `frontend/src/index.css`.** Examples: `card`, `form-input`, `form-label`, `form-textarea`, `container-public` (public page width, `--container-public: 90rem`), and colours such as `primary`, `accent`, `gold`, `cream`, `mist`.
- **Routes live in `frontend/src/routes/`:** `adminRoute.ts` (`ADMIN_PATHS`, sidebar nav, lazy routes) and `publicRoute.ts` (`PUBLIC_PATHS`, public nav).
- **Frontend layering:** `api/api.ts` (axios) → `services/{admin,public}/*Service.ts` (snake_case ↔ camelCase mapping, FormData) → `hooks/{admin,public}/*Hook.ts` (TanStack Query) → components → `pages/{adminpage,publicpage}/`. Types are in `types/admin/*.ts`.
- **Explain changes in plain language,** and point out what is left to do (e.g. values to fill in).

## Server apps

| App | What it holds | API |
|---|---|---|
| `user` | Custom `User` with email login. JWT in **httpOnly cookies** (`user/cookies.py`, `user/authentication.py`). Requests that change data need the `X-Requested-With: XMLHttpRequest` header (CSRF protection). | `/api/auth/login|refresh|logout|me/` |
| `about` | `AboutPage` singleton: hero, description, mission, vision, core values (one per line), patron, history (+ image), parish info | `GET/PATCH /api/about/` |
| `clergy_staff` | `Member` (roles incl. Bishop; category clergy/religious/staff derived from role; photo ≤2 MB) | `/api/clergy-staff/` (+ `summary/`, `reorder/`, public `leadership/` = parish priest, bishop, assistant parish priest) |
| `parish_life` | `ParishLifePage` singleton (hero, intro) + `Highlight` cards (icon choice) + `Activity` cards | `GET/PATCH /api/parish-life/` (includes cards), `/api/parish-life/highlights/`, `/api/parish-life/activities/` (+ `reorder/`) |
| `parish_groups` | `ParishGroup` cards | `/api/parish-groups/` (+ `reorder/`) |
| `sacraments` | `Sacrament` (title, icon, short description, content, image ≤5 MB, published) + `SacramentsPage` singleton (hero, intro, quote, list heading, bottom banner) + `SacramentFeature` icon cards | `/api/sacraments/` (+ `?search=`, `?status=`, `reorder/`), `GET/PATCH /api/sacraments/page/` (includes features), `/api/sacraments/features/` (+ `reorder/`) |
| `gallery` | `Photo` (image ≤10 MB JPG/PNG/WebP, title, category: mass_liturgy/parish_events/community/sacraments/youth/others, description, date_taken, tags) | `/api/gallery/` (12/page, `?page_size=`, `?category=`, `?search=`, `?date=month|3months|year`, `?ordering=newest|oldest|title`), `summary/`, `upload/` (several files at once; all are checked before any is saved), `bulk-delete/`, `bulk-move/`; public: `categories/` (count + cover), `albums/?category=` (grouped by day), `?date_taken=` (one day, up to 200); `GalleryPage` singleton at `GET/PATCH /api/gallery/page/` (hero, bottom banner) |
| `contact` | `ContactMessage` (status unread/read/replied/archived), `ContactReply`, `ContactPage` singleton (hero, contact details also used by the footer and emails, form/map/directions text, FAQ heading, side banner), `FAQ` cards | public `POST /api/contact/messages/` (hidden `website` spam trap; 5/hour per visitor), `subjects/`; staff: list (`?status=`, `?search=`, `?date=`), PATCH status, `reply/` (emails the sender), `summary/`, `mark-all-read/`, `bulk-delete/`, `export/` (CSV); `GET/PATCH /api/contact/page/`; `/api/contact/faqs/` |
| `news_events` | `Event` (starts_at in parish time, location, category) and `NewsPost` (published_on, category); both share title, short description, content, image ≤5 MB, published, featured. `NewsEventsPage` singleton (hero, bottom banner) | `/api/events/` (`?when=upcoming|past|month`), `/api/news/` (public hides future `published_on`); both take `?search=`, `?status=`, `?category=a,b`, `?featured=1`, 10/page, plus `categories/`, `summary/`; `GET/PATCH /api/news-events/page/` |
| `realtime` | Websocket `/ws/updates/`. Broadcasts `{"type":"content.changed","topic":...}` after any content save, delete or reorder (on commit). Only `CORS_ALLOWED_ORIGINS` may connect. | |
| `core` | Shared code: `IsAdminOrReadOnly`, `OrderedModel`, `ReorderMixin`, `DeleteImagesMixin`, `ImageFieldsMixin` (`remove_<field>=true` clears an image), `MaxFileSizeValidator`, `to_plain_text`, `bulk_changed` signal, `CardIcon` choices (shared by highlights and features) | |

The public only sees active/published items. Writes require staff. Replaced or deleted images are removed from storage.

**Email:** `core/mail_backends.py` is a ZeptoMail backend for Django 6.1's `MAILERS`, used when `ZEPTOMAIL_API_KEY` is set; otherwise emails print to the console. Templates are in `server/templates/emails/` (`base.html`, extended by `contact_notification.html` and `contact_reply.html`); send them with `core.email.send_templated_email()`. The settings `DEFAULT_FROM_EMAIL`, `CONTACT_NOTIFY_EMAIL`, `CONTACT_REPLY_TO` and `FRONTEND_URL` are documented in `.env.example`.

The Redis channel layer needs `socket_timeout: 15` in settings: redis-py 8 defaults to 5 s, which crashes channels_redis's 5 s blocking reads.

## Frontend pages

- **Admin (`/admin`):** login, Dashboard (still mock data in `services/mock/`), About, Clergy & Staff, Parish Life, Sacraments, News & Events, Gallery, Contact Messages. All other sidebar items show a placeholder.
- **List + edit-panel pages** (Clergy & Staff, Sacraments): a table on the left and an edit panel on the right. Shared pieces: `MoreMenu`, `StatusPillSelect`, `ImagePickerField`, `ConfirmDialog`, `Modal`, and `hooks/useDragReorder.ts`.
- **Admin Sacraments** has two tabs: **Sacraments** (table and edit panel) and **Page Content** (About-style cards for the rest of the public page; its header Save Changes submits the form by id). `HighlightsEditor` is generic: pass `api` and `queryKey`.
- **Live updates:** the `contact-messages` topic only reloads admin queries.
- **Admin Contact Messages** (`/admin/messages`) has two tabs: Messages (with the reply panel) and Contact Page Content. The sidebar unread badge comes from `summary/`.
- **Public:** `/contact`, `/about`, `/parish-life`, `/sacraments`, `/news-events`, `/gallery` (category tiles) and `/gallery/<category-slug>` (albums by day; opening one plays `components/public/gallery/Lightbox.tsx`), with a shared header and footer.
- **Admin Gallery** has two tabs, like Sacraments: Photos and Page Content.
- **News & Events:** admin `/admin/news-events` has Events, News and Page Content tabs (`components/admin/newsEvents/`). Public `/news-events` has chips; their category mapping is `VIEWS` in `pages/publicpage/NewsEvents.tsx`. Event times are shown in `PARISH_TIME_ZONE` (`utils/siteConfig.ts`); helpers live in `utils/newsEvents.ts`. `PostPreviewModal` is also the public "Read More" popup.
- **The user trimmed the admin sidebar** (`adminRoute.ts`): no Pages, Parish Groups, Ministries, Parish Information, Media & Files or Backup. Don't re-add them, and breadcrumbs say just "Content". `/` and the other pages show "Coming soon".
- **Live updates:** `hooks/useLiveUpdates.ts`, mounted in `App.tsx`, invalidates all non-auth queries when a `content.changed` message arrives. It reconnects with backoff and leaves open forms untouched.
- **Site details** (name, diocese website, socials) are in `frontend/src/utils/siteConfig.ts`. The footer's address, phone, email and hours come from the admin Contact page. Phone and social links are still empty; the email and opening hours were taken from the design and need the user to confirm them.

## Not built yet

Public Home, Mass Times. Admin pages for those, plus Mass Times, Parish Groups (groups are edited inside Parish Life for now), Ministries, Parish Information, Announcements, Contact Messages, Media Library, Documents, Settings, Users & Roles, Backup. The dashboard still uses placeholder data. The real church crest/logo (`logoUrl` in `siteConfig.ts`) is missing.
