-- Supabase 대시보드 → SQL Editor에서 실행하세요.
create table if not exists public.test_items (
  id bigint generated always as identity primary key,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.test_items enable row level security;

-- 테스트용: 누구나 읽기/쓰기/삭제 가능 (테스트 후 삭제하거나 정책을 강화하세요)
create policy "test read"   on public.test_items for select using (true);
create policy "test insert" on public.test_items for insert with check (true);
create policy "test delete" on public.test_items for delete using (true);
