# Database code style

Must-follow. Append-only — existing entries change only on explicit instruction.

## Naming: snake_case fields, written directly

Field names are snake_case in the schema — no `@map` on fields. Every model needs `@@map("<snake_case_plural>")` for the table name.

```prisma
model LeadContact {
  id         String   @id @default(cuid())
  first_name String
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@map("lead_contacts")
}
```

## Model conventions

- Model names singular PascalCase (`Lead`, not `Leads`).
- Every model carries `id`, `created_at`, `updated_at` as shown above.
- Prefer an enum over a free-text status column.
- Soft delete for CRM records — a nullable `deleted_at`, never a hard `.delete()`. History matters.
- Index every foreign key, and every column a Route Handler filters or sorts by.

## Migrations

One migration per logical change, never hand-edit one that's already applied. Full workflow: `.claude/agents/data-modeler.md` / `/migrate`. Comments are one line, max — in `schema.prisma` and in every migration.
