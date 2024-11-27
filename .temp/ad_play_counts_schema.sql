-- Create ad play counts table
create table if not exists public.ad_play_counts (
  id uuid default gen_random_uuid() primary key,
  ad_id uuid not null references public.ads(id) on delete cascade,
  count integer not null default 0,
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(ad_id) -- Add unique constraint on ad_id
);

-- Enable RLS
alter table public.ad_play_counts enable row level security;

-- Create policies
create policy "Admin users can manage ad play counts"
  on public.ad_play_counts
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

create policy "All users can view ad play counts"
  on public.ad_play_counts
  for select
  using (true);

-- Create function to increment ad play count
create or replace function increment_ad_play_count(
  ad_id_param uuid
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.ad_play_counts (ad_id, count)
  values (ad_id_param, 1)
  on conflict (ad_id) do update -- Now references the unique constraint
  set count = ad_play_counts.count + 1,
      updated_at = now();
end;
$$;