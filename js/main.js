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

/* ---------- Globo 3D de partículas (hero) ---------- */
(function orbScene() {
  const canvas = document.getElementById('orb');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const TECH = ['React', 'Node.js', 'Java', 'Python', 'SQL Server', 'AWS', 'LLMs', 'JavaScript', 'Spring Boot', 'ColdFusion'];
  const HIGHLIGHT = new Set(['AWS', 'LLMs']);

  // Pontos distribuídos uniformemente numa esfera unitária (espiral de Fibonacci)
  function fibonacciSphere(n) {
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
    }
    return pts;
  }

  const spherePts = fibonacciSphere(520);
  const labelPts = fibonacciSphere(TECH.length + 2).slice(1, -1); // evita os polos

  // Anel orbital inclinado
  const ringPts = [];
  const RING_N = 160;
  const tiltX = 1.15;
  const tiltZ = 0.38;
  for (let i = 0; i < RING_N; i++) {
    const t = (i / RING_N) * Math.PI * 2;
    let x = Math.cos(t) * 1.6;
    let y = 0;
    let z = Math.sin(t) * 1.6;
    // inclinação em X
    const y1 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
    const z1 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
    // inclinação em Z
    const x2 = x * Math.cos(tiltZ) - y1 * Math.sin(tiltZ);
    const y2 = x * Math.sin(tiltZ) + y1 * Math.cos(tiltZ);
    ringPts.push([x2, y2, z1]);
  }

  let size = 0;
  let dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = canvas.clientWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Rotação: base automática + inclinação pelo mouse
  let spin = 0;
  let tiltTargetX = 0.25, tiltTargetY = 0;
  let tiltX0 = 0.25, tiltY0 = 0;

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    tiltTargetY = nx * 1.2;
    tiltTargetX = 0.25 + ny * 0.8;
  });
  hero.addEventListener('pointerleave', () => { tiltTargetX = 0.25; tiltTargetY = 0; });

  function project(p, R, rotY, rotX) {
    const [x, y, z] = p;
    const cy = Math.cos(rotY), sy = Math.sin(rotY);
    const cx = Math.cos(rotX), sx = Math.sin(rotX);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y2 = y * cx - z1 * sx;
    const z2 = y * sx + z1 * cx;
    const f = 3.2;
    const scale = f / (f + z2);
    return { x: size / 2 + x1 * R * scale, y: size / 2 + y2 * R * scale, z: z2, s: scale };
  }

  function draw() {
    const R = size * 0.27;
    ctx.clearRect(0, 0, size, size);

    tiltX0 += (tiltTargetX - tiltX0) * 0.06;
    tiltY0 += (tiltTargetY - tiltY0) * 0.06;
    const rotY = spin + tiltY0;
    const rotX = tiltX0;

    // Anel: parte de trás
    const ring = ringPts.map((p) => project(p, R, rotY * 0.6, rotX));
    const drawRing = (front) => {
      for (const q of ring) {
        if ((q.z < 0) !== front) continue;
        const a = front ? 0.85 : 0.25;
        ctx.fillStyle = `rgba(168, 85, 247, ${a})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 1.6 * q.s, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawRing(false);

    // Esfera
    for (const p of spherePts) {
      const q = project(p, R, rotY, rotX);
      const depth = (1 - q.z) / 2; // 0 (fundo) a 1 (frente)
      const a = 0.12 + depth * 0.8;
      const r = (0.7 + depth * 1.5) * q.s;
      ctx.fillStyle = depth > 0.82
        ? `rgba(243, 232, 255, ${a})`
        : `rgba(192, 132, 252, ${a})`;
      ctx.beginPath();
      ctx.arc(q.x, q.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Anel: parte da frente
    drawRing(true);

    // Rótulos das tecnologias orbitando
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    TECH.forEach((name, i) => {
      const [x, y, z] = labelPts[i];
      const q = project([x * 1.35, y * 1.35, z * 1.35], R, rotY * 0.85, rotX);
      const depth = (1 - q.z / 1.35) / 2;
      const alpha = 0.08 + Math.pow(depth, 2) * 0.92;
      const fontSize = Math.max(10, size * 0.026) * q.s;
      ctx.font = `600 ${fontSize}px Archivo, Arial, sans-serif`;
      ctx.fillStyle = HIGHLIGHT.has(name)
        ? `rgba(192, 132, 252, ${alpha})`
        : `rgba(255, 255, 255, ${alpha})`;
      ctx.fillText(name.toUpperCase(), q.x, q.y);
    });
  }

  // Só anima enquanto a capa está visível (economiza bateria)
  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(hero);

  function loop() {
    if (visible && !document.hidden) {
      spin += 0.0035;
      draw();
    }
    requestAnimationFrame(loop);
  }

  if (reduceMotion) {
    draw();
    window.addEventListener('resize', draw);
  } else {
    requestAnimationFrame(loop);
  }
})();

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
