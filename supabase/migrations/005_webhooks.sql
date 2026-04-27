-- Webhooks
-- Disparados ao criar leads (e potencialmente outros eventos no futuro).
-- Eventos suportados: 'lead.criado'.
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  evento VARCHAR(50) NOT NULL DEFAULT 'lead.criado',
  ativo BOOLEAN DEFAULT true,
  ultimo_status INTEGER,
  ultimo_disparo_em TIMESTAMPTZ,
  ultimo_erro TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhooks_evento_ativo ON webhooks(evento, ativo);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin all webhooks" ON webhooks FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
