# Vue Scaffold

`vue-scaffold` is a monorepo starter extracted from the current IAM admin project.

## Workspace

```text
vue-scaffold/
  apps/
    admin/
  packages/
    api/
    constants/
    config/
    directives/
    styles/
    types/
    ui/
    utils/
```

## Migrated capabilities

- `apps/admin` for the desktop admin app
- `packages/ui` for shared UI wrappers
- `packages/utils`, `packages/directives`, `packages/constants`, and `packages/types` for shared foundations
- `packages/api` for request infrastructure
- `packages/styles` for global styling

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
```
