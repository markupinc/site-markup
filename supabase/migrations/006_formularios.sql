-- Formulários personalizados por empreendimento
-- Permite definir campos extras (texto, seleção única, múltipla, etc.)
-- além dos campos padrão (nome, telefone, email).

CREATE TABLE empreendimento_formularios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empreendimento_id UUID NOT NULL UNIQUE REFERENCES empreendimentos(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT false,
  campos JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_empreendimento_formularios_emp ON empreendimento_formularios(empreendimento_id);

-- Respostas customizadas — vinculadas ao lead criado
CREATE TABLE formulario_respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  empreendimento_id UUID REFERENCES empreendimentos(id) ON DELETE SET NULL,
  respostas JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_formulario_respostas_lead ON formulario_respostas(lead_id);
CREATE INDEX idx_formulario_respostas_emp ON formulario_respostas(empreendimento_id);

-- RLS
ALTER TABLE empreendimento_formularios ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulario_respostas ENABLE ROW LEVEL SECURITY;

-- Público lê o formulário do empreendimento ativo (para renderizar)
CREATE POLICY "Public read empreendimento_formularios" ON empreendimento_formularios FOR SELECT USING (ativo = true);

-- Admin pode tudo
CREATE POLICY "Admin all empreendimento_formularios" ON empreendimento_formularios FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all formulario_respostas" ON formulario_respostas FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
