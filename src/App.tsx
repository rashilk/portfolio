import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { portfolioData, Project } from './data/portfolioData';
import { ParticleScene } from './components/ParticleScene';
import { CustomCursor } from './components/CustomCursor';
import { Preloader } from './components/Preloader';
import { Hero } from './components/Hero';
import { Statement } from './components/Statement';
import { World } from './components/World';
import { Italy } from './components/Italy';
import { HowIWork } from './components/HowIWork';
import { Playground } from './components/Playground';
import { Experience } from './components/Experience';
import { Contacts } from './components/Contacts';
import { Footer } from './components/Footer';import { ProjectDetail } from './components/ProjectDetail';
import { CookiePolicy } from './components/CookiePolicy';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const scrollMemory = useRef<number | null>(null);
  const restoreScroll = useRef(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.75,
      touchMultiplier: 1.5
    });

    (window as any).__lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const reqId = requestAnimationFrame(raf);

    const onPopState = () => {
      // browser back from a project behaves like "Back to work"
      if (window.location.pathname === '/') restoreScroll.current = true;
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('popstate', onPopState);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  const navigateTo = (path: string) => {
    // Remember where we were on the home page so "Back to work" can return to the same spot
    if (currentPath === '/' && path.startsWith('/projects/')) {
      scrollMemory.current = window.scrollY;
    }
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
    (window as any).__lenis?.scrollTo(0, { immediate: true });
  };

  const handleBackToWork = () => {
    restoreScroll.current = true;
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  };

  // After returning home from a project, put the page back where it was (or at the work section)
  useEffect(() => {
    if (currentPath !== '/' || !restoreScroll.current) return;
    restoreScroll.current = false;
    const saved = scrollMemory.current;
    scrollMemory.current = null;

    let attempts = 0;
    const apply = () => {
      const lenis = (window as any).__lenis;
      lenis?.resize();
      const work = document.getElementById('work');
      const y = saved ?? (work ? work.getBoundingClientRect().top + window.scrollY : 0);
      lenis?.scrollTo(y, { immediate: true });
      window.scrollTo(0, y);
      // the work section sizes itself after mount, so re-apply a few times while layout settles
      if (++attempts < 4) window.setTimeout(apply, 60);
    };
    apply();
  }, [currentPath]);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('/');
  };

  // Determine current route
  let projectMatch: Project | undefined;
  if (currentPath.startsWith('/projects/')) {
    const slug = currentPath.replace('/projects/', '').replace(/\/$/, '');
    projectMatch = portfolioData.projects.find((p) => p.slug === slug);
  }

  const isCookiePage = currentPath === '/cookie-policy' || currentPath === '/cookie-policy/';

  return (
    <>
      {/* Animated film grain noise */}
      <div aria-hidden="true" className="noise-layer" />

      {/* 3D Three.js WebGL Particle Scene */}
      <ParticleScene />

      {/* Fluid ribbon trailing custom cursor */}
      <CustomCursor />

      {/* 0% to 100% preloader sequence */}
      <Preloader />
      {isCookiePage ? (
        <CookiePolicy onHomeClick={handleHomeClick} onNavigate={navigateTo} />
      ) : projectMatch ? (
        <ProjectDetail
          project={projectMatch}
          onBack={handleBackToWork}
          onHomeClick={handleHomeClick}
          onNavigate={navigateTo}
        />
      ) : (
        <main className="content">
          <div>
            <Hero />
            <Statement />
            <World />
            <Italy />
            <HowIWork />
            <Experience />
            <Playground
              projects={portfolioData.projects}
              onProjectSelect={(slug) => navigateTo(`/projects/${slug}`)}
            />
            <Contacts />
            <Footer onHomeClick={handleHomeClick} onNavigate={navigateTo} />
          </div>
        </main>
      )}
    </>
  );
};
export default App;

