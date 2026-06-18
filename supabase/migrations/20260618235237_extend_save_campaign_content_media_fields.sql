create or replace function public.save_campaign_content(content jsonb)
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
    companions jsonb,
    "imagePositionX" numeric,
    "imagePositionY" numeric,
    "imageScale" numeric,
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
    companions,
    image_position_x,
    image_position_y,
    image_scale,
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
    coalesce(companions, '[]'::jsonb),
    coalesce("imagePositionX", 50),
    coalesce("imagePositionY", 50),
    coalesce("imageScale", 1),
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
    companions = excluded.companions,
    image_position_x = excluded.image_position_x,
    image_position_y = excluded.image_position_y,
    image_scale = excluded.image_scale,
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
    companions jsonb,
    "imagePositionX" numeric,
    "imagePositionY" numeric,
    "imageScale" numeric,
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
    companions,
    image_position_x,
    image_position_y,
    image_scale,
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
    coalesce(companions, '[]'::jsonb),
    coalesce("imagePositionX", 50),
    coalesce("imagePositionY", 50),
    coalesce("imageScale", 1),
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
    companions = excluded.companions,
    image_position_x = excluded.image_position_x,
    image_position_y = excluded.image_position_y,
    image_scale = excluded.image_scale,
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
