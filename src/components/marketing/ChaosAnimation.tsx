'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  el: HTMLElement;
  w: number;
  h: number;
}

const BADGES = [
  { label: 'N', className: 'bg-zinc-800 text-white font-bold' },
  {
    label: '',
    className: 'bg-zinc-800 text-zinc-300',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`,
  },
  { label: '#', className: 'bg-purple-900 text-purple-300 font-bold text-lg' },
  { label: '</>', className: 'bg-blue-900 text-blue-300 font-mono text-xs font-bold' },
  {
    label: '',
    className: 'bg-zinc-800 text-zinc-300',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
  },
  { label: '>_', className: 'bg-orange-900 text-orange-300 font-mono font-bold text-xs' },
  {
    label: '',
    className: 'bg-zinc-800 text-zinc-300',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  },
  { label: '★', className: 'bg-yellow-900 text-yellow-300 text-lg' },
];

const MIN_SPEED = 0.5;
const DAMPING = 0.999;
const REPEL_RADIUS = 80;
const REPEL_FORCE = 5;

export default function ChaosAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: Particle[] = [];

    BADGES.forEach((badge, i) => {
      const el = document.createElement('div');
      el.className = `absolute flex items-center justify-center rounded-lg w-10 h-10 text-sm select-none ${badge.className}`;
      el.style.willChange = 'transform';
      if (badge.svg) {
        el.innerHTML = badge.svg;
      } else {
        el.textContent = badge.label;
      }
      container.appendChild(el);

      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const angle = (i / BADGES.length) * Math.PI * 2;
      const speed = 1 + Math.random() * 1.5;

      particles.push({
        x: 20 + Math.random() * (cw - 80),
        y: 20 + Math.random() * (ch - 80),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.5,
        el,
        w: 40,
        h: 40,
      });
    });

    particlesRef.current = particles;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => { mouseRef.current = null; };
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    const onVisibility = () => { pausedRef.current = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    const tick = () => {
      if (!pausedRef.current) {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const mouse = mouseRef.current;

        for (const p of particles) {
          if (mouse) {
            const dx = p.x + p.w / 2 - mouse.x;
            const dy = p.y + p.h / 2 - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < REPEL_RADIUS && dist > 0) {
              const force = (REPEL_RADIUS - dist) / REPEL_RADIUS * REPEL_FORCE;
              p.vx += (dx / dist) * force;
              p.vy += (dy / dist) * force;
            }
          }

          p.vx *= DAMPING;
          p.vy *= DAMPING;

          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed < MIN_SPEED) {
            p.vx = (p.vx / speed) * MIN_SPEED;
            p.vy = (p.vy / speed) * MIN_SPEED;
          }

          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;

          if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
          if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
          if (p.x + p.w > cw) { p.x = cw - p.w; p.vx = -Math.abs(p.vx); }
          if (p.y + p.h > ch) { p.y = ch - p.h; p.vy = -Math.abs(p.vy); }

          p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      particles.forEach((p) => p.el.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden h-52 w-full rounded-lg border border-white/5"
    />
  );
}
