# Prototype Instructions

## UC Poster Studio project decisions

- The user selected the third displayed visual concept, `design/concepts/03-open-commons.png` (Open Commons), on 2026-09-15.
- On 2026-09-16, the user rejected the Manrope/multicolor refinement and clarified that "more color" meant more of the geometric color blocks at the upper right. Restore and preserve the original Inter + Noto Sans SC typography, editor styling and blue/green text palette. Only increase the existing blue/mint geometric decoration around the poster edges, keeping it clear of text. Do not interpret this as a request for additional text colors or another font change.
- Use the original left UCM graphic only, `public/assets/ucm-symbol.png`; do not include the UCM / Unified Cache Manager wordmark or redraw the symbol.
- The user specifically requested a 3T identity in "UC Thursday Tech Talk": enlarge the initial T in Thursday, Tech and Talk and give each its own blue/teal/violet accent. Use lighter versions on the blue community panel for contrast. This is a narrow exception to the otherwise original typography and text palette; keep the editable series wording intact.
- The user also requested UCC color emphasis in the "UC Community" brand title: color the U, the following C, and the initial C in Community blue/teal/violet respectively, without enlarging them or recoloring the rest of Community. Preserve the full editable name.
- Poster text must remain editable HTML. Raster references are design targets, not flattened templates. This explicit user requirement takes priority over generic image-to-code guidance about text inside poster assets.
- Provide community/event templates and portrait/landscape layouts. Export PNG at exactly 2880 × 3840 or 3840 × 2160; never confuse preview scale with output pixels.
- The user authorized publishing this project to `ucm-system/uc-community-studio` and configuring GitHub Pages. The homepage lists activities, and new/edit actions open the existing editor. Keep IndexedDB and portable backups; hosting the static tool does not make activity data shared or synchronized. The local development origin remains `http://127.0.0.1:4173`.
- GitHub Pages uses `/uc-community-studio/` as the build base. All application assets must respect `import.meta.env.BASE_URL`; navigation uses `#/edit/<id>` so editor reloads work on static hosting.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
