# Polykromy

Website for Polykromy, an independent studio making original Roblox experiences and digital accessories.

A single-page, scroll-driven 3D story built with React, Vite, GSAP ScrollTrigger and OGL (WebGL).

## Develop

```bash
npm ci
npm run dev      # local dev server
npm run lint
npm run build    # production build into dist/
npm run preview  # serve the production build
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`. The build uses relative
asset URLs (`base: './'`), so it works under any repo path or a custom domain.

## Structure

| Path | What lives there |
| --- | --- |
| `src/content/site.js` | All copy and media: chapters, process steps, games, channels, nav |
| `src/components/story/` | The sticky 3D story (chapters A S C D F L), process rail, chapter HUD |
| `src/story/storyTimeline.js` | Scroll choreography: one timeline drives both the scene state and the HTML |
| `src/gl/` | OGL renderer: `WorldStage` (canvas + render loop), `island` (island layout), `kit` (GLB loader), shaders |
| `src/components/games/` | Games showcase (horizontal pin on desktop, stacked on mobile) |
| `src/components/Companion.jsx` | Inky, the Piixpal guide: section-aware tips, quick navigation |
| `src/components/Interactions.jsx` | Custom cursor, magnetic buttons, text scramble (fine pointers only) |
| `src/lib/siteStore.js` | Tiny store for rarely-changing shared state (active section, loader) |
| `src/assets/webgl/` | Low-poly nature kit (`.glb`) used to build the island |
| `src/assets/media/` | Web-optimised key art (`.webp`) and gameplay/process clips (`.mp4`) |
| `public/` | The four fonts, favicon and logo |

## Content updates

- **Games:** add or edit entries in `GAMES` in `src/content/site.js`. Each needs a 16:9 image, a square image
  and a short muted clip in `src/assets/media/`.
- **Media:** keep clips short (around 10 s), 960 px wide, H.264 `.mp4` without audio, e.g.
  `ffmpeg -ss 20 -t 9 -i in.mov -an -vf scale=960:-2 -c:v libx264 -crf 29 -movflags +faststart out.mp4`.
- **Island:** pieces are placed in `LANDMARKS` in `src/gl/island.js`. Hotspot anchors in `PROCESS` (site.js)
  sit on those landmarks.

## Typography

Only four local fonts, declared in `src/index.css`:

- **Game Paused**: display headings. Letters only; digits and punctuation fall back to Monocraft, and periods
  render as pixel squares via `PixelText`.
- **Monocraft**: labels, buttons and UI.
- **Poppins**: body text.
- **Stamp RSPK**: chapter stamps. It only contains A C D F L S, which is why the chapters are named
  Arrive, Scatter, Construct, Detail, Form and Leap.

## Accessibility and motion

With `prefers-reduced-motion: reduce` the story renders as one still image followed by plain, stacked chapters.
Pinning, scrubbing, the custom cursor and companion motion are all off. The custom cursor never runs on touch devices.
