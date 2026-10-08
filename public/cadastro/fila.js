// Envio ao servidor + fila offline compartilhada entre index.html e obrigado.html
window.Fila = (function(){
  const ENDPOINT = '/api/eventos/cadastro';
  const QUEUE_KEY = 'kommo_fila_leads';
  const COUNT_KEY = 'kommo_contagem_dia';
  let ouvintes = [], ocupado = false;

  const ler = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch(e){ return d; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const avisar = () => ouvintes.forEach(fn => fn());
  const hoje = () => new Date().toLocaleDateString('pt-BR');

  async function enviar(data){
    const r = await fetch(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error(j.erro || ('HTTP ' + r.status));
    return j;
  }

  function guardar(data){ const q = ler(QUEUE_KEY, []); q.push(data); gravar(QUEUE_KEY, q); avisar(); }
  function pendentes(){ return ler(QUEUE_KEY, []).length; }

  async function reenviar(){
    if (ocupado || !navigator.onLine) return;
    ocupado = true;
    const q = ler(QUEUE_KEY, []);
    while (q.length){
      try { await enviar(q[0]); q.shift(); gravar(QUEUE_KEY, q); }
      catch(e){ break; } // tenta de novo no próximo ciclo
    }
    ocupado = false; avisar();
  }

  function contarHoje(){
    const c = ler(COUNT_KEY, {});
    const n = c.dia === hoje() ? c.n + 1 : 1;
    gravar(COUNT_KEY, { dia: hoje(), n });
  }
  function totalHoje(){ const c = ler(COUNT_KEY, {}); return c.dia === hoje() ? c.n : 0; }

  window.addEventListener('online', reenviar);
  setInterval(reenviar, 30000);

  return { enviar, guardar, pendentes, reenviar, contarHoje, totalHoje,
           aoAtualizar: fn => ouvintes.push(fn) };
})();
