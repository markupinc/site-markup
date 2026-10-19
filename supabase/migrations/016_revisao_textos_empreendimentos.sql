-- Revisão de texto do site (ASTI, 19/10/2026) — parte que fica no banco:
-- descrições, diferenciais, ficha e previsão de entrega dos empreendimentos.
-- Trocas por trecho exato (replace) ou por valor exato, então rodar duas vezes não estraga nada.
-- Itens que dependem de confirmação da Markup (D2, D4, D5) NÃO estão aqui.

BEGIN;

-- ===================== SALSA HOME RESORT =====================
UPDATE empreendimentos SET
  descricao_curta = replace(descricao_curta, 'localizado beira-mar', 'localizado à beira-mar'),            -- O7 O9
  meta_description = replace(meta_description, 'localizado beira-mar', 'localizado à beira-mar'),
  descricao = replace(replace(replace(replace(replace(replace(descricao,
    'localizado beira-mar', 'localizado à beira-mar'),
    'pensado no bem-estar e aprimorar', 'pensado para promover o bem-estar e aprimorar'),                 -- O10
    'você terá toda a comodidade de ter tudo que precisa perto de você.',
    'você terá tudo de que precisa sem sair de casa.'),                                                   -- O11 R3
    'sua família viver bem', 'sua família viverem bem'),                                                  -- O12
    'Opções com 03 ou 04 suítes de 148 até 254m² no pavimento tipo. E com coberturas duplex de 241 a 418m².',
    'Opções com 3 ou 4 suítes, de 148 a 254 m² no pavimento tipo, e coberturas duplex de 241 a 418 m².'), -- O13
    'Salsa Home Resort, invista na vida que você leva. Invista no que você leva da vida, empreendimento Markup Incorporações.',
    'Salsa Home Resort. Invista na vida que você leva — e no que você leva da vida. Um empreendimento Markup Incorporações.'), -- O14
  area_max = 418,                                                                                         -- D6 (faixa completa com coberturas)
  previsao_entrega = CASE WHEN previsao_entrega = 'Nov/29' THEN 'nov/2029' ELSE previsao_entrega END,     -- D15
  updated_at = NOW()
WHERE slug = 'salsa-home-resort';

UPDATE empreendimento_diferenciais d SET titulo = v.novo
FROM (VALUES
  ('Academia com vista 180º', 'Academia com vista 180°'),                                                 -- O15
  ('Acesso a praia direto pelo prédio', 'Acesso à praia direto pelo prédio')                              -- O16
) AS v(antigo, novo), empreendimentos e
WHERE d.empreendimento_id = e.id AND e.slug = 'salsa-home-resort' AND d.titulo = v.antigo;

-- ===================== UP! STUDIOS =====================
UPDATE empreendimentos SET
  descricao_curta = replace(descricao_curta, 'Apartamentos Studios e Quarto/Sala', 'Studios e apartamentos de quarto e sala'),  -- O8 O17
  meta_description = replace(meta_description, 'Apartamentos Studios e Quarto/Sala', 'Studios e apartamentos de quarto e sala'),
  descricao = replace(replace(replace(replace(descricao,
    'Apartamentos Studios e Quarto/Sala', 'Studios e apartamentos de quarto e sala'),
    'Localizado em uma das regiões', 'O Up! Studios está localizado em uma das regiões'),                -- O18
    'O UP! Studios é um empreendimento', 'O Up! Studios é um empreendimento'),                             -- O19 D10
    'que redefinem o conceito de qualidade de vida urbana', 'que elevam a qualidade de vida urbana'),     -- R8
  previsao_entrega = CASE WHEN previsao_entrega = 'Dez/29' THEN 'dez/2029' ELSE previsao_entrega END,     -- D15
  updated_at = NOW()
WHERE slug = 'up-studios-smart-living';

UPDATE empreendimento_diferenciais d SET titulo = v.novo
FROM (VALUES
  ('Próximos a bares e restaurantes', 'Próximo a bares e restaurantes'),                                  -- O20
  ('Estrutura Lazer Completa', 'Estrutura de lazer completa'),                                            -- O21
  ('Gestão Completa MME', 'Gestão de locação MME Hospitalidade')                                          -- R9
) AS v(antigo, novo), empreendimentos e
WHERE d.empreendimento_id = e.id AND e.slug = 'up-studios-smart-living' AND d.titulo = v.antigo;

-- ===================== HORIZON TRADE CENTER =====================
UPDATE empreendimentos SET
  bairro = CASE WHEN bairro = 'Centro' THEN 'Praia da Avenida' ELSE bairro END,                           -- D9
  descricao = replace(replace(descricao,
    'este empreendimento é um marco na transformação da região', 'este empreendimento nasce no centro da transformação da região'),  -- I12
    'esquadrias do piso ao teto para conforto acústico e vista deslumbrante para o mar em 80% das unidades',
    'esquadrias do piso ao teto, isolamento acústico e vista deslumbrante para o mar em 80% das salas'),  -- I11 D8
  updated_at = NOW()
WHERE slug = 'horizon-trade-center';

UPDATE empreendimento_diferenciais d SET titulo = v.novo
FROM (VALUES
  ('8 minutos da Ponta Verde', 'A 8 minutos da Ponta Verde'),                                             -- O22
  ('10 minutos da Barra Nova', 'A 10 minutos da Barra Nova'),
  ('Restaurante com vista panorâmica', 'Restaurante e auditório com vista panorâmica')                    -- R7
) AS v(antigo, novo), empreendimentos e
WHERE d.empreendimento_id = e.id AND e.slug = 'horizon-trade-center' AND d.titulo = v.antigo;

DELETE FROM empreendimento_diferenciais d USING empreendimentos e                                         -- R7 (unido ao restaurante)
WHERE d.empreendimento_id = e.id AND e.slug = 'horizon-trade-center'
  AND d.titulo = 'Auditório/Espaço Multiuso com vista panorâmica';

COMMIT;

-- Conferência: deve mostrar os textos novos
SELECT slug, bairro, area_max, previsao_entrega, descricao_curta, left(descricao, 160) AS inicio_descricao
FROM empreendimentos WHERE slug IN ('salsa-home-resort', 'up-studios-smart-living', 'horizon-trade-center');
