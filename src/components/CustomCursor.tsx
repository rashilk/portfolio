import React, { useEffect, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !(
        window.matchMedia('(pointer: fine) and (hover: hover)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
    ) {
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const head = headRef.current;
    if (!container || !canvas || !head) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    document.documentElement.classList.add('has-custom-cursor');

    const foregroundColor =
      getComputedStyle(container).getPropertyValue('--foreground').trim() || '#f2f2f2';

    let pixelRatio = 1;
    const onResize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    onResize();
    window.addEventListener('resize', onResize);

    interface TrailPoint {
      x: number;
      y: number;
      t: number;
    }

    const trail: TrailPoint[] = [];
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let hasMoved = false;
    let animId = 0;

    const onPointerMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        current.x = target.x;
        current.y = target.y;
        trail.length = 0;
      }
      if (container.dataset.visible !== 'true') {
        container.dataset.visible = 'true';
      }
    };

    const onPointerOver = (e: MouseEvent) => {
      const targetEl = (e.target as HTMLElement)?.closest('a, button, [data-cursor]');
      container.dataset.hover = targetEl ? 'true' : 'false';
    };

    const onPointerLeave = () => {
      container.dataset.visible = 'false';
    };

    const render = (time: number) => {
      animId = requestAnimationFrame(render);

      current.x += (target.x - current.x) * 0.28;
      current.y += (target.y - current.y) * 0.28;
      head.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;

      const lastPoint = trail[trail.length - 1];
      if (hasMoved && (!lastPoint || Math.hypot(current.x - lastPoint.x, current.y - lastPoint.y) >= 1.5)) {
        trail.push({ x: current.x, y: current.y, t: time });
      }

      while (trail.length && time - trail[0].t > 150) {
        trail.shift();
      }

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (trail.length < 3) return;

      const len = trail.length;
      const leftPoints: { x: number; y: number }[] = [];
      const rightPoints: { x: number; y: number }[] = [];

      for (let i = 0; i < len; i++) {
        const p = trail[i];
        const prev = trail[Math.max(0, i - 1)];
        const next = trail[Math.min(len - 1, i + 1)];
        let dx = next.x - prev.x;
        let dy = next.y - prev.y;
        let d = Math.hypot(dx, dy) || 1;
        dx /= d;
        dy /= d;

        const width = (1.5 + 7.5 * Math.min(1, Math.max(0, 1 - (time - p.t) / 150))) / 2;
        leftPoints.push({ x: p.x - dy * width, y: p.y + dx * width });
        rightPoints.push({ x: p.x + dy * width, y: p.y - dx * width });
      }

      const tail = trail[0];
      const headPoint = trail[len - 1];
      const gradient = ctx.createLinearGradient(tail.x, tail.y, headPoint.x, headPoint.y);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, foregroundColor);

      ctx.beginPath();
      ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
      for (let i = 1; i < len; i++) {
        ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
      }
      for (let i = len - 1; i >= 0; i--) {
        ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.shadowColor = foregroundColor;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerover', onPointerOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerover', onPointerOver);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, []);

  return (
    <div ref={containerRef} className="custom-cursor" aria-hidden="true">
      <canvas ref={canvasRef} className="custom-cursor__canvas" />
      <div ref={headRef} className="custom-cursor__head" />
    </div>
  );
};

