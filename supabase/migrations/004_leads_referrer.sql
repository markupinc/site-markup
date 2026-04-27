-- Adiciona campo referrer (de onde a pessoa veio) e utm_content/term na tabela leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_content VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_term VARCHAR(100);
