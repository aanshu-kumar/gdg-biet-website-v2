-- GDG On Campus BIET — import the original website's teams (2023–24, 2024–25)
-- as LEGACY sessions. Run after 003_owner_and_legacy.sql. Generated from src/data/team.json.
-- Mapping: Organizer = Lead, Co-Organizer = Co-lead; chapter-wide roles = club positions.
-- Alumni are added without email (they never sign in) and marked is_legacy, so only the
-- owner can edit them. The owner's own 2023–24 entry is linked to their existing account.

do $import$
declare s23 bigint; s24 bigint; pid uuid;
begin
  if exists (select 1 from public.sessions where start_year in (2023, 2024)) then
    raise notice 'Legacy sessions already exist; skipping import.';
    return;
  end if;

  insert into public.departments (name, sort_order, is_active) values
    ('Web Development', 1, true),
    ('AI/ML', 2, true),
    ('Data Forge', 3, true),
    ('Event Management', 4, true),
    ('Social Media', 5, true),
    ('Human Resources', 6, true),
    ('Tech', 7, false),
    ('Content Writing', 8, false),
    ('Marketing', 9, false)
  on conflict (name) do nothing;

  insert into public.sessions (name, start_year, is_current, is_legacy) values ('2023–24', 2023, false, true) returning id into s23;
  insert into public.sessions (name, start_year, is_current, is_legacy) values ('2024–25', 2024, false, true) returning id into s24;

  -- 2023: Rishu Kumar — Lead
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Rishu Kumar', 'Team/Rishu.jpg', 'https://www.linkedin.com/in/rishuku01', 'https://x.com/rishuku01', true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s23, pid, 'club', null, 'lead');

  -- 2023: Anshu Kumar — Co-lead
  update public.people set avatar_path = coalesce(avatar_path, 'Team/rakon.jpg'),
         linkedin_url = coalesce(linkedin_url, 'https://www.linkedin.com/in/anshukumar01/'), twitter_url = coalesce(twitter_url, 'https://x.com/anshu__kr')
   where email = 'anshu.kumar.4125@gmail.com' returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s23, pid, 'club', null, 'co_lead');

  -- 2023: Rashi Chandra — Human Resource (the original site linked Anshu's LinkedIn here by mistake; left empty)
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Rashi Chandra', 'Team/Rashi.jpg', null, null, true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s23, pid, 'department', (select id from public.departments where name = 'Human Resources'), 'lead');

  -- 2023: Vishal Gupta — Tech-lead
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Vishal Gupta', 'Team/Vishal.jpeg', 'http://linkedin.com/in/vishusahu09/', 'https://x.com/VishalG54298320', true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s23, pid, 'department', (select id from public.departments where name = 'Tech'), 'lead');

  -- 2023: Shivakant Shukla — Tech Co-lead
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Shivakant Shukla', 'Team/ShivakantBhaia.jpg', 'https://www.linkedin.com/in/shivakant-shukla-4b3987241', 'https://x.com/codetech_shivam', true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s23, pid, 'department', (select id from public.departments where name = 'Tech'), 'co_lead');

  -- 2023: Rehnuma Rahman — Content Writing-Lead
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Rehnuma Rahman', 'Team/rahnuma.jpg', 'https://www.linkedin.com/in/rahnuma-rahman-008034223/', 'https://x.com/rahnuma_r_', true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s23, pid, 'department', (select id from public.departments where name = 'Content Writing'), 'lead');

  -- 2023: Ankita Srivastava — Social Media-Lead
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Ankita Srivastava', 'Team/Ankita.jpeg', 'https://www.linkedin.com/in/ankita-srivastava-a5a7a3241/', null, true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s23, pid, 'department', (select id from public.departments where name = 'Social Media'), 'lead');

  -- 2023: Prince Upadhayay — Marketing-Lead
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Prince Upadhayay', 'Team/Prince.png', 'https://www.linkedin.com/in/prince-upadhyay-024415221', 'https://x.com/PrinceU72211892', true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s23, pid, 'department', (select id from public.departments where name = 'Marketing'), 'lead');

  -- 2023: Apoorv Kumar — Event Management-Lead
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Apoorv Kumar', 'Team/apoorv.jpg', 'https://www.linkedin.com/in/apoorv-kumar-0b8707253', null, true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s23, pid, 'department', (select id from public.departments where name = 'Event Management'), 'lead');

  -- 2023: Anuj Gupta — Event Management Co-Lead
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Anuj Gupta', 'Team/Anuj.jpeg', 'https://www.linkedin.com/in/99anujgupta', null, true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s23, pid, 'department', (select id from public.departments where name = 'Event Management'), 'co_lead');

  -- 2024: Amar Deep Rao — Organizer
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Amar Deep Rao', 'Team/Amar.jpg', 'https://www.linkedin.com/in/amardeep16/', 'https://x.com/AmardeepRao15', true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s24, pid, 'club', null, 'lead');

  -- 2024: Humaira Hashmi — Co-Organizer
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Humaira Hashmi', 'Team/Humaira.jpg', 'https://www.linkedin.com/in/humaira-hashmi03/', 'https://x.com/Has65384Hashmi', true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s24, pid, 'club', null, 'co_lead');

  -- 2024: Nandini Singh — HR Associate
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Nandini Singh', 'Team/Nandini.jpeg', 'https://www.linkedin.com/in/nandini-singh-0238a22a7', 'https://x.com/Singh_Nandini05', true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s24, pid, 'department', (select id from public.departments where name = 'Human Resources'), 'lead');

  -- 2024: Mohd. Kaif — Web Developer Organizer
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Mohd. Kaif', 'Team/Kaif.jpg', 'https://www.linkedin.com/in/kaif9999', 'https://x.com/kaif9998', true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s24, pid, 'department', (select id from public.departments where name = 'Web Development'), 'lead');

  -- 2024: Katyayani Mishra — Web developer Co-Organizer
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Katyayani Mishra', 'Team/Katayani.jpg', 'https://www.linkedin.com/in/katyayanim12', null, true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s24, pid, 'department', (select id from public.departments where name = 'Web Development'), 'co_lead');

  -- 2024: Aryan Gupta — AI/Ml Organizer
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Aryan Gupta', 'Team/Aryan.jpg', 'https://www.linkedin.com/in/aryan-gupta-820164262', null, true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s24, pid, 'department', (select id from public.departments where name = 'AI/ML'), 'lead');

  -- 2024: Abhishek Verma — AI/ML Co-Organizer
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Abhishek Verma', 'Team/abhishek varma.jpeg', 'https://www.linkedin.com/in/abhishek-verma-jnv', 'https://x.com/thor_x_me', true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s24, pid, 'department', (select id from public.departments where name = 'AI/ML'), 'co_lead');

  -- 2024: Nagesh Tripathi — Data Forge Organizer
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Nagesh Tripathi', 'Team/nagesh.jpg', 'https://www.linkedin.com/in/nagesh-tripathi/', null, true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s24, pid, 'department', (select id from public.departments where name = 'Data Forge'), 'lead');

  -- 2024: Vikas Deep Sharma — Social Media Organizer
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Vikas Deep Sharma', 'Team/vikas.jpg', 'https://www.linkedin.com/in/vikas-deep-sharma-619b91274/', 'https://x.com/deep_shar24', true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s24, pid, 'department', (select id from public.departments where name = 'Social Media'), 'lead');

  -- 2024: Kavyshree Jaiswal — Event Management Organizer
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Kavyshree Jaiswal', 'Team/kavya.jpg', 'https://www.linkedin.com/in/kavyshree-jaiswal-065078282', null, true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s24, pid, 'department', (select id from public.departments where name = 'Event Management'), 'lead');

  -- 2024: Utkarsh Upadhayay — Event Management Co-Organizer
  insert into public.people (full_name, avatar_path, linkedin_url, twitter_url, is_legacy, is_active)
  values ('Utkarsh Upadhayay', 'Team/utkarsh.jpg', 'https://www.linkedin.com/in/utkarsh2005', 'https://x.com/UTKARSHUPA88883', true, true) returning id into pid;
  insert into public.positions (session_id, person_id, scope, department_id, title) values (s24, pid, 'department', (select id from public.departments where name = 'Event Management'), 'co_lead');

end $import$;
