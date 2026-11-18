/* =========================================================
   Portfólio · Ryan Moreira — interações
   ========================================================= */

const GITHUB_USER = 'RyanNG0104';

// Repositórios que já estão na coleção (ou não fazem sentido listar)
const HIDDEN_REPOS = new Set([
  'RyanNG0104',
  'portfolio',
  'Digital-Drive',
  'iphone17-react',
  'COFFE-PAGE',
  'pizzariacurso',
]);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Ano no rodapé ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Tema claro / escuro ---------- */
const root = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');

function syncThemeButton() {
  const dark = root.dataset.theme === 'dark';
  themeBtn.setAttribute('aria-label', dark ? 'Mudar para o tema claro' : 'Mudar para o tema escuro');
}
themeBtn.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  syncThemeButton();
});
syncThemeButton();

/* ---------- Navbar: transparente no hero, sólida depois ---------- */
const nav = document.getElementById('nav');
const hero = document.getElementById('inicio');

function updateNav() {
  const limit = hero.offsetHeight - nav.offsetHeight - 10;
  nav.classList.toggle('is-solid', window.scrollY > limit);
}
window.addEventListener('scroll', updateNav, { passive: true });
window.addEventListener('resize', updateNav);
updateNav();

/* ---------- Menu em tela cheia ---------- */
const menu = document.getElementById('menu');
const openBtn = document.getElementById('menu-open');
const closeBtn = document.getElementById('menu-close');

function setMenu(open) {
  menu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  openBtn.setAttribute('aria-expanded', String(open));
  if (open) closeBtn.focus();
  else openBtn.focus({ preventScroll: true });
}
openBtn.addEventListener('click', () => setMenu(true));
closeBtn.addEventListener('click', () => setMenu(false));
menu.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !menu.hidden) setMenu(false);
});

/* ---------- Conta-giros do hero ---------- */
const SVG_NS = 'http://www.w3.org/2000/svg';
const gauge = document.getElementById('gauge');
const CX = 200;
const CY = 200;
const START = -135; // ângulo inicial (0° = topo, sentido horário)
const SWEEP = 270;

function polar(r, deg) {
  const rad = (deg * Math.PI) / 180;
  return [CX + r * Math.sin(rad), CY - r * Math.cos(rad)];
}

function arcPath(r, from, to) {
  const [x1, y1] = polar(r, from);
  const [x2, y2] = polar(r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

// Marcações do mostrador (as últimas ficam em roxo, como a "faixa vermelha" de um conta-giros)
const ticks = document.getElementById('gauge-ticks');
const TICKS = 40;
for (let i = 0; i <= TICKS; i++) {
  const deg = START + (SWEEP * i) / TICKS;
  const major = i % 5 === 0;
  const [x1, y1] = polar(176, deg);
  const [x2, y2] = polar(major ? 156 : 166, deg);
  const line = document.createElementNS(SVG_NS, 'line');
  line.setAttribute('x1', x1); line.setAttribute('y1', y1);
  line.setAttribute('x2', x2); line.setAttribute('y2', y2);
  line.setAttribute('class', `gauge__tick${major ? ' gauge__tick--major' : ''}${i >= 34 ? ' gauge__tick--red' : ''}`);
  ticks.appendChild(line);
}
const trackD = arcPath(140, START, START + SWEEP);
document.getElementById('gauge-track').setAttribute('d', trackD);
document.getElementById('gauge-arc').setAttribute('d', trackD);

const gaugeArc = document.getElementById('gauge-arc');
const gaugeNeedle = document.getElementById('gauge-needle');
const gaugeValue = document.getElementById('gauge-value');

function setGauge(value) {
  const v = Math.max(0, Math.min(1, value));
  gaugeArc.style.strokeDashoffset = String(100 - v * 100);
  gaugeNeedle.style.transform = `rotate(${START + v * SWEEP}deg)`;
}

// Modos que o mostrador alterna sozinho
const MODES = [
  { name: 'Back-end', value: 0.82 },
  { name: 'APIs REST', value: 0.68 },
  { name: 'Front-end', value: 0.55 },
  { name: 'IA Generativa', value: 0.94 },
];
let modeIndex = 0;
let tracking = false;

function showMode(i) {
  const mode = MODES[i];
  gaugeValue.classList.add('is-swapping');
  setTimeout(() => {
    gaugeValue.textContent = mode.name;
    gaugeValue.classList.remove('is-swapping');
  }, 250);
  setGauge(mode.value);
}

setTimeout(() => showMode(0), 600);
if (!reduceMotion) {
  setInterval(() => {
    if (tracking || document.hidden) return;
    modeIndex = (modeIndex + 1) % MODES.length;
    showMode(modeIndex);
  }, 3000);

  // Na capa, o ponteiro acompanha a posição horizontal do mouse
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    tracking = true;
    gauge.classList.add('is-tracking');
    const rect = hero.getBoundingClientRect();
    setGauge((e.clientX - rect.left) / rect.width);
  });
  hero.addEventListener('pointerleave', () => {
    tracking = false;
    gauge.classList.remove('is-tracking');
    showMode(modeIndex);
  });
}

/* ---------- Cursor personalizado ---------- */
const cursor = document.getElementById('cursor');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (finePointer) {
  const ring = document.getElementById('cursor-ring');
  const dot = document.getElementById('cursor-dot');
  let mx = -100, my = -100; // posição do mouse
  let rx = -100, ry = -100; // posição do anel (com atraso)

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    cursor.classList.add('is-visible');
    const interactive = e.target.closest('a, button, [role="button"], .carousel');
    cursor.classList.toggle('is-hover', Boolean(interactive));
  });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
  window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

  const follow = () => {
    const ease = reduceMotion ? 1 : 0.18;
    rx += (mx - rx) * ease;
    ry += (my - ry) * ease;
    const scale = cursor.classList.contains('is-hover') ? 1.6 : 1;
    ring.style.transform = `translate(${rx}px, ${ry}px) scale(${scale})`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
}

/* ---------- Animação de entrada ---------- */
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    obs.unobserve(entry.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------- Contadores da ficha técnica ---------- */
function animateCount(el) {
  const target = Number(el.dataset.count);
  if (!target || reduceMotion) { el.textContent = target; return; }
  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const countObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    animateCount(entry.target);
    obs.unobserve(entry.target);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

/* ---------- Carrossel da coleção ---------- */
const carousel = document.getElementById('carousel');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const progress = document.getElementById('progress');

function cardStep() {
  const card = carousel.querySelector('.model');
  const gap = parseFloat(getComputedStyle(carousel).columnGap) || 0;
  return card ? card.offsetWidth + gap : carousel.clientWidth;
}

function updateCarousel() {
  const max = carousel.scrollWidth - carousel.clientWidth;
  const ratio = max > 0 ? carousel.scrollLeft / max : 0;
  prev.disabled = carousel.scrollLeft <= 4;
  next.disabled = carousel.scrollLeft >= max - 4;
  const visible = max > 0 ? carousel.clientWidth / carousel.scrollWidth : 1;
  progress.style.width = `${visible * 100}%`;
  progress.style.transform = `translateX(${ratio * (1 / visible - 1) * 100}%)`;
}

prev.addEventListener('click', () => carousel.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
next.addEventListener('click', () => carousel.scrollBy({ left: cardStep(), behavior: 'smooth' }));
carousel.addEventListener('scroll', updateCarousel, { passive: true });
window.addEventListener('resize', updateCarousel);
carousel.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
});
updateCarousel();

/* ---------- Copiar e-mail ---------- */
const copyBtn = document.getElementById('copy-email');
copyBtn.addEventListener('click', async () => {
  const email = document.getElementById('email-text').textContent.trim();
  try {
    await navigator.clipboard.writeText(email);
    copyBtn.textContent = 'Copiado';
  } catch (e) {
    copyBtn.textContent = 'Selecione e copie';
  }
  setTimeout(() => { copyBtn.textContent = 'Copiar'; }, 2000);
});

/* ---------- Dados do GitHub (API pública) ---------- */
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
}

async function loadGitHub() {
  const list = document.getElementById('repos');
  const status = document.getElementById('repos-status');

  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Atualiza o número de repositórios na ficha técnica
    const countEl = document.getElementById('repo-count');
    const publicCount = data.filter((r) => !r.fork).length;
    if (publicCount) {
      countEl.dataset.count = publicCount;
      countEl.textContent = publicCount;
    }

    const repos = data
      .filter((r) => !r.fork && !r.archived && !HIDDEN_REPOS.has(r.name) && r.size > 0)
      .slice(0, 6);

    if (!repos.length) {
      status.textContent = 'Nenhum outro repositório público por enquanto.';
      return;
    }

    list.innerHTML = repos.map((r) => `
      <li>
        <a href="${escapeHTML(r.homepage || r.html_url)}" target="_blank" rel="noopener">
          <span class="repo-list__name">${escapeHTML(r.name.replace(/[-_]/g, ' '))}</span>
          <span class="repo-list__desc">${escapeHTML(r.description || 'Sem descrição.')}</span>
          <span class="repo-list__lang">${escapeHTML(r.language || 'n/d')}</span>
          <span class="repo-list__date">${formatDate(r.pushed_at || r.updated_at)}</span>
          <span class="repo-list__arrow" aria-hidden="true">→</span>
        </a>
      </li>
    `).join('');
  } catch (err) {
    status.textContent = 'Não foi possível carregar os repositórios agora.';
  }
}

loadGitHub();
