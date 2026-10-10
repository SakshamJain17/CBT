create or replace function public.admin_assign_staff_by_email(
  staff_email text,
  staff_display_name text,
  staff_role public.staff_role
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
begin
  if not private.has_role(array['admin']::public.staff_role[]) then
    raise exception 'insufficient_permission';
  end if;

  select id into target_user_id
  from auth.users
  where lower(email) = lower(trim(staff_email))
  limit 1;

  if target_user_id is null then
    raise exception 'auth_user_not_found';
  end if;

  insert into public.profiles (id, display_name, active)
  values (target_user_id, trim(staff_display_name), true)
  on conflict (id) do update
  set display_name = excluded.display_name,
      active = true,
      updated_at = now();

  insert into public.staff_roles (profile_id, role, assigned_by)
  values (target_user_id, staff_role, (select auth.uid()))
  on conflict (profile_id, role) do nothing;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, changes)
  values (
    (select auth.uid()),
    'staff.role_assigned',
    'profile',
    target_user_id,
    jsonb_build_object('role', staff_role, 'email', lower(trim(staff_email)))
  );

  return target_user_id;
end;
$$;

revoke all on function public.admin_assign_staff_by_email(text, text, public.staff_role) from public;
grant execute on function public.admin_assign_staff_by_email(text, text, public.staff_role) to authenticated;

do $$
declare
  test_user_id uuid;
begin
  select id into test_user_id
  from auth.users
  where lower(email) = 'jainsaksham983+cbt-librarian@gmail.com'
  limit 1;

  if test_user_id is not null then
    insert into public.profiles (id, display_name, active)
    values (test_user_id, 'CBT Test Librarian', true)
    on conflict (id) do update set active = true, updated_at = now();

    insert into public.staff_roles (profile_id, role)
    values (test_user_id, 'librarian')
    on conflict (profile_id, role) do nothing;
  end if;
end;
$$;
