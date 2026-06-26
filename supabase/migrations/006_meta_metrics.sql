-- Meta Ads metrics cache
-- O dashboard NUNCA chama a Graph API direto (atraso ~15-30min + rate limit).
-- Uma rota /api/meta/sync puxa os dados a cada ~10-15min e grava aqui;
-- o dashboard lê apenas destas tabelas (rápido, com Supabase Realtime).

-- Insights por campanha por dia (snapshot)
CREATE TABLE meta_campanha_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,                       -- dia a que as métricas se referem
  campaign_id VARCHAR(64) NOT NULL,
  campaign_name TEXT,
  objetivo VARCHAR(50),                     -- objective da campanha (ex.: OUTCOME_LEADS)
  bucket VARCHAR(20) NOT NULL DEFAULT 'outro', -- 'lead' | 'reconhecimento' | 'outro'
  gasto NUMERIC(14,2) DEFAULT 0,
  impressoes BIGINT DEFAULT 0,
  alcance BIGINT DEFAULT 0,
  frequencia NUMERIC(10,4) DEFAULT 0,
  cliques BIGINT DEFAULT 0,
  ctr NUMERIC(10,4) DEFAULT 0,
  cpc NUMERIC(14,4) DEFAULT 0,
  cpm NUMERIC(14,4) DEFAULT 0,
  leads INTEGER DEFAULT 0,                   -- derivado de actions (action_type de lead)
  custo_por_lead NUMERIC(14,2),
  moeda VARCHAR(3) DEFAULT 'BRL',
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (data, campaign_id)
);

CREATE INDEX idx_meta_insights_data ON meta_campanha_insights(data DESC);
CREATE INDEX idx_meta_insights_bucket ON meta_campanha_insights(bucket);

-- Snapshot diário de seguidores / alcance por plataforma
CREATE TABLE meta_seguidores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  plataforma VARCHAR(20) NOT NULL,          -- 'instagram' | 'facebook'
  seguidores_total BIGINT,                  -- total no dia (followers_count / fan_count)
  novos_seguidores INTEGER,                 -- IG follower_count (novos no dia), se disponível
  alcance BIGINT,                           -- reach no dia, se disponível
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (data, plataforma)
);

CREATE INDEX idx_meta_seguidores_data ON meta_seguidores(data DESC);

-- Log das execuções de sincronização (sucesso/erro), espelha o padrão da tabela webhooks
CREATE TABLE meta_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(30) NOT NULL,                -- 'insights' | 'seguidores'
  status VARCHAR(20) NOT NULL,             -- 'ok' | 'erro'
  mensagem TEXT,
  linhas_afetadas INTEGER DEFAULT 0,
  executado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meta_sync_log_exec ON meta_sync_log(executado_em DESC);

-- RLS: admin lê tudo; a escrita acontece via service-role (createAdminClient), que bypassa RLS.
ALTER TABLE meta_campanha_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_seguidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin all meta_campanha_insights" ON meta_campanha_insights
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all meta_seguidores" ON meta_seguidores
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all meta_sync_log" ON meta_sync_log
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
