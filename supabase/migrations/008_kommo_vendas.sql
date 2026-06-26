-- Kommo CRM — espelho de vendas (funil)
-- Sync: backfill + poll (e webhook) → tabelas espelho → dashboard lê o cache.

-- Mapeamento status -> bucket (editável; alimenta a classificação dos leads)
CREATE TABLE kommo_pipeline_stages (
  status_id BIGINT PRIMARY KEY,
  pipeline_id BIGINT NOT NULL,
  pipeline_nome TEXT,
  status_nome TEXT,
  tipo INTEGER,
  cor VARCHAR(20),
  bucket VARCHAR(20) NOT NULL DEFAULT 'em_atendimento', -- novo|em_atendimento|qualificado|ganho|perdido|ignorar
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Espelho dos leads dos funis de venda
CREATE TABLE kommo_leads (
  id BIGINT PRIMARY KEY,
  pipeline_id BIGINT,
  status_id BIGINT,
  produto VARCHAR(20),        -- salsa|up|horizon|outro
  bucket VARCHAR(20),         -- snapshot do bucket atual
  responsavel_id BIGINT,
  valor NUMERIC(14,2) DEFAULT 0,
  nome TEXT,
  fonte VARCHAR(30),          -- facebook|site|outro
  created_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_kommo_leads_produto ON kommo_leads(produto);
CREATE INDEX idx_kommo_leads_bucket ON kommo_leads(bucket);
CREATE INDEX idx_kommo_leads_created ON kommo_leads(created_at DESC);

CREATE TABLE kommo_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(30),
  status VARCHAR(20),
  mensagem TEXT,
  linhas_afetadas INTEGER DEFAULT 0,
  executado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_kommo_sync_log_exec ON kommo_sync_log(executado_em DESC);

ALTER TABLE kommo_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kommo_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE kommo_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all kommo_pipeline_stages" ON kommo_pipeline_stages FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all kommo_leads" ON kommo_leads FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all kommo_sync_log" ON kommo_sync_log FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
