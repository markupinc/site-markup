-- QR Code access log
-- Cada clique no /qr/[slug] gera uma linha com origem, user-agent e UTMs.
CREATE TABLE qr_acessos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_slug VARCHAR(100) NOT NULL,
  user_agent TEXT,
  referer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qr_acessos_slug ON qr_acessos(qr_slug);
CREATE INDEX idx_qr_acessos_created ON qr_acessos(created_at DESC);

ALTER TABLE qr_acessos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin all qr_acessos" ON qr_acessos FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
