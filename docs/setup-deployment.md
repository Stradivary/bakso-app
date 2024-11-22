---
title: Setup and Deployment
nav_order: 8
---

# Setup and Deployment 🐳

## Development

1. Clone the repository and install dependencies.
2. Run the app locally with `npm run dev`.
3. The app is served at [localhost:5173](http://localhost:5173).

## Production

1. Deploy the frontend to your VPS or preferred hosting platform.

   ```bash
   npm run build
   rsync -avz dist/ your-vps:/var/www/html
   ```

2. Configure Nginx (or another reverse proxy) to serve the `dist/` folder.

3. Backend services (database and API) are managed via **Supabase Cloud**. Ensure your environment variables point to the live instance.

## Supabase Initialization

Disable email verification as we only use generated local email.
Ensure supabase realtime is installed and available,

Run this command on supabase sql editor

```sql
create table
  public.user_profiles (
    id uuid references auth.users on delete cascade,
    role text check (role in ('seller', 'buyer')),
    last_location geometry (Point, 4326),
    last_seen timestamp with time zone,
    is_online boolean default false,
    created_at timestamp with time zone default timezone ('utc'::text, now()) not null,
    display_name text,
    latitude float8,
    longitude float8,
    primary key (id),
    constraint name_length check ( CHAR_LENGTH(display_name) > 3 AND CHAR_LENGTH(display_name) <= 60 ) );

-- Set up Row Level Security (RLS)
alter table user_profiles enable row level security;

create policy "Public profiles are viewable by everyone." on user_profiles for
select
  using (true);

create policy "Users can insert their own profile." on user_profiles for insert
with
  check (
    (
      select
        auth.uid ()
    ) = id
  );

create policy "Users can update own profile." on user_profiles
for update
  using (
    (
      select
        auth.uid ()
    ) = id
  );

create
or replace function public.handle_new_user () returns trigger as $$
begin
  insert into public.user_profiles (id, display_name, role, latitude, longitude)
  values (new.id, new.raw_user_meta_data->>'display_name',
   new.raw_user_meta_data->>'role',
   (new.raw_user_meta_data->>'latitude')::double precision,
   (new.raw_user_meta_data->>'longitude')::double precision
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user ();

```

and done!