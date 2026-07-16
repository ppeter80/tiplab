-- ============================================================
--  TIPLAB — ČASŤ 2/2: funkcie + práva
--  Spusti AŽ PO časti 1 (schema.sql), v novom SQL query.
-- ============================================================

create or replace function ensure_player(p_name text)
returns players language plpgsql security definer as $ensure$
declare pr players; rnd int;
begin
  select id into rnd from rounds where status = 'active' order by id desc limit 1;
  select * into pr from players where user_id = auth.uid();
  if not found then
    insert into players(user_id, name, balance, round_id)
    values (auth.uid(), coalesce(nullif(p_name, ''), 'Hráč'),
            coalesce((select start_bank from rounds where id = rnd), 10000), rnd)
    returning * into pr;
  end if;
  return pr;
end;
$ensure$;

create or replace function place_bet(p_match uuid, p_selection text, p_stake numeric)
returns bets language plpgsql security definer as $place$
declare pl players; mt matches; od numeric; bt bets;
begin
  select * into pl from players where user_id = auth.uid();
  if not found then raise exception 'no_player'; end if;
  select * into mt from matches where id = p_match;
  if not found then raise exception 'no_match'; end if;
  if mt.status <> 'upcoming' or mt.commence_time <= now() then raise exception 'betting_closed'; end if;
  if p_stake <= 0 then raise exception 'bad_stake'; end if;
  if p_stake > pl.balance then raise exception 'insufficient_balance'; end if;
  od := case p_selection when 'home' then mt.odds_home
                         when 'draw' then mt.odds_draw
                         when 'away' then mt.odds_away end;
  if od is null then raise exception 'no_odds_for_selection'; end if;
  update players set balance = balance - p_stake where id = pl.id;
  insert into bets(player_id, match_id, round_id, selection, stake, locked_odds)
  values (pl.id, p_match, pl.round_id, p_selection, p_stake, od)
  returning * into bt;
  return bt;
end;
$place$;

create or replace function settle_match(p_match uuid)
returns int language plpgsql security definer as $settle$
declare mt matches; bt bets; cnt int := 0; pay numeric;
begin
  select * into mt from matches where id = p_match;
  if mt.result is null then raise exception 'no_result'; end if;
  for bt in select * from bets where match_id = p_match and status = 'open' loop
    if bt.selection = mt.result then
      pay := round(bt.stake * bt.locked_odds, 2);
      update bets set status = 'won', payout = pay where id = bt.id;
      update players set balance = balance + pay where id = bt.player_id;
    else
      update bets set status = 'lost', payout = 0 where id = bt.id;
    end if;
    cnt := cnt + 1;
  end loop;
  update matches set status = 'finished' where id = p_match;
  return cnt;
end;
$settle$;

grant execute on function ensure_player(text)            to authenticated;
grant execute on function place_bet(uuid, text, numeric) to authenticated;

-- HOTOVO (obe časti). Po prvom prihlásení v appke si nastav admina:
--   update players set is_admin = true where name = 'TVOJE_MENO';
