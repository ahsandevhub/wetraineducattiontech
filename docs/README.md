# Documentation Guide

This `docs/` folder is the durable knowledge base for both humans and AI agents.

## Start Here

Read in this order:

1. `AI_EXECUTION_FLOW.md`
2. `CRITICAL_SYSTEMS.md`
3. the relevant file in `modules/`
4. the relevant file in `stack/`
5. the deeper reference docs that remain in `product/`

## Folder Purpose

- `modules/` explains route ownership, workflows, and module boundaries for landing, education, CRM, HRM, and Store
- `product/` explains platform architecture and routing reference
- `stack/` explains framework and integration patterns

## Core Top-Level Docs

- `AI_EXECUTION_FLOW.md` for AI execution order and decision rules
- `DATABASE_RULES.md` for Supabase, migrations, and RLS safety
- `CRITICAL_SYSTEMS.md` for systems that must never regress
- `DEBUGGING.md` for investigation workflow
- `UNIFIED_AUTH_FLOW.md` for auth callback behavior
- `ARCHITECTURE_DECISION_USERS_PROFILES.md` for the core user/profile decision
- `AUTH_EMAIL_SETUP.md` and `SUPABASE_EMAIL_TEMPLATES.md` for durable auth email setup
- `MIGRATION_GUIDE.md` and `DATABASE_MIGRATION_SAFETY.md` for durable database workflow
- `HRM_CRON.md` for scheduled HRM logic
- `SKELETON_LOADING_SYSTEM.md` for shared loading-state structure

## What Not To Add Back

Avoid reintroducing docs that are only:

- task completion reports
- temporary migration notes after rollout
- visual preview docs
- one-off audits that duplicate final implementation
- generic AI prompt templates
- broad product-planning docs that do not help contributors navigate the codebase
