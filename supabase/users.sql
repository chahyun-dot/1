-- Supabase 대시보드 → SQL Editor에서 실행하세요.
create table if not exists public.users (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- 테스트용: 누구나 읽기 가능 (쓰기/삭제는 막혀 있음)
drop policy if exists "users read" on public.users;
create policy "users read" on public.users for select using (true);

insert into public.users (name, email) values
  ('김민수', 'minsu@example.com'),
  ('이지은', 'jieun@example.com'),
  ('박서준', 'seojun@example.com'),
  ('최유나', 'yuna@example.com')
on conflict (email) do nothing;
