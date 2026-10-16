-- avena-2 needs its own settings row (one-row-per-apartment is enforced by
-- the unique index above). Use the same default the app already falls back
-- to in code (lib/settings.ts DEFAULT_BOOKING_BLOCKED_AFTER) so behavior is
-- identical whether or not this row exists.
insert into public.settings (apartment_id, booking_blocked_after)
values ('avena-2', '2028-10-31')
on conflict (apartment_id) do nothing;
