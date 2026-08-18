-- Rode este script inteiro no SQL Editor do seu projeto Supabase
-- (https://supabase.com/dashboard/project/_/sql/new)

-- 1. Tabela principal do catálogo
create table if not exists public.jewelry (
  id uuid primary key default gen_random_uuid(),
  code text not null default '',
  category text not null,
  material text,
  description text,
  supplier text,
  price numeric(12, 2) not null default 0,
  cost_price numeric(12, 2),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Caso a tabela já exista de uma execução anterior deste script, adiciona as colunas novas
alter table public.jewelry add column if not exists code text not null default '';
alter table public.jewelry add column if not exists supplier text;
alter table public.jewelry add column if not exists cost_price numeric(12, 2);

-- Campo "nome" não é mais usado (código + descrição substituem)
alter table public.jewelry drop column if exists name;

-- 2. Row Level Security: leitura pública, escrita só para logados
alter table public.jewelry enable row level security;

drop policy if exists "Catálogo é público para leitura" on public.jewelry;
create policy "Catálogo é público para leitura"
  on public.jewelry for select
  to anon, authenticated
  using (true);

drop policy if exists "Só logados podem inserir" on public.jewelry;
create policy "Só logados podem inserir"
  on public.jewelry for insert
  to authenticated
  with check (true);

drop policy if exists "Só logados podem atualizar" on public.jewelry;
create policy "Só logados podem atualizar"
  on public.jewelry for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Só logados podem excluir" on public.jewelry;
create policy "Só logados podem excluir"
  on public.jewelry for delete
  to authenticated
  using (true);

-- 3. Atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_jewelry_updated_at on public.jewelry;
create trigger trg_jewelry_updated_at
  before update on public.jewelry
  for each row
  execute function public.set_updated_at();

-- 4. Bucket de imagens (público para leitura, restrito para escrita)
insert into storage.buckets (id, name, public)
values ('jewelry-images', 'jewelry-images', true)
on conflict (id) do nothing;

drop policy if exists "Leitura pública das imagens de joias" on storage.objects;
create policy "Leitura pública das imagens de joias"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'jewelry-images');

drop policy if exists "Só logados podem subir imagens de joias" on storage.objects;
create policy "Só logados podem subir imagens de joias"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'jewelry-images');

drop policy if exists "Só logados podem atualizar imagens de joias" on storage.objects;
create policy "Só logados podem atualizar imagens de joias"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'jewelry-images');

drop policy if exists "Só logados podem excluir imagens de joias" on storage.objects;
create policy "Só logados podem excluir imagens de joias"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'jewelry-images');
