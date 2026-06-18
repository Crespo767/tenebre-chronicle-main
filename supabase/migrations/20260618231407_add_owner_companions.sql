alter table public.campaign_characters
add column if not exists companions jsonb not null default '[]'::jsonb;

alter table public.campaign_npcs
add column if not exists companions jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'campaign_characters_companions_array_check'
  ) then
    alter table public.campaign_characters
    add constraint campaign_characters_companions_array_check
    check (jsonb_typeof(companions) = 'array');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'campaign_npcs_companions_array_check'
  ) then
    alter table public.campaign_npcs
    add constraint campaign_npcs_companions_array_check
    check (jsonb_typeof(companions) = 'array');
  end if;
end
$$;
