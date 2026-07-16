-- 0005: Default weekly availability for both consultants, so consultations
-- are bookable from day one. Consultants can change these anytime from the
-- designer portal availability manager; this only inserts where no weekly
-- template exists (never overwrites), and date-specific overrides always win.
--
-- Schedule seeded: Mon–Fri all six slots, Saturday morning–midday, Sunday closed.

insert into public.consultant_availability (consultant_id, weekday, slots)
select c.id, w.weekday, w.slots
from public.consultant_profiles c
cross join (
  values
    (1, '["09:00","10:30","12:00","14:00","15:30","17:00"]'::jsonb),
    (2, '["09:00","10:30","12:00","14:00","15:30","17:00"]'::jsonb),
    (3, '["09:00","10:30","12:00","14:00","15:30","17:00"]'::jsonb),
    (4, '["09:00","10:30","12:00","14:00","15:30","17:00"]'::jsonb),
    (5, '["09:00","10:30","12:00","14:00","15:30","17:00"]'::jsonb),
    (6, '["09:00","10:30","12:00"]'::jsonb)
) as w(weekday, slots)
on conflict (consultant_id, weekday) where weekday is not null
do nothing;
