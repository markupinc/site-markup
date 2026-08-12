-- Quais tags do Kommo são imobiliárias (allowlist do painel de Distribuição).
-- Marcadas no Admin → Marketing → Distribuição → botão "Tags".
-- Sem nenhuma tag marcada, o painel considera todas (fallback).

CREATE TABLE kommo_distribuicao_tags (
  tag TEXT PRIMARY KEY,
  imobiliaria BOOLEAN NOT NULL DEFAULT false,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE kommo_distribuicao_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all kommo_distribuicao_tags" ON kommo_distribuicao_tags
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_profiles));
