-- GDG On Campus BIET — Supabase schema
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Image columns (*_path) hold object keys in the public `assets` storage bucket,
-- e.g. 'Team/Rishu.jpg'. Full URLs also work.

-- ---------------------------------------------------------------- tables

create table if not exists public.events (
  id            text primary key,
  title         text not null,
  description   text not null default '',
  date          timestamptz,
  location      text,
  status        text not null default 'upcoming' check (status in ('upcoming', 'past')),
  image_path    text,
  tags          text[] not null default '{}',
  register_url  text,
  resources_url text,
  created_at    timestamptz not null default now()
);

create table if not exists public.team_members (
  id            text primary key,
  name          text not null,
  role          text not null,
  year          int  not null,
  image_path    text,
  linkedin_url  text,
  twitter_url   text,
  is_lead       boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.projects (
  id            text primary key,
  title         text not null,
  description   text not null default '',
  image_path    text,
  tags          text[] not null default '{}',
  github_url    text,
  live_url      text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.faqs (
  id            text primary key,
  question      text not null,
  answer        text not null,
  sort_order    int not null default 0
);

create table if not exists public.sponsors (
  id            text primary key,
  name          text not null,
  logo_path     text not null,
  url           text,
  sort_order    int not null default 0
);

create table if not exists public.stories (
  id            text primary key,
  quote         text not null,
  name          text not null,
  role          text,
  image_path    text,
  created_at    timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id            bigint generated always as identity primary key,
  name          text not null check (char_length(name) between 1 and 120),
  email         text not null check (char_length(email) between 3 and 200),
  message       text not null check (char_length(message) between 1 and 5000),
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------- row level security
-- Content tables: anyone can read, nobody can write with the anon key
-- (edit them in the dashboard or with the service-role key).
-- contact_messages: anyone can insert, nobody can read with the anon key.

alter table public.events           enable row level security;
alter table public.team_members     enable row level security;
alter table public.projects         enable row level security;
alter table public.faqs             enable row level security;
alter table public.sponsors         enable row level security;
alter table public.stories          enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "public read" on public.events;
create policy "public read" on public.events       for select using (true);
drop policy if exists "public read" on public.team_members;
create policy "public read" on public.team_members for select using (true);
drop policy if exists "public read" on public.projects;
create policy "public read" on public.projects     for select using (true);
drop policy if exists "public read" on public.faqs;
create policy "public read" on public.faqs         for select using (true);
drop policy if exists "public read" on public.sponsors;
create policy "public read" on public.sponsors     for select using (true);
drop policy if exists "public read" on public.stories;
create policy "public read" on public.stories      for select using (true);

drop policy if exists "public insert" on public.contact_messages;
create policy "public insert" on public.contact_messages for insert with check (true);

-- ------------------------------------------------------------------ storage

insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do update set public = true;
