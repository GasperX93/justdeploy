# justdeploy.eth

A single-page guide for deploying websites to [Swarm](https://ethswarm.org) decentralized storage. Hosted on Swarm itself.

## What it does

Walks users through three deployment paths based on their comfort level:

| Path | Tool | Best for |
|---|---|---|
| **Easy** | [Beeport](https://beeport.ethswarm.org) | Browser-only, wallet required, no install |
| **Intermediate** | [Swarm Desktop](https://desktop.ethswarm.org) | GUI app, local node, repeat deploys |
| **Advanced** | Bee + [swarm-cli](https://github.com/ethersphere/swarm-cli) | CLI, scriptable, CI/CD |


## Key interactions

- **Skill cards** — clicking Easy / Intermediate / Advanced calls `showSteps(level)`, which shows the matching `.steps-section` and smooth-scrolls to it
- **Dark/light mode** — toggled via `data-theme` on `<html>`, persisted in `localStorage`, initialized with an inline script in `<head>` to prevent flash
- **"What is Swarm?" toggle** — inline accordion in the hero subtitle, expands/collapses with a `max-height` CSS transition
- **Stamp calculator** (Advanced step 04) — interactive size/duration picker that updates the `swarm-cli` command in real time
- **Copy buttons** — injected via JS on all `.step-code` elements, uses the Clipboard API
- **Tooltips** — `.tip` class with `data-tip` attribute; tooltip bubble rendered via CSS `::after`; ⓘ icon injected via JS

## Dependencies (CDN, no install)

- [Lucide icons](https://lucide.dev) — `lucide.min.js` via jsDelivr
- [Google Fonts](https://fonts.google.com) — Space Grotesk, DM Sans, DM Mono

## Design tokens

Defined as CSS custom properties in `:root` (dark) and `[data-theme="light"]`:

| Variable | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0a0a0f` | `#f5f4f0` | Page background |
| `--surface` | `#111118` | `#eceae5` | Card backgrounds |
| `--accent` | `#f5a623` | `#b86800` | Orange highlight |
| `--accent2` | `#7c4dff` | `#4a28c4` | Purple highlight |
| `--green` | `#00d68f` | `#007a45` | Success / Easy path |
| `--muted` | `#52525e` | `#888680` | Secondary text |

## External links

- Upload app: https://beeport.ethswarm.org
- Desktop app: https://desktop.ethswarm.org
- Node funding: https://fund.ethswarm.org
- Swarm docs: https://docs.ethswarm.org
- Main site: https://ethswarm.org
