-- 1. Add email column to profiles table
alter table public.profiles add column if not exists email text;

-- 2. Update the handle_new_user function to include email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;
