import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Project } from '../data/portfolioData';

interface PlaygroundProps {
  projects: Project[];
  onProjectSelect: (slug: string) => void;
}

const ASPECT_RATIO = 1280 / 720;
const MIN_TRAVEL_TILES = 3;
const LERP = (a: number, b: number, t: number) => a + (b - a) * t;
const DAMP = (a: number, b: number, t: number) => {
  const n = LERP(a, b, t);
  return Math.abs(n - b) < 0.0005 ? b : n;
};

interface WebGLVideoCardProps {
  videoUrl: string;
  className?: string;
  energyRef: React.MutableRefObject<number>;
}

const WebGLVideoCard: React.FC<WebGLVideoCardProps> = ({ videoUrl, className, energyRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onEnter = () => { hoverRef.current = 1; };
    const onLeave = () => { hoverRef.current = 0; };
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let isDisposed = false;
    let animId = 0;
    let cleanup = () => {};

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || isDisposed) return;
        observer.disconnect();

        const scene = new THREE.Scene();
        const width = ASPECT_RATIO;
        const camera = new THREE.OrthographicCamera(
          (-width / 2) * 1.2,
          (width / 2) * 1.2,
          0.6,
          -0.6,
          0.1,
          10
        );
        camera.position.z = 1;

        let renderer: THREE.WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        } catch {
          return;
        }

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        const geometry = new THREE.PlaneGeometry(width, 1, 32, 18);
        const origPositions = geometry.attributes.position.array.slice();
        const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.src = videoUrl;

        let videoTexture: THREE.VideoTexture | null = null;
        let isPlaying = true;

        video.addEventListener(
          'loadeddata',
          () => {
            if (isDisposed) return;
            videoTexture = new THREE.VideoTexture(video);
            videoTexture.colorSpace = THREE.SRGBColorSpace;

            const videoAspect = video.videoWidth / video.videoHeight;
            if (videoAspect > ASPECT_RATIO) {
              const repeatX = ASPECT_RATIO / videoAspect;
              videoTexture.repeat.set(repeatX, 1);
              videoTexture.offset.set((1 - repeatX) / 2, 0);
            } else {
              const repeatY = videoAspect / ASPECT_RATIO;
              videoTexture.repeat.set(1, repeatY);
              videoTexture.offset.set(0, (1 - repeatY) / 2);
            }

            material.map = videoTexture;
            material.opacity = 1;
            material.needsUpdate = true;
            if (glowRef.current) glowRef.current.style.opacity = '1';
            if (isPlaying) video.play().catch(() => {});
          },
          { once: true }
        );

        const updateSize = () => {
          const { clientWidth, clientHeight } = mount;
          if (clientWidth !== 0 && clientHeight !== 0) {
            renderer.setSize(clientWidth, clientHeight, false);
          }
        };
        updateSize();
        const ro = new ResizeObserver(updateSize);
        ro.observe(mount);

        let energy = 0;
        let hoverVal = 0;
        const startTime = performance.now();

        const tick = () => {
          animId = requestAnimationFrame(tick);
          if (!isPlaying) return;

          const time = (performance.now() - startTime) / 1000;
          energy = DAMP(energy, energyRef.current, 0.08);
          hoverVal = DAMP(hoverVal, hoverRef.current, 0.05);

          const intensity = LERP(0, 0.06, energy) + 0.02 * hoverVal;
          mesh.scale.setScalar(1 + 0.025 * energy);

          const posAttr = geometry.attributes.position;
          for (let i = 0; i < posAttr.count; i++) {
            const ox = origPositions[3 * i];
            const oy = origPositions[3 * i + 1];
            const nx = ox / width;
            const ny = oy / 1;
            const dist = Math.max(0, (Math.min(Math.hypot(nx, ny) / 0.7071, 1) - 0.15) / 0.85);
            const dx = dist * intensity * Math.sin(3.2 * ny * Math.PI + 0.6 * time);
            const dy = dist * intensity * Math.sin(3.2 * nx * Math.PI + 0.6 * time * 1.3 + 1.7);
            posAttr.setX(i, ox + dx);
            posAttr.setY(i, oy + dy);
          }
          posAttr.needsUpdate = true;
          renderer.render(scene, camera);
        };

        animId = requestAnimationFrame(tick);

        const visObserver = new IntersectionObserver(
          ([e]) => {
            isPlaying = e.isIntersecting;
            if (isPlaying) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          },
          { threshold: 0, rootMargin: '50% 0px' }
        );
        visObserver.observe(mount);

        cleanup = () => {
          cancelAnimationFrame(animId);
          ro.disconnect();
          visObserver.disconnect();
          videoTexture?.dispose();
          video.pause();
          video.removeAttribute('src');
          video.load();
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          mount.replaceChildren();
        };
      },
      { threshold: 0, rootMargin: '50% 0px' }
    );

    observer.observe(mount);

    return () => {
      isDisposed = true;
      observer.disconnect();
      cleanup();
    };
  }, [videoUrl, energyRef]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-20%',
          zIndex: -1,
          background: 'radial-gradient(closest-side, rgba(255, 255, 255, 0.14), transparent 70%)',
          opacity: 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none'
        }}
      />
      <div ref={mountRef} style={{ position: 'absolute', inset: '-10%' }} />
    </div>
  );
};

export const Playground: React.FC<PlaygroundProps> = ({ projects, onProjectSelect }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const kickerRef = useRef<HTMLParagraphElement>(null);
  const closingRef = useRef<HTMLParagraphElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollEnergyRef = useRef<number>(0);
  const [isStageActive, setIsStageActive] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let animId = 0;

    const measureEnergy = () => {
      animId = requestAnimationFrame(measureEnergy);
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) {
        const vel = Math.min(Math.abs(window.scrollY - lastScrollY) / dt / 3, 1);
        scrollEnergyRef.current += (vel - scrollEnergyRef.current) * 0.1;
      }
      lastScrollY = window.scrollY;
      lastTime = now;
    };

    animId = requestAnimationFrame(measureEnergy);
    return () => cancelAnimationFrame(animId);
  }, []);

  const calculateTravel = (projectCount: number) => {
    // With no projects the track would have negative width and the section would collapse to one
    // screen, so size the scroll length as if there were a few tiles to keep the animation paced.
    const count = Math.max(projectCount, MIN_TRAVEL_TILES);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isPortrait = w < h;
    // Cards start travelling once the section reaches the top of the viewport, i.e. after the
    // Experience block above it has scrolled away
    const revealSpan = 0;
    const tileWidthPercent = isPortrait ? 85 : 50;
    const tileWidth = (w * tileWidthPercent) / 100;
    const totalContentWidth = (w * (count * tileWidthPercent + (count - 1) * 12)) / 100;
    // The track slides left: the first tile starts centred, the last one exits off the left edge
    const startX = (w - tileWidth) / 2;
    const endX = -totalContentWidth - 0.09 * w;
    const maxTravel = startX - endX;
    const travelScale = isPortrait ? 0.6 : 1;
    const sectionHeight = Math.max(maxTravel / travelScale - revealSpan + h, h);

    return { revealSpan, sectionHeight, startX, maxTravel };
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onResize = () => {
      const { sectionHeight } = calculateTravel(projects.length);
      section.style.height = `${sectionHeight}px`;
      (window as any).__lenis?.resize();
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [projects.length]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!section) return;

    let ticking = false;
    let pageTop = 0;
    let pageHeight = 0;
    const measureLayout = () => {
      const r = section.getBoundingClientRect();
      pageTop = r.top + window.scrollY;
      pageHeight = r.height;
    };
    measureLayout();
    // the section height is set from JS and the sections above resize too, so refresh when the page does
    const resizeObserver = new ResizeObserver(() => {
      measureLayout();
      requestTick();
    });
    resizeObserver.observe(document.body);
    let targetX = 0;
    let trackX: number | null = null;
    let glideId = 0;
    let glideLast = performance.now();

    // Ease the row toward its scroll-driven position so it glides rather than stepping with the wheel
    const glide = (now: number) => {
      glideId = requestAnimationFrame(glide);
      const dt = Math.min((now - glideLast) / 1000, 0.05);
      glideLast = now;
      if (trackX === null || !track) return;
      const gap = targetX - trackX;
      if (Math.abs(gap) < 0.3) {
        if (gap !== 0) {
          trackX = targetX;
          track.style.transform = `translateX(${trackX}px)`;
        }
        return;
      }
      trackX += gap * (1 - Math.exp(-dt / 0.15));
      track.style.transform = `translateX(${trackX}px)`;
    };
    glideId = requestAnimationFrame(glide);

    const onScroll = () => {
      ticking = false;
      const { revealSpan, startX, maxTravel } = calculateTravel(projects.length);
      // cached position (see measureLayout) instead of a layout read on every scroll frame
      const top = pageTop - window.scrollY;
      const bounds = { top, bottom: top + pageHeight };
      const inView = bounds.top < revealSpan && bounds.bottom > 0;
      const workReady: number = (window as any).__workReady ?? 0;
      // Keep the project cards hidden until the "How I work" sentence has faded out
      const stageVisible = inView && workReady <= 0.02;

      if (stage) stage.dataset.active = stageVisible ? 'true' : 'false';
      setIsStageActive(stageVisible);

      if (!inView) {
        if (kickerRef.current) kickerRef.current.dataset.active = 'false';
        if (closingRef.current) closingRef.current.dataset.active = 'false';
        // Once scrolled past, hold the finished state; before the section, rest at zero
        (window as any).__playgroundClosing = bounds.bottom <= 0 ? 1 : 0;
        return;
      }

      const isBottomVisible = bounds.bottom > 0.6 * window.innerHeight;
      const portraitRatio = window.innerWidth < window.innerHeight ? 0.6 : 1;
      const clampedTravel = Math.min(Math.max(revealSpan - bounds.top, 0) * portraitRatio, maxTravel);
      const normProgress = clampedTravel / maxTravel;
      const smoothProgress = normProgress * normProgress * normProgress * (normProgress * (6 * normProgress - 15) + 10);
      const currentX = startX - smoothProgress * maxTravel;

      targetX = currentX;
      if (trackX === null) {
        trackX = currentX;
        if (track) track.style.transform = `translateX(${currentX}px)`;
      }

      // Closing line only appears once the last card has left the screen
      const threshold = 0.6;
      const closingProgress = Math.min(Math.max((normProgress - threshold) / (1 - threshold), 0), 1);
      const smoothClosing = closingProgress * closingProgress * closingProgress * (closingProgress * (6 * closingProgress - 15) + 10);
      (window as any).__playgroundClosing = smoothClosing;

      const isClosingActive = isBottomVisible && smoothClosing > 0.5;

      if (kickerRef.current) {
        kickerRef.current.dataset.active = String(isBottomVisible && !isClosingActive && workReady <= 0.15);
      }
      if (closingRef.current) {
        closingRef.current.dataset.active = String(isClosingActive);
      }
    };

    const requestTick = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    };

    onScroll();
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(glideId);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', requestTick);
      window.removeEventListener('resize', onScroll);
      (window as any).__playgroundClosing = 0;
    };
  }, [projects.length]);

  return (
    <section id="work" ref={sectionRef} className="playground">
      <div className="playground__kicker">
        <p ref={kickerRef} className="playground__kickerLabel t-16" data-active="false">
          Some Notable Projects
        </p>
      </div>

      <div className="playground__closingWrap">
        <p ref={closingRef} className="playground__closingLine t-30" data-active="false">
          And still working on plenty more.
        </p>
      </div>

      <div ref={stageRef} className="playground__stage" data-active={isStageActive ? 'true' : 'false'}>
        <div className="playground__marquee" data-marquee="projects">
          <div ref={trackRef} className="playground__track">
            {projects.map((proj) => (
              <div key={proj.slug} className="playground__tile">
                <a
                  href={`/projects/${proj.slug}`}
                  className="playground__tileLink"
                  onClick={(e) => {
                    e.preventDefault();
                    onProjectSelect(proj.slug);
                  }}
                >
                  {proj.video ? (
                    <WebGLVideoCard
                      videoUrl={proj.video}
                      className="playground__tileMedia"
                      energyRef={scrollEnergyRef}
                    />
                  ) : proj.image ? (
                    <img
                      src={proj.image}
                      alt={proj.title}
                      className="playground__tileMedia playground__tileImage"
                      loading="lazy"
                    />
                  ) : (
                    <div className="playground__tileMedia playground__poster" aria-hidden="true">
                      <span className="playground__posterIndex t-20">
                        {String(projects.indexOf(proj) + 1).padStart(2, '0')}
                      </span>
                      <span className="playground__posterTitle t-49">{proj.title}</span>
                    </div>
                  )}
                </a>
                <div className="playground__caption">
                  <a
                    href={`/projects/${proj.slug}`}
                    className="playground__captionTitle t-30"
                    onClick={(e) => {
                      e.preventDefault();
                      onProjectSelect(proj.slug);
                    }}
                  >
                    {proj.title}
                  </a>
                  <span className="playground__captionMeta">
                    {proj.info && <span className="playground__captionInfo t-20">{proj.info}</span>}
                    {proj.year && <span className="playground__captionYear t-20">{proj.year}</span>}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

