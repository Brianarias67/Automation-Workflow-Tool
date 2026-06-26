# DGL Automation Planner

A static browser-based planner for Dynalogics DGL Business Suite CRM automations.

The app helps business users visually plan CRM automations, document bilingual client/developer specs, and export implementation-ready JSON or PDF-style summaries for developers.

## Features

- Folder-based automation organization.
- Figma-style workflow canvas with draggable nodes.
- Preset actions: trigger, condition, assign owner, move stage, create task, notify, wait, update field, webhook, and close ticket.
- Guided rule builder for common `IF field equals value` and `IF time elapsed >= X` criteria.
- SLA presets for `Immediate`, `24 hours`, `48 hours`, and `72 hours`.
- Bilingual handoff fields: Spanish client labels plus English/backend technical names.
- Collapsible Step Spec panel.
- Canvas horizontal scrolling and automatic resize when the Step Spec panel is collapsed or expanded.
- Browser `localStorage` autosave.
- `Export JSON`, `Copy spec`, and `Print / PDF`.
- Starter workflow restore and backup JSON.

## Quick Start

Open `index.html` directly in a browser.

For a local preview server:

```bash
npm run serve
```

Then open:

```text
http://localhost:4173
```

No build step is required.

## Project Structure

```text
.
├── index.html
├── app.js
├── styles.css
├── original-starter-template.json
├── design-concept.png
├── docs/
│   └── developer-handoff.md
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
├── CHANGELOG.md
├── package.json
└── README.md
```

## Usage

- Select automation folders from the left sidebar. Empty folders show an empty canvas instead of another folder's workflow.
- Click `+ New automation` to create a draft in the selected folder.
- Click a node to edit its Spanish client label and English/backend developer spec.
- Use the guided rule builder to create common field or time-elapsed criteria.
- Use SLA presets to avoid typing inconsistent timing values.
- Drag nodes on the canvas to reorganize the flow.
- Click `Save automation` to save the current draft into the selected folder and update the folder count.
- Use preset actions to add automation steps.
- Use `+ Branch` to add a condition with yes/no paths.
- Use `Export JSON` for a developer-readable structured handoff.
- Use `Print / PDF` and choose `Save as PDF` from the browser print dialog.
- Use `Restore starter template` to revert the autosaved browser diagram back to the original workflow.
- Use `Collapse` in the Step Spec panel to hide the right-side fields while working on the diagram.

## Current Folder Model

- `Servicio al Cliente / Pipeline`: general automations that apply to every ticket in the CS pipeline.
- `Servicio al Cliente / Tipos de Caso`: reserved for later ticket-type-specific automations.
- `Servicio al Cliente / SLA y Escalaciones`: reserved for later SLA-specific rules if they need to be separated.
- `Ventas`, `Finanzas`, `Operaciones`, and `Recursos Humanos`: placeholder folders for future departments.

## Current Starter Workflow

The current starter workflow is `CS Pipeline - Reglas Generales`. It captures:

- All new CS pipeline tickets default to low priority.
- `Solicitud de devolucion` changes priority to medium.
- `Status de Factura / NC`, pricing errors, and product errors change priority to high.
- Tickets moved to `Pendiente por Almacen` notify the `Almacen` user group.
- Tickets moved to `Pendiente por Contabilidad` notify the accounting user group.
- Tickets in `En espera / Por Nosotros` for over 24 hours create a follow-up task for the group supervisor.
- Tickets in `En Espera / Por Cliente` for over 24 hours create a customer follow-up call/email task for the ticket creator.
- Tickets moved to `Escalado / En Revision` create a supervisor review task due within 48 hours.

## Data and Persistence

The app stores saved drafts in browser `localStorage`.

That means saved automations are local to the browser and device. Use `Export JSON` to back up a workflow, share it with developers, or move it between browsers.

The current starter workflow is also saved as `original-starter-template.json`.

## GitHub Pages Deployment

This repo includes a GitHub Actions workflow at:

```text
.github/workflows/deploy-pages.yml
```

To deploy:

1. Push this folder as a GitHub repository.
2. In GitHub, go to `Settings` -> `Pages`.
3. Set the source to `GitHub Actions`.
4. Push to the `main` branch.

The workflow deploys the static site from the repository root.

## Development

Run a syntax check:

```bash
npm run check
```

Preview locally:

```bash
npm run serve
```

## License

This project is currently marked `UNLICENSED` in `package.json`. Add a license before publishing publicly if you want others to reuse or modify it.
