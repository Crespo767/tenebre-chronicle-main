alter table public.campaign_archive_items
alter column type drop default;

alter table public.campaign_archive_items
alter column type type text using type::text;

alter table public.campaign_archive_items
alter column type set default 'Documento';

drop type if exists public.archive_item_type;
