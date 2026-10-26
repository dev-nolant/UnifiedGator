create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  display_name text,
  created_at timestamptz not null default now()
);

-- every signup gets a profile
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'display_name');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into profiles (id, email) select id, email from auth.users on conflict do nothing;

alter table profiles enable row level security;

create type member_role as enum ('owner', 'member');

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  due_date date,
  owner_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now()
);

create table members (
  project_id uuid references projects on delete cascade,
  user_id uuid references profiles on delete cascade,
  role member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index on members (user_id);

create function public.add_owner() returns trigger
language plpgsql set search_path = '' as $$
begin
  insert into public.members (project_id, user_id, role) values (new.id, new.owner_id, 'owner');
  return new;
end $$;

create trigger project_owner
  after insert on projects
  for each row execute function public.add_owner();

alter table projects enable row level security;
alter table members enable row level security;
