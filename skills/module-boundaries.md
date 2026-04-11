# Skill: Module Boundaries

## Use When

- a feature touches business logic
- a change crosses landing, education, CRM, and HRM areas
- there is risk of mixing responsibilities

## Boundaries

- `/(landing)` handles marketing, discovery, and public conversion
- `/dashboard/customer` handles Education customer operations
- `/dashboard/crm` handles lead, request, and sales workflows
- `/dashboard/hrm` handles employee, KPI, and HR workflows

## Shared Concerns

- authentication
- role resolution
- shared UI primitives
- shared infrastructure and utilities

Shared concern does not mean shared business logic.

## Safe Workflow

1. identify the owning module first
2. keep module data in its own tables and actions
3. route users according to the existing priority rules
4. document genuine cross-module integration points
5. avoid "quick fixes" that couple one module to another

## Read Next

- `docs/modules/landing.md`
- `docs/modules/education.md`
- `docs/modules/crm.md`
- `docs/modules/hrm.md`
- `docs/modules/shared-systems.md`
- `docs/product/module-map.md`
