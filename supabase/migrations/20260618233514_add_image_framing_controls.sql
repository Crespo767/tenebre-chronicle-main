alter table public.campaign_characters
add column if not exists image_position_x numeric not null default 50,
add column if not exists image_position_y numeric not null default 50,
add column if not exists image_scale numeric not null default 1;

alter table public.campaign_npcs
add column if not exists image_position_x numeric not null default 50,
add column if not exists image_position_y numeric not null default 50,
add column if not exists image_scale numeric not null default 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'campaign_characters_image_framing_check'
  ) then
    alter table public.campaign_characters
    add constraint campaign_characters_image_framing_check
    check (
      image_position_x between 0 and 100
      and image_position_y between 0 and 100
      and image_scale between 1 and 3
    );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'campaign_npcs_image_framing_check'
  ) then
    alter table public.campaign_npcs
    add constraint campaign_npcs_image_framing_check
    check (
      image_position_x between 0 and 100
      and image_position_y between 0 and 100
      and image_scale between 1 and 3
    );
  end if;
end
$$;
