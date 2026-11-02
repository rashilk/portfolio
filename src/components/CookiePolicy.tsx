import React, { useEffect } from 'react';
import { ParticleDisintegrate } from './ParticleDisintegrate';
import { Footer } from './Footer';

interface CookiePolicyProps {
  onHomeClick: (e: React.MouseEvent) => void;
  onNavigate: (path: string) => void;
}

export const CookiePolicy: React.FC<CookiePolicyProps> = ({ onHomeClick, onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="cookie-policy-wrap">
      <main className="content">
        <section className="cookie-policy">
          <a className="cookie-policy__backShell" href="/" onClick={onHomeClick}>
            <ParticleDisintegrate>
              <span className="cookie-policy__backText t-16">
                <svg
                  className="icon"
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
                  <path d="M20 12H4M4 12L10 18M4 12L10 6" />
                </svg>
                Home
              </span>
            </ParticleDisintegrate>
          </a>

          <h1 className="label t-49 cookie-policy__title">Cookie Policy</h1>
          <p className="label t-16 muted cookie-policy__updated">Last updated: September 2026</p>

          <div>
            <p className="label t-20 cookie-policy__paragraph">
              This site does not use cookies. Nothing here reads or writes a cookie on your device,
              for tracking, advertising or any other purpose.
            </p>

            <h2 className="label t-30 cookie-policy__heading">What this site does not do</h2>
            <p className="label t-20 cookie-policy__paragraph">
              There are no analytics trackers, no advertising beacons, and no marketing tags embedded
              in this website. Your visit is completely private and unmonitored.
            </p>

            <h2 className="label t-30 cookie-policy__heading">Local Storage</h2>
            <p className="label t-20 cookie-policy__paragraph">
              A single session storage flag (<code>preloader-shown</code>) is kept solely within your
              active browser tab to ensure the initial 3D particle preloader sequence does not replay
              every time you navigate between pages during the same session.
            </p>

            <h2 className="label t-30 cookie-policy__heading">Changes to this policy</h2>
            <p className="label t-20 cookie-policy__paragraph">
              If any changes are made to how this website handles data in the future, this policy will
              be updated accordingly.
            </p>
          </div>
        </section>
      </main>

      <Footer onHomeClick={onHomeClick} onNavigate={onNavigate} />
    </div>
  );
};

