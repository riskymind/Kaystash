/* ==========================
   Current year
========================== */
document.getElementById('currentYear').textContent = new Date().getFullYear();

/* ==========================
   Navbar opacity on scroll
========================== */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

/* ==========================
   Mobile nav toggle
========================== */
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu   = document.getElementById('mobileMenu');

mobileToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ==========================
   Scroll fade-in (IntersectionObserver)
========================== */
const fadeEls = document.querySelectorAll('.fade-in');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

fadeEls.forEach(el => revealObserver.observe(el));

/* ==========================
   Chaos icon animation
========================== */
const chaosContainer = document.getElementById('chaosContainer');
const chaosIcons     = Array.from(chaosContainer.querySelectorAll('.chaos-icon'));
const ICON_SIZE      = 46;
const MAX_SPEED      = 1.8;
const DAMPING        = 0.992;
const REPEL_RADIUS   = 90;
const REPEL_FORCE    = 0.6;

let cW = chaosContainer.offsetWidth;
let cH = chaosContainer.offsetHeight;

/* Give each icon a random starting position and velocity */
const particles = chaosIcons.map((el, i) => {
  const angle = (i / chaosIcons.length) * Math.PI * 2 + Math.random() * 0.5;
  const speed = 0.5 + Math.random() * 0.7;
  const x = 8 + Math.random() * Math.max(4, cW - ICON_SIZE - 16);
  const y = 8 + Math.random() * Math.max(4, cH - ICON_SIZE - 16);

  return {
    el,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rot:      Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 0.5,
  };
});

/* Set initial positions before first frame to avoid stack at (0,0) */
particles.forEach(p => {
  p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
});

let mouseX = -9999;
let mouseY = -9999;

chaosContainer.addEventListener('mousemove', e => {
  const rect = chaosContainer.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
}, { passive: true });

chaosContainer.addEventListener('mouseleave', () => {
  mouseX = -9999;
  mouseY = -9999;
});

window.addEventListener('resize', () => {
  cW = chaosContainer.offsetWidth;
  cH = chaosContainer.offsetHeight;
}, { passive: true });

let rafId = null;

function tick() {
  cW = chaosContainer.offsetWidth;
  cH = chaosContainer.offsetHeight;

  for (const p of particles) {
    /* Mouse repulsion */
    const cx  = p.x + ICON_SIZE / 2;
    const cy  = p.y + ICON_SIZE / 2;
    const dx  = cx - mouseX;
    const dy  = cy - mouseY;
    const d   = Math.sqrt(dx * dx + dy * dy);

    if (d < REPEL_RADIUS && d > 0.5) {
      const strength = (REPEL_RADIUS - d) / REPEL_RADIUS * REPEL_FORCE;
      p.vx += (dx / d) * strength;
      p.vy += (dy / d) * strength;
    }

    /* Damping */
    p.vx *= DAMPING;
    p.vy *= DAMPING;

    /* Speed cap */
    const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (spd > MAX_SPEED) {
      p.vx = (p.vx / spd) * MAX_SPEED;
      p.vy = (p.vy / spd) * MAX_SPEED;
    }

    /* Minimum speed — give a random kick if nearly stopped */
    if (spd < 0.18 && spd > 0) {
      const kick = 0.4 / spd;
      p.vx *= kick;
      p.vy *= kick;
    } else if (spd === 0) {
      const a = Math.random() * Math.PI * 2;
      p.vx = Math.cos(a) * 0.4;
      p.vy = Math.sin(a) * 0.4;
    }

    p.x   += p.vx;
    p.y   += p.vy;
    p.rot += p.rotSpeed;

    /* Bounce off walls */
    if (p.x < 0)              { p.x = 0;              p.vx =  Math.abs(p.vx) * 0.75; }
    if (p.x > cW - ICON_SIZE) { p.x = cW - ICON_SIZE; p.vx = -Math.abs(p.vx) * 0.75; }
    if (p.y < 0)              { p.y = 0;              p.vy =  Math.abs(p.vy) * 0.75; }
    if (p.y > cH - ICON_SIZE) { p.y = cH - ICON_SIZE; p.vy = -Math.abs(p.vy) * 0.75; }

    p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
  }

  rafId = requestAnimationFrame(tick);
}

rafId = requestAnimationFrame(tick);

/* Pause when tab is hidden to save CPU */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  } else if (!rafId) {
    rafId = requestAnimationFrame(tick);
  }
});

/* ==========================
   Pricing toggle (monthly ↔ yearly)
========================== */
const pricingToggle = document.getElementById('pricingToggle');
const proPrice      = document.getElementById('proPrice');
const proDesc       = document.getElementById('proDesc');
const monthlyLabel  = document.getElementById('monthlyLabel');
const yearlyLabel   = document.getElementById('yearlyLabel');

let yearly = false;

pricingToggle.addEventListener('click', () => {
  yearly = !yearly;

  pricingToggle.classList.toggle('on', yearly);
  monthlyLabel.classList.toggle('on', !yearly);
  yearlyLabel.classList.toggle('on', yearly);

  if (yearly) {
    proPrice.textContent = '$6';
    proDesc.textContent  = 'Billed $72 / year';
  } else {
    proPrice.textContent = '$8';
    proDesc.textContent  = 'Billed monthly';
  }
});

/* Set initial active label */
monthlyLabel.classList.add('on');
