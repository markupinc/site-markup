/**
 * Motor das Tabelas de Preços.
 * A tabela define componentes de pagamento (% do Valor Total + nº de parcelas),
 * opcionalmente agrupados. As unidades e valores vêm do Espelho de Vendas.
 *
 *   valor por parcela  = valor_total × (percentual/100) ÷ parcelas
 *   subtotal do grupo  = valor_total × (soma dos % do grupo)/100
 *
 * Reproduz os dois modelos reais:
 *  - UP!    : Sinal 10% (1x) · Semestrais 17% (8x) · Mensais 23% (48x) · Chaves 50% (1x)
 *  - Horizon: [Taxa de Adesão] 6% (1x) + 9% (3x)  ·  [Custo de Construção] 45% (60x) + 40% (10x)
 */

export interface Componente {
  id?: string;
  ordem: number;
  nome: string;
  grupo: string | null;
  percentual: number;
  parcelas: number;
}

export interface UnidadeTabela {
  apartamento: string;
  torre: string | null;
  tipo: string | null;
  area_m2: number | null;
  valor: number | null;
  /** Não vem do upload de preços — é cruzado com o Espelho de Vendas (snapshot mais recente). */
  status?: string;
}

export interface Coluna {
  key: string;
  label: string;
  tipo: "grupo" | "componente";
  percentual: number; // no grupo = soma dos componentes
  parcelas: number;
}

/** Gera as colunas: cada grupo aparece como subtotal, seguido dos seus componentes. */
export function montarColunas(componentes: Componente[]): Coluna[] {
  const ordenados = [...componentes].sort((a, b) => a.ordem - b.ordem);

  const somaGrupo = new Map<string, number>();
  ordenados.forEach((c) => {
    if (c.grupo) somaGrupo.set(c.grupo, (somaGrupo.get(c.grupo) || 0) + Number(c.percentual || 0));
  });

  const cols: Coluna[] = [];
  const emitidos = new Set<string>();
  ordenados.forEach((c, i) => {
    if (c.grupo && !emitidos.has(c.grupo)) {
      emitidos.add(c.grupo);
      cols.push({
        key: `grupo:${c.grupo}`,
        label: c.grupo,
        tipo: "grupo",
        percentual: somaGrupo.get(c.grupo) || 0,
        parcelas: 1,
      });
    }
    cols.push({
      key: `comp:${c.id ?? i}`,
      label: c.nome,
      tipo: "componente",
      percentual: Number(c.percentual || 0),
      parcelas: Math.max(1, Number(c.parcelas || 1)),
    });
  });
  return cols;
}

/** Valor exibido na coluna para uma unidade. */
export function valorDaColuna(col: Coluna, valorTotal: number): number {
  const bruto = valorTotal * (col.percentual / 100);
  return col.tipo === "grupo" ? bruto : bruto / col.parcelas;
}

export const somaPercentuais = (cs: Componente[]) =>
  cs.reduce((a, c) => a + Number(c.percentual || 0), 0);

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const STATUS_LABEL: Record<string, string> = {
  disponivel: "Disponível",
  reservada: "Reservada",
  vendida: "Vendida",
  outros: "Outros",
};

/** Modelos prontos para acelerar a criação (baseados nas tabelas reais). */
export const MODELOS: Record<string, Componente[]> = {
  "UP! Studios (plano)": [
    { ordem: 0, nome: "Sinal 10%", grupo: null, percentual: 10, parcelas: 1 },
    { ordem: 1, nome: "Semestrais 17% (8x)", grupo: null, percentual: 17, parcelas: 8 },
    { ordem: 2, nome: "Mensais 23% (48x)", grupo: null, percentual: 23, parcelas: 48 },
    { ordem: 3, nome: "Chaves 50%", grupo: null, percentual: 50, parcelas: 1 },
  ],
  "Horizon (agrupado)": [
    { ordem: 0, nome: "Taxa de Adesão", grupo: "Taxa de Adesão (Sinal)", percentual: 6, parcelas: 1 },
    { ordem: 1, nome: "Taxa de Adesão (+3 Parcelas)", grupo: "Taxa de Adesão (Sinal)", percentual: 9, parcelas: 3 },
    { ordem: 2, nome: "60x Mensais", grupo: "Custo de Construção", percentual: 45, parcelas: 60 },
    { ordem: 3, nome: "10x Semestrais", grupo: "Custo de Construção", percentual: 40, parcelas: 10 },
  ],
};
