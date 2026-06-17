alter table public.campaign_npcs
add column if not exists image text not null default '';
