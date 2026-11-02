import React, { useState, useLayoutEffect } from 'react';

const PRELOADER_KEY = 'preloader-shown';
const SCROLL_KEYS = new Set([' ', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);

export const Preloader: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [count, setCount] = useState(0);

  useLayoutEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(PRELOADER_KEY) === '1';
    } catch {}

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (alreadyShown || reducedMotion) {
      document.body.dataset.preloading = 'false';
      return;
    }

    setIsActive(true);
    document.body.dataset.preloading = 'true';
    window.scrollTo(0, 0);

    const preventScroll = (e: Event) => {
      if (e.cancelable) e.preventDefault();
    };
    const preventKey = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key)) preventScroll(e);
    };
    const ensureTop = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };

    const opt = { passive: false };
    window.addEventListener('wheel', preventScroll, opt);
    window.addEventListener('touchmove', preventScroll, opt);
    window.addEventListener('keydown', preventKey, opt);
    window.addEventListener('scroll', ensureTop);

    (window as any).__lenis?.stop();
    (window as any).__preloaderRingMix = 1;

    let unlock = () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('keydown', preventKey);
      window.removeEventListener('scroll', ensureTop);
    };

    const enterTimer = window.setTimeout(() => setIsEntered(true), 300);

    const startTime = performance.now();
    let animId = 0;

    const tick = () => {
      const elapsed = performance.now() - startTime - 300;
      if (elapsed < 0) {
        animId = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / 1200, 1);
      const val = Math.round(progress * progress * progress * 100);
      setCount(val);

      if (progress < 1) {
        animId = requestAnimationFrame(tick);
        return;
      }

      window.setTimeout(() => {
        setIsEntered(false);
        window.setTimeout(() => {
          const fadeStart = performance.now();
          let fadeAnimId = 0;

          const fadeRing = (now: number) => {
            const t = Math.min((now - fadeStart) / 800, 1);
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            (window as any).__preloaderRingMix = 1 - ease;
            if (t < 1) {
              fadeAnimId = requestAnimationFrame(fadeRing);
            } else {
              (window as any).__preloaderRingMix = 0;
            }
          };
          fadeAnimId = requestAnimationFrame(fadeRing);

          window.setTimeout(() => {
            cancelAnimationFrame(fadeAnimId);
            document.body.dataset.preloading = 'false';
            unlock();
            (window as any).__lenis?.resize();
            (window as any).__lenis?.start();

            try {
              sessionStorage.setItem(PRELOADER_KEY, '1');
            } catch {}

            setIsDismissing(true);
            window.setTimeout(() => {
              setIsActive(false);
            }, 400);
          }, 800);
        }, 150);
      }, 200);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      clearTimeout(enterTimer);
      cancelAnimationFrame(animId);
      unlock();
    };
  }, []);

  if (!isActive) return null;

  return (
    <div className="preloader" data-dismissing={isDismissing} aria-hidden="true">
      <span className="preloader__count t-20" data-entered={isEntered}>
        {count}%
      </span>
    </div>
  );
};

