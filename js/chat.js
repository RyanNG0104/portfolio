/* =========================================================
   Assistente do portfólio: um chat de IA que responde sobre o Ryan.
   Usa o mesmo servidor gratuito da SaturnIA (Cloudflare Workers AI).
   Nada é salvo no servidor; a conversa fica só nesta aba.
   ========================================================= */
(function () {
  const API = 'https://saturnia.ryanng0104.workers.dev/portfolio/chat';
  const STORE = 'portfolio-chat';
  const SUGGESTIONS = [
    'Quem é o Ryan?',
    'Quais projetos ele já fez?',
    'Com quais tecnologias ele trabalha?',
    'Como falo com ele?',
  ];
  const ERRORS = {
    rate_limited: 'Muitas perguntas seguidas. Espere um minutinho e tente de novo.',
    quota: 'A cota gratuita de IA de hoje acabou. Fale com o Ryan direto pelo e-mail: moreiraryan803@gmail.com',
    network: 'Não consegui me conectar. Verifique sua internet e tente de novo.',
    default: 'Algo deu errado. Tente de novo em instantes.',
  };

  /* ---------- Elementos ---------- */
  const root = document.createElement('div');
  root.className = 'pchat';
  root.innerHTML = `
    <button class="pchat__fab" type="button" aria-expanded="false" aria-controls="pchat-panel">
      <span class="pchat__orb" aria-hidden="true"><i></i></span>
      <span class="pchat__fab-text">Pergunte à IA</span>
    </button>
    <section class="pchat__panel" id="pchat-panel" role="dialog" aria-label="Assistente do portfólio" hidden>
      <header class="pchat__head">
        <span class="pchat__orb pchat__orb--lg" aria-hidden="true"><i></i></span>
        <div class="pchat__title">
          <strong>Assistente do Ryan</strong>
          <span><i class="pchat__live" aria-hidden="true"></i>IA · responde sobre carreira e projetos</span>
        </div>
        <button class="pchat__icon" type="button" data-act="reset" aria-label="Nova conversa" title="Nova conversa">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
        <button class="pchat__icon" type="button" data-act="close" aria-label="Fechar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </header>
      <div class="pchat__log" aria-live="polite"></div>
      <form class="pchat__form">
        <label class="sr-only" for="pchat-input">Sua pergunta</label>
        <textarea id="pchat-input" rows="1" maxlength="800" placeholder="Pergunte sobre o Ryan…"></textarea>
        <button class="pchat__send" type="submit" aria-label="Enviar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </button>
      </form>
      <p class="pchat__note">Respostas geradas por IA podem conter erros.</p>
    </section>`;
  document.body.appendChild(root);

  const fab = root.querySelector('.pchat__fab');
  const panel = root.querySelector('.pchat__panel');
  const log = root.querySelector('.pchat__log');
  const form = root.querySelector('.pchat__form');
  const input = root.querySelector('#pchat-input');
  const sendBtn = root.querySelector('.pchat__send');

  /* ---------- Estado (só nesta aba) ---------- */
  let messages = [];
  let busy = false;
  try { messages = JSON.parse(sessionStorage.getItem(STORE) || '[]'); } catch (e) { messages = []; }
  const save = () => { try { sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-20))); } catch (e) {} };

  /* ---------- Markdown simples e seguro ---------- */
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function inline(s) {
    return esc(s)
      .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g, (m, t, u) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`)
      .replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;:!?])/g, (m, p, u) => `${p}<a href="${u}" target="_blank" rel="noopener">${u.replace(/^https?:\/\/(www\.)?/, '')}</a>`)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }
  function render(text) {
    const out = [];
    let list = null;
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      const item = /^(?:[-*•]|\d+[.)])\s+(.*)$/.exec(line);
      if (item) {
        if (!list) { list = []; out.push(list); }
        list.push(`<li>${inline(item[1])}</li>`);
      } else {
        list = null;
        if (line) out.push(`<p>${inline(line)}</p>`);
      }
    }
    return out.map((b) => (Array.isArray(b) ? `<ul>${b.join('')}</ul>` : b)).join('');
  }

  /* ---------- Mensagens na tela ---------- */
  function bubble(role, text) {
    const el = document.createElement('div');
    el.className = `pchat__msg pchat__msg--${role}`;
    if (role === 'user') el.textContent = text;
    else el.innerHTML = render(text);
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function renderAll() {
    log.innerHTML = '';
    bubble('assistant', 'Oi! 👋 Sou o assistente do portfólio do **Ryan Moreira**. Posso contar sobre a carreira, as tecnologias e os projetos dele. O que você quer saber?');
    messages.forEach((m) => bubble(m.role, m.content));
    if (!messages.length) {
      const chips = document.createElement('div');
      chips.className = 'pchat__chips';
      SUGGESTIONS.forEach((s) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = s;
        b.addEventListener('click', () => ask(s));
        chips.appendChild(b);
      });
      log.appendChild(chips);
    }
  }

  /* ---------- Perguntar ---------- */
  async function ask(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    busy = true;
    sendBtn.disabled = true;
    root.classList.add('is-busy');
    const chips = log.querySelector('.pchat__chips');
    if (chips) chips.remove();

    messages.push({ role: 'user', content: text });
    save();
    bubble('user', text);
    input.value = '';
    autosize();

    const el = bubble('assistant', '');
    el.classList.add('is-typing');
    el.innerHTML = '<span class="pchat__dots"><i></i><i></i><i></i></span>';
    let answer = '';
    let error = null;

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.slice(-10) }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw Object.assign(new Error('http'), { code: data.error || 'default' });
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const chunk = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          if (!chunk.startsWith('data:')) continue;
          let ev;
          try { ev = JSON.parse(chunk.slice(5)); } catch (e) { continue; }
          if (ev.type === 'text') {
            answer += ev.text;
            el.classList.remove('is-typing');
            el.innerHTML = render(answer);
            log.scrollTop = log.scrollHeight;
          } else if (ev.type === 'error') {
            error = ev.code || 'default';
          }
        }
      }
    } catch (e) {
      error = e.code || 'network';
    }

    el.classList.remove('is-typing');
    if (answer) {
      messages.push({ role: 'assistant', content: answer });
      save();
    } else {
      // Sem resposta: tira a pergunta do histórico para poder tentar de novo
      messages.pop();
      save();
      el.classList.add('is-error');
      el.textContent = ERRORS[error] || ERRORS.default;
    }
    busy = false;
    sendBtn.disabled = false;
    root.classList.remove('is-busy');
    input.focus();
  }

  /* ---------- Abrir, fechar, digitar ---------- */
  function setOpen(open) {
    panel.hidden = !open;
    root.classList.toggle('is-open', open);
    fab.setAttribute('aria-expanded', String(open));
    if (open) {
      if (!log.children.length) renderAll();
      setTimeout(() => input.focus(), 60);
    }
  }
  function autosize() {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  }

  fab.addEventListener('click', () => setOpen(panel.hidden));
  root.querySelector('[data-act="close"]').addEventListener('click', () => { setOpen(false); fab.focus(); });
  root.querySelector('[data-act="reset"]').addEventListener('click', () => {
    if (busy) return;
    messages = [];
    save();
    renderAll();
    input.focus();
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
  input.addEventListener('input', autosize);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask(input.value); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) setOpen(false); });

  // Links do site com data-chat abrem o assistente
  document.querySelectorAll('[data-open-chat]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); setOpen(true); }));
})();
