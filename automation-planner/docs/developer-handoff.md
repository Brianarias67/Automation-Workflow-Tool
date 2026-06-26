# Developer Handoff Notes

This project is a static browser app. It does not require a backend, database, or build step.

## Persistence

Automation drafts are saved in browser `localStorage` under the current app storage key in `app.js`.

Important implication: saved workflows are local to the browser and device. Use `Export JSON` when a workflow needs to be handed to developers, backed up, or shared with another user.

## Main Files

- `index.html`: app entry point.
- `styles.css`: layout, canvas, inspector, and component styling.
- `app.js`: data model, workflow canvas, guided rule builder, local persistence, export, and print behavior.
- `original-starter-template.json`: backup of the current starter workflow.

## Deployment

The app can be hosted as static files from the repository root. GitHub Pages is supported through `.github/workflows/deploy-pages.yml`.

## Suggested Developer Implementation Contract

Each workflow node exports these developer-facing fields:

- `labelEs`: Spanish client-facing label.
- `backendName`: English technical name.
- `actionKey`: action category such as trigger, condition, update field, task, notify, wait, webhook, or close ticket.
- `criteria`: the trigger/condition logic.
- `fieldsUpdated`: CRM fields changed by the step.
- `ownerRule`: assignee, group, queue, role, or fallback logic.
- `sla`: timing expectation.
- `notification`: message channel, recipients, and content notes.
- `developerNotes`: implementation details, duplicate prevention, exact DGL role/group names, and unresolved assumptions.
