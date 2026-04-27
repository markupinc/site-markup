import { createAdminClient } from "@/lib/supabase/admin";

interface Webhook {
  id: string;
  nome: string;
  url: string;
}

/**
 * Dispara webhooks ativos para um evento. Não bloqueia o caller —
 * espera as requisições resolverem e atualiza o status no banco,
 * mas erros são silenciados pra não impactar a resposta principal.
 *
 * @param evento  Nome do evento (ex: "lead.criado")
 * @param payload JSON enviado no body
 */
export async function dispatchWebhook(
  evento: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("webhooks")
      .select("id, nome, url")
      .eq("evento", evento)
      .eq("ativo", true);

    const webhooks = (data as Webhook[]) || [];
    if (webhooks.length === 0) return;

    const body = JSON.stringify({
      evento,
      enviado_em: new Date().toISOString(),
      data: payload,
    });

    await Promise.allSettled(
      webhooks.map(async (hook) => {
        let status: number | null = null;
        let erro: string | null = null;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10_000);
          const res = await fetch(hook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "Markup-Webhook/1.0",
              "X-Markup-Event": evento,
            },
            body,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          status = res.status;
          if (!res.ok) {
            erro = `HTTP ${res.status}: ${res.statusText}`;
          }
        } catch (e) {
          erro = e instanceof Error ? e.message : "Erro desconhecido";
        }

        // Atualiza status do webhook (best-effort, ignora erro)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("webhooks") as any)
          .update({
            ultimo_status: status,
            ultimo_disparo_em: new Date().toISOString(),
            ultimo_erro: erro,
          })
          .eq("id", hook.id);
      })
    );
  } catch {
    // ignora — webhook não deve impactar a resposta
  }
}
