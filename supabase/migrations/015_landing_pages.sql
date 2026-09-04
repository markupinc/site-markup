-- Landing pages estáticas por ZIP (Admin → Configurações → Landing Pages).
-- O ZIP é extraído para o bucket 'landing-pages' (prefixo = slug) e servido
-- pelo site em /lp/{slug} via proxy (route handler).

CREATE TABLE landing_pages (
  slug TEXT PRIMARY KEY CHECK (slug ~ '^[a-z0-9][a-z0-9-]{0,59}$'),
  titulo TEXT,
  arquivo_principal TEXT NOT NULL DEFAULT 'index.html',
  ativo BOOLEAN NOT NULL DEFAULT true,
  total_arquivos INTEGER DEFAULT 0,
  tamanho_bytes BIGINT DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all landing_pages" ON landing_pages
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));

-- Bucket público de leitura (o serve é feito pelo site, mas a leitura direta não faz mal)
INSERT INTO storage.buckets (id, name, public) VALUES ('landing-pages', 'landing-pages', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read landing-pages" ON storage.objects
  FOR SELECT USING (bucket_id = 'landing-pages');
