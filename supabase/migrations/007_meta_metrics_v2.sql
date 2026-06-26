-- Meta metrics v2: visitas ao perfil por campanha, produto, e métricas de IG orgânico

-- Campanhas: visitas ao perfil (campo instagram_profile_visits) + produto + tipo
ALTER TABLE meta_campanha_insights
  ADD COLUMN IF NOT EXISTS visitas_perfil INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS custo_por_visita NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS produto VARCHAR(20) DEFAULT 'outro'; -- 'salsa' | 'up' | 'outro'

-- bucket passa a comportar também 'social' (Post do Instagram) e 'trafego'
-- (coluna já existe; sem alteração de tipo)

CREATE INDEX IF NOT EXISTS idx_meta_insights_produto ON meta_campanha_insights(produto);

-- Instagram orgânico: métricas diárias adicionais na tabela de seguidores
ALTER TABLE meta_seguidores
  ADD COLUMN IF NOT EXISTS views BIGINT,                 -- visualizações (substitui impressions)
  ADD COLUMN IF NOT EXISTS profile_views BIGINT,         -- visitas ao perfil (conta)
  ADD COLUMN IF NOT EXISTS total_interactions BIGINT,    -- interações com conteúdo
  ADD COLUMN IF NOT EXISTS accounts_engaged BIGINT;      -- contas engajadas
