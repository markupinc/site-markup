-- Revisão de texto do site — itens confirmados pela Markup em 20/10/2026 (D4, D5).
-- Funciona tanto antes quanto depois da 016 (troca os dois textos possíveis).

BEGIN;

UPDATE empreendimentos SET
  area_max = 53,                                                                                     -- D4: Up! de 22 a 53 m²
  descricao_curta = replace(replace(descricao_curta,
    'Apartamentos Studios e Quarto/Sala', 'Studios, apartamentos de quarto e sala e cobertura duplex com hidro privativa'),
    'Studios e apartamentos de quarto e sala', 'Studios, apartamentos de quarto e sala e cobertura duplex com hidro privativa'),  -- D5
  meta_description = replace(replace(meta_description,
    'Apartamentos Studios e Quarto/Sala', 'Studios, quarto e sala e cobertura duplex'),
    'Studios e apartamentos de quarto e sala', 'Studios, quarto e sala e cobertura duplex'),
  updated_at = NOW()
WHERE slug = 'up-studios-smart-living';

COMMIT;

SELECT slug, area_min, area_max, descricao_curta FROM empreendimentos WHERE slug = 'up-studios-smart-living';
