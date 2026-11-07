# GDG On Campus BIET — Website

The official website of Google Developer Groups On Campus, BIET Lucknow.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (content + image storage)

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

The site works out of the box with no configuration: content comes from `src/data/*.json` and images from `public/`.

## Connecting Supabase

1. Create a Supabase project.
2. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql). It creates the content tables, the
   `contact_messages` table, row-level security policies and a public `assets` storage bucket.
3. Copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**.
4. Upload the current images and content:

   ```bash
   npm run seed
   ```

5. Restart `npm run dev`. Pages now read from Supabase and refresh every 5 minutes.

After that, manage content from the Supabase dashboard:

| What              | Where                                                                         |
| ----------------- | ----------------------------------------------------------------------------- |
| Events            | `events` table (`status` is `upcoming` or `past`)                             |
| Team              | `team_members` table (`is_lead` puts someone in the highlighted lead card)    |
| Projects          | `projects` table                                                              |
| FAQs              | `faqs` table                                                                  |
| Sponsors, stories | `sponsors`, `stories` tables                                                  |
| Images            | **Storage → assets**. Put the object path (e.g. `Team/Rishu.jpg`) in `*_path` |
| Contact messages  | `contact_messages` table (insert-only for visitors)                           |

For production (e.g. Vercel), set `SUPABASE_URL` and `SUPABASE_ANON_KEY` as environment variables. They're
server-only (no `NEXT_PUBLIC_` prefix) because all Supabase access happens on the server. The service-role key is only
needed locally for `npm run seed` — never add it to the host.

## Team platform (dashboard)

Team members sign in with Google at `/login` and manage content at `/dashboard`. Access is invite-only.

| Role       | Who                                                                     | Can                                                                                                  |
| ---------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Admin**  | `people.is_admin`                                                       | Everything: sessions, departments, assigning club and department leads, inviting anyone, making admins |
| **Lead**   | Holds a lead/co-lead position in the **current** session                | Publish events and blog posts in their scope; invite and manage members. Club leads cover every department; department leads cover their own |
| **Member** | Everyone else                                                           | Edit their own profile; draft events and posts and submit them for review                             |

- The public **Team** page shows only position holders (club lead and co-lead, plus each department's lead and
  co-lead), using their profile photo, bio and links. Older years without positions show the original team list.
- The public **Blog** (`/blog`) shows published posts. Posts are written in Markdown; raw HTML isn't rendered.
- Every rule is enforced in Postgres with row-level security (`supabase/002_team_platform.sql`), not just in the UI.

**Setup**

1. Run `supabase/002_team_platform.sql` after `schema.sql`.
2. Enable Google in Supabase → Authentication → Providers (OAuth client redirect URI:
   `https://<project-ref>.supabase.co/auth/v1/callback`), and add `<your site>/auth/callback` to Authentication →
   URL Configuration → Redirect URLs.
3. Make yourself admin:
   `insert into public.people (email, full_name, is_admin) values (lower('you@gmail.com'), 'Your Name', true);`
4. Sign in, then in **Admin** create a session, add departments and assign leads. Invite people from **Members**.

**Separate dashboard address (optional).** Set `SITE_URL` and `APP_URL` (e.g. `https://gdgcbiet-lucknow.vercel.app`
and `https://gdgcbiet-lucknow-app.vercel.app`, both added as domains on the same Vercel project). The app address then
serves only login and the dashboard, and the public site redirects `/login` and `/dashboard` there. Vercel previews and
localhost keep serving everything from one address.

## Project structure

```
src/
  app/            public routes: /, /events, /projects, /team, /blog, /contact, /hackathon
    dashboard/    team platform: profile, events, posts, members, admin
    login/, auth/ Google sign-in, OAuth callback (claims invites), sign-out
  components/     Navbar, Footer, cards, Section primitives, ui/button, dashboard/*
  data/           fallback JSON content (also the seed source)
  lib/
    data.ts       public loaders: Supabase first, JSON fallback
    auth.ts       signed-in viewer + role checks
    supabase.ts   anonymous client + assetUrl() for storage paths
    supabase-session.ts  per-user client (row-level security applies)
    site.ts       site name, links, nav
  middleware.ts   session refresh, /dashboard gate, site/app host split
supabase/schema.sql, supabase/002_team_platform.sql
scripts/seed-supabase.mjs
```

## Design

The design follows Google's visual language: Google blue, red, yellow and green on clean white or dark surfaces,
Material-style pill buttons, rounded cards and generous spacing. Colour tokens live in `src/app/globals.css` and are
exposed to Tailwind as `bg`, `surface`, `fg`, `muted`, `line`, `primary` and `g-{blue,red,yellow,green}`
(plus `-tint` variants). Dark mode follows the system setting and can be toggled from the navbar.
