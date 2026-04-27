"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CampoFormulario, CampoTipo } from "@/types/database";

interface Props {
  empreendimentoId: string;
}

const TIPO_LABELS: Record<CampoTipo, string> = {
  texto: "Texto curto",
  textarea: "Texto longo",
  numero: "Número",
  selecao_unica: "Seleção única (radio)",
  multipla_escolha: "Múltipla escolha (checkbox)",
  select: "Lista (dropdown)",
};

const TIPOS_COM_OPCOES: CampoTipo[] = [
  "selecao_unica",
  "multipla_escolha",
  "select",
];

const TEMPLATES: Array<{ label: string; campo: Omit<CampoFormulario, "id" | "ordem"> }> = [
  {
    label: "Faixa de renda mensal",
    campo: {
      tipo: "select",
      label: "Faixa de renda mensal",
      obrigatorio: false,
      opcoes: [
        "Até R$ 5.000",
        "R$ 5.000 a R$ 10.000",
        "R$ 10.000 a R$ 20.000",
        "R$ 20.000 a R$ 50.000",
        "Acima de R$ 50.000",
      ],
    },
  },
  {
    label: "Faixa de investimento",
    campo: {
      tipo: "select",
      label: "Quanto pretende investir?",
      obrigatorio: false,
      opcoes: [
        "Até R$ 300.000",
        "R$ 300.000 a R$ 500.000",
        "R$ 500.000 a R$ 1.000.000",
        "R$ 1.000.000 a R$ 2.000.000",
        "Acima de R$ 2.000.000",
      ],
    },
  },
  {
    label: "Profissão",
    campo: {
      tipo: "texto",
      label: "Profissão",
      obrigatorio: false,
      placeholder: "Ex: Médico, Engenheiro...",
    },
  },
  {
    label: "Como conheceu a Markup?",
    campo: {
      tipo: "selecao_unica",
      label: "Como você conheceu a Markup?",
      obrigatorio: false,
      opcoes: ["Google", "Instagram", "Indicação", "Outdoor", "Outro"],
    },
  },
  {
    label: "Já investe em imóveis?",
    campo: {
      tipo: "selecao_unica",
      label: "Você já investe em imóveis?",
      obrigatorio: false,
      opcoes: ["Sim", "Não"],
    },
  },
  {
    label: "Tipos de unidade de interesse",
    campo: {
      tipo: "multipla_escolha",
      label: "Quais unidades te interessam?",
      obrigatorio: false,
      opcoes: ["Studio", "1 quarto", "2 quartos", "3 quartos", "Cobertura"],
    },
  },
  {
    label: "Pretende morar ou investir?",
    campo: {
      tipo: "selecao_unica",
      label: "Pretende morar ou investir?",
      obrigatorio: false,
      opcoes: ["Morar", "Investir", "Ambos"],
    },
  },
];

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `c-${Math.random().toString(36).slice(2, 10)}`;

export default function FormularioBuilder({ empreendimentoId }: Props) {
  const supabase = createClient();
  const [campos, setCampos] = useState<CampoFormulario[]>([]);
  const [ativo, setAtivo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("empreendimento_formularios")
        .select("ativo, campos")
        .eq("empreendimento_id", empreendimentoId)
        .maybeSingle<{ ativo: boolean; campos: CampoFormulario[] }>();
      if (data) {
        setAtivo(data.ativo);
        setCampos(
          (data.campos || []).slice().sort((a, b) => a.ordem - b.ordem)
        );
      }
      setLoading(false);
    }
    load();
  }, [empreendimentoId]);

  function addCampo(template?: Omit<CampoFormulario, "id" | "ordem">) {
    const base: CampoFormulario = template
      ? {
          ...template,
          id: newId(),
          ordem: campos.length,
        }
      : {
          id: newId(),
          tipo: "texto",
          label: "Novo campo",
          obrigatorio: false,
          ordem: campos.length,
        };
    setCampos([...campos, base]);
    setSaved(false);
  }

  function updateCampo(id: string, patch: Partial<CampoFormulario>) {
    setCampos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
    setSaved(false);
  }

  function removeCampo(id: string) {
    if (!confirm("Remover este campo?")) return;
    setCampos((prev) =>
      prev
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, ordem: i }))
        // remove condições que apontam para o campo deletado
        .map((c) => (c.condicao?.campo_id === id ? { ...c, condicao: undefined } : c))
    );
    setSaved(false);
  }

  function moveCampo(id: string, direcao: -1 | 1) {
    setCampos((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const target = idx + direcao;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((c, i) => ({ ...c, ordem: i }));
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    // upsert (1 form por empreendimento)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("empreendimento_formularios") as any).upsert(
      {
        empreendimento_id: empreendimentoId,
        ativo,
        campos,
      },
      { onConflict: "empreendimento_id" }
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return (
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Formulário Personalizado</h2>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2 style={sectionTitle}>Formulário Personalizado</h2>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
            Campos extras além de Nome / Telefone / E-mail (que sempre aparecem).
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <ToggleSwitch ativo={ativo} onChange={() => { setAtivo(!ativo); setSaved(false); }} />
            {ativo ? "Ativo" : "Inativo"}
          </label>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={{
              padding: "8px 16px",
              backgroundColor: saved ? "#6b9f6b" : "#fff",
              color: saved ? "#fff" : "#000",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? "Salvando..." : saved ? "Salvo ✓" : "Salvar formulário"}
          </button>
        </div>
      </div>

      {/* Templates */}
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          border: "1px dashed rgba(255,255,255,0.12)",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "16px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Adicionar campo
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => addCampo(t.campo)}
              style={chipStyle}
            >
              + {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => addCampo()}
            style={{ ...chipStyle, borderColor: "rgba(184,148,95,0.5)", color: "#b8945f" }}
          >
            + Campo em branco
          </button>
        </div>
      </div>

      {/* Lista de campos */}
      {campos.length === 0 ? (
        <p
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.4)",
            padding: "20px",
            textAlign: "center",
            backgroundColor: "rgba(255,255,255,0.02)",
            borderRadius: "8px",
          }}
        >
          Nenhum campo extra. O formulário público vai mostrar só Nome / Telefone / E-mail / Mensagem.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {campos.map((campo, i) => (
            <CampoEditor
              key={campo.id}
              campo={campo}
              index={i}
              total={campos.length}
              outrosCampos={campos.filter((c) => c.id !== campo.id)}
              onUpdate={(patch) => updateCampo(campo.id, patch)}
              onRemove={() => removeCampo(campo.id)}
              onMove={(dir) => moveCampo(campo.id, dir)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CampoEditor({
  campo,
  index,
  total,
  outrosCampos,
  onUpdate,
  onRemove,
  onMove,
}: {
  campo: CampoFormulario;
  index: number;
  total: number;
  outrosCampos: CampoFormulario[];
  onUpdate: (patch: Partial<CampoFormulario>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const temOpcoes = TIPOS_COM_OPCOES.includes(campo.tipo);
  const [opcoesText, setOpcoesText] = useState((campo.opcoes || []).join("\n"));

  useEffect(() => {
    setOpcoesText((campo.opcoes || []).join("\n"));
  }, [campo.id]);

  const camposComOpcoes = outrosCampos.filter(
    (c) => TIPOS_COM_OPCOES.includes(c.tipo) && (c.opcoes?.length ?? 0) > 0
  );

  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "8px",
        padding: "14px",
      }}
    >
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        {/* Setas */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            style={arrowButtonStyle(index === 0)}
            title="Mover para cima"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            style={arrowButtonStyle(index === total - 1)}
            title="Mover para baixo"
          >
            ↓
          </button>
        </div>

        <div style={{ flex: 1, display: "grid", gap: "8px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: "8px" }}>
            <input
              type="text"
              value={campo.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="Pergunta"
              style={inputStyle}
            />
            <select
              value={campo.tipo}
              onChange={(e) =>
                onUpdate({
                  tipo: e.target.value as CampoTipo,
                  // Se mudou pra um tipo sem opções, limpa as opções
                  opcoes: TIPOS_COM_OPCOES.includes(e.target.value as CampoTipo)
                    ? campo.opcoes ?? []
                    : undefined,
                })
              }
              style={{ ...inputStyle, colorScheme: "dark" }}
            >
              {Object.entries(TIPO_LABELS).map(([v, l]) => (
                <option key={v} value={v} style={optionStyle}>
                  {l}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onRemove}
              style={{
                padding: "8px 12px",
                backgroundColor: "transparent",
                border: "1px solid rgba(212,91,91,0.3)",
                borderRadius: "6px",
                color: "#d45b5b",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Remover
            </button>
          </div>

          {(campo.tipo === "texto" || campo.tipo === "textarea" || campo.tipo === "numero") && (
            <input
              type="text"
              value={campo.placeholder || ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              placeholder="Placeholder (opcional)"
              style={inputStyle}
            />
          )}

          {temOpcoes && (
            <textarea
              value={opcoesText}
              onChange={(e) => {
                setOpcoesText(e.target.value);
                onUpdate({
                  opcoes: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                });
              }}
              placeholder="Uma opção por linha"
              rows={4}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          )}

          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={campo.obrigatorio}
                onChange={(e) => onUpdate({ obrigatorio: e.target.checked })}
                style={{ accentColor: "#b8945f" }}
              />
              Obrigatório
            </label>

            {/* Lógica condicional */}
            {camposComOpcoes.length > 0 && (
              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                  Mostrar só se:
                </span>
                <select
                  value={campo.condicao?.campo_id || ""}
                  onChange={(e) => {
                    if (!e.target.value) {
                      onUpdate({ condicao: undefined });
                    } else {
                      onUpdate({
                        condicao: {
                          campo_id: e.target.value,
                          valor: campo.condicao?.valor || "",
                        },
                      });
                    }
                  }}
                  style={{ ...inputStyle, colorScheme: "dark", padding: "6px 10px", fontSize: "12px" }}
                >
                  <option value="" style={optionStyle}>(sempre mostrar)</option>
                  {camposComOpcoes.map((c) => (
                    <option key={c.id} value={c.id} style={optionStyle}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {campo.condicao?.campo_id && (() => {
                  const ref = camposComOpcoes.find((c) => c.id === campo.condicao!.campo_id);
                  if (!ref) return null;
                  return (
                    <>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>=</span>
                      <select
                        value={campo.condicao.valor}
                        onChange={(e) =>
                          onUpdate({
                            condicao: {
                              campo_id: campo.condicao!.campo_id,
                              valor: e.target.value,
                            },
                          })
                        }
                        style={{ ...inputStyle, colorScheme: "dark", padding: "6px 10px", fontSize: "12px" }}
                      >
                        <option value="" style={optionStyle}>(escolha o valor)</option>
                        {(ref.opcoes || []).map((o) => (
                          <option key={o} value={o} style={optionStyle}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ ativo, onChange }: { ativo: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: "38px",
        height: "22px",
        borderRadius: "11px",
        border: "none",
        backgroundColor: ativo ? "#22a355" : "#c0392b",
        position: "relative",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "2px",
          left: ativo ? "18px" : "2px",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "24px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#fff",
  marginBottom: "4px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
};

const optionStyle: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  color: "#fff",
};

const chipStyle: React.CSSProperties = {
  padding: "6px 12px",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "999px",
  color: "rgba(255,255,255,0.85)",
  fontSize: "12px",
  cursor: "pointer",
};

const arrowButtonStyle = (disabled: boolean): React.CSSProperties => ({
  width: "26px",
  height: "26px",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "4px",
  color: disabled ? "rgba(255,255,255,0.2)" : "#fff",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: "12px",
  padding: 0,
});
