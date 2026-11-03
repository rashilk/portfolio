import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { particleVertexShader, particleFragmentShader } from '../shaders/particleShaders';

interface ParticleSceneProps {
  className?: string;
  src?: string;
  italySrc?: string;
  color?: string;
  cameraDistance?: number;
  fill?: number;
  widthFill?: number;
  bottomOffset?: number;
  horizontalOffset?: number;
  formationDuration?: number;
  headTurn?: number;
  maxTurn?: number;
  idleTurn?: number;
  followTime?: number;
  settleTime?: number;
  exposure?: number;
  glow?: number;
  glowRadius?: number;
  mobileRatio?: number;
  scrollScale?: number;
  scrollScaleDistance?: number;
  scrollRotate?: number;
  morphStart?: number;
  morphDistance?: number;
  globeRadius?: number;
  globeSpin?: number;
  morphStart2?: number;
  morphDistance2?: number;
  italyOffset?: number;
  morphStart3?: number;
  morphDistance3?: number;
  workSlideDistance?: number;
}

function parsePPT1(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (magic !== 'PPT1') throw new Error(`Portrait format: ${magic}`);
  const count = view.getUint32(4, true);
  const scale = view.getFloat32(8, true);
  const positions = new Float32Array(count * 3);
  const luma = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const offset = 12 + 8 * i;
    positions[3 * i] = view.getInt16(offset, true) * scale;
    positions[3 * i + 1] = view.getInt16(offset + 2, true) * scale;
    positions[3 * i + 2] = view.getInt16(offset + 4, true) * scale;
    luma[i] = view.getUint8(offset + 6) / 255;
  }
  return { count, positions, luma };
}

// Portrait globe size: 0.6 on a typical phone, shrunk on very narrow screens so the globe (and the
// text ring around it) never exceeds ~87% of the screen width. Landscape is unchanged.
const globeScaleFor = (width: number, height: number) =>
  width < height ? 0.6 * Math.min(1, 1.587 * (width / height)) : 1;

export const ParticleScene: React.FC<ParticleSceneProps> = ({
  className = 'particle-scene',
  src = '/portrait.bin',
  italySrc = '/india.bin',
  color = '#ffffff',
  cameraDistance = 3,
  fill = 0.9,
  widthFill = 0.92,
  bottomOffset = -0.09,
  horizontalOffset = 0.15,
  formationDuration = 4,
  headTurn = 0.16,
  maxTurn = 0.22,
  idleTurn = 0.12,
  followTime = 0.35,
  settleTime = 1.1,
  exposure = 0.5,
  glow = 2,
  glowRadius = 1,
  mobileRatio = 0.6,
  scrollScale = 0.2,
  scrollScaleDistance = 1,
  scrollRotate = -0.6,
  morphStart = 1,
  morphDistance = 0.6,
  globeRadius = 0.42,
  globeSpin = 0.08,
  morphStart2 = 2.3,
  morphDistance2 = 0.7,
  italyOffset = -0.04,
  morphStart3 = 3.4,
  morphDistance3 = 0.6,
  workSlideDistance = 1.5
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let cleanup: (() => void) | undefined;
    const abortCtrl = new AbortController();

    const fetchBuffer = (url: string) =>
      fetch(url, { signal: abortCtrl.signal }).then((res) => {
        if (!res.ok) throw new Error(`${url}: ${res.status}`);
        return res.arrayBuffer();
      });

    Promise.all([fetchBuffer(src), fetchBuffer(italySrc)])
      .then(([portraitBuf, italyBuf]) => {
        if (isDisposed) return;
        const portraitData = parsePPT1(portraitBuf);
        const italyData = parsePPT1(italyBuf);

        let renderer: THREE.WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        } catch (err) {
          console.error('WebGL init failed:', err);
          return;
        }

        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let count = portraitData.count;
        let positions = portraitData.positions;
        let luma = portraitData.luma;
        let italyPositions = italyData.positions;

        let maxY = -Infinity;
        let minY = Infinity;
        let minX = Infinity;
        let maxX = -Infinity;

        for (let i = 0; i < count; i++) {
          const x = positions[3 * i];
          const y = positions[3 * i + 1];
          if (y > maxY) maxY = y;
          if (y < minY) minY = y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }

        const spanY = Math.max(maxY - minY, 0.001);
        const spanX = Math.max(maxX - minX, 0.001);
        const centreY = (maxY + minY) / 2;

        const isCoarse = window.matchMedia('(pointer: coarse)').matches;
        if (isCoarse && mobileRatio < 1) {
          const step = Math.max(Math.round(1 / mobileRatio), 1);
          const newCount = Math.ceil(count / step);
          const pSub = new Float32Array(3 * newCount);
          const lSub = new Float32Array(newCount);
          const itSub = new Float32Array(3 * newCount);
          for (let i = 0; i < newCount; i++) {
            const orig = i * step;
            pSub[3 * i] = positions[3 * orig];
            pSub[3 * i + 1] = positions[3 * orig + 1];
            pSub[3 * i + 2] = positions[3 * orig + 2];
            lSub[i] = luma[orig];
            itSub[3 * i] = italyPositions[3 * orig];
            itSub[3 * i + 1] = italyPositions[3 * orig + 1];
            itSub[3 * i + 2] = italyPositions[3 * orig + 2];
          }
          count = newCount;
          positions = pSub;
          luma = lSub;
          italyPositions = itSub;
        }

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(rect.width, rect.height, false);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.inset = '0';
        container.appendChild(renderer.domElement);
        container.style.transition = 'opacity 0.6s ease-in-out';
        container.style.opacity = '1';

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 100);
        camera.position.z = cameraDistance;

        const aOrigin = new Float32Array(3 * count);
        const aDelay = new Float32Array(count);
        const aSize = new Float32Array(count);
        const aPhase = new Float32Array(count);
        const tmpVec = new THREE.Vector3();

        for (let i = 0; i < count; i++) {
          tmpVec.set(2 * Math.random() - 1, 2 * Math.random() - 1, 2 * Math.random() - 1);
          if (tmpVec.lengthSq() === 0) tmpVec.set(0, 1, 0);
          tmpVec.normalize().multiplyScalar(2 + 4.5 * Math.random());
          aOrigin[3 * i] = tmpVec.x;
          aOrigin[3 * i + 1] = tmpVec.y;
          aOrigin[3 * i + 2] = tmpVec.z;
          aDelay[i] = 0.55 * Math.random();
          aSize[i] = 0.5 + 0.35 * luma[i] + 1.4 * Math.pow(Math.random(), 3);
          aPhase[i] = Math.random() * Math.PI * 2;
        }

        let itMaxY = -Infinity;
        let itMinY = Infinity;
        for (let i = 0; i < count; i++) {
          const y = italyPositions[3 * i + 1];
          if (y > itMaxY) itMaxY = y;
          if (y < itMinY) itMinY = y;
        }
        const italyCentreY = (itMaxY + itMinY) / 2;

        const aGlobe = new Float32Array(3 * count);
        const goldenRatioAngle = Math.PI * (3 - Math.sqrt(5));
        const sphereRadius = spanY * globeRadius;
        for (let i = 0; i < count; i++) {
          const normY = 1 - (i / Math.max(count - 1, 1)) * 2;
          const r = Math.sqrt(Math.max(1 - normY * normY, 0));
          const theta = goldenRatioAngle * i;
          aGlobe[3 * i] = Math.cos(theta) * r * sphereRadius;
          aGlobe[3 * i + 1] = normY * sphereRadius + centreY;
          aGlobe[3 * i + 2] = Math.sin(theta) * r * sphereRadius;
        }

        const rungFraction = 1 / 6;
        const aWaveX = new Float32Array(count);
        const aWaveCurve = new Float32Array(count);
        const aWaveJitter = new Float32Array(count);
        const aIsRung = new Float32Array(count);
        const aRungT = new Float32Array(count);

        const perm = new Uint32Array(count);
        for (let i = 0; i < count; i++) perm[i] = i;
        for (let i = count - 1; i > 0; i--) {
          const rand = Math.floor(Math.random() * (i + 1));
          const tmp = perm[i];
          perm[i] = perm[rand];
          perm[rand] = tmp;
        }

        const invCount = 1 / Math.max(count - 1, 1);
        for (let i = 0; i < count; i++) {
          const idx = perm[i];
          aWaveJitter[idx] = 2 * Math.random() - 1;
          if (i % Math.round(1 / rungFraction) === 0) {
            const rungIndex = Math.floor(24 * Math.random());
            aWaveX[idx] = (rungIndex + 0.5) * (1 / 24) - 0.5 + (Math.random() - 0.5) * (1 / 24) * 0.5;
            aIsRung[idx] = 1;
            aRungT[idx] = Math.random();
          } else {
            aWaveX[idx] = i * invCount - 0.5 + (Math.random() - 0.5) * invCount;
            aWaveCurve[idx] = i % 2;
          }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aOrigin', new THREE.BufferAttribute(aOrigin, 3));
        geometry.setAttribute('aGlobe', new THREE.BufferAttribute(aGlobe, 3));
        geometry.setAttribute('aItaly', new THREE.BufferAttribute(italyPositions, 3));
        geometry.setAttribute('aWaveX', new THREE.BufferAttribute(aWaveX, 1));
        geometry.setAttribute('aWaveCurve', new THREE.BufferAttribute(aWaveCurve, 1));
        geometry.setAttribute('aWaveJitter', new THREE.BufferAttribute(aWaveJitter, 1));
        geometry.setAttribute('aIsRung', new THREE.BufferAttribute(aIsRung, 1));
        geometry.setAttribute('aRungT', new THREE.BufferAttribute(aRungT, 1));
        geometry.setAttribute('aDelay', new THREE.BufferAttribute(aDelay, 1));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
        geometry.setAttribute('aPhase', new THREE.BufferAttribute(aPhase, 1));
        geometry.setAttribute('aLuma', new THREE.BufferAttribute(luma, 1));

        const isPortrait = rect.width < rect.height;

        const material = new THREE.ShaderMaterial({
          vertexShader: particleVertexShader,
          fragmentShader: particleFragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uSize: { value: 0 },
            uPixelRatio: { value: renderer.getPixelRatio() },
            uFormation: { value: prefersReducedMotion ? 1 : 0 },
            uMorph: { value: 0 },
            uMorph2: { value: 0 },
            uMorph3: { value: 0 },
            uMorph4: { value: 0 },
            uMorph5: { value: 0 },
            uRingMix: { value: 0 },
            uRingRadius: { value: 0.1 * spanX },
            uOutlineRect: { value: new THREE.Vector4(0, 0, 0, 0) },
            uWaveformWidth: { value: 0 },
            uSpiralRadius: { value: 0 },
            uWaveformAmp: { value: 0.12 * spanY },
            uWorkSlide: { value: 0 },
            uTurbulence: { value: 0 },
            uColor: { value: new THREE.Color(color) },
            uExposure: { value: exposure },
            uPointer: { value: new THREE.Vector2(0, 0) },
            uGlow: { value: 0 },
            uGlowRadius: { value: glowRadius },
            uAspect: { value: rect.width / rect.height },
            uIsPortrait: { value: isPortrait ? 1 : 0 },
            uGlobeScale: { value: globeScaleFor(rect.width, rect.height) },
            uGlobeCentreY: { value: centreY },
            uItalyScale: { value: isPortrait ? 0.7 : 1 },
            uItalyCentreY: { value: italyCentreY }
          },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geometry, material);
        const group = new THREE.Group();
        group.add(points);
        scene.add(group);

        let lastTime = performance.now();
        let targetScale = 1;
        let viewH = 0;
        let viewW = 0;
        let globeRotY = 0;
        let currentScrollY = window.location.pathname === '/' ? window.scrollY : window.innerHeight * (morphStart3 + morphDistance3);
        let prevScrollY = currentScrollY;
        let turbulence = 0;
        let contactOffset = 0;
        let contactSmoothed = 0;
        let closingSmoothed = 0;
        let isAtContactBottom = false;
        let lastContactMountId = -1;

        const targetLookAt = new THREE.Vector3(0, 0, 0);
        const rectMin = new THREE.Vector3();
        const rectMax = new THREE.Vector3();
        const pointerSmoothed = new THREE.Vector2(0, 0);
        const pointerTarget = new THREE.Vector2(0, 0);
        let pointerActive = 0;
        let pointerTargetActive = 0;

        const onPointerMove = (e: PointerEvent) => {
          const cRect = container.getBoundingClientRect();
          const px = (e.clientX - cRect.left) / cRect.width;
          const py = (e.clientY - cRect.top) / cRect.height;
          if (px < 0 || px > 1 || py < 0 || py > 1) {
            pointerTargetActive = 0;
            return;
          }
          pointerTarget.set(2 * px - 1, -(2 * py - 1));
          pointerTargetActive = 1;
        };

        const onPointerLeave = () => {
          pointerTargetActive = 0;
        };

        if (!prefersReducedMotion) {
          window.addEventListener('pointermove', onPointerMove, { passive: true });
          window.addEventListener('pointerleave', onPointerLeave);
        }

        let hasFadedIn = false;

        const renderFrame = (now: number) => {
          const dt = Math.min((now - lastTime) / 1000, 0.02);
          lastTime = now;

          if (window.location.pathname === '/') {
            // Ease toward the real scroll position so every scroll-driven morph glides instead of
            // tracking each wheel tick
            const scrollGap = window.scrollY - currentScrollY;
            currentScrollY =
              prefersReducedMotion || Math.abs(scrollGap) < 0.5
                ? window.scrollY
                : currentScrollY + scrollGap * (1 - Math.exp(-dt / 0.2));
          }
          const scrollDiff = Math.abs(currentScrollY - prevScrollY) / Math.max(dt, 0.001);
          prevScrollY = currentScrollY;
          const targetTurbulence = THREE.MathUtils.clamp(scrollDiff / 2400, 0, 1);
          turbulence += (targetTurbulence - turbulence) * (1 - Math.exp(-dt / 0.15));
          material.uniforms.uTurbulence.value = turbulence;

          if (hasFadedIn && container.style.opacity !== '1') {
            container.style.opacity = '1';
          }

          const uTimeVal = (material.uniforms.uTime.value += dt);
          const followFactor = 1 - Math.exp(-dt / Math.max(followTime, 0.001));
          const settleFactor = 1 - Math.exp(-dt / Math.max(settleTime, 0.001));
          pointerSmoothed.lerp(pointerTarget, followFactor);
          pointerSmoothed.x = THREE.MathUtils.clamp(pointerSmoothed.x, -1, 1);
          pointerSmoothed.y = THREE.MathUtils.clamp(pointerSmoothed.y, -1, 1);
          pointerActive += (pointerTargetActive - pointerActive) * (prefersReducedMotion ? 1 : pointerTargetActive > pointerActive ? followFactor : settleFactor);

          const formVal = material.uniforms.uFormation.value;
          const idleX = Math.sin(0.16 * uTimeVal) * idleTurn;
          const idleY = -(Math.sin(0.11 * uTimeVal + 1.4) * idleTurn * 0.4);

          const sScale = THREE.MathUtils.clamp(currentScrollY / (window.innerHeight * scrollScaleDistance), 0, 1);
          const m1Norm = THREE.MathUtils.clamp((currentScrollY / window.innerHeight - morphStart) / Math.max(morphDistance, 0.001), 0, 1);
          const morph1 = m1Norm * m1Norm * (3 - 2 * m1Norm);
          material.uniforms.uMorph.value = morph1;

          const invMorph1 = 1 - morph1;
          const m2Norm = THREE.MathUtils.clamp((currentScrollY / window.innerHeight - morphStart2) / Math.max(morphDistance2, 0.001), 0, 1);
          const morph2 = m2Norm * m2Norm * (3 - 2 * m2Norm);
          material.uniforms.uMorph2.value = morph2;

          const m3Norm = THREE.MathUtils.clamp((currentScrollY / window.innerHeight - morphStart3) / Math.max(morphDistance3, 0.001), 0, 1);
          const morph3 = m3Norm * m3Norm * (3 - 2 * m3Norm);
          material.uniforms.uMorph3.value = morph3;

          document.documentElement.style.setProperty('--portrait-morph', morph1.toFixed(4));

          const globeReady = THREE.MathUtils.clamp((morph1 - 0.85) / 0.15, 0, 1) * (1 - THREE.MathUtils.clamp(morph2 / 0.15, 0, 1));
          document.documentElement.style.setProperty('--globe-ready', globeReady.toFixed(4));

          const italyReady = THREE.MathUtils.clamp((morph2 - 0.99) / 0.01, 0, 1) * (1 - THREE.MathUtils.clamp((morph3 - 0.85) / 0.15, 0, 1));
          document.documentElement.style.setProperty('--italy-ready', italyReady.toFixed(4));

          const workSlideOver = Math.max(0, currentScrollY / window.innerHeight - (morphStart3 + morphDistance3));
          const workSlide = THREE.MathUtils.clamp(workSlideOver / Math.max(workSlideDistance, 0.001), 0, 1);
          material.uniforms.uWorkSlide.value = workSlide;

          const workReady = THREE.MathUtils.clamp((morph3 - 0.85) / 0.15, 0, 1) * (1 - THREE.MathUtils.clamp((workSlide - 0.85) / 0.15, 0, 1));
          document.documentElement.style.setProperty('--work-ready', workReady.toFixed(4));

          const playgroundClosingTarget = (window as any).__playgroundClosing ?? 0;
          closingSmoothed +=
            (playgroundClosingTarget - closingSmoothed) * (prefersReducedMotion ? 1 : 1 - Math.exp(-dt / 0.3));
          if (Math.abs(playgroundClosingTarget - closingSmoothed) < 0.0005) closingSmoothed = playgroundClosingTarget;
          const playgroundClosing = closingSmoothed;
          material.uniforms.uMorph4.value = playgroundClosing;

          const preloaderRingMix = (window as any).__preloaderRingMix ?? 0;
          material.uniforms.uRingMix.value = preloaderRingMix;

          const contactFocus = (window as any).__contactFocus ?? 0;
          const contactMountId = (window as any).__contactMountId ?? 0;
          if (contactMountId !== lastContactMountId) {
            lastContactMountId = contactMountId;
            contactOffset = 0;
            isAtContactBottom = false;
          }

          const isHome = window.location.pathname === '/';
          const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
          const isScrollEnd = window.scrollY >= maxScroll - 2;

          if (isHome) {
            isAtContactBottom = false;
          } else if (isScrollEnd) {
            if (!isAtContactBottom) contactOffset = contactFocus;
            isAtContactBottom = true;
          } else {
            isAtContactBottom = false;
          }

          const targetContactFocus = isAtContactBottom ? contactOffset : contactFocus;
          // The focus flag flips instantly when the email enters/leaves view; ease it so the
          // spiral -> outline morph (and the camera blend) doesn't snap
          contactSmoothed +=
            (targetContactFocus - contactSmoothed) * (prefersReducedMotion ? 1 : 1 - Math.exp(-dt / 0.35));
          if (Math.abs(targetContactFocus - contactSmoothed) < 0.0005) contactSmoothed = targetContactFocus;
          const activeContactFocus = contactSmoothed;
          const blendFocus = Math.max(playgroundClosing, activeContactFocus);
          const globeSpinActive = morph1 * (1 - morph2);
          globeRotY = (globeRotY + dt * globeSpin * Math.PI * 2 * globeSpinActive) % (2 * Math.PI);

          const softClamp = (val: number, bound: number) => bound * Math.tanh(val / bound);

          group.rotation.y =
            (softClamp(THREE.MathUtils.lerp(idleX, pointerSmoothed.x * headTurn, pointerActive) * formVal, maxTurn) +
              scrollRotate * sScale * invMorph1 +
              globeRotY * globeSpinActive) *
            (1 - blendFocus);

          group.rotation.x =
            softClamp(THREE.MathUtils.lerp(idleY, -pointerSmoothed.y * headTurn * 0.6, pointerActive) * formVal, 0.6 * maxTurn) *
            (1 - blendFocus);

          group.rotation.z = 0.35 * morph3 * (1 - blendFocus);

          material.uniforms.uPointer.value.copy(pointerSmoothed);
          material.uniforms.uGlow.value = glow * pointerActive;

          if (material.uniforms.uFormation.value < 1) {
            material.uniforms.uFormation.value = Math.min(
              material.uniforms.uFormation.value + dt / formationDuration,
              1
            );
          }
          (window as any).__preloaderFormation = material.uniforms.uFormation.value;

          const scaleBase = targetScale * (1 + sScale * scrollScale * invMorph1) * (1 + 0.6 * workSlide);
          group.scale.set(scaleBase, scaleBase, scaleBase);

          const baseY = -viewH / 2 - minY * scaleBase + bottomOffset * viewH * sScale * invMorph1;
          const targetY =
            -THREE.MathUtils.lerp(THREE.MathUtils.lerp(centreY, italyCentreY, morph2), 0, morph3) * scaleBase +
            italyOffset * morph2 * (1 - morph3) * viewH;

          group.position.y = THREE.MathUtils.lerp(baseY, targetY, morph1);
          group.position.x = horizontalOffset * viewW * sScale * invMorph1 - 0.22 * morph3 * viewW;

          group.position.x = THREE.MathUtils.lerp(group.position.x, 0, preloaderRingMix);
          group.position.y = THREE.MathUtils.lerp(group.position.y, 0, preloaderRingMix);

          const cameraAngle = (Math.PI / 7) * workSlide * (1 - blendFocus);
          const camDist = cameraDistance * (1 - 0.15 * workSlide);

          camera.position.x = THREE.MathUtils.lerp(Math.sin(cameraAngle) * camDist, group.position.x, blendFocus);
          camera.position.y = THREE.MathUtils.lerp(0, group.position.y, blendFocus);
          camera.position.z = Math.cos(cameraAngle) * camDist;

          targetLookAt.set(0, 0, 0).lerp(group.position, Math.max(workSlide, blendFocus));
          camera.lookAt(targetLookAt);

          material.uniforms.uMorph5.value = activeContactFocus;

          // Measure live every frame so the outline follows the email while scrolling
          const emailEl = (window as any).__contactEmailEl as HTMLElement | null | undefined;
          const emailRect = emailEl ? emailEl.getBoundingClientRect() : (window as any).__contactEmailRect;
          if (emailRect && !isAtContactBottom && (contactFocus > 0.001 || contactSmoothed > 0.001)) {
            const zPlane = group.position.z;
            const dist = Math.abs(camera.position.z - zPlane);
            const frustumH = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * dist;
            const frustumW = frustumH * camera.aspect;
            const isNarrow = window.innerWidth < window.innerHeight;
            const padX = emailRect.width * (isNarrow ? 0.08 : 0.1);
            const padY = emailRect.height * (isNarrow ? 1 : 1.05);

            const sMinX = (emailRect.left - padX) / window.innerWidth - 0.5;
            const sMaxX = (emailRect.left + emailRect.width + padX) / window.innerWidth - 0.5;
            const sMinY = (emailRect.top - padY) / window.innerHeight - 0.5;
            // Extra room below for the LinkedIn line and the resume button
            const sMaxY = (emailRect.top + emailRect.height + padY + emailRect.height * 0.6) / window.innerHeight - 0.5;

            rectMin.set(camera.position.x + sMinX * frustumW, camera.position.y - sMinY * frustumH, zPlane);
            rectMax.set(camera.position.x + sMaxX * frustumW, camera.position.y - sMaxY * frustumH, zPlane);

            group.updateMatrixWorld();
            group.worldToLocal(rectMin);
            group.worldToLocal(rectMax);

            material.uniforms.uOutlineRect.value.set(rectMin.x, rectMax.x, rectMin.y, rectMax.y);
          }

          renderer.render(scene, camera);

          if (!hasFadedIn) {
            hasFadedIn = true;
            container.style.opacity = '1';
          }

          animId = requestAnimationFrame(renderFrame);
        };

        let animId = requestAnimationFrame(renderFrame);

        const onResize = () => {
          const cRect = container.getBoundingClientRect();
          const vHeight = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * cameraDistance;
          const vWidth = vHeight * (cRect.width / cRect.height);
          const scaleY = (fill * vHeight) / spanY;
          const scaleX = (widthFill * vWidth) / spanX;
          const portrait = cRect.width < cRect.height;

          targetScale = portrait ? scaleY : Math.min(scaleY, scaleX);
          viewH = vHeight;
          viewW = vWidth;

          material.uniforms.uWaveformWidth.value = (vHeight / 0.34289780745545134 / targetScale) * 1.15;
          material.uniforms.uSpiralRadius.value = (0.2 * vHeight) / targetScale;
          material.uniforms.uSize.value = THREE.MathUtils.clamp((cRect.height / 900) * 5.5, 2.4, 7);
          material.uniforms.uAspect.value = cRect.width / cRect.height;
          material.uniforms.uIsPortrait.value = portrait ? 1 : 0;
          material.uniforms.uRingRadius.value = 0.07 * spanX;
          material.uniforms.uGlobeScale.value = globeScaleFor(cRect.width, cRect.height);
          material.uniforms.uItalyScale.value = portrait ? 0.7 : 1;

          camera.aspect = cRect.width / cRect.height;
          camera.updateProjectionMatrix();
          renderer.setSize(cRect.width, cRect.height, false);
        };

        onResize();
        window.addEventListener('resize', onResize);

        cleanup = () => {
          cancelAnimationFrame(animId);
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerleave', onPointerLeave);
          window.removeEventListener('resize', onResize);
          renderer.dispose();
          geometry.dispose();
          material.dispose();
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        };
      })
      .catch((err) => {
        if (!isDisposed) console.error('ParticleScene asset error:', err);
      });

    return () => {
      isDisposed = true;
      abortCtrl.abort();
      cleanup?.();
    };
  }, [
    src,
    italySrc,
    color,
    cameraDistance,
    fill,
    widthFill,
    bottomOffset,
    horizontalOffset,
    formationDuration,
    headTurn,
    maxTurn,
    idleTurn,
    followTime,
    settleTime,
    exposure,
    glow,
    glowRadius,
    mobileRatio,
    scrollScale,
    scrollScaleDistance,
    scrollRotate,
    morphStart,
    morphDistance,
    globeRadius,
    globeSpin,
    morphStart2,
    morphDistance2,
    italyOffset,
    morphStart3,
    morphDistance3,
    workSlideDistance
  ]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
};

