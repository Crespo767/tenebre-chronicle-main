revoke all on table public.campaign_sessions from anon, authenticated;
revoke all on table public.campaign_characters from anon, authenticated;
revoke all on table public.campaign_npcs from anon, authenticated;
revoke all on table public.campaign_archive_items from anon, authenticated;
revoke all on table public.campaign_master_notes from anon, authenticated;

grant select on table public.campaign_sessions to anon, authenticated;
grant select on table public.campaign_characters to anon, authenticated;
grant select on table public.campaign_npcs to anon, authenticated;
grant select on table public.campaign_archive_items to anon, authenticated;
grant select on table public.campaign_master_notes to anon, authenticated;
