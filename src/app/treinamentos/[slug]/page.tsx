import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCorretorId } from "@/lib/auth/corretor";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import ReservaForm from "./ReservaForm";

export const dynamic = "force-dynamic";

interface Treinamento {
  id: string;
  titulo: string;
  descricao: string | null;
  local: string | null;
  modalidade: "presencial" | "online";
  mapa_url: string | null;
  online_url: string | null;
  slug: string;
  status: string;
  cor: string | null;
}

interface Horario {
  id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string | null;
  capacidade: number;
  ativo: boolean;
}

interface Reservado {
  horario_id: string;
  nome: string;
  creci: string;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("treinamentos")
    .select("titulo, descricao")
    .eq("slug", slug)
    .eq("status", "publicado")
    .maybeSingle<{ titulo: string; descricao: string | null }>();
  if (!data) return { title: "Treinamento" };
  return {
    title: `${data.titulo} | Markup Incorporações`,
    description: data.descricao || undefined,
  };
}

// Horário/Data atual em São Paulo (YYYY-MM-DD e HH:MM)
function agoraSaoPaulo() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (k: string) => parts.find((p) => p.type === k)?.value ?? "";
  return {
    data: `${get("year")}-${get("month")}-${get("day")}`,
    hora: `${get("hour")}:${get("minute")}`,
  };
}

function isFuturo(data: string, hora: string, agora: { data: string; hora: string }) {
  if (data > agora.data) return true;
  if (data < agora.data) return false;
  return hora.slice(0, 5) > agora.hora;
}

function formatDataLonga(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return fmt.format(dt);
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] || "") + (partes.slice(-1)[0]?.[0] || "")).toUpperCase();
}

export default async function TreinamentoPublicPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: treino } = await supabase
    .from("treinamentos")
    .select("*")
    .eq("slug", slug)
    .eq("status", "publicado")
    .maybeSingle<Treinamento>();
  if (!treino) notFound();

  const { data: horariosRaw } = await supabase
    .from("treinamento_horarios")
    .select("*")
    .eq("treinamento_id", treino.id)
    .eq("ativo", true)
    .order("data")
    .order("hora_inicio");

  // RPC com lista de nomes (server-side: usa client SSR, política está OK)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reservadosRaw } = await (supabase as any).rpc(
    "treinamento_reservados",
    { p_treinamento_id: treino.id }
  );

  const agora = agoraSaoPaulo();
  const horarios: Horario[] = ((horariosRaw as Horario[]) || []).filter((h) =>
    isFuturo(h.data, h.hora_inicio, agora)
  );

  const reservados: Reservado[] = (reservadosRaw as Reservado[]) || [];
  const reservasPorHorario = new Map<string, Reservado[]>();
  reservados.forEach((r) => {
    const arr = reservasPorHorario.get(r.horario_id) || [];
    arr.push(r);
    reservasPorHorario.set(r.horario_id, arr);
  });

  // Agrupa por data
  const porData = new Map<string, Horario[]>();
  horarios.forEach((h) => {
    const arr = porData.get(h.data) || [];
    arr.push(h);
    porData.set(h.data, arr);
  });
  const datas = [...porData.keys()].sort();

  // Pré-preenche se corretor logado
  const corretorId = await getCorretorId();
  let corretorPre: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    creci: string;
  } | null = null;
  if (corretorId) {
    const admin = createAdminClient();
    const { data: cor } = await admin
      .from("corretores")
      .select("id, nome, email, telefone, creci")
      .eq("id", corretorId)
      .maybeSingle<{
        id: string;
        nome: string;
        email: string;
        telefone: string;
        creci: string;
      }>();
    if (cor) corretorPre = cor;
  }

  const accent = treino.cor || "#b8945f";
  const mapsEmbed =
    treino.modalidade === "presencial" && treino.local
      ? `https://www.google.com/maps?q=${encodeURIComponent(treino.local)}&output=embed`
      : null;

  return (
    <>
      <Navbar logoSrc="/assets/logo.png" />

      {/* Hero */}
      <section
        style={{
          backgroundColor: "#1a1a1a",
          padding: "160px 20px 60px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            backgroundColor: `${accent}22`,
            color: accent,
            border: `1px solid ${accent}40`,
            borderRadius: "9999px",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          {treino.modalidade === "presencial" ? "Treinamento presencial" : "Treinamento online"}
        </span>
        <h1
          className="font-serif"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "44px",
            color: "#ffffff",
            fontWeight: 400,
            marginBottom: "12px",
            lineHeight: 1.2,
          }}
        >
          {treino.titulo}
        </h1>
        {treino.descricao && (
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.65)",
              maxWidth: "640px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            {treino.descricao}
          </p>
        )}
        {treino.local && (
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.45)",
              marginTop: "20px",
            }}
          >
            📍 {treino.local}
          </p>
        )}
      </section>

      <main style={{ backgroundColor: "#ffffff", padding: "60px 20px" }}>
        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          {datas.length === 0 ? (
            <div
              style={{
                padding: "60px 32px",
                textAlign: "center",
                backgroundColor: "#f5ebe1",
                borderRadius: "12px",
              }}
            >
              <p style={{ fontSize: "16px", color: "#1a1a1a", marginBottom: "8px" }}>
                Sem horários disponíveis no momento.
              </p>
              <p style={{ fontSize: "13px", color: "#8a7d72" }}>
                Volte mais tarde ou fale com a Markup.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {datas.map((d) => (
                <div key={d}>
                  <h2
                    style={{
                      fontSize: "13px",
                      color: "#8a7d72",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: 600,
                      marginBottom: "12px",
                    }}
                  >
                    {formatDataLonga(d)}
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {(porData.get(d) || []).map((h) => {
                      const lista = reservasPorHorario.get(h.id) || [];
                      const ocupadas = lista.length;
                      const restam = h.capacidade - ocupadas;
                      const cheio = restam <= 0;
                      const pct = (ocupadas / h.capacidade) * 100;
                      return (
                        <div
                          key={h.id}
                          style={{
                            backgroundColor: "#fff",
                            border: "1px solid rgba(0,0,0,0.08)",
                            borderRadius: "12px",
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                            opacity: cheio ? 0.6 : 1,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "12px",
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  fontSize: "20px",
                                  fontWeight: 600,
                                  color: "#1a1a1a",
                                  fontFamily: "var(--font-playfair)",
                                }}
                              >
                                {h.hora_inicio.slice(0, 5)}
                                {h.hora_fim && (
                                  <span
                                    style={{
                                      fontSize: "14px",
                                      color: "#8a7d72",
                                      fontWeight: 400,
                                      marginLeft: "8px",
                                    }}
                                  >
                                    – {h.hora_fim.slice(0, 5)}
                                  </span>
                                )}
                              </p>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "#8a7d72",
                                  marginTop: "2px",
                                }}
                              >
                                {cheio
                                  ? "Lotado"
                                  : `${restam} vaga${restam === 1 ? "" : "s"} restante${restam === 1 ? "" : "s"}`}
                              </p>
                            </div>
                            <ReservaForm
                              horarioId={h.id}
                              cheio={cheio}
                              accentColor={accent}
                              corretorInicial={corretorPre}
                            />
                          </div>

                          {/* Barra de vagas */}
                          <div
                            style={{
                              height: "4px",
                              backgroundColor: "rgba(0,0,0,0.06)",
                              borderRadius: "2px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(100, pct)}%`,
                                height: "100%",
                                backgroundColor: accent,
                              }}
                            />
                          </div>

                          {/* Inscritos */}
                          {lista.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              <p
                                style={{
                                  fontSize: "11px",
                                  color: "#8a7d72",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  marginRight: "4px",
                                }}
                              >
                                Inscritos:
                              </p>
                              {lista.map((r, i) => (
                                <div
                                  key={i}
                                  title={`${r.nome} · ${r.creci}`}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "4px 10px 4px 4px",
                                    backgroundColor: "#f5ebe1",
                                    borderRadius: "9999px",
                                    fontSize: "12px",
                                    color: "#1a1a1a",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "22px",
                                      height: "22px",
                                      borderRadius: "50%",
                                      backgroundColor: accent,
                                      color: "#fff",
                                      fontSize: "10px",
                                      fontWeight: 600,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {iniciais(r.nome)}
                                  </span>
                                  {r.nome.split(/\s+/)[0]}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Como chegar / Acessar reunião */}
          {treino.modalidade === "presencial" && treino.local && (
            <div
              style={{
                marginTop: "48px",
                backgroundColor: "#f5ebe1",
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 400,
                  color: "#1a1a1a",
                  fontFamily: "var(--font-playfair)",
                  marginBottom: "4px",
                }}
              >
                Como chegar
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: "#8a7d72",
                  marginBottom: "16px",
                }}
              >
                {treino.local}
              </p>
              {mapsEmbed && (
                <div
                  style={{
                    width: "100%",
                    height: "360px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    marginBottom: "16px",
                  }}
                >
                  <iframe
                    src={mapsEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
              <a
                href={
                  treino.mapa_url ||
                  `https://www.google.com/maps?q=${encodeURIComponent(treino.local)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "12px 22px",
                  backgroundColor: "#1a1a1a",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  textDecoration: "none",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Abrir no Maps
              </a>
            </div>
          )}

          {treino.modalidade === "online" && treino.online_url && (
            <div
              style={{
                marginTop: "48px",
                backgroundColor: "#f5ebe1",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 400,
                  color: "#1a1a1a",
                  fontFamily: "var(--font-playfair)",
                  marginBottom: "8px",
                }}
              >
                Reunião online
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: "#8a7d72",
                  marginBottom: "16px",
                }}
              >
                Acesse o link abaixo no horário marcado.
              </p>
              <a
                href={treino.online_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "14px 28px",
                  backgroundColor: accent,
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  textDecoration: "none",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Acessar reunião
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer logoSrc="/assets/logo.png" />
    </>
  );
}
