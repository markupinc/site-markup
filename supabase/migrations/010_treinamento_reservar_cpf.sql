-- Adiciona CPF na reserva. Se o corretor não existir em `corretores`,
-- cria um cadastro novo; se existir, vincula a reserva ao cadastro.

drop function if exists public.treinamento_reservar(uuid,text,text,text,text,uuid);

create or replace function public.treinamento_reservar(
  p_horario_id uuid,
  p_nome text,
  p_creci text,
  p_email text,
  p_telefone text,
  p_cpf text,
  p_corretor_id uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_cap int;
  v_ativo boolean;
  v_status text;
  v_data date;
  v_hora time;
  v_ocup int;
  v_id uuid;
  v_corretor_id uuid;
  v_cpf_norm text;
begin
  -- Normaliza CPF (só dígitos)
  v_cpf_norm := regexp_replace(coalesce(p_cpf,''), '\D', '', 'g');

  -- Valida obrigatórios
  if coalesce(btrim(p_nome),'')='' or coalesce(btrim(p_creci),'')='' or coalesce(btrim(p_email),'')='' or coalesce(btrim(p_telefone),'')='' or v_cpf_norm = '' then
    return jsonb_build_object('ok',false,'motivo','dados_invalidos');
  end if;

  if length(v_cpf_norm) <> 11 then
    return jsonb_build_object('ok',false,'motivo','cpf_invalido');
  end if;

  -- Busca horário com lock
  select h.capacidade, h.ativo, t.status, h.data, h.hora_inicio
    into v_cap, v_ativo, v_status, v_data, v_hora
    from public.treinamento_horarios h
    join public.treinamentos t on t.id = h.treinamento_id
    where h.id = p_horario_id
    for update of h;

  if not found then return jsonb_build_object('ok',false,'motivo','nao_encontrado'); end if;
  if v_status <> 'publicado' or v_ativo is not true then
    return jsonb_build_object('ok',false,'motivo','fechado');
  end if;

  -- Já passou?
  if (v_data + v_hora) < (now() at time zone 'America/Sao_Paulo') then
    return jsonb_build_object('ok',false,'motivo','expirado');
  end if;

  -- E-mail duplicado nesse horário?
  if exists (select 1 from public.treinamento_reservas where horario_id = p_horario_id and status = 'confirmada' and lower(email) = lower(btrim(p_email))) then
    return jsonb_build_object('ok',false,'motivo','email_duplicado');
  end if;

  -- Lotado?
  select count(*) into v_ocup from public.treinamento_reservas where horario_id = p_horario_id and status = 'confirmada';
  if v_ocup >= v_cap then
    return jsonb_build_object('ok',false,'motivo','lotado');
  end if;

  -- Resolve corretor: prioriza id passado, senão busca por CPF, senão cria
  if p_corretor_id is not null then
    v_corretor_id := p_corretor_id;
  else
    select id into v_corretor_id from public.corretores where cpf = v_cpf_norm;

    if v_corretor_id is null then
      begin
        insert into public.corretores (nome, email, telefone, cpf, creci, ativo, aceite_termos, aceite_termos_em)
        values (
          btrim(p_nome),
          lower(btrim(p_email)),
          btrim(p_telefone),
          v_cpf_norm,
          upper(btrim(p_creci)),
          true,
          true,
          now()
        )
        returning id into v_corretor_id;
      exception
        when unique_violation then
          -- CRECI já em uso por outra pessoa
          return jsonb_build_object('ok',false,'motivo','creci_em_uso');
      end;
    end if;
  end if;

  -- Insere reserva
  insert into public.treinamento_reservas (horario_id, corretor_id, nome, creci, email, telefone)
  values (p_horario_id, v_corretor_id, btrim(p_nome), btrim(p_creci), lower(btrim(p_email)), btrim(p_telefone))
  returning id into v_id;

  return jsonb_build_object('ok', true, 'reserva_id', v_id, 'corretor_id', v_corretor_id);
end; $$;

revoke all on function public.treinamento_reservar(uuid,text,text,text,text,text,uuid) from public;
grant execute on function public.treinamento_reservar(uuid,text,text,text,text,text,uuid) to anon, authenticated;
