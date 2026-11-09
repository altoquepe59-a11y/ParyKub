create table if not exists public.partykub_saved_games (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null check (char_length(name) between 1 and 120),
  saved_at bigint not null check (saved_at > 0),
  game jsonb not null check (jsonb_typeof(game) = 'object'),
  primary key (user_id, id)
);

alter table public.partykub_saved_games enable row level security;

drop policy if exists "Anonymous users manage their own PartyKub saves"
  on public.partykub_saved_games;

create policy "Anonymous users manage their own PartyKub saves"
  on public.partykub_saved_games
  for all
  to authenticated
  using (
    (select auth.uid()) = user_id
    and ((select auth.jwt()) ->> 'is_anonymous') = 'true'
  )
  with check (
    (select auth.uid()) = user_id
    and ((select auth.jwt()) ->> 'is_anonymous') = 'true'
  );

grant select, insert, update, delete
  on public.partykub_saved_games
  to authenticated;

create index if not exists partykub_saved_games_user_saved_at_idx
  on public.partykub_saved_games (user_id, saved_at desc);
