-- 1. Create the Profiles Table (if you haven't already)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  username text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Create RLS Policies (Safely drop first to avoid errors)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 4. Create Trigger for auto-profile creation
-- (Functions can be replaced safely)

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication errors (Postgres < 14 needs specific handling, but 'create or replace trigger' is Postgres 14+)
-- For compatibility, we'll drop it first:
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
