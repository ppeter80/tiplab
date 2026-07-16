-- ============================================================
--  TIPLAB — ČASŤ 1/2: tabuľky, RLS, seed
--  Spusti ako prvé. Potom spusti ČASŤ 2 (functions.sql).
-- ============================================================

-- ---------- TABUĽKY ----------
create table if not exists rounds (
  id           serial primary key,
  name         text not null,
  start_bank   numeric not null default 10000,
  target       numeric not null default 50000,
  status       text not null default 'active',
  winner_id    uuid,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz
);

create table if not exists players (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid unique references auth.users(id) on delete cascade,
  name       text not null,
  is_ai      boolean not null default false,
  is_admin   boolean not null default false,
  strategy   text,
  tagline    text,
  balance    numeric not null default 10000,
  round_id   int references rounds(id),
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id            uuid primary key default gen_random_uuid(),
  ext_id        text,
  sport         text not null,
  league        text,
  home          text not null,
  away          text not null,
  commence_time timestamptz not null,
  has_draw      boolean not null default true,
  odds_home     numeric,
  odds_draw     numeric,
  odds_away     numeric,
  odds_updated_at timestamptz,
  status        text not null default 'upcoming',
  result        text,
  home_score    int,
  away_score    int
);

create table if not exists bets (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references players(id) on delete cascade,
  match_id    uuid not null references matches(id) on delete cascade,
  round_id    int references rounds(id),
  selection   text not null,
  stake       numeric not null check (stake > 0),
  locked_odds numeric not null,
  status      text not null default 'open',
  payout      numeric not null default 0,
  rationale   text,
  placed_at   timestamptz not null default now()
);
create index if not exists bets_player_idx on bets(player_id);
create index if not exists bets_match_idx  on bets(match_id);

-- ---------- RLS (obsah len pre prihlásených) ----------
alter table rounds  enable row level security;
alter table players enable row level security;
alter table matches enable row level security;
alter table bets    enable row level security;

drop policy if exists "read rounds"  on rounds;
drop policy if exists "read players" on players;
drop policy if exists "read matches" on matches;
drop policy if exists "read bets"    on bets;
drop policy if exists "admin write matches" on matches;

create policy "read rounds"  on rounds  for select to authenticated using (true);
create policy "read players" on players for select to authenticated using (true);
create policy "read matches" on matches for select to authenticated using (true);
create policy "read bets"    on bets    for select to authenticated using (true);
create policy "admin write matches" on matches for all to authenticated
  using      (exists (select 1 from players where user_id = auth.uid() and is_admin))
  with check (exists (select 1 from players where user_id = auth.uid() and is_admin));

-- ---------- SEED (idempotentné) ----------
insert into rounds(name)
select 'Kolo 1' where not exists (select 1 from rounds);

insert into players(name, is_ai, strategy, tagline, balance, round_id)
select v.name, true, v.strategy, v.tagline, 10000, (select id from rounds order by id limit 1)
from (values
  ('Favorit',      'favorite',   'Vždy na najnižší kurz. Nuda, ale prežije.'),
  ('Value Hunter', 'value',      'Stávkujem len na podhodnotené kurzy.'),
  ('Underdog',     'underdog',   'Vysoké kurzy alebo nič. Buď ó, alebo au.'),
  ('Analytik',     'data',       'Forma, H2H, čísla. Žiadne emócie.'),
  ('Kontrarián',   'contrarian', 'Idem proti davu a proti hype favoritom.')
) as v(name, strategy, tagline)
where not exists (select 1 from players where is_ai);

insert into matches(sport, league, home, away, commence_time, has_draw, odds_home, odds_draw, odds_away, odds_updated_at)
select v.sport, v.league, v.home, v.away, v.ct, v.hd, v.oh, v.od, v.oa, now()
from (values
  ('soccer',     'Premier League', 'Arsenal',     'Chelsea',        now() + interval '2 days', true,  1.85::numeric, 3.60::numeric, 4.20::numeric),
  ('soccer',     'La Liga',        'Real Madrid', 'Sevilla',        now() + interval '3 days', true,  1.50::numeric, 4.30::numeric, 6.50::numeric),
  ('basketball', 'NBA',            'LA Lakers',   'Boston Celtics', now() + interval '1 day',  false, 2.10::numeric, null::numeric, 1.75::numeric)
) as v(sport, league, home, away, ct, hd, oh, od, oa)
where not exists (select 1 from matches);

insert into bets(player_id, match_id, round_id, selection, stake, locked_odds, rationale)
select p.id, m.id, p.round_id, 'home', 500, 1.85, 'Arsenal doma je jasný favorit — najnižší kurz = najvyššia šanca.'
from players p, matches m
where p.strategy = 'favorite' and m.home = 'Arsenal'
  and not exists (select 1 from bets);

insert into bets(player_id, match_id, round_id, selection, stake, locked_odds, rationale)
select p.id, m.id, p.round_id, 'away', 300, 4.20, 'Chelsea vonku za 4.20 je hodnota, beriem risk.'
from players p, matches m
where p.strategy = 'underdog' and m.home = 'Arsenal'
  and not exists (select 1 from bets b join players pp on pp.id = b.player_id where pp.strategy = 'underdog');

update players set balance = 10000 - coalesce(
  (select sum(b.stake) from bets b where b.player_id = players.id and b.status = 'open'), 0)
where is_ai;

-- ČASŤ 1 hotová. Teraz spusti ČASŤ 2 (functions.sql).
