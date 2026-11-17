// Mock da API para demonstração (sem back-end). Intercepta fetch('.../api/...').
// Uso: Mock.route('GET', '/api/cliente/:cpf', ({ params, query, body, db }) => dados)
// Lançar erro: throw Mock.err(404, 'mensagem')  |  Resposta customizada: return { status: 201, body: {...} }
(function () {
  const KEY = 'deposito-vieira-demo-v1';
  const routes = [];
  const Mock = (window.Mock = {
    db: null,
    seed: null, // preenchido por seed.js
    err: (status, message) => Object.assign(new Error(message), { status }),
    route(method, path, handler) {
      const names = [];
      const re = new RegExp('^' + path.replace(/:(\w+)/g, (_, n) => (names.push(n), '([^/]+)')) + '/?$');
      routes.push({ method, re, names, handler, weight: names.length });
      routes.sort((a, b) => a.weight - b.weight); // rotas fixas antes das com parâmetro
    },
    save() { try { localStorage.setItem(KEY, JSON.stringify(Mock.db)); } catch (e) {} },
    reset() { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); },
  });

  function loadDb() {
    try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {}
    return JSON.parse(JSON.stringify(Mock.seed));
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async function (url, opts = {}) {
    const u = new URL(String(url), location.href);
    if (!u.pathname.startsWith('/api/')) return realFetch(url, opts);
    if (!Mock.db) Mock.db = loadDb();
    const method = (opts.method || 'GET').toUpperCase();
    const path = decodeURIComponent(u.pathname);
    const json = (status, data) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
    for (const r of routes) {
      const m = r.method === method && r.re.exec(path);
      if (!m) continue;
      const params = {};
      r.names.forEach((n, i) => (params[n] = decodeURIComponent(m[i + 1])));
      let body = {};
      try { body = opts.body ? JSON.parse(opts.body) : {}; } catch (e) {}
      try {
        const out = await r.handler({ params, body, query: Object.fromEntries(u.searchParams), db: Mock.db });
        if (method !== 'GET') Mock.save();
        return out && out.status && out.body !== undefined ? json(out.status, out.body) : json(200, out === undefined ? {} : out);
      } catch (e) {
        return json(e.status || 500, { message: e.message, error: e.message });
      }
    }
    return json(404, { message: 'Rota não encontrada: ' + method + ' ' + path });
  };

  // Faixa de aviso
  document.addEventListener('DOMContentLoaded', () => {
    const b = document.createElement('div');
    b.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#212529;color:#fff;font:13px system-ui;padding:6px 12px;text-align:center';
    b.innerHTML = 'Demonstração com dados fictícios, salvos só no seu navegador. <a href="#" style="color:#ffc107">Restaurar dados</a>';
    b.querySelector('a').onclick = (e) => { e.preventDefault(); Mock.reset(); };
    document.body.appendChild(b);
  });
})();
