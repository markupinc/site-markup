-- Corretores area
-- Public brokers who can access promotional materials from empreendimentos
-- Authentication: CPF + CRECI (no password). Sessions via JWT in httpOnly cookie.

CREATE TABLE corretores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  creci VARCHAR(30) UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  aceite_termos BOOLEAN DEFAULT false,
  aceite_termos_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_corretores_cpf ON corretores(cpf);
CREATE INDEX idx_corretores_creci ON corretores(creci);

-- Materials per empreendimento (Drive links)
CREATE TYPE material_categoria AS ENUM ('folder', 'tabela', 'divulgacao', 'outros');

CREATE TABLE empreendimento_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empreendimento_id UUID NOT NULL REFERENCES empreendimentos(id) ON DELETE CASCADE,
  titulo VARCHAR(200) NOT NULL,
  categoria material_categoria NOT NULL DEFAULT 'outros',
  drive_url TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_empreendimento_materiais_emp ON empreendimento_materiais(empreendimento_id);

-- Access log: every time a corretor clicks a material
CREATE TABLE material_acessos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id UUID NOT NULL REFERENCES corretores(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES empreendimento_materiais(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_material_acessos_corretor ON material_acessos(corretor_id);
CREATE INDEX idx_material_acessos_material ON material_acessos(material_id);
CREATE INDEX idx_material_acessos_created ON material_acessos(created_at DESC);

-- RLS
ALTER TABLE corretores ENABLE ROW LEVEL SECURITY;
ALTER TABLE empreendimento_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_acessos ENABLE ROW LEVEL SECURITY;

-- All corretor operations go through API routes using the service role key,
-- so public policies only need to cover the admin dashboard.
CREATE POLICY "Admin all corretores" ON corretores FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all empreendimento_materiais" ON empreendimento_materiais FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all material_acessos" ON material_acessos FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
