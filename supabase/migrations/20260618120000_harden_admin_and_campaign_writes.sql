create table if not exists public.admin_login_attempts (
  identifier text primary key,
  failed_count integer not null default 0,
  locked_until timestamptz,
  last_failed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.admin_login_attempts enable row level security;

revoke all on table public.admin_login_attempts from anon, authenticated;
grant all on table public.admin_login_attempts to service_role;

drop policy if exists "Service role manages admin login attempts" on public.admin_login_attempts;
create policy "Service role manages admin login attempts"
on public.admin_login_attempts for all
to service_role
using (true)
with check (true);

drop function if exists public.register_admin_user(text, text, text, integer);
create function public.register_admin_user(
  input_username text,
  input_username_normalized text,
  input_password_hash text,
  max_users integer default 2
)
returns table(ok boolean, message text, username text)
language plpgsql
set search_path = public, pg_temp
as $$
declare
  current_count integer;
begin
  perform pg_advisory_xact_lock(hashtext('tenebre_admin_users_limit'));

  select count(*) into current_count
  from public.admin_users;

  if current_count >= max_users then
    return query select false, 'O limite de 2 usuários já foi atingido.', null::text;
    return;
  end if;

  insert into public.admin_users (username, username_normalized, password_hash)
  values (input_username, input_username_normalized, input_password_hash);

  return query select true, null::text, input_username;
exception
  when unique_violation then
    return query select false, 'Esse login já existe.', null::text;
end;
$$;

revoke all on function public.register_admin_user(text, text, text, integer) from public, anon, authenticated;
grant execute on function public.register_admin_user(text, text, text, integer) to service_role;

drop function if exists public.get_admin_login_lock(text);
create function public.get_admin_login_lock(input_identifier text)
returns table(locked boolean, retry_after_seconds integer)
language sql
stable
set search_path = public, pg_temp
as $$
  select
    coalesce(locked_until > now(), false) as locked,
    greatest(0, ceil(extract(epoch from (locked_until - now())))::integer) as retry_after_seconds
  from public.admin_login_attempts
  where identifier = input_identifier
  union all
  select false, 0
  where not exists (
    select 1 from public.admin_login_attempts where identifier = input_identifier
  )
  limit 1;
$$;

revoke all on function public.get_admin_login_lock(text) from public, anon, authenticated;
grant execute on function public.get_admin_login_lock(text) to service_role;

drop function if exists public.record_admin_login_failure(text);
create function public.record_admin_login_failure(input_identifier text)
returns void
language plpgsql
set search_path = public, pg_temp
as $$
declare
  window_started_at timestamptz;
  next_failed_count integer;
begin
  select last_failed_at into window_started_at
  from public.admin_login_attempts
  where identifier = input_identifier;

  insert into public.admin_login_attempts (
    identifier,
    failed_count,
    locked_until,
    last_failed_at,
    updated_at
  )
  values (
    input_identifier,
    1,
    null,
    now(),
    now()
  )
  on conflict (identifier) do update set
    failed_count = case
      when admin_login_attempts.last_failed_at is null
        or admin_login_attempts.last_failed_at < now() - interval '15 minutes'
      then 1
      else admin_login_attempts.failed_count + 1
    end,
    last_failed_at = now(),
    updated_at = now()
  returning failed_count into next_failed_count;

  if next_failed_count >= 5 then
    update public.admin_login_attempts
    set locked_until = now() + interval '15 minutes',
        updated_at = now()
    where identifier = input_identifier;
  end if;
end;
$$;

revoke all on function public.record_admin_login_failure(text) from public, anon, authenticated;
grant execute on function public.record_admin_login_failure(text) to service_role;

drop function if exists public.clear_admin_login_attempts(text);
create function public.clear_admin_login_attempts(input_identifier text)
returns void
language sql
set search_path = public, pg_temp
as $$
  delete from public.admin_login_attempts
  where identifier = input_identifier;
$$;

revoke all on function public.clear_admin_login_attempts(text) from public, anon, authenticated;
grant execute on function public.clear_admin_login_attempts(text) to service_role;

drop function if exists public.save_campaign_content(jsonb);
create function public.save_campaign_content(content jsonb)
returns void
language plpgsql
set search_path = public, pg_temp
as $$
begin
  perform pg_advisory_xact_lock(hashtext('tenebre_campaign_content_write'));

  create temporary table incoming_sessions on commit drop as
  select *
  from jsonb_to_recordset(coalesce(content -> 'sessions', '[]'::jsonb)) as row(
    slug text,
    number integer,
    title text,
    date text,
    present text[],
    summary text,
    events text[],
    npcs text[],
    locations text[],
    consequences text[],
    hooks text[],
    "masterNotes" text,
    order_index integer
  );

  insert into public.campaign_sessions (
    slug,
    number,
    title,
    session_date,
    present,
    summary,
    events,
    npcs,
    locations,
    consequences,
    hooks,
    master_notes,
    order_index
  )
  select
    slug,
    number,
    title,
    coalesce(date, ''),
    coalesce(present, '{}'),
    coalesce(summary, ''),
    coalesce(events, '{}'),
    coalesce(npcs, '{}'),
    coalesce(locations, '{}'),
    coalesce(consequences, '{}'),
    coalesce(hooks, '{}'),
    coalesce("masterNotes", ''),
    order_index
  from incoming_sessions
  on conflict (number) do update set
    slug = excluded.slug,
    title = excluded.title,
    session_date = excluded.session_date,
    present = excluded.present,
    summary = excluded.summary,
    events = excluded.events,
    npcs = excluded.npcs,
    locations = excluded.locations,
    consequences = excluded.consequences,
    hooks = excluded.hooks,
    master_notes = excluded.master_notes,
    order_index = excluded.order_index;

  delete from public.campaign_sessions saved
  where not exists (
    select 1 from incoming_sessions incoming where incoming.number = saved.number
  );

  create temporary table incoming_characters on commit drop as
  select *
  from jsonb_to_recordset(coalesce(content -> 'characters', '[]'::jsonb)) as row(
    slug text,
    name text,
    role text,
    people text,
    shadow text,
    quote text,
    image text,
    player text,
    status text,
    appearance text,
    goal text,
    history text,
    order_index integer
  );

  insert into public.campaign_characters (
    slug,
    name,
    role,
    people,
    shadow,
    quote,
    image,
    player,
    status,
    appearance,
    goal,
    history,
    order_index
  )
  select
    slug,
    name,
    coalesce(role, ''),
    coalesce(people, ''),
    nullif(shadow, ''),
    coalesce(quote, ''),
    coalesce(image, ''),
    nullif(player, ''),
    coalesce(status, ''),
    coalesce(appearance, ''),
    coalesce(goal, ''),
    coalesce(history, ''),
    order_index
  from incoming_characters
  on conflict (slug) do update set
    name = excluded.name,
    role = excluded.role,
    people = excluded.people,
    shadow = excluded.shadow,
    quote = excluded.quote,
    image = excluded.image,
    player = excluded.player,
    status = excluded.status,
    appearance = excluded.appearance,
    goal = excluded.goal,
    history = excluded.history,
    order_index = excluded.order_index;

  delete from public.campaign_characters saved
  where not exists (
    select 1 from incoming_characters incoming where incoming.slug = saved.slug
  );

  create temporary table incoming_npcs on commit drop as
  select *
  from jsonb_to_recordset(coalesce(content -> 'npcs', '[]'::jsonb)) as row(
    slug text,
    name text,
    image text,
    role text,
    location text,
    relation text,
    status text,
    summary text,
    order_index integer
  );

  insert into public.campaign_npcs (
    slug,
    name,
    image,
    role,
    location,
    relation,
    status,
    summary,
    order_index
  )
  select
    slug,
    name,
    coalesce(image, ''),
    coalesce(role, ''),
    coalesce(location, ''),
    coalesce(relation, ''),
    coalesce(status, ''),
    coalesce(summary, ''),
    order_index
  from incoming_npcs
  on conflict (slug) do update set
    name = excluded.name,
    image = excluded.image,
    role = excluded.role,
    location = excluded.location,
    relation = excluded.relation,
    status = excluded.status,
    summary = excluded.summary,
    order_index = excluded.order_index;

  delete from public.campaign_npcs saved
  where not exists (
    select 1 from incoming_npcs incoming where incoming.slug = saved.slug
  );

  create temporary table incoming_archive on commit drop as
  select *
  from jsonb_to_recordset(coalesce(content -> 'archive', '[]'::jsonb)) as row(
    slug text,
    title text,
    type text,
    discovered text,
    description text,
    link text,
    order_index integer
  );

  insert into public.campaign_archive_items (
    slug,
    title,
    type,
    discovered,
    description,
    link,
    order_index
  )
  select
    slug,
    title,
    coalesce(type, 'Documento'),
    coalesce(discovered, ''),
    coalesce(description, ''),
    nullif(link, ''),
    order_index
  from incoming_archive
  on conflict (slug) do update set
    title = excluded.title,
    type = excluded.type,
    discovered = excluded.discovered,
    description = excluded.description,
    link = excluded.link,
    order_index = excluded.order_index;

  delete from public.campaign_archive_items saved
  where not exists (
    select 1 from incoming_archive incoming where incoming.slug = saved.slug
  );

  create temporary table incoming_master_notes on commit drop as
  select *
  from jsonb_to_recordset(coalesce(content -> 'masterNotes', '[]'::jsonb)) as row(
    title text,
    date text,
    body text,
    order_index integer
  );

  insert into public.campaign_master_notes (
    title,
    note_date,
    body,
    order_index
  )
  select
    title,
    coalesce(date, ''),
    coalesce(body, ''),
    order_index
  from incoming_master_notes
  on conflict (title, note_date) do update set
    body = excluded.body,
    order_index = excluded.order_index;

  delete from public.campaign_master_notes saved
  where not exists (
    select 1
    from incoming_master_notes incoming
    where incoming.title = saved.title
      and coalesce(incoming.date, '') = saved.note_date
  );
end;
$$;

revoke all on function public.save_campaign_content(jsonb) from public, anon, authenticated;
grant execute on function public.save_campaign_content(jsonb) to service_role;
