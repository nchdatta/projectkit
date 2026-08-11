# Database code style

Basic rules. This file grows — new rules get appended below, existing ones only change on explicit instruction.

## Comments

One line, max, per comment — in `schema.prisma` and in every migration. State the non-obvious fact only (why a field exists, why a default is what it is); no multi-line essays, no restating what the Prisma syntax already says.

## Naming: snake_case fields, written directly

Field names in the Prisma schema are written in snake_case directly — the same name reaches Postgres, the generated client, and the entity built from it. No `@map` on fields.

```prisma
model LeadContact {
  id         String   @id @default(cuid())
  first_name String
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@map("lead_contacts")
}
```

Rules:

- Field names: snake_case, written as-is (`first_name`, not `firstName` + `@map("first_name")`).
- Model names: singular PascalCase (`LeadContact`), unaffected by the field convention — that's what names the TS type.
- Every model still needs `@@map("<snake_case_plural>")` for the table name: `LeadContact` → `lead_contacts`, `Deal` → `deals`. Model name is PascalCase by convention; the table it points at is not, so `@@map` still does that job.
- The Prisma Client therefore exposes snake_case properties (`healthCheck.created_at`). That's expected here — don't rename them back to camelCase in a `select`/`map` inside the handler. If a Route Handler's response needs camelCase (matching `src/services/types.ts`), that reshaping happens explicitly when building the response body, not by fighting the schema.

## Model conventions

- Model names singular PascalCase (`Lead`, not `Leads`).
- Every model: `id String @id @default(cuid())`, `created_at DateTime @default(now())`, `updated_at DateTime @updatedAt`.
- Foreign key fields end in `_id` (`lead_id`); index every foreign key.
- Enums: PascalCase type name, SCREAMING_SNAKE_CASE members — `enum LeadStatus { NEW, CONTACTED, QUALIFIED, LOST }`. Prefer an enum over a free-text status column.
- Soft delete over hard delete for CRM records: a nullable `deleted_at DateTime?`, not a Prisma `.delete()` — history matters in a CRM. Filter it out in the service layer, not with a global middleware.
- Relations: name the field after the entity, not the table (`contact Contact`, not `contact_model`); back-relations plural (`deals Deal[]`).

## Indexes

- Index every foreign key.
- Index every column a Route Handler filters or sorts by (`status`, `assigned_to_id`, `created_at` on a list endpoint).
- Composite index when two columns are always queried together, ordered by selectivity (most selective first).

## Migrations

- One migration per logical change, named descriptively in snake_case: `add_lead_status_enum`, not `update`.
- Never hand-edit a `migration.sql` that has already been applied — write a new migration.
- See `.claude/agents/data-modeler.md` and `/migrate` for the full workflow (validate → generate → print SQL → apply → regenerate client).
