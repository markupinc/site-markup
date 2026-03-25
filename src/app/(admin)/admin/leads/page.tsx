"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

type LeadStatus = "novo" | "contatado" | "em_negociacao" | "convertido" | "perdido";

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  mensagem: string | null;
  empreendimento_id: string | null;
  origem: string | null;
  pagina_origem: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: LeadStatus;
  notas: string | null;
  atendente: string | null;
  created_at: string;
  updated_at: string;
  empreendimentos: { nome: string } | null;
}

interface Empreendimento {
  id: string;
  nome: string;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  novo: { label: "Novo", color: "#1CB8E8" },
  contatado: { label: "Contatado", color: "#b8945f" },
  em_negociacao: { label: "Em Negociação", color: "#d4835b" },
  convertido: { label: "Convertido", color: "#6b9f6b" },
  perdido: { label: "Perdido", color: "#d45b5b" },
};

const PAGE_SIZE = 20;

export default function LeadsPage() {
  const supabase = createClient();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [empreendimentoFilter, setEmpreendimentoFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination & sorting
  const [page, setPage] = useState(0);
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  // Expanded row
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Inline edit state
  const [editNotas, setEditNotas] = useState<Record<string, string>>({});
  const [editAtendente, setEditAtendente] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch empreendimentos once
  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from("empreendimentos") as any)
        .select("id, nome")
        .order("nome", { ascending: true });
      if (data) setEmpreendimentos(data as Empreendimento[]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setLoading(true);

    let query = (supabase.from("leads") as any)
      .select("*, empreendimentos(nome)", { count: "exact" });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    if (empreendimentoFilter !== "all") {
      query = query.eq("empreendimento_id", empreendimentoFilter);
    }
    if (debouncedSearch) {
      query = query.or(
        `nome.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,telefone.ilike.%${debouncedSearch}%`
      );
    }

    query = query
      .order(sortColumn, { ascending: sortAsc })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("Error fetching leads:", error);
    }

    setLeads((data ?? []) as Lead[]);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [supabase, statusFilter, empreendimentoFilter, debouncedSearch, sortColumn, sortAsc, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
  }, [statusFilter, empreendimentoFilter]);

  // Handlers
  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(col);
      setSortAsc(true);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const { error } = await (supabase.from("leads") as any)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", leadId);

    if (!error) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus, updated_at: new Date().toISOString() } : l))
      );
    }
  };

  const handleSaveNotes = async (leadId: string) => {
    setSaving((p) => ({ ...p, [leadId]: true }));
    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (editNotas[leadId] !== undefined) updates.notas = editNotas[leadId];
    if (editAtendente[leadId] !== undefined) updates.atendente = editAtendente[leadId];

    const { error } = await (supabase.from("leads") as any)
      .update(updates)
      .eq("id", leadId);

    if (!error) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                ...(editNotas[leadId] !== undefined ? { notas: editNotas[leadId] } : {}),
                ...(editAtendente[leadId] !== undefined ? { atendente: editAtendente[leadId] } : {}),
                updated_at: new Date().toISOString(),
              }
            : l
        )
      );
    }
    setSaving((p) => ({ ...p, [leadId]: false }));
  };

  const toggleExpand = (lead: Lead) => {
    if (expandedId === lead.id) {
      setExpandedId(null);
    } else {
      setExpandedId(lead.id);
      if (editNotas[lead.id] === undefined) setEditNotas((p) => ({ ...p, [lead.id]: lead.notas ?? "" }));
      if (editAtendente[lead.id] === undefined) setEditAtendente((p) => ({ ...p, [lead.id]: lead.atendente ?? "" }));
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const rangeStart = page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, totalCount);

  // Styles
  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#fff",
    padding: "10px 14px",
    outline: "none",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "6px",
    display: "block",
  };

  const sortIndicator = (col: string) => {
    if (sortColumn !== col) return "";
    return sortAsc ? " ↑" : " ↓";
  };

  const thStyle: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: 500,
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    padding: "14px 16px",
    fontSize: "13px",
    color: "rgba(255,255,255,0.8)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    verticalAlign: "top",
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 300, color: "#fff", marginBottom: "8px" }}>
            Leads
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            {totalCount} lead{totalCount !== 1 ? "s" : ""} encontrado{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          disabled
          style={{
            padding: "10px 24px",
            backgroundColor: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.3)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "not-allowed",
          }}
        >
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <div style={{ minWidth: "160px" }}>
          <label style={labelStyle}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}
          >
            <option value="all">Todos</option>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: "200px" }}>
          <label style={labelStyle}>Empreendimento</label>
          <select
            value={empreendimentoFilter}
            onChange={(e) => setEmpreendimentoFilter(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}
          >
            <option value="all">Todos</option>
            {empreendimentos.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nome}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: "220px" }}>
          <label style={labelStyle}>Buscar</label>
          <input
            type="text"
            placeholder="Nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
            Carregando leads...
          </div>
        ) : leads.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
            Nenhum lead encontrado
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle} onClick={() => handleSort("nome")}>
                  Nome / Contato{sortIndicator("nome")}
                </th>
                <th style={thStyle} onClick={() => handleSort("empreendimento_id")}>
                  Empreendimento{sortIndicator("empreendimento_id")}
                </th>
                <th style={thStyle} onClick={() => handleSort("origem")}>
                  Origem{sortIndicator("origem")}
                </th>
                <th style={thStyle} onClick={() => handleSort("status")}>
                  Status{sortIndicator("status")}
                </th>
                <th style={thStyle} onClick={() => handleSort("created_at")}>
                  Data{sortIndicator("created_at")}
                </th>
                <th style={{ ...thStyle, cursor: "default" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <>
                  <tr
                    key={lead.id}
                    style={{
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Nome / Contato */}
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: "#fff", marginBottom: "2px" }}>{lead.nome}</div>
                      {lead.telefone && (
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>{lead.telefone}</div>
                      )}
                      {lead.email && (
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{lead.email}</div>
                      )}
                    </td>

                    {/* Empreendimento */}
                    <td style={tdStyle}>
                      {lead.empreendimentos?.nome || (
                        <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>
                      )}
                    </td>

                    {/* Origem */}
                    <td style={tdStyle}>
                      <div>{lead.origem || <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>}</div>
                      {lead.utm_source && (
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                          {lead.utm_source}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: STATUS_CONFIG[lead.status]?.color ?? "#fff",
                          backgroundColor: `${STATUS_CONFIG[lead.status]?.color ?? "#fff"}33`,
                        }}
                      >
                        {STATUS_CONFIG[lead.status]?.label ?? lead.status}
                      </span>
                    </td>

                    {/* Data */}
                    <td style={{ ...tdStyle, whiteSpace: "nowrap", fontSize: "12px" }}>
                      {formatDate(lead.created_at)}
                    </td>

                    {/* Ações */}
                    <td style={tdStyle}>
                      <button
                        onClick={() => toggleExpand(lead)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: expandedId === lead.id ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                          color: "#fff",
                          transition: "background 0.15s",
                        }}
                      >
                        {expandedId === lead.id ? "Fechar" : "Ver"}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded detail */}
                  {expandedId === lead.id && (
                    <tr key={`${lead.id}-detail`}>
                      <td colSpan={6} style={{ padding: 0, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <div
                          style={{
                            padding: "24px",
                            background: "rgba(255,255,255,0.02)",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "24px",
                          }}
                        >
                          {/* Left column */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Contact info */}
                            <div>
                              <div style={labelStyle}>Contato</div>
                              <div style={{ fontSize: "14px", color: "#fff", fontWeight: 600 }}>{lead.nome}</div>
                              {lead.telefone && (
                                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>
                                  {lead.telefone}
                                </div>
                              )}
                              {lead.email && (
                                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                                  {lead.email}
                                </div>
                              )}
                            </div>

                            {/* Mensagem */}
                            {lead.mensagem && (
                              <div>
                                <div style={labelStyle}>Mensagem</div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    color: "rgba(255,255,255,0.7)",
                                    lineHeight: "1.6",
                                    background: "rgba(255,255,255,0.04)",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                  }}
                                >
                                  {lead.mensagem}
                                </div>
                              </div>
                            )}

                            {/* UTM / Origem */}
                            <div>
                              <div style={labelStyle}>Rastreamento</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px" }}>
                                {lead.origem && (
                                  <div>
                                    <span style={{ color: "rgba(255,255,255,0.35)" }}>Origem: </span>
                                    <span style={{ color: "rgba(255,255,255,0.7)" }}>{lead.origem}</span>
                                  </div>
                                )}
                                {lead.utm_source && (
                                  <div>
                                    <span style={{ color: "rgba(255,255,255,0.35)" }}>UTM Source: </span>
                                    <span style={{ color: "rgba(255,255,255,0.7)" }}>{lead.utm_source}</span>
                                  </div>
                                )}
                                {lead.utm_medium && (
                                  <div>
                                    <span style={{ color: "rgba(255,255,255,0.35)" }}>UTM Medium: </span>
                                    <span style={{ color: "rgba(255,255,255,0.7)" }}>{lead.utm_medium}</span>
                                  </div>
                                )}
                                {lead.utm_campaign && (
                                  <div>
                                    <span style={{ color: "rgba(255,255,255,0.35)" }}>UTM Campaign: </span>
                                    <span style={{ color: "rgba(255,255,255,0.7)" }}>{lead.utm_campaign}</span>
                                  </div>
                                )}
                                {lead.pagina_origem && (
                                  <div>
                                    <span style={{ color: "rgba(255,255,255,0.35)" }}>Página: </span>
                                    <span style={{ color: "rgba(255,255,255,0.7)" }}>{lead.pagina_origem}</span>
                                  </div>
                                )}
                              </div>
                              {!lead.origem && !lead.utm_source && !lead.utm_medium && !lead.utm_campaign && !lead.pagina_origem && (
                                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
                                  Nenhum dado de rastreamento
                                </div>
                              )}
                            </div>

                            {/* Timestamps */}
                            <div style={{ display: "flex", gap: "24px", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                              <div>Criado em: {formatDate(lead.created_at)}</div>
                              <div>Atualizado em: {formatDate(lead.updated_at)}</div>
                            </div>
                          </div>

                          {/* Right column */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Status changer */}
                            <div>
                              <div style={labelStyle}>Status</div>
                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {(Object.entries(STATUS_CONFIG) as [LeadStatus, { label: string; color: string }][]).map(
                                  ([key, { label, color }]) => (
                                    <button
                                      key={key}
                                      onClick={() => handleStatusChange(lead.id, key)}
                                      style={{
                                        padding: "6px 14px",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        border:
                                          lead.status === key
                                            ? `1px solid ${color}`
                                            : "1px solid rgba(255,255,255,0.1)",
                                        background: lead.status === key ? `${color}33` : "rgba(255,255,255,0.04)",
                                        color: lead.status === key ? color : "rgba(255,255,255,0.5)",
                                        transition: "all 0.15s",
                                      }}
                                    >
                                      {label}
                                    </button>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Atendente */}
                            <div>
                              <label style={labelStyle}>Atendente</label>
                              <input
                                type="text"
                                value={editAtendente[lead.id] ?? lead.atendente ?? ""}
                                onChange={(e) => setEditAtendente((p) => ({ ...p, [lead.id]: e.target.value }))}
                                placeholder="Nome do atendente..."
                                style={inputStyle}
                              />
                            </div>

                            {/* Notas */}
                            <div>
                              <label style={labelStyle}>Notas</label>
                              <textarea
                                value={editNotas[lead.id] ?? lead.notas ?? ""}
                                onChange={(e) => setEditNotas((p) => ({ ...p, [lead.id]: e.target.value }))}
                                placeholder="Adicionar notas sobre o lead..."
                                rows={4}
                                style={{
                                  ...inputStyle,
                                  resize: "vertical",
                                  fontFamily: "inherit",
                                  lineHeight: "1.5",
                                }}
                              />
                            </div>

                            {/* Save button */}
                            <div>
                              <button
                                onClick={() => handleSaveNotes(lead.id)}
                                disabled={saving[lead.id]}
                                style={{
                                  padding: "10px 24px",
                                  backgroundColor: "#fff",
                                  color: "#000",
                                  border: "none",
                                  borderRadius: "8px",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  cursor: saving[lead.id] ? "not-allowed" : "pointer",
                                  opacity: saving[lead.id] ? 0.5 : 1,
                                  transition: "opacity 0.15s",
                                }}
                              >
                                {saving[lead.id] ? "Salvando..." : "Salvar"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <span>
            Mostrando {rangeStart}-{rangeEnd} de {totalCount}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: page === 0 ? "rgba(255,255,255,0.2)" : "#fff",
                cursor: page === 0 ? "not-allowed" : "pointer",
              }}
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: page >= totalPages - 1 ? "rgba(255,255,255,0.2)" : "#fff",
                cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
              }}
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
