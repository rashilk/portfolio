# Mohammed Rashil: AI Developer Portfolio

A personal portfolio for Mohammed Rashil, a data analyst and AI engineer working
across machine learning, generative AI and Web3 analytics. The site tells its story
through a single scroll-driven 3D particle scene instead of static sections.

## Highlights

- **Scroll-driven particle scene:** a WebGL point cloud morphs as you scroll, from a
  portrait to a globe, a map of India, a rotating DNA helix, a tunnel, and finally a
  frame around the contact email.
- **Experience:** current and past roles shown one at a time on the DNA screen.
- **Notable projects:** Multimodal RAG, Bank Market Analysis and Skin Disorder
  Detection, each with its own detail page.
- **Contact:** the email link opens a Gmail compose window, and there is a one-click
  resume download.
- **Smooth, responsive motion:** eased scrolling with Lenis, layouts that adapt from
  desktop to phone, and reduced-motion support.

## Tech stack

React 18, TypeScript, Vite, Three.js (custom GLSL shaders) and Lenis.

## Run it locally

```bash
npm install
npm run dev
```

Then open the address Vite prints (by default http://localhost:3000).

Build for production with:

```bash
npm run build
```

## Customising the content

Text, experience and projects live in [`src/data/portfolioData.ts`](src/data/portfolioData.ts).
Project preview images go in `public/projects/`, and the resume PDF is
`public/Mohammed-Rashil-Resume.pdf`.

## Acknowledgements

The visual design and particle-animation approach started from a clone of
[Daniel Ingrassia's portfolio](https://ingrassiadaniel.it/). The content, India map,
experience section, project pages and later changes are my own.
