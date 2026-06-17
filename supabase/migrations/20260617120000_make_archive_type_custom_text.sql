alter table public.campaign_archive_items
alter column type type text using type::text;

drop type if exists public.archive_item_type;
