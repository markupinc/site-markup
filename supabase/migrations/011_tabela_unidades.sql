-- Tabelas de Preços v2: unidades PRÓPRIAS (upload dedicado).
-- Motivo: o CSV do Espelho CONGELA o preço quando a unidade é vendida (vira o valor da venda).
-- Para a tabela de preços precisamos do valor ATUAL de TODAS as unidades.
-- Então: o PREÇO vem deste upload; o STATUS continua vindo do Espelho (snapshot mais recente).

CREATE TABLE tabela_unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela_id UUID NOT NULL REFERENCES tabelas_precos(id) ON DELETE CASCADE,
  apartamento TEXT NOT NULL,
  torre TEXT,
  tipo TEXT,
  area_m2 NUMERIC(12,2),
  valor NUMERIC(14,2) NOT NULL DEFAULT 0,
  ordem INTEGER DEFAULT 0,
  UNIQUE (tabela_id, apartamento)
);

CREATE INDEX idx_tabela_unidades ON tabela_unidades(tabela_id, ordem);

ALTER TABLE tabela_unidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all tabela_unidades" ON tabela_unidades
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));

-- data_espelho deixa de ser obrigatória (as unidades não vêm mais de lá).
ALTER TABLE tabelas_precos ALTER COLUMN data_espelho DROP NOT NULL;
ALTER TABLE tabelas_precos ADD COLUMN IF NOT EXISTS unidades_atualizadas_em TIMESTAMPTZ;
