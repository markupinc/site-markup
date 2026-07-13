-- Tabelas de Preços (compartilhadas com corretores)
-- As unidades e valores vêm do Espelho de Vendas (espelho_unidades, por data).
-- A tabela define APENAS a estrutura de pagamento, de forma flexível:
--   cada componente tem nome, % do Valor Total, nº de parcelas e (opcional) um grupo.
--   valor por parcela = valor_total * (percentual/100) / parcelas
--   subtotal do grupo  = valor_total * (soma dos % do grupo)/100
-- Isso reproduz tanto o modelo "plano" (UP!: Sinal/Semestrais/Mensais/Chaves)
-- quanto o "agrupado" (Horizon: Taxa de Adesão + Custo de Construção).

CREATE TABLE tabelas_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empreendimento TEXT NOT NULL,              -- casa com espelho_unidades.empreendimento
  nome TEXT NOT NULL,                        -- ex.: "Julho/26"
  slug VARCHAR(120) UNIQUE NOT NULL,         -- link público: /tabela/{slug}
  data_espelho DATE NOT NULL,                -- snapshot de onde vêm unidades/valores
  entrega_prevista TEXT,
  localizacao TEXT,
  incorporadora TEXT DEFAULT 'MARKUP INCORPORAÇÕES',
  mostrar_valor_m2 BOOLEAN DEFAULT false,    -- Horizon mostra; UP! não
  observacoes TEXT,
  publicada BOOLEAN DEFAULT false,           -- visível no link público / área do corretor
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tabela_componentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela_id UUID NOT NULL REFERENCES tabelas_precos(id) ON DELETE CASCADE,
  ordem INTEGER DEFAULT 0,
  nome TEXT NOT NULL,                        -- "Sinal", "Semestrais", "Chaves"...
  grupo TEXT,                                -- "Taxa de Adesão" | "Custo de Construção" | NULL
  percentual NUMERIC(9,4) NOT NULL,          -- % do Valor Total
  parcelas INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_tabelas_precos_emp ON tabelas_precos(empreendimento);
CREATE INDEX idx_tabelas_precos_slug ON tabelas_precos(slug);
CREATE INDEX idx_tabela_componentes ON tabela_componentes(tabela_id, ordem);

-- RLS: só admin gerencia. O link público e a área do corretor leem via
-- Server Component com service-role (que valida publicada = true).
ALTER TABLE tabelas_precos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabela_componentes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all tabelas_precos" ON tabelas_precos
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
CREATE POLICY "Admin all tabela_componentes" ON tabela_componentes
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
