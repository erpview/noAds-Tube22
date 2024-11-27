-- Create YouTube API keys table
create table if not exists public.youtube_api_keys (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  key text not null unique,
  enabled boolean default true,
  quota_used integer default 0,
  last_used timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.youtube_api_keys enable row level security;

-- Create policies
create policy "Admin users can manage YouTube API keys"
  on public.youtube_api_keys
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

create policy "All users can view enabled YouTube API keys"
  on public.youtube_api_keys
  for select
  using (enabled = true);

-- Create function to increment quota
create or replace function increment_youtube_key_quota(
  key_id uuid,
  increment_amount int default 1
)
returns void
language plpgsql
security definer
as $$
begin
  -- Check if user is admin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid()
    and is_admin = true
  ) then
    raise exception 'Only administrators can update quota usage';
  end if;

  -- Update quota
  update public.youtube_api_keys
  set quota_used = quota_used + increment_amount,
      updated_at = now()
  where id = key_id;
end;
$$;