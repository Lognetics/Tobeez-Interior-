-- TOBEEZ INTERIOR — initial schema + seed
-- Products power the marketplace. RLS allows public read; writes are locked down.

create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text not null,
  category text not null,
  price integer not null,
  rating numeric not null default 0,
  reviews integer not null default 0,
  tag text,
  gradient text not null default '',
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);

insert into public.products (id, name, brand, category, price, rating, reviews, tag, gradient) values
  ('p1','Milano Modular Sofa','Casa Nova','Furniture',1850000,4.8,214,'Bestseller','from-amber-200 to-orange-300'),
  ('p2','Arc Floor Lamp','Lumen','Lighting',285000,4.6,98,'New','from-indigo-200 to-purple-300'),
  ('p3','Oakline Dining Table','Timberworks','Furniture',940000,4.7,156,null,'from-stone-200 to-stone-400'),
  ('p4','Marble Kitchen Island','Stonecraft','Kitchen',2400000,4.9,72,'Luxury','from-neutral-200 to-neutral-400'),
  ('p5','Velvet Accent Chair','Casa Nova','Furniture',420000,4.5,189,null,'from-rose-200 to-amber-200'),
  ('p6','Rainfall Shower Set','AquaLux','Bathroom',360000,4.7,64,null,'from-emerald-200 to-teal-300'),
  ('p7','Linen Blackout Curtains','DrapeCo','Curtains',145000,4.4,233,'Bestseller','from-stone-200 to-stone-400'),
  ('p8','Pendant Cluster Light','Lumen','Lighting',510000,4.8,41,'New','from-indigo-200 to-purple-300'),
  ('p9','Terracotta Vase Set','Earthen','Décor',78000,4.6,127,null,'from-amber-200 to-orange-300'),
  ('p10','Ergo Executive Desk','WorkForm','Office',680000,4.7,88,null,'from-neutral-200 to-neutral-400'),
  ('p11','Rattan Lounge Set','Outdora','Outdoor',1250000,4.5,53,'Luxury','from-emerald-200 to-teal-300'),
  ('p12','Boucle Ottoman','Casa Nova','Furniture',210000,4.6,174,null,'from-rose-200 to-amber-200')
on conflict (id) do update set
  name = excluded.name, brand = excluded.brand, category = excluded.category,
  price = excluded.price, rating = excluded.rating, reviews = excluded.reviews,
  tag = excluded.tag, gradient = excluded.gradient;
