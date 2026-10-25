# Signals

Neuroscience innovation at Washington University in St. Louis. A curated, AI-driven exploration of publicly disclosed methods, technologies, and research ideas from the neuroscience community.

This is an independent project. It is not an official Washington University website, and coverage is incomplete.

**Repository:** https://github.com/Neurotech-Hub/Signals
**Site:** https://neurotech-hub.github.io/Signals/

The page is a single static site. It reads `data/innovation_bank.json` at build time, so a Scout update to that file is enough to change what the site shows. The next push to `main` rebuilds and redeploys it.

## Layout

| Path | Role |
|---|---|
| `src/` | React + TypeScript site (Vite, Tailwind). |
| `data/innovation_bank.json` | Source of truth. The only data file the site imports. |
| `docs/grok.md` | Contract for the Scout that maintains `data/`. |
| `docs/bringup.md` | Original implementation spec. |
| `brand/` | Visual reference. |
| `.github/workflows/deploy.yml` | Build and GitHub Pages deploy. |

## Local development

Node 22 (the version the deploy workflow uses).

```bash
npm ci
npm run dev
```

`npm run dev` serves at http://localhost:5173/ with base path `/`.

```bash
npm run typecheck
npm run build
npm run preview
```

To preview the GitHub Pages base path locally:

```bash
BASE_PATH=/Signals/ npm run build
npm run preview
```

## GitHub Pages

The site is a project page, so asset URLs are rooted at `/Signals/`. The workflow sets `BASE_PATH` from the repository name. Local dev leaves it at `/`.

### One-time setup

1. Create the repository [Neurotech-Hub/Signals](https://github.com/Neurotech-Hub/Signals) and push this `main` branch to it.
2. In the repository, open **Settings → Pages → Build and deployment**.
3. Set **Source** to **GitHub Actions**.

That creates the `github-pages` environment the workflow deploys into. The repository needs to be public, or the organization needs GitHub Pages enabled for private repositories.

### What runs on each push

`.github/workflows/deploy.yml` runs on every push to `main`, and can also be started by hand from the Actions tab.

1. `npm ci`
2. `npm run build` with `BASE_PATH=/Signals/`
3. Upload `dist/` and deploy it with the Pages actions

The site is then at https://neurotech-hub.github.io/Signals/

If the first run fails because Pages was not set to GitHub Actions yet, fix the setting and re-run the workflow from the Actions tab. Later pushes to `main`, including Scout commits that only touch `data/`, deploy on their own.

## Data

`data/innovation_bank.json` is the bank. The Scout fills it; records are not hand-tagged. Field rules, `publication_date`, and the scores the landscape plots are in [docs/grok.md](docs/grok.md). A short note for the data folder is in [data/README.md](data/README.md).
