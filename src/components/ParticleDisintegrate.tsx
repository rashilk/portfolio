import React, { useRef } from 'react';

const MAX_SPAWN_PER_FRAME = 120;

interface ParticleDisintegrateProps {
  children: React.ReactNode;
  className?: string;
  elClassName?: string;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  duration?: number;
  particlesAmountCoefficient?: number;
  oscillationCoefficient?: number;
  canvasPadding?: number;
}

interface Particle {
  startX: number;
  startY: number;
  x: number;
  y: number;
  angle: number;
  counter: number;
  increase: number;
  life: number;
  death: number;
  speed: number;
  size: number;
}

export const ParticleDisintegrate: React.FC<ParticleDisintegrateProps> = ({
  children,
  className = '',
  elClassName = '',
  direction = 'left',
  duration = 500,
  particlesAmountCoefficient = 3,
  oscillationCoefficient = 50,
  canvasPadding = 60
}) => {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const elRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const prevProgressRef = useRef<number>(0);
  const lastRunTimeRef = useRef<number>(0);

  const isHorizontal = direction === 'left' || direction === 'right';

  const addParticle = (x: number, y: number, maxLife: number) => {
    const speed = 4 * Math.random() - 2;
    particlesRef.current.push({
      startX: x,
      startY: y,
      x: 0,
      y: 0,
      angle: 360 * Math.random() - 180,
      counter: 0,
      increase: (2 * Math.PI) / 100,
      life: 0,
      death: maxLife - 20 + 40 * Math.random(),
      speed,
      size: Math.floor(3 * Math.random()) + 1
    });
  };

  const applyTransform = (val: number) => {
    const wrapper = wrapperRef.current;
    const el = elRef.current;
    if (!wrapper || !el) return;
    const transformName = isHorizontal ? 'translateX' : 'translateY';
    const shift = direction === 'left' || direction === 'top' ? val : -val;
    wrapper.style.transform = val === 0 ? 'none' : `${transformName}(${shift}%)`;
    el.style.transform = val === 0 ? 'none' : `${transformName}(${-shift}%)`;
  };

  const triggerDisintegrate = () => {
    if (animFrameRef.current !== null || Date.now() - lastRunTimeRef.current < 800) return;

    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrapper || !canvas || !ctx) return;

    prevProgressRef.current = 0;
    particlesRef.current = [];

    const rect = wrapper.getBoundingClientRect();
    const cw = Math.ceil(rect.width + 2 * canvasPadding);
    const ch = Math.ceil(rect.height + 2 * canvasPadding);
    // Resizing reallocates the canvas backing store, so only do it when the size changed
    if (canvas.width !== cw) canvas.width = cw;
    if (canvas.height !== ch) canvas.height = ch;

    const color =
      getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() ||
      getComputedStyle(wrapper).color ||
      '#f0f2f0';

    const startTime = performance.now();
    let hasReset = false;

    const step = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 101 * (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

      if (!hasReset) applyTransform(ease);

      if (p < 1) {
        const delta = ease - prevProgressRef.current;
        prevProgressRef.current = ease;

        let originX = canvasPadding;
        let originY = canvasPadding;
        const totalSpan = (isHorizontal ? rect.width : rect.height) * (ease / 100) + 100 * delta;

        if (isHorizontal) {
          originX += direction === 'left' ? totalSpan : rect.width - totalSpan;
        } else {
          originY += direction === 'top' ? totalSpan : rect.height - totalSpan;
        }

        const maxLife = (60 * duration) / 1000;
        // Cap per-frame spawns: the raw value reaches thousands on large text and stalls the main thread
        let spawnCount = Math.min(Math.floor(particlesAmountCoefficient * (100 * delta + 1)), MAX_SPAWN_PER_FRAME);
        while (spawnCount-- > 0) {
          addParticle(
            originX + (isHorizontal ? 0 : rect.width * Math.random()),
            originY + (isHorizontal ? rect.height * Math.random() : 0),
            maxLife
          );
        }
      }

      // Update and compact in a single pass (no splice)
      const all = particlesRef.current;
      let alive = 0;
      for (let i = 0; i < all.length; i++) {
        const pt = all[i];
        if (pt.life > pt.death) continue;
        pt.x += pt.speed;
        pt.y = oscillationCoefficient * Math.sin(pt.counter * pt.increase);
        pt.life++;
        pt.counter++;
        all[alive++] = pt;
      }
      all.length = alive;
      const activeParticles = all;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;

      // Rotate by hand and draw squares: avoids per-particle save/restore/path overhead
      for (const pt of activeParticles) {
        if (pt.life >= pt.death) continue;
        const a = (pt.angle * Math.PI) / 180;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        ctx.globalAlpha = 1 - pt.life / pt.death;
        ctx.fillRect(
          pt.startX + pt.x * cos - pt.y * sin - pt.size,
          pt.startY + pt.x * sin + pt.y * cos - pt.size,
          pt.size * 2,
          pt.size * 2
        );
      }
      ctx.globalAlpha = 1;

      if (p >= 1 && !hasReset) {
        hasReset = true;
        wrapper.style.transition = 'none';
        applyTransform(0);
        wrapper.style.opacity = '0';
        // trigger reflow
        void wrapper.offsetWidth;
        wrapper.style.transition = '';
        wrapper.style.opacity = '1';
        window.setTimeout(() => {
          lastRunTimeRef.current = Date.now();
        }, 400);
      }

      if (p < 1 || activeParticles.length > 0) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animFrameRef.current = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  return (
    <span
      className={`particle-disintegrate ${className}`}
      onMouseEnter={triggerDisintegrate}
    >
      <span ref={wrapperRef} className="particle-disintegrate__wrapper">
        <span ref={elRef} className={`particle-disintegrate__el ${elClassName}`}>
          {children}
        </span>
      </span>
      <canvas ref={canvasRef} className="particle-disintegrate__canvas" aria-hidden="true" />
    </span>
  );
};

