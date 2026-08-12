-- Kommo CRM — funil de DISTRIBUIÇÃO de leads para imobiliárias
-- Espelho local: sync (backfill + incremental) → dashboard lê o cache.
-- Empreendimento vem do funil/estágio; imobiliária vem das TAGS do lead.

CREATE TABLE kommo_distribuicao_leads (
  id BIGINT PRIMARY KEY,              -- id do lead no Kommo
  pipeline_id BIGINT,
  pipeline_nome TEXT,
  status_id BIGINT,
  status_nome TEXT,
  responsavel_id BIGINT,
  responsavel_nome TEXT,
  tags TEXT[] DEFAULT '{}',           -- tags do lead (imobiliária, etc.)
  nome TEXT,
  valor NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ,             -- quando o lead foi criado no Kommo
  updated_at TIMESTAMPTZ,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_kommo_dist_created ON kommo_distribuicao_leads(created_at DESC);
CREATE INDEX idx_kommo_dist_pipeline ON kommo_distribuicao_leads(pipeline_id);
CREATE INDEX idx_kommo_dist_tags ON kommo_distribuicao_leads USING GIN(tags);

ALTER TABLE kommo_distribuicao_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all kommo_distribuicao_leads" ON kommo_distribuicao_leads
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
