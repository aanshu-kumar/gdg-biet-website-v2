-- GDG On Campus BIET — owner role, legacy (imported) sessions, alumni profiles.
-- Run after 002_team_platform.sql.
--
-- Owner     people.is_owner. The chapter's custodian (set here, never from the
--           dashboard). Only the owner can edit legacy sessions and legacy alumni.
-- Legacy    sessions.is_legacy / people.is_legacy: teams imported from the
--           original website (2023–24, 2024–25) and the alumni in them.
-- Admins    can edit any non-legacy session, past or current.
-- Alumni    can be added without an email (they never sign in); admins and the
--           owner edit their profiles from the dashboard.

-- ----------------------------------------------------------------- columns

alter table public.people   add column if not exists is_owner  boolean not null default false;
alter table public.people   add column if not exists is_legacy boolean not null default false;
alter table public.sessions add column if not exists is_legacy boolean not null default false;

-- Past members who never sign in don't need an email. (Unique index still applies to real emails.)
alter table public.people alter column email drop not null;

-- --------------------------------------------------------------- helpers

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_owner from public.people where user_id = auth.uid() and is_active), false)
$$;

-- May the caller edit positions in this session? Legacy sessions: owner only.
create or replace function public.can_edit_session(p_session bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin()
     and (public.is_owner() or not coalesce((select is_legacy from public.sessions where id = p_session), false))
$$;

-- Managing a person now also respects legacy alumni (owner only).
create or replace function public.can_manage_person(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.people t
    where t.id = pid
      and (not t.is_legacy or public.is_owner())
      and (
        public.is_admin()
        or (not t.is_admin and (public.is_club_lead() or t.department_id in (select public.led_department_ids())))
      )
  )
$$;

-- For storage policies: the path segment is text and may not be a uuid.
create or replace function public.can_manage_person_key(key text) returns boolean
language plpgsql stable security definer set search_path = public as $$
begin
  return public.can_manage_person(key::uuid);
exception when invalid_text_representation then
  return false;
end $$;

create or replace function public.my_context() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'person', (
      select row_to_json(p) from (
        select id, email, full_name, is_admin, is_owner, department_id, avatar_path
        from public.people where user_id = auth.uid() and is_active
      ) p
    ),
    'is_club_lead', public.is_club_lead(),
    'led_department_ids', coalesce((select json_agg(d) from public.led_department_ids() d), '[]'::json),
    'current_session', (select row_to_json(s) from (select id, name, start_year from public.sessions where is_current) s)
  )
$$;

-- Positions: legacy sessions are owner-only, and assigning a department lead in a
-- PAST session no longer moves that person's current department.
create or replace function public.admin_set_positions(p_session bigint, p_slots jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare
  slot jsonb;
  is_current_session boolean;
begin
  if not public.is_admin() then
    raise exception 'Only admins can assign positions' using errcode = '42501';
  end if;
  if not public.can_edit_session(p_session) then
    raise exception 'Only the chapter owner can edit legacy sessions' using errcode = '42501';
  end if;
  select is_current into is_current_session from public.sessions where id = p_session;

  delete from public.positions where session_id = p_session;
  for slot in select * from jsonb_array_elements(p_slots) loop
    continue when nullif(slot->>'person_id', '') is null;
    insert into public.positions (session_id, person_id, scope, department_id, title)
    values (p_session, (slot->>'person_id')::uuid, slot->>'scope',
            nullif(slot->>'department_id', '')::uuid, slot->>'title');
    -- Only the current session decides who manages which department today.
    if is_current_session and slot->>'scope' = 'department' then
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
  if exists (select 1 from public.sessions where id = p_session and is_legacy) then
    raise exception 'A legacy session can''t be made current' using errcode = '42501';
  end if;
  update public.sessions set is_current = false where is_current and id <> p_session;
  update public.sessions set is_current = true where id = p_session;
end $$;

revoke execute on function public.is_owner() from anon;
revoke execute on function public.can_edit_session(bigint) from anon;
revoke execute on function public.can_manage_person_key(text) from anon;

-- --------------------------------------------------------------- triggers

create or replace function public.people_guard() returns trigger
language plpgsql set search_path = public as $$
declare
  me uuid := public.current_person_id();
  admin boolean := public.is_admin();
  owner boolean := public.is_owner();
  manages boolean;
begin
  if current_user not in ('authenticated', 'anon') then return new; end if;

  if tg_op = 'INSERT' then
    if not admin then new.is_admin := false; end if;
    new.is_owner := false;                       -- set only in SQL, never from the app
    if not owner then new.is_legacy := false; end if;
    new.user_id := null;                         -- linked only by claim_invite()
    new.invited_by := me;
    return new;
  end if;

  new.user_id := old.user_id;
  new.invited_by := old.invited_by;
  new.created_at := old.created_at;
  new.is_owner := old.is_owner;
  if not owner then new.is_legacy := old.is_legacy; end if;
  if admin then return new; end if;

  new.is_admin := old.is_admin;
  manages := public.can_manage_person(old.id) and old.id is distinct from me;
  if not manages then
    -- Editing your own profile: department, access and email are not yours to change.
    new.department_id := old.department_id;
    new.is_active := old.is_active;
    new.email := old.email;
  elsif old.user_id is not null then
    new.email := old.email;                      -- once claimed, the email is the login identity
  end if;
  return new;
end $$;

-- Sessions: only the owner may create, change or delete legacy sessions.
create or replace function public.sessions_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_user not in ('authenticated', 'anon') or public.is_owner() then
    return coalesce(new, old);
  end if;
  if (tg_op <> 'INSERT' and old.is_legacy) or (tg_op <> 'DELETE' and new.is_legacy) then
    raise exception 'Only the chapter owner can change legacy sessions' using errcode = '42501';
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists sessions_guard on public.sessions;
create trigger sessions_guard before insert or update or delete on public.sessions
  for each row execute function public.sessions_guard();

-- Departments used by a legacy session can't be deleted (it would erase that history),
-- except by the owner. Deactivating them is fine.
create or replace function public.departments_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_owner() and exists (
    select 1 from public.positions p join public.sessions s on s.id = p.session_id
    where p.department_id = old.id and s.is_legacy
  ) then
    raise exception 'This department is part of a legacy session; deactivate it instead' using errcode = '42501';
  end if;
  return old;
end $$;

drop trigger if exists departments_guard on public.departments;
create trigger departments_guard before delete on public.departments
  for each row execute function public.departments_guard();

-- ------------------------------------------------------------------ policies

drop policy if exists "admin write" on public.positions;
create policy "admin write" on public.positions for all to authenticated
  using (public.can_edit_session(session_id)) with check (public.can_edit_session(session_id));

drop policy if exists "remove invite" on public.people;
create policy "remove invite" on public.people for delete to authenticated
  using (
    (public.is_admin() and (not is_legacy or public.is_owner()))
    or (user_id is null and public.can_manage_person(id))
  );

-- Admins/leads upload photos for people they manage under people/<person id>/.
drop policy if exists "team upload" on storage.objects;
create policy "team upload" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'assets' and public.current_person_id() is not null
    and (
      ((storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text)
      or ((storage.foldername(name))[1] = 'people' and public.can_manage_person_key((storage.foldername(name))[2]))
      or (storage.foldername(name))[1] in ('events', 'posts')
    )
  );

-- ------------------------------------------------------------------- owner
update public.people set is_owner = true where email = 'anshu.kumar.4125@gmail.com';
