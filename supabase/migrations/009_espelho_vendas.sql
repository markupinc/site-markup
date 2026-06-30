-- Espelho de Vendas (importação diária do Trilote)

-- Config por empreendimento (logo, ordem)
CREATE TABLE espelho_empreendimentos (
  nome TEXT PRIMARY KEY,            -- "HORIZON TRADE CENTER"
  logo_url TEXT,
  ordem INTEGER DEFAULT 0,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Unidades por dia (cada import substitui as linhas daquele dia)
CREATE TABLE espelho_unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  empreendimento TEXT NOT NULL,
  apartamento TEXT,
  torre TEXT,
  tipo TEXT,
  matricula TEXT,
  inscricao_municipal TEXT,
  area_m2 NUMERIC(12,2),
  valor NUMERIC(14,2) DEFAULT 0,
  desconto NUMERIC(14,2) DEFAULT 0,
  venda NUMERIC(14,2) DEFAULT 0,
  situacao_raw TEXT,
  status TEXT,                      -- vendida | reservada | disponivel | outros
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_espelho_unidades_data ON espelho_unidades(data DESC);
CREATE INDEX idx_espelho_unidades_emp ON espelho_unidades(empreendimento);
CREATE INDEX idx_espelho_unidades_data_emp ON espelho_unidades(data, empreendimento);

-- Config geral do espelho (logo do topo, etc.) — usa a tabela configuracoes existente
-- (chaves: 'espelho_logo_topo')

ALTER TABLE espelho_empreendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE espelho_unidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all espelho_empreendimentos" ON espelho_empreendimentos
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all espelho_unidades" ON espelho_unidades
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
