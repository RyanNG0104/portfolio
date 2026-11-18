/* =========================================================
   Portfólio · Ryan Moreira — interações
   ========================================================= */

const GITHUB_USER = 'RyanNG0104';

// Repositórios que já aparecem em destaque (ou não fazem sentido listar)
const HIDDEN_REPOS = new Set([
  'RyanNG0104',
  'portfolio',
  'Digital-Drive',
  'iphone17-react',
  'COFFE-PAGE',
  'pizzariacurso',
]);

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#663399',
  Java: '#b07219',
  Python: '#3572a5',
  Dart: '#00b4ab',
  ColdFusion: '#ed2cd6',
};

/* ---------- Ano no rodapé ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Tema claro/escuro ---------- */
const root = document.documentElement;
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});

/* ---------- Navbar: sombra ao rolar + menu mobile ---------- */
const nav = document.getElementById('nav');
const burger = document.getElementById('nav-burger');
const menu = document.getElementById('nav-menu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 10);
}, { passive: true });

function setMenu(open) {
  menu.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}
burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------- Link ativo conforme a seção visível ---------- */
const links = [...menu.querySelectorAll('a')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

/* ---------- Animação de entrada ---------- */
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------- Efeito de digitação ---------- */
const roles = [
  'Desenvolvedor Full-Stack',
  'Estudante de Engenharia de Software',
  'Explorando IA Generativa com AWS',
  'Construindo aplicações com LLMs',
];
const typingEl = document.getElementById('typing');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = true;
  let pause = 1800;

  const tick = () => {
    const current = roles[roleIndex];
    if (deleting) {
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    } else {
      charIndex++;
    }
    typingEl.textContent = roles[roleIndex].slice(0, charIndex);

    let delay = deleting ? 35 : 70;
    if (!deleting && charIndex === roles[roleIndex].length) {
      deleting = true;
      delay = pause;
    }
    setTimeout(tick, delay);
  };
  setTimeout(tick, pause);
}

/* ---------- Copiar e-mail ---------- */
const copyBtn = document.getElementById('copy-email');
copyBtn.addEventListener('click', async () => {
  const email = document.getElementById('email-text').textContent.trim();
  try {
    await navigator.clipboard.writeText(email);
    copyBtn.textContent = 'Copiado!';
  } catch (e) {
    copyBtn.textContent = 'Selecione e copie';
  }
  setTimeout(() => { copyBtn.textContent = 'Copiar'; }, 2000);
});

/* ---------- Repositórios do GitHub (API pública) ---------- */
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

async function loadRepos() {
  const container = document.getElementById('repos');
  const status = document.getElementById('repos-status');

  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const repos = data
      .filter((r) => !r.fork && !r.archived && !HIDDEN_REPOS.has(r.name) && r.size > 0)
      .slice(0, 6);

    if (!repos.length) {
      status.textContent = 'Nenhum outro repositório público por enquanto.';
      return;
    }

    container.innerHTML = repos.map((r) => `
      <a class="repo" href="${escapeHTML(r.homepage || r.html_url)}" target="_blank" rel="noopener">
        <span class="repo__name">${escapeHTML(r.name)}</span>
        <p class="repo__desc">${escapeHTML(r.description || 'Sem descrição.')}</p>
        <div class="repo__meta">
          ${r.language ? `<span class="repo__lang" style="--lang:${LANG_COLORS[r.language] || 'var(--accent)'}">${escapeHTML(r.language)}</span>` : ''}
          <span>${formatDate(r.pushed_at || r.updated_at)}</span>
        </div>
      </a>
    `).join('');
  } catch (err) {
    status.textContent = 'Não foi possível carregar os repositórios agora.';
  }
}

loadRepos();
