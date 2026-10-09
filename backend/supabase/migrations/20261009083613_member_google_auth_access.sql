alter table public.members add column auth_user_id uuid unique references auth.users(id) on delete set null;
create index members_auth_user_id_idx on public.members (auth_user_id) where auth_user_id is not null;

create or replace function public.claim_member_account() returns uuid language plpgsql security definer set search_path = '' as $$
declare current_user_id uuid := (select auth.uid()); current_email text; matching_member_id uuid;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  select email into current_email from auth.users where id = current_user_id;
  if current_email is null then return null; end if;
  select candidate.id into matching_member_id
  from public.members as candidate
  where lower(candidate.email) = lower(current_email)
    and candidate.auth_user_id is null
    and (
      select count(*)
      from public.members as possible_match
      where lower(possible_match.email) = lower(current_email)
        and possible_match.auth_user_id is null
    ) = 1
  limit 1;
  if matching_member_id is not null then
    update public.members set auth_user_id = current_user_id, updated_at = now()
    where id = matching_member_id and auth_user_id is null;
  end if;
  return coalesce(matching_member_id, (select id from public.members where auth_user_id = current_user_id limit 1));
end; $$;
revoke all on function public.claim_member_account() from public;
grant execute on function public.claim_member_account() to authenticated;

create policy member_read_self on public.members for select to authenticated using ((select auth.uid()) = auth_user_id);
create policy member_read_own_loans on public.loans for select to authenticated using (
  member_id in (select id from public.members where auth_user_id = (select auth.uid()))
);
