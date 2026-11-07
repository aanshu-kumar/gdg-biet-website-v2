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

## Project structure

```
src/
  app/            routes: /, /events, /projects, /team, /contact, /hackathon
  components/     Navbar, Footer, cards, Section primitives, ui/button
  data/           fallback JSON content (also the seed source)
  lib/
    data.ts       server-side loaders: Supabase first, JSON fallback
    supabase.ts   client + assetUrl() for storage paths
    site.ts       site name, links, nav
supabase/schema.sql
scripts/seed-supabase.mjs
```

## Design

The design follows Google's visual language: Google blue, red, yellow and green on clean white or dark surfaces,
Material-style pill buttons, rounded cards and generous spacing. Colour tokens live in `src/app/globals.css` and are
exposed to Tailwind as `bg`, `surface`, `fg`, `muted`, `line`, `primary` and `g-{blue,red,yellow,green}`
(plus `-tint` variants). Dark mode follows the system setting and can be toggled from the navbar.
