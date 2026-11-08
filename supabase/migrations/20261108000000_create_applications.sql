create type public.application_status as enum (
  'Applied',
  'Interview Scheduled',
  'Selected',
  'Rejected',
  'On Hold'
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company_name text not null check (char_length(btrim(company_name)) between 1 and 120),
  job_role text not null check (char_length(btrim(job_role)) between 1 and 160),
  salary_amount numeric(12, 2) check (salary_amount is null or salary_amount >= 0),
  salary_currency text check (
    salary_currency is null or salary_currency ~ '^[A-Z]{3}$'
  ),
  application_date date not null,
  status public.application_status not null default 'Applied',
  job_description text not null default '',
  notes text not null default '',
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint applications_salary_currency_pair check (
    (salary_amount is null and salary_currency is null)
    or (salary_amount is not null and salary_currency is not null)
  ),
  constraint applications_description_length check (char_length(job_description) <= 10000),
  constraint applications_notes_length check (char_length(notes) <= 5000)
);

create index applications_user_date_idx
  on public.applications (user_id, application_date desc);

create index applications_user_status_date_idx
  on public.applications (user_id, status, application_date desc);

create function public.set_application_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create trigger applications_set_updated_at
before update on public.applications
for each row
execute function public.set_application_updated_at();

alter table public.applications enable row level security;

revoke all on table public.applications from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.applications to authenticated;

create policy "Users can read their own applications"
  on public.applications
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own applications"
  on public.applications
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own applications"
  on public.applications
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own applications"
  on public.applications
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
