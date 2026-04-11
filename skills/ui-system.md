# Skill: UI System

## Use When

- building forms, tables, dialogs, dashboards, or loading states
- changing shared components
- touching visual consistency across modules

## Project Facts

- shared primitives live in `components/ui`
- cross-module components live in `components/shared`
- loading architecture is documented in `docs/SKELETON_LOADING_SYSTEM.md`
- forms use React Hook Form with Zod and Shadcn wrappers
- yellow branding remains the active visual direction

## Safe Workflow

1. look for an existing component or pattern first
2. keep module-specific behavior inside the owning module
3. use shared components only when at least two areas benefit
4. preserve loading, empty, and error states
5. verify mobile layouts

## Never Do

- invent a new form pattern when the repo already has one
- move module-specific UI into shared space without a reuse reason
- change theme behavior during unrelated tasks

## Read Next

- `docs/stack/forms.md`
- `docs/stack/shadcn.md`
- `docs/stack/tailwind.md`
- `docs/SKELETON_LOADING_SYSTEM.md`
