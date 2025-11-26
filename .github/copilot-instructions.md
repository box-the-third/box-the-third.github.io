## Purpose
Give concise, repository‑specific guidance so an AI coding agent can be productive immediately.

## Big picture
- This is a single‑page static portfolio served from the repository root (`index.html`).
- All assets (images, PDFs) live under `assets/` and are referenced with relative paths from `index.html`.
- Styling is centralized in `style.css`; interactive behavior is in small JS files and several inline scripts at the bottom of `index.html`.

## Key files to read first (order matters)
- `index.html` — the canonical entry point. Contains structure, inline scripts, modal forms, and references to external CDNs (fonts, Bootstrap, AOS, Vanilla‑tilt, Chatbase embed).
- `style.css` — visual system & naming conventions (variables at top, many component styles). Look here for class naming and theme tokens like `luxury-*`.
- `cursor.js` — custom cursor implementation (tiny, vanilla JS). Use this as a pattern for small, dependency‑free scripts.
- `assets/README.md` — one‑line note: assets folder for site content.

## Architecture notes / patterns
- Monolithic, client‑side site: no backend code in this repo. Forms post to Formspree (`https://formspree.io/f/mjkarwza`).
- External dependencies are loaded from CDNs in `index.html` (Bootstrap v5 bundle, Google Fonts, AOS, Vanilla‑tilt, Font Awesome, Chatbase, jQuery). Be mindful of order when adding scripts: Bootstrap v5 does not require jQuery.
- Scripts are frequently inlined at the bottom of `index.html`. When adding new behavior, prefer small files (like `cursor.js`) and reference them after Bootstrap bundle.

## Developer workflows
- Local preview: open `index.html` in a browser or run a local HTTP server from repo root. Example quick command (PowerShell):
```
python -m http.server 8000
```
- Recommended with VS Code: use the Live Server extension to preview and auto‑reload.
- Deployment: this repo is named `box-the-third.github.io` so GitHub Pages will serve `master` (push to `master` to publish). No CI/build step required.

## Conventions & project specifics
- Assets: add images, PDFs, and thumbnails under `assets/`. Reference as `assets/your-file.ext` from `index.html`.
- Forms: all service request modals post to the same Formspree endpoint — keep that consistent when adding new forms.
- UI components: duplicate the modal markup in `index.html` when creating new service dialogs. Follow existing markup (modal id, hidden input `service`, form fields, submit button).
- CSS variables: use `:root` tokens (e.g., `--luxury-*`) defined in `style.css` to keep visual consistency.

## Integration points & gotchas
- Formspree: forms submit externally — there is no server‑side code here. If you change the action, update all service modals.
- Chatbase embed: injected via script in `index.html` — if editing, keep the same embed initialization pattern.
- Performance: many external fonts and repeated logo images (affiliations) can increase payload. Optimize by reducing font families and deduplicating logos.

## Known issues / things to watch for (explicit examples)
- Malformed form in Service 3 modal: `index.html` contains ` <form action="https://formspree.io/f/mjkarwza" method="POST" enctype="multipart/form-data"></form>` followed by input fields outside of the form. Fix by moving inputs inside the `<form>...</form>` block.
- Script ordering: jQuery is included after `cursor.js` and other inline scripts — cursor.js is plain JS, but if you add jQuery‑dependent code, include jQuery before those scripts.
- Many inline scripts are defined at the bottom of `index.html`. When extracting behavior into separate files, preserve their execution order.

## Common tasks & examples
- Add an image used on the page:
  - Put `my-photo.jpg` into `assets/` and update the `src` in `index.html` (e.g., `<img src="assets/my-photo.jpg" ...>`).
- Add a new modal service:
  - Copy an existing modal block, change the modal `id` (e.g., `service7Modal`), update the hidden `service` input value, and wire a button `data-bs-target="#service7Modal"`.
- Fix the Service 3 modal form quickly:
  - Search `Service 3 Modal` in `index.html`, remove the immediate `</form>` closing tag after the opening `<form>` and ensure all inputs are inside the form.

## Testing & verification
- Manual verification only: open the site in a browser, test modals, form submission (Formspree will accept POSTs), and the custom cursor/particle animations.

## When to open PRs / labels
- Small content or asset updates: push to `master` on this personal site repo (site will auto‑publish). For larger changes (structure, form endpoints, or asset deletions), open a PR and request review.

---
If anything here is unclear or you want more automation (linting, basic local server, or CI for image optimization), tell me which area to expand and I will iterate.
