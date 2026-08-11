---
name: feature-plan
description: Plan and document a new feature or a change to existing functionality — inspects the codebase, then writes docs/<feature>/brief.md and plan.md. Use when the user describes something to build or change and wants it thought through and written down before implementation, or says "plan this", "write a brief", "spec this out".
---

# Feature and change planning

You are an engineering partner here, not a requirements form. Three inputs from the user, everything else you work out from the codebase.

## 1. Inputs

You need **Title**, **Type** (New Feature / Enhancement / Change / Bug Fix / Refactor), and **Brief**.

Most requests already carry all three. Extract what is there, then ask only for what is genuinely missing — one short question, all gaps at once. Never re-ask for something the user already told you, and never open with a questionnaire. If the type is obvious from the wording ("fix", "rename", "add a screen"), infer it; state your inference rather than asking.

## 2. Investigate before writing anything

Read the code. A plan that does not name real files is worthless.

- What exists today in this area, and where — routes, handlers, services, hooks, components, models.
- What already does part of this job and can be reused or extended. Prefer that over new code.
- What conventions the neighbouring code follows (`AGENTS.md`, `.claude/rules/*.md`).
- Where the change lands in the layering contract, and which layers it does **not** touch.

## 3. Think, then say so

Before writing files, tell the user in a few lines what you found and what you would change about their request. This is the part that earns the skill its keep:

- A simpler approach the codebase suggests.
- Existing code they may not know about.
- Logic that would be duplicated, and what to extract instead.
- Edge cases, validation gaps, permission or performance implications.
- Ambiguity or a conflict with an existing rule or behaviour.

Ask a follow-up **only** if the answer would change the design. Otherwise state an assumption and carry on — assumptions go in the plan where they can be corrected.

Do not blindly encode the request if the codebase reveals a better path. Say what you would do differently and why, then plan the version you would defend.

## 4. Write the docs

`docs/<feature-slug>/` — kebab-case from the title, stable across updates. If a folder for this work already exists, **update it in place**; never create `feature-v2/`. When updating, preserve decisions still standing and revise what changed.

### brief.md — short, product-level, no implementation detail

```md
# <Title>

## Type

<New Feature | Enhancement | Change | Bug Fix | Refactor>

## Brief

<Concise what and why, 2-4 sentences>

## Expected

<The observable outcome — what a user or caller can do that they could not before>
```

Derive **Expected** yourself from the brief and the code.

### plan.md — detailed, specific, real paths

Include only sections that apply, and omit the rest — no "N/A" headings. Cover, where relevant:

- **Current implementation** — what exists now, with `path:line` references.
- **Proposed approach** — the design, and why this one over the alternative you rejected.
- **Affected files** — per layer, marked new or modified.
- **Database** — model, fields, enum, index, migration name.
- **API** — route, method, request/response shape, zod schema, status codes.
- **Client data layer** — entity type, both services, query keys, hooks.
- **UI** — components by area (`dashboard/` or `storefront/`), state, loading and error handling.
- **Validation** — the schema, and both edges it guards.
- **Edge cases** — empty, concurrent, unauthorized, deleted, oversized, offline.
- **Testing** — MSW service tests, component tests, the e2e flow.
- **Migration and rollout** — data backfill, destructive SQL, ordering constraints.
- **Assumptions and open questions** — anything you inferred that a reader should confirm.
- **Implementation steps** — ordered, each step small enough to verify, following the layering contract's order.

Reference real files, components, services, and patterns from this project. A step that could be pasted into any repo is not a plan.

## 5. Hand off

End with a one-line summary and the two paths. Implement only if the user asks — `/feature` or `/endpoint` runs the build against this plan.

Once implementation lands, update `plan.md` so it describes what was actually built. A plan that disagrees with the code is worse than no plan.
