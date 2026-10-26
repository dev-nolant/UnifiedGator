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
