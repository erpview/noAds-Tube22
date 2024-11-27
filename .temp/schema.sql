-- Create function to delete user
create or replace function delete_user(user_id uuid)
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
    raise exception 'Only administrators can delete users';
  end if;

  -- Delete from auth.users (this will cascade to profiles due to foreign key)
  delete from auth.users where id = user_id;
end;
$$;