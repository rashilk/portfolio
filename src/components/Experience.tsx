import React, { useEffect, useRef } from 'react';
import { portfolioData } from '../data/portfolioData';

// Scroll length per role change, in viewport heights
const SCREENS_PER_STEP = 1.2;
// Extra tail after the last role, during which it fades out
const TAIL_STEPS = 0.6;
// Lead-in before the section reaches the top of the viewport, in viewport heights
const LEAD_IN = 0.5;
// How far a role travels while sliding in from below / out upward, in vh
const SLIDE_DISTANCE_VH = 12;
// Screens after the last role's travel at which its exit fade finishes
const EXIT_END = 0.7;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

export const Experience: React.FC = () => {
  const items = portfolioData.experience;
  const count = items.length;

  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || count === 0) return;

    const travel = () => (count + TAIL_STEPS) * SCREENS_PER_STEP * window.innerHeight;

    const layout = () => {
      // End the section exactly when the last role has finished fading (travel + 0.7 screens of
      // progress, minus the lead-in already counted) so there is no empty scrolling before the projects
      section.style.height = `${travel() + (EXIT_END - LEAD_IN) * window.innerHeight}px`;
      (window as any).__lenis?.resize();
    };

    let targetS = 0;
    let shownS = 0;
    let inView = false;
    let rafId = 0;
    let lastTime = performance.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const measure = () => {
      const bounds = section.getBoundingClientRect();
      targetS = LEAD_IN * window.innerHeight - bounds.top;
      inView = bounds.top < window.innerHeight && bounds.bottom > 0;
    };

    const render = (now: number) => {
      rafId = requestAnimationFrame(render);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      measure();

      if (!inView) {
        shownS = targetS;
        for (const el of itemRefs.current) {
          if (el && el.style.visibility !== 'hidden') {
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
          }
        }
        if (labelRef.current) labelRef.current.style.opacity = '0';
        return;
      }

      // Ease toward the scroll position so the roll glides slowly instead of tracking each wheel tick
      const gap = targetS - shownS;
      shownS = reducedMotion || Math.abs(gap) < 0.1 ? targetS : shownS + gap * (1 - Math.exp(-dt / 0.45));

      const h = window.innerHeight;
      const total = travel();
      // t runs 0..count+TAIL; role k takes over from role k-1 around t = k + 0.5
      const t = clamp01(shownS / total) * (count + TAIL_STEPS);
      const sentenceGone = 1 - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--work-ready') || '0');

      // the last role fades out across the tail, after its hold
      const exit = 1 - smooth((shownS - total - 0.1 * h) / (0.6 * h));

      let anyVisible = 0;
      items.forEach((_, i) => {
        const el = itemRefs.current[i];
        if (!el) return;
        // wide hand-over windows (0.7 of a step) keep the roll slow and gradual
        const fadeIn = smooth((t - i - 0.15) / 0.7);
        const fadeOut = i < count - 1 ? smooth((t - (i + 1) - 0.15) / 0.7) : 1 - exit;
        const o = fadeIn * (1 - fadeOut) * sentenceGone;
        anyVisible = Math.max(anyVisible, o);
        // roll upward: the next role rises in from below while the current one slides up and out
        const shift = (1 - fadeIn) * SLIDE_DISTANCE_VH - fadeOut * SLIDE_DISTANCE_VH;
        el.style.transform = `translateY(${shift.toFixed(2)}vh)`;
        el.style.opacity = o.toFixed(3);
        el.style.filter = `blur(${((1 - o) * 10).toFixed(2)}px)`;
        el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      });

      if (labelRef.current) labelRef.current.style.opacity = anyVisible.toFixed(3);
    };

    const onResize = () => {
      layout();
      measure();
    };

    layout();
    measure();
    shownS = targetS;
    rafId = requestAnimationFrame(render);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, [count, items]);

  return (
    <section id="experience" ref={sectionRef} className="experience">
      <p ref={labelRef} className="experience__label t-16">
        Experience
      </p>

      <div className="experience__stage">
        {items.map((item, i) => (
          <div
            key={`${item.company}-${item.period}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="experience__item"
          >
            <div className="experience__meta">
              {item.current && <span className="experience__badge t-16">Currently working</span>}
              <span className="experience__period t-16">{item.period}</span>
            </div>
            <h3 className="experience__role t-30">{item.role}</h3>
            <p className="experience__company t-20">
              {item.company} · {item.location}
            </p>
            <ul className="experience__highlights">
              {item.highlights.map((line, idx) => (
                <li key={idx} className="experience__highlight t-20">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
