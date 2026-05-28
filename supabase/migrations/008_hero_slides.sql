-- Slides do hero da home page
-- Imagens: upload no Storage. Vídeos: URL externa (YouTube/Vimeo/CDN/mp4).
CREATE TABLE hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(10) NOT NULL DEFAULT 'image' CHECK (tipo IN ('image', 'video')),
  src TEXT NOT NULL,
  label VARCHAR(200),
  href TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hero_slides_ordem ON hero_slides(ordem);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read hero_slides" ON hero_slides FOR SELECT USING (ativo = true);
CREATE POLICY "Admin all hero_slides" ON hero_slides FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
