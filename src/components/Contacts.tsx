import React, { useEffect, useRef, useState } from 'react';
import { portfolioData } from '../data/portfolioData';
import { ParticleDisintegrate } from './ParticleDisintegrate';
import { SplitText } from './SplitText';

// On desktop, open a Gmail compose window; touch devices keep the native mailto: handler (mail app)
const openGmailCompose = (e: React.MouseEvent) => {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  e.preventDefault();
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(portfolioData.email)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const Contacts: React.FC = () => {
  const emailShellRef = useRef<HTMLAnchorElement>(null);
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    const shell = emailShellRef.current;
    if (!shell) return;

    (window as any).__contactEmailEl = shell;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsEntered(entry.isIntersecting);
        if (entry.isIntersecting) {
          const rect = shell.getBoundingClientRect();
          (window as any).__contactEmailRect = rect;
          (window as any).__contactFocus = 1;
        } else {
          (window as any).__contactFocus = 0;
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(shell);

    const onResize = () => {
      if (shell) {
        (window as any).__contactEmailRect = shell.getBoundingClientRect();
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      (window as any).__contactFocus = 0;
      (window as any).__contactEmailEl = null;
    };
  }, []);

  return (
    <div className="contactsWrap">
      <section id="contact" className="contacts">
        <div className="contacts__copy">
          <SplitText type="blur-anim" className="label t-16 muted contacts__kicker">
            Get in touch
          </SplitText>

          <a
            ref={emailShellRef}
            href={`mailto:${portfolioData.email}`}
            className="contacts__emailShell"
            data-entered={isEntered}
            onClick={openGmailCompose}
          >
            <ParticleDisintegrate duration={1200}>
              <span className="contacts__email t-85">{portfolioData.email}</span>
            </ParticleDisintegrate>
          </a>

          <SplitText type="split" delay={0.3} className="label t-20 muted">
            or reach out on{' '}
            <a
              href={portfolioData.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="no-anim"
            >
              <ParticleDisintegrate className="contacts__linkedinParticles">
                <span className="contacts__linkedin">{portfolioData.linkedin}</span>
              </ParticleDisintegrate>
            </a>
          </SplitText>

          <a
            href={portfolioData.resumeUrl}
            download
            className="contacts__resume no-anim"
            data-entered={isEntered}
          >
            <ParticleDisintegrate>
              <span className="contacts__resumeText t-20">
                Download Resume
                <svg
                  className="contacts__resumeIcon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 4V16M12 16L6 10M12 16L18 10M5 20H19" />
                </svg>
              </span>
            </ParticleDisintegrate>
          </a>
        </div>
      </section>
    </div>
  );
};

