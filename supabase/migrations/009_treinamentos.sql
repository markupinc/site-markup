-- Sistema de agendamento de treinamentos para corretores
create extension if not exists pgcrypto;

-- Treinamentos (eventos) criados pelo admin
create table if not exists public.treinamentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  local text,
  modalidade text not null default 'presencial' check (modalidade in ('presencial','online')),
  mapa_url text,
  online_url text,
  slug text not null unique,
  status text not null default 'rascunho' check (status in ('rascunho','publicado','encerrado')),
  cor text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Horários (slots)
create table if not exists public.treinamento_horarios (
  id uuid primary key default gen_random_uuid(),
  treinamento_id uuid not null references public.treinamentos(id) on delete cascade,
  data date not null,
  hora_inicio time not null,
  hora_fim time,
  capacidade int not null default 10 check (capacidade > 0),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_trh_treino on public.treinamento_horarios (treinamento_id);

-- Reservas. corretor_id FK para a tabela `corretores` existente. email/telefone PRIVADOS.
create table if not exists public.treinamento_reservas (
  id uuid primary key default gen_random_uuid(),
  horario_id uuid not null references public.treinamento_horarios(id) on delete cascade,
  corretor_id uuid references public.corretores(id) on delete set null,
  nome text not null,
  creci text not null,
  email text not null,
  telefone text not null,
  status text not null default 'confirmada' check (status in ('confirmada','cancelada')),
  created_at timestamptz not null default now()
);
create index if not exists idx_trr_horario on public.treinamento_reservas (horario_id);
create index if not exists idx_trr_corretor on public.treinamento_reservas (corretor_id);

-- updated_at automático
create or replace function public.tr_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;
drop trigger if exists trg_treinamentos_updated on public.treinamentos;
create trigger trg_treinamentos_updated before update on public.treinamentos
  for each row execute function public.tr_set_updated_at();

-- RLS
alter table public.treinamentos enable row level security;
alter table public.treinamento_horarios enable row level security;
alter table public.treinamento_reservas enable row level security;

create policy trein_sel_pub on public.treinamentos for select to anon using (status = 'publicado');
create policy trein_all_auth on public.treinamentos for all to authenticated using (true) with check (true);

create policy trh_sel_pub on public.treinamento_horarios for select to anon
  using (ativo = true and exists (select 1 from public.treinamentos t where t.id = treinamento_id and t.status='publicado'));
create policy trh_all_auth on public.treinamento_horarios for all to authenticated using (true) with check (true);

-- Reservas: SEM acesso direto do público (insert só via RPC). Admin total.
create policy trr_all_auth on public.treinamento_reservas for all to authenticated using (true) with check (true);

-- RPC: reserva atômica (anti-overbooking) + valida horário não passado (fuso São Paulo)
create or replace function public.treinamento_reservar(
  p_horario_id uuid, p_nome text, p_creci text, p_email text, p_telefone text, p_corretor_id uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_cap int; v_ativo boolean; v_status text; v_data date; v_hora time; v_ocup int; v_id uuid;
begin
  if coalesce(btrim(p_nome),'')='' or coalesce(btrim(p_creci),'')='' or coalesce(btrim(p_email),'')='' or coalesce(btrim(p_telefone),'')='' then
    return jsonb_build_object('ok',false,'motivo','dados_invalidos');
  end if;
  select h.capacidade,h.ativo,t.status,h.data,h.hora_inicio into v_cap,v_ativo,v_status,v_data,v_hora
    from public.treinamento_horarios h join public.treinamentos t on t.id=h.treinamento_id
    where h.id=p_horario_id for update of h;
  if not found then return jsonb_build_object('ok',false,'motivo','nao_encontrado'); end if;
  if v_status<>'publicado' or v_ativo is not true then return jsonb_build_object('ok',false,'motivo','fechado'); end if;
  -- já passou?
  if (v_data + v_hora) < (now() at time zone 'America/Sao_Paulo') then
    return jsonb_build_object('ok',false,'motivo','expirado');
  end if;
  if exists (select 1 from public.treinamento_reservas where horario_id=p_horario_id and status='confirmada' and lower(email)=lower(btrim(p_email))) then
    return jsonb_build_object('ok',false,'motivo','email_duplicado');
  end if;
  select count(*) into v_ocup from public.treinamento_reservas where horario_id=p_horario_id and status='confirmada';
  if v_ocup >= v_cap then return jsonb_build_object('ok',false,'motivo','lotado'); end if;
  insert into public.treinamento_reservas (horario_id, corretor_id, nome, creci, email, telefone)
    values (p_horario_id, p_corretor_id, btrim(p_nome), btrim(p_creci), lower(btrim(p_email)), btrim(p_telefone))
    returning id into v_id;
  return jsonb_build_object('ok',true,'reserva_id',v_id);
end; $$;
revoke all on function public.treinamento_reservar(uuid,text,text,text,text,uuid) from public;
grant execute on function public.treinamento_reservar(uuid,text,text,text,text,uuid) to anon, authenticated;

-- RPC: nomes públicos por horário (SÓ nome/creci — nunca email/telefone)
create or replace function public.treinamento_reservados(p_treinamento_id uuid)
returns table (horario_id uuid, nome text, creci text)
language sql security definer set search_path = '' stable as $$
  select r.horario_id, r.nome, r.creci
  from public.treinamento_reservas r
  join public.treinamento_horarios h on h.id=r.horario_id
  join public.treinamentos t on t.id=h.treinamento_id
  where t.id=p_treinamento_id and t.status='publicado' and r.status='confirmada'
  order by r.created_at;
$$;
revoke all on function public.treinamento_reservados(uuid) from public;
grant execute on function public.treinamento_reservados(uuid) to anon, authenticated;
