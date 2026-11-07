-- GDG On Campus BIET — team platform (run after schema.sql)
-- Adds sign-in, roles, departments, positions per session, editable profiles,
-- event drafts/approval and blog posts. Run once in the Supabase SQL editor.
--
-- Roles
--   admin   people.is_admin = true. Controls access, departments, sessions, positions.
--   lead    holds a lead/co-lead position in the CURRENT session, either for the
--           whole club (scope = 'club') or for a department. Club leads manage
--           everyone; department leads manage their own department.
--   member  everyone else. Edits their own profile, drafts events and posts.
--
-- Access is invite-only: a person row (email) must exist before that Google
-- account can use the dashboard. claim_invite() links the two on first sign-in.

-- ----------------------------------------------------------------- tables

create table if not exists public.sessions (
  id          bigint generated always as identity primary key,
  name        text not null,                 -- e.g. '2026–27'
  start_year  int  not null unique,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now()
);
create unique index if not exists sessions_one_current on public.sessions (is_current) where is_current;

create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (char_length(name) between 1 and 80),
  description text check (char_length(description) <= 300),
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.people (
  id            uuid primary key default gen_random_uuid(),
  email         text not null check (email = lower(email) and char_length(email) <= 200),
  user_id       uuid unique references auth.users (id) on delete set null,
  full_name     text not null default '' check (char_length(full_name) <= 120),
  is_admin      boolean not null default false,
  department_id uuid references public.departments (id) on delete set null,
  avatar_path   text,
  bio           text check (char_length(bio) <= 600),
  linkedin_url  text,
  twitter_url   text,
  github_url    text,
  website_url   text,
  skills        text[] not null default '{}',
  is_active     boolean not null default true,
  invited_by    uuid references public.people (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
-- Emails are stored lowercase; Google may return any casing, so claims compare lower().
create unique index if not exists people_email_unique on public.people (email);

create table if not exists public.positions (
  id            bigint generated always as identity primary key,
  session_id    bigint not null references public.sessions (id) on delete cascade,
  person_id     uuid   not null references public.people (id) on delete cascade,
  scope         text   not null check (scope in ('club', 'department')),
  department_id uuid   references public.departments (id) on delete cascade,
  title         text   not null check (title in ('lead', 'co_lead')),
  created_at    timestamptz not null default now(),
  check ((scope = 'club') = (department_id is null))
);
-- One lead and one co-lead per slot per session, and one position per person per session.
create unique index if not exists positions_one_per_slot
  on public.positions (session_id, scope, coalesce(department_id, '00000000-0000-0000-0000-000000000000'::uuid), title);
create unique index if not exists positions_one_per_person on public.positions (session_id, person_id);

-- Events: add authoring + approval.
alter table public.events alter column id set default gen_random_uuid()::text;
alter table public.events add column if not exists publish_state text not null default 'published'
  check (publish_state in ('draft', 'pending', 'published'));
alter table public.events add column if not exists created_by uuid references public.people (id) on delete set null;
alter table public.events add column if not exists department_id uuid references public.departments (id) on delete set null;
alter table public.events add column if not exists updated_at timestamptz not null default now();

create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  title         text not null check (char_length(title) between 1 and 160),
  excerpt       text check (char_length(excerpt) <= 300),
  body          text not null default '' check (char_length(body) <= 50000),
  cover_path    text,
  tags          text[] not null default '{}',
  author_id     uuid references public.people (id) on delete set null,
  department_id uuid references public.departments (id) on delete set null,
  publish_state text not null default 'draft' check (publish_state in ('draft', 'pending', 'published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists posts_published on public.posts (published_at desc) where publish_state = 'published';

-- ------------------------------------------------- permission helpers
-- SECURITY DEFINER so policies can call them without recursing into RLS.

create or replace function public.current_person_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.people where user_id = auth.uid() and is_active
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.people where user_id = auth.uid() and is_active), false)
$$;

create or replace function public.current_session_id() returns bigint
language sql stable security definer set search_path = public as $$
  select id from public.sessions where is_current
$$;

create or replace function public.is_club_lead() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.positions
    where person_id = public.current_person_id() and session_id = public.current_session_id() and scope = 'club'
  )
$$;

create or replace function public.led_department_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select department_id from public.positions
  where person_id = public.current_person_id() and session_id = public.current_session_id() and scope = 'department'
$$;

create or replace function public.is_lead() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_club_lead() or exists (select 1 from public.led_department_ids())
$$;

-- Can the caller manage this person? Admins: anyone. Club leads: any non-admin.
-- Department leads: non-admins in a department they lead.
create or replace function public.can_manage_person(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.people t
    where t.id = pid and not t.is_admin
      and (public.is_club_lead() or t.department_id in (select public.led_department_ids()))
  )
$$;

-- Can the caller publish content belonging to this department?
create or replace function public.can_publish(dept uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or public.is_club_lead()
      or (dept is not null and dept in (select public.led_department_ids()))
$$;

-- ------------------------------------------------- app-facing functions

-- Called after Google sign-in: links this auth user to their invite (verified email only).
create or replace function public.claim_invite() returns uuid
language plpgsql security definer set search_path = public as $$
declare
  pid uuid;
  verified_email text;
begin
  if auth.uid() is null then return null; end if;

  select id into pid from public.people where user_id = auth.uid() and is_active;
  if pid is not null then return pid; end if;

  select email into verified_email from auth.users where id = auth.uid() and email_confirmed_at is not null;
  if verified_email is null then return null; end if;

  update public.people set user_id = auth.uid(), updated_at = now()
  where email = lower(verified_email) and user_id is null and is_active
  returning id into pid;
  return pid;
end $$;

-- Everything the dashboard needs to know about the signed-in user, in one call.
create or replace function public.my_context() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'person', (
      select row_to_json(p) from (
        select id, email, full_name, is_admin, department_id, avatar_path
        from public.people where user_id = auth.uid() and is_active
      ) p
    ),
    'is_club_lead', public.is_club_lead(),
    'led_department_ids', coalesce((select json_agg(d) from public.led_department_ids() d), '[]'::json),
    'current_session', (select row_to_json(s) from (select id, name, start_year from public.sessions where is_current) s)
  )
$$;

-- Public team page: only position holders, only public profile fields (no emails).
create or replace function public.team_roster()
returns table (
  session_id bigint, session_name text, start_year int, is_current boolean,
  scope text, title text, department_id uuid, department_name text, department_sort int,
  person_id uuid, full_name text, avatar_path text, bio text,
  linkedin_url text, twitter_url text, github_url text, website_url text
)
language sql stable security definer set search_path = public as $$
  select s.id, s.name, s.start_year, s.is_current,
         p.scope, p.title, d.id, d.name, d.sort_order,
         pe.id, pe.full_name, pe.avatar_path, pe.bio,
         pe.linkedin_url, pe.twitter_url, pe.github_url, pe.website_url
  from public.positions p
  join public.sessions s on s.id = p.session_id
  join public.people pe on pe.id = p.person_id and pe.is_active
  left join public.departments d on d.id = p.department_id
$$;

-- Public blog: published posts with the author's public name and photo.
create or replace function public.blog_posts(p_slug text default null)
returns table (
  id uuid, slug text, title text, excerpt text, body text, cover_path text, tags text[],
  published_at timestamptz, author_name text, author_avatar_path text, department_name text
)
language sql stable security definer set search_path = public as $$
  select po.id, po.slug, po.title, po.excerpt,
         case when p_slug is null then '' else po.body end,  -- list view doesn't need bodies
         po.cover_path, po.tags, po.published_at,
         pe.full_name, pe.avatar_path, d.name
  from public.posts po
  left join public.people pe on pe.id = po.author_id
  left join public.departments d on d.id = po.department_id
  where po.publish_state = 'published' and (p_slug is null or po.slug = p_slug)
  order by po.published_at desc
$$;

-- Admin: replace all positions for a session in one transaction.
-- p_slots: [{ "scope": "club"|"department", "department_id": uuid|null, "title": "lead"|"co_lead", "person_id": uuid }]
create or replace function public.admin_set_positions(p_session bigint, p_slots jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare slot jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only admins can assign positions' using errcode = '42501';
  end if;
  delete from public.positions where session_id = p_session;
  for slot in select * from jsonb_array_elements(p_slots) loop
    continue when nullif(slot->>'person_id', '') is null;
    insert into public.positions (session_id, person_id, scope, department_id, title)
    values (p_session, (slot->>'person_id')::uuid, slot->>'scope',
            nullif(slot->>'department_id', '')::uuid, slot->>'title');
    -- A department lead belongs to that department, so they can manage its members.
    if slot->>'scope' = 'department' then
      update public.people set department_id = (slot->>'department_id')::uuid where id = (slot->>'person_id')::uuid;
    end if;
  end loop;
end $$;

create or replace function public.admin_set_current_session(p_session bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can change the current session' using errcode = '42501';
  end if;
  update public.sessions set is_current = false where is_current and id <> p_session;
  update public.sessions set is_current = true where id = p_session;
end $$;

revoke execute on function public.claim_invite() from anon, public;
revoke execute on function public.my_context() from anon, public;
revoke execute on function public.admin_set_positions(bigint, jsonb) from anon, public;
revoke execute on function public.admin_set_current_session(bigint) from anon, public;
grant execute on function public.claim_invite() to authenticated;
grant execute on function public.my_context() to authenticated;
grant execute on function public.admin_set_positions(bigint, jsonb) to authenticated;
grant execute on function public.admin_set_current_session(bigint) to authenticated;
grant execute on function public.team_roster() to anon, authenticated;
grant execute on function public.blog_posts(text) to anon, authenticated;

-- --------------------------------------------------------------- triggers

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists people_touch on public.people;
create trigger people_touch before update on public.people for each row execute function public.touch_updated_at();
drop trigger if exists events_touch on public.events;
create trigger events_touch before update on public.events for each row execute function public.touch_updated_at();
drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts for each row execute function public.touch_updated_at();

-- Column-level rules RLS can't express. Requests from the API run as the
-- `authenticated` role; service-role scripts and the SECURITY DEFINER
-- functions above run as other roles and are trusted.
create or replace function public.people_guard() returns trigger
language plpgsql set search_path = public as $$
declare
  me uuid := public.current_person_id();
  admin boolean := public.is_admin();
  manages boolean;
begin
  if current_user not in ('authenticated', 'anon') then return new; end if;

  if tg_op = 'INSERT' then
    if not admin then new.is_admin := false; end if;
    new.user_id := null;           -- linked only by claim_invite()
    new.invited_by := me;
    return new;
  end if;

  new.user_id := old.user_id;
  new.invited_by := old.invited_by;
  new.created_at := old.created_at;
  if admin then return new; end if;

  new.is_admin := old.is_admin;
  manages := public.can_manage_person(old.id) and old.id is distinct from me;
  if not manages then
    -- Editing your own profile: department, access and email are not yours to change.
    new.department_id := old.department_id;
    new.is_active := old.is_active;
    new.email := old.email;
  elsif old.user_id is not null then
    new.email := old.email;        -- once claimed, the email is the login identity
  end if;
  return new;
end $$;

drop trigger if exists people_guard on public.people;
create trigger people_guard before insert or update on public.people for each row execute function public.people_guard();

-- Authors can't be reassigned through the API; publishing stamps published_at.
create or replace function public.content_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_table_name = 'events' then
      if tg_op = 'UPDATE' then new.created_by := old.created_by; end if;
    else
      if tg_op = 'UPDATE' then new.author_id := old.author_id; end if;
    end if;
  end if;
  if tg_table_name = 'posts' and new.publish_state = 'published'
     and (tg_op = 'INSERT' or old.publish_state <> 'published') then
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end $$;

drop trigger if exists events_guard on public.events;
create trigger events_guard before insert or update on public.events for each row execute function public.content_guard();
drop trigger if exists posts_guard on public.posts;
create trigger posts_guard before insert or update on public.posts for each row execute function public.content_guard();

-- ---------------------------------------------------- row level security

alter table public.sessions    enable row level security;
alter table public.departments enable row level security;
alter table public.people      enable row level security;
alter table public.positions   enable row level security;
alter table public.posts       enable row level security;

-- Sessions, departments, positions: public read (no personal data), admin write.
drop policy if exists "public read" on public.sessions;
create policy "public read" on public.sessions for select using (true);
drop policy if exists "admin write" on public.sessions;
create policy "admin write" on public.sessions for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read" on public.departments;
create policy "public read" on public.departments for select using (true);
drop policy if exists "admin write" on public.departments;
create policy "admin write" on public.departments for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read" on public.positions;
create policy "public read" on public.positions for select using (true);
drop policy if exists "admin write" on public.positions;
create policy "admin write" on public.positions for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- People: visible to signed-in team only (emails). Public pages use team_roster()/blog_posts().
drop policy if exists "team read" on public.people;
create policy "team read" on public.people for select to authenticated
  using (public.current_person_id() is not null);
drop policy if exists "invite" on public.people;
create policy "invite" on public.people for insert to authenticated
  with check (
    public.is_admin()
    or (public.is_lead() and not is_admin
        and (public.is_club_lead() or department_id in (select public.led_department_ids())))
  );
drop policy if exists "edit" on public.people;
create policy "edit" on public.people for update to authenticated
  using (user_id = auth.uid() or public.can_manage_person(id))
  with check (
    user_id = auth.uid() or public.is_admin()
    or (not is_admin and (public.is_club_lead() or department_id in (select public.led_department_ids())))
  );
drop policy if exists "remove invite" on public.people;
create policy "remove invite" on public.people for delete to authenticated
  using (public.is_admin() or (user_id is null and public.can_manage_person(id)));

-- Events: public sees published; team sees all; authors edit their unpublished
-- work; leads publish within their scope.
drop policy if exists "public read" on public.events;
drop policy if exists "public read published" on public.events;
create policy "public read published" on public.events for select to anon using (publish_state = 'published');
drop policy if exists "team read" on public.events;
create policy "team read" on public.events for select to authenticated
  using (publish_state = 'published' or public.current_person_id() is not null);
drop policy if exists "team create" on public.events;
create policy "team create" on public.events for insert to authenticated
  with check (
    public.current_person_id() is not null and created_by = public.current_person_id()
    and (publish_state <> 'published' or public.can_publish(department_id))
  );
drop policy if exists "team edit" on public.events;
create policy "team edit" on public.events for update to authenticated
  using (public.can_publish(department_id) or (created_by = public.current_person_id() and publish_state <> 'published'))
  with check (publish_state <> 'published' or public.can_publish(department_id));
drop policy if exists "team delete" on public.events;
create policy "team delete" on public.events for delete to authenticated
  using (public.can_publish(department_id) or (created_by = public.current_person_id() and publish_state <> 'published'));

-- Posts: same rules as events.
drop policy if exists "public read published" on public.posts;
create policy "public read published" on public.posts for select to anon using (publish_state = 'published');
drop policy if exists "team read" on public.posts;
create policy "team read" on public.posts for select to authenticated
  using (publish_state = 'published' or public.current_person_id() is not null);
drop policy if exists "team create" on public.posts;
create policy "team create" on public.posts for insert to authenticated
  with check (
    public.current_person_id() is not null and author_id = public.current_person_id()
    and (publish_state <> 'published' or public.can_publish(department_id))
  );
drop policy if exists "team edit" on public.posts;
create policy "team edit" on public.posts for update to authenticated
  using (public.can_publish(department_id) or (author_id = public.current_person_id() and publish_state <> 'published'))
  with check (publish_state <> 'published' or public.can_publish(department_id));
drop policy if exists "team delete" on public.posts;
create policy "team delete" on public.posts for delete to authenticated
  using (public.can_publish(department_id) or (author_id = public.current_person_id() and publish_state <> 'published'));

-- Storage: team members upload avatars, event images and post covers into the
-- public `assets` bucket. Avatars go under avatars/<their auth uid>/.
drop policy if exists "team upload" on storage.objects;
create policy "team upload" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'assets' and public.current_person_id() is not null
    and (
      ((storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text)
      or (storage.foldername(name))[1] in ('events', 'posts')
    )
  );
drop policy if exists "team delete own uploads" on storage.objects;
create policy "team delete own uploads" on storage.objects for delete to authenticated
  using (bucket_id = 'assets' and owner_id = auth.uid()::text);

-- ------------------------------------------------------------ first admin
-- After running this file, make yourself admin (use the Google account you'll sign in with):
--
--   insert into public.people (email, full_name, is_admin) values (lower('you@gmail.com'), 'Your Name', true);
