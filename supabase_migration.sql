-- channels テーブル
create table if not exists channels (
  id text primary key,
  platform text not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- sessions テーブル
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  platform text not null,
  channel_id text references channels(id) on delete cascade,
  code text unique not null,
  clicked_at timestamptz default now(),
  verified_at timestamptz,
  platform_user_id text,
  status text default 'CLICKED'
);

-- RLS を有効化（service_role は全権限）
alter table channels enable row level security;
alter table sessions enable row level security;

-- API route は service_role key でアクセスするため RLS はデフォルト拒否でOK
