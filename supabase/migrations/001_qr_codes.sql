-- QR Codes table
-- Stores dynamic redirects used by printed QR codes (e.g. site tapumes).
-- URL pattern: /qr/[slug] -> destino_url
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  destino_url TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qr_codes_slug ON qr_codes(slug);

ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read qr_codes" ON qr_codes FOR SELECT USING (ativo = true);
CREATE POLICY "Admin all qr_codes" ON qr_codes FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));

-- Seed Horizon QR (inherits the /qr/horizon route created earlier)
INSERT INTO qr_codes (slug, destino_url, descricao)
VALUES ('horizon', '/', 'QR Code do tapume do Horizon')
ON CONFLICT (slug) DO NOTHING;
