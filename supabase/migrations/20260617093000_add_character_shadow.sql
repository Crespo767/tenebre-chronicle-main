alter table public.campaign_characters
add column if not exists shadow text,
drop column if exists subtitle,
drop column if exists bonds,
drop column if exists items,
drop column if exists evolution,
drop column if exists relations;
