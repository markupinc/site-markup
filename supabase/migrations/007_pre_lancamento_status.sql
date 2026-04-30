-- Adiciona "Pré-lançamento" como status de empreendimento
ALTER TYPE empreendimento_status ADD VALUE IF NOT EXISTS 'pre_lancamento' BEFORE 'lancamento';
