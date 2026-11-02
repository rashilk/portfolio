# Daniel Ingrassia Portfolio Clone

A pixel-perfect, high-performance clone of [Daniel Ingrassia's Portfolio](https://ingrassiadaniel.it/), featuring all custom 3D WebGL animations, shaders, fluid custom cursor, particle disintegration interactions, and case study pages.

---

## 🌟 Key Features & Animation Architecture

### 1. 3D WebGL Particle Cloud (`ParticleScene.tsx`)
- **Binary Point Cloud Decoding**: Decodes the custom `PPT1` format point clouds (`/portrait.bin` and `/india.bin`).
- **Real-Time Cursor Head Tracking**: In the hero section, the 3D head rotates and tilts smoothly to look at your pointer, complete with proximity glow and dynamic twinkle.
- **Scroll-Driven Multi-Stage Morphing**:
  1. **3D Portrait**: Daniel's face gazing towards your cursor with interactive tilt.
  2. **Global Sphere & Orbiting Ring**: Morphs into a 3D rotating globe surrounded by an animated SVG text ring (*"Working globally"*).
  3. **3D India Map**: Reshapes into a 3D geographical map of India (*"Based in India"*).
  4. **Constellation Waveform**: Morphs into wave rungs and floating harmonic curves for the philosophy section (*"I don’t just execute what’s handed to me..."*).
  5. **Playground Stream**: Shifts into a horizontal particle stream behind the projects gallery.
  6. **Cosmic Constellation**: Settles into an ambient star field with focal framing around the contact email.

### 2. Interactive Video Showcase (`Playground.tsx`)
- **Horizontal Scroll Mapping**: Vertical page scrolling smoothly drives horizontal inertia travel across selected works.
- **WebGL Mesh Wave Deformation**: Each video tile is rendered onto a 3D Three.js subdivided mesh (`PlaneGeometry`) that dynamically distorts with fluid sine waves responding to scroll velocity and mouse hovers.
- **Dual Hover States**: Dynamic drop-shadow glow and title blur transitions.

### 3. Particle Disintegration Interaction (`ParticleDisintegrate.tsx`)
- **Canvas Particle Explosion**: Hovering interactive links (email, LinkedIn, cookie policy, back buttons) triggers a canvas disintegration explosion.
- **Physics-Based Flight**: Particles explode along the movement vector with sine-wave oscillation, life-cycle fade, and instant re-emergence.

### 4. Fluid Comet Custom Cursor (`CustomCursor.tsx`)
- **Variable-Width Ribbon**: Renders a dynamic polygon comet tail connecting mouse position history using linear gradients and shadow glow.
- **Interactive Ring Expansion**: Automatically detects links/buttons (`a`, `button`, `[data-cursor]`) and transitions into an enlarged hollow ring cursor.

### 5. Split-Text & Blur Reveals (`SplitText.tsx`)
- **Word Split (`.split`)**: Splits paragraphs into word wrappers with staggered translateY and opacity reveals on scroll.
- **Character Blur Reveal (`.blur-anim`)**: Splits titles into individual character spans with staggered 18px blur-to-focus transitions.

### 6. Interactive Monogram Logo (`Monogram.tsx`)
- **Animated SVG Vectors**: Hovering the monogram animates stroke opacity and triggers color fills (`#379777` green and `#f4ce14` yellow) with a floating tooltip (*"hey there!"*).

### 7. Preloader (`Preloader.tsx`)
- **0% to 100% Sequence**: Locks scroll and presents a tabular countdown while particles align into a spinning ring, before smoothly expanding into the 3D head.

### 8. Case Study & Cookie Policy Pages
- Dedicated views for project case studies (`/projects/michael-london`, `/projects/fratelli-simonetti`, etc.) and the cookie policy.

---

## 🚀 Getting Started

### 1. Set Workspace
Recommended workspace directory:
```
C:\Users\pro\.gemini\antigravity\scratch\daniel-ingrassia-portfolio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🎨 How to Personalize for Yourself

All content and projects are configured in **[`src/data/portfolioData.ts`](src/data/portfolioData.ts)**:

```typescript
export const portfolioData = {
  name: "Your Name",
  role: "Creative Frontend Developer / Motion Designer",
  statement: "I turn ambitious designs into fast, interactive web experiences...",
  location: "Based in Your City",
  workPhilosophy: "Your personal approach and philosophy...",
  email: "your.email@example.com",
  linkedin: "LinkedIn",
  linkedinUrl: "https://www.linkedin.com/in/your-profile",
  copyrightYear: "2026",
  vatInfo: "VAT / Freelance ID",
  projects: [
    {
      slug: "project-one",
      title: "Project Name",
      year: "2026",
      tagline: "Inspiring project subtitle",
      partner: "Client or Agency",
      partnerUrl: "https://...",
      href: "https://...",
      video: "https://.../video.mp4",
      description: ["Case study description..."],
      collaboration: "Details of your role...",
      stack: ["React", "Three.js", "GSAP", "Tailwind"],
      stackNote: "Technical architecture summary..."
    }
  ]
};
```

