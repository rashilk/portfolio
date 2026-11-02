import React, { useEffect, useRef } from 'react';

interface SplitTextProps {
  children: React.ReactNode;
  className?: string;
  type?: 'split' | 'blur-anim';
  delay?: number;
  start?: string;
}

export const SplitText: React.FC<SplitTextProps> = ({
  children,
  className = '',
  type = 'split',
  delay = 0,
  start = '90%'
}) => {
  const elRef = useRef<HTMLParagraphElement>(null);
  const hasInitRef = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // Only split the DOM once (survives StrictMode double-invoke)
    if (!hasInitRef.current) {
      hasInitRef.current = true;

      const baseDelay = 0.15 + delay;
      el.style.setProperty('--anim-delay', `${baseDelay}s`);

      if (type === 'split') {
        const splitNodes = (parent: Node) => {
          const childNodes = Array.from(parent.childNodes);
          for (const child of childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
              const text = child.nodeValue ?? '';
              if (!text.trim()) continue;
              const frag = document.createDocumentFragment();
              const tokens = text.split(/(\s+)/);
              for (const token of tokens) {
                if (!token) continue;
                if (/^\s+$/.test(token)) {
                  frag.append(token);
                  continue;
                }
                const wrapper = document.createElement('span');
                wrapper.className = 'word-wrapper';
                const word = document.createElement('span');
                word.className = 'word';
                word.textContent = token;
                wrapper.append(word);
                frag.append(wrapper);
              }
              child.parentNode?.replaceChild(frag, child);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              if ((child as HTMLElement).classList.contains('no-anim')) continue;
              splitNodes(child);
            }
          }
        };

        splitNodes(el);

        const words = el.querySelectorAll('.word');
        const stagger = words.length > 15 ? 0.015 : 0.05;
        el.style.setProperty('--anim-stagger', `${stagger}s`);
        words.forEach((w, i) => {
          (w as HTMLElement).style.setProperty('--anim-index', `${i}`);
        });
      } else {
        const text = el.textContent ?? '';
        if (text) {
          if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', text);
          const frag = document.createDocumentFragment();
          const chars = Array.from(text);
          chars.forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.setAttribute('aria-hidden', 'true');
            span.style.setProperty('--anim-index', `${i}`);
            frag.append(span);
          });
          el.replaceChildren(frag);
          const stagger = chars.length > 15 ? 0.015 : 0.07;
          el.style.setProperty('--anim-stagger', `${stagger}s`);
        }
      }

      el.classList.add('is-split');
    }

    // Always set up visibility observer (re-created on every effect run)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible');
      return;
    }

    // If already visible, nothing to do
    if (el.classList.contains('is-visible')) return;

    const startVal = parseFloat(start) || 90;
    const margin = Math.min(Math.max(100 - startVal, 0), 100);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: `0px 0px -${margin}% 0px` }
    );

    const startObserving = () => {
      observer.observe(el);
    };

    if (document.body.dataset.preloading === 'true') {
      const mutObserver = new MutationObserver(() => {
        if (document.body.dataset.preloading !== 'true') {
          mutObserver.disconnect();
          startObserving();
        }
      });
      mutObserver.observe(document.body, { attributes: true, attributeFilter: ['data-preloading'] });
      return () => {
        mutObserver.disconnect();
        observer.disconnect();
      };
    } else {
      startObserving();
      return () => observer.disconnect();
    }
  }, [delay, start, type]);

  return (
    <p ref={elRef} className={`${type} ${className}`} data-delay={delay} data-start={start}>
      {children}
    </p>
  );
};
