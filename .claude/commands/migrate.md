---
description: Change the Prisma schema and produce a reviewed migration
argument-hint: <schema change description>
---

Schema change requested: **$ARGUMENTS**

Delegate to the `data-modeler` agent, then confirm its work.

1. Read `prisma/schema.prisma` as it stands.
2. Apply the change following `.claude/rules/database.md` — read it, every convention there is binding.
3. `npx prisma validate && npx prisma format`.
4. `npm run db:migrate -- --name <short_snake_case_name>` — writes and applies the migration against `flowly_dev`.
5. **Print the generated SQL** from `prisma/migrations/<timestamp>_<name>/migration.sql`. Call out anything destructive: dropped columns, narrowed types, new `NOT NULL` on an existing table.
6. `npm run db:generate`, then `npm run typecheck`.

Hard stops:

- Never run `db:reset` or `prisma migrate reset` — it drops all data. If Prisma says a reset is required, stop, explain why, and let the user decide.
- Never edit a migration that has already been applied. Write a new one.

Finish by naming the entity fields the service layer should now declare in `src/services/types.ts`.
