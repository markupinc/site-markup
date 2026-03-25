-- =====================================================
-- MARKUP INCORPORAÇÕES — Database Schema
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ADMIN PROFILES
-- =====================================================
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMPREENDIMENTOS
-- =====================================================
CREATE TYPE empreendimento_status AS ENUM ('lancamento', 'em_obras', 'entregue');

CREATE TABLE empreendimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  descricao TEXT,
  descricao_curta VARCHAR(500),
  status empreendimento_status DEFAULT 'lancamento',
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  bairro VARCHAR(100),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  area_min DECIMAL(10,2),
  area_max DECIMAL(10,2),
  quartos_min INTEGER,
  quartos_max INTEGER,
  suites_min INTEGER,
  suites_max INTEGER,
  vagas_min INTEGER,
  vagas_max INTEGER,
  andares INTEGER,
  unidades_por_andar INTEGER,
  total_unidades INTEGER,
  previsao_entrega VARCHAR(50),
  imagem_destaque_url TEXT,
  video_url TEXT,
  tour_virtual_url TEXT,
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  og_image_url TEXT,
  destaque BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMPREENDIMENTO IMAGES
-- =====================================================
CREATE TABLE empreendimento_imagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empreendimento_id UUID NOT NULL REFERENCES empreendimentos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  categoria VARCHAR(50),
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMPREENDIMENTO PLANTAS
-- =====================================================
CREATE TABLE empreendimento_plantas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empreendimento_id UUID NOT NULL REFERENCES empreendimentos(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  area DECIMAL(10,2),
  quartos INTEGER,
  suites INTEGER,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMPREENDIMENTO DIFERENCIAIS
-- =====================================================
CREATE TABLE empreendimento_diferenciais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empreendimento_id UUID NOT NULL REFERENCES empreendimentos(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  icone VARCHAR(50),
  ordem INTEGER DEFAULT 0
);

-- =====================================================
-- BLOG POSTS
-- =====================================================
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  conteudo TEXT NOT NULL,
  resumo VARCHAR(500),
  imagem_destaque_url TEXT,
  categoria VARCHAR(100),
  tags TEXT[],
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  og_image_url TEXT,
  publicado BOOLEAN DEFAULT false,
  data_publicacao TIMESTAMPTZ,
  autor_id UUID REFERENCES admin_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BLOG CATEGORIES
-- =====================================================
CREATE TABLE blog_categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LEADS
-- =====================================================
CREATE TYPE lead_status AS ENUM ('novo', 'contatado', 'em_negociacao', 'convertido', 'perdido');

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20) NOT NULL,
  mensagem TEXT,
  empreendimento_id UUID REFERENCES empreendimentos(id),
  origem VARCHAR(50),
  pagina_origem TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  status lead_status DEFAULT 'novo',
  notas TEXT,
  atendente VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MIDIA (Press)
-- =====================================================
CREATE TABLE midia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fonte VARCHAR(255) NOT NULL,
  titulo VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  data_publicacao DATE,
  thumbnail_url TEXT,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NEWSLETTER
-- =====================================================
CREATE TABLE newsletter (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONFIGURACOES (Site Settings)
-- =====================================================
CREATE TABLE configuracoes (
  chave VARCHAR(100) PRIMARY KEY,
  valor TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SEED DATA
-- =====================================================
INSERT INTO configuracoes (chave, valor) VALUES
  ('hero_tagline', 'Você investe, o retorno vem.'),
  ('stats_anos', '15'),
  ('stats_investidores', '200'),
  ('stats_empreendimentos', '2'),
  ('stats_unidades', '200'),
  ('stats_titulo', 'Somos obcecados por excelência'),
  ('stats_subtitulo', 'Com 15 anos de experiência em desenvolvimento imobiliário através de parcerias estratégicas, a Markup Incorporações direciona toda a sua expertise para oferecer produtos arrojados, de alto padrão e com alta rentabilidade.'),
  ('whatsapp_number', '5582982294001'),
  ('email_comercial', 'comercial@markupinc.com.br'),
  ('telefone', '+5582982294001'),
  ('endereco', 'Empresarial Ocean Tower - Tv. Dr. Antônio Gouveia, 61 - Pajuçara, Maceió - AL, 57030-170, Sala 307'),
  ('instagram', 'https://www.instagram.com/markup_inc/'),
  ('facebook', 'https://www.facebook.com/profile.php?id=61575200364485'),
  ('youtube', 'https://www.youtube.com/@MarkupIncorporacoes'),
  ('gtm_id', ''),
  ('meta_pixel_id', '');

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE empreendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE empreendimento_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE empreendimento_plantas ENABLE ROW LEVEL SECURITY;
ALTER TABLE empreendimento_diferenciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE midia ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read empreendimentos" ON empreendimentos FOR SELECT USING (ativo = true);
CREATE POLICY "Public read empreendimento_imagens" ON empreendimento_imagens FOR SELECT USING (true);
CREATE POLICY "Public read empreendimento_plantas" ON empreendimento_plantas FOR SELECT USING (true);
CREATE POLICY "Public read empreendimento_diferenciais" ON empreendimento_diferenciais FOR SELECT USING (true);
CREATE POLICY "Public read blog" ON blog_posts FOR SELECT USING (publicado = true);
CREATE POLICY "Public read blog_categorias" ON blog_categorias FOR SELECT USING (true);
CREATE POLICY "Public read midia" ON midia FOR SELECT USING (ativo = true);
CREATE POLICY "Public read configuracoes" ON configuracoes FOR SELECT USING (true);

-- Public insert policies
CREATE POLICY "Anyone can submit leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can subscribe newsletter" ON newsletter FOR INSERT WITH CHECK (true);

-- Admin full access policies
CREATE POLICY "Admin all admin_profiles" ON admin_profiles FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all empreendimentos" ON empreendimentos FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all empreendimento_imagens" ON empreendimento_imagens FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all empreendimento_plantas" ON empreendimento_plantas FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all empreendimento_diferenciais" ON empreendimento_diferenciais FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all blog" ON blog_posts FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all blog_categorias" ON blog_categorias FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all leads" ON leads FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all midia" ON midia FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all newsletter" ON newsletter FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all configuracoes" ON configuracoes FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('empreendimentos', 'empreendimentos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('blog', 'blog', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('midia', 'midia', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('site', 'site', true);

-- Storage policies (public read, admin write)
CREATE POLICY "Public read storage" ON storage.objects FOR SELECT USING (bucket_id IN ('empreendimentos', 'blog', 'midia', 'site'));
CREATE POLICY "Admin upload storage" ON storage.objects FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin update storage" ON storage.objects FOR UPDATE USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin delete storage" ON storage.objects FOR DELETE USING (auth.uid() IN (SELECT id FROM admin_profiles));
