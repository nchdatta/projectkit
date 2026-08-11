# Backend code style

Essential, must-follow. This file grows — new rules get appended below, existing ones only change on explicit instruction.

## Comments

One line, max. State the non-obvious why, not the what.

## Route files

One file per resource. No verbs in the path — the HTTP method is the verb (`POST /api/leads`, not `POST /api/leads/create`). Handlers are named function declarations matching the HTTP method, per the Next.js file convention: `export async function GET(request: NextRequest)`.

## Handler body order

1. Await `params` if the route is dynamic, destructure immediately.
2. Validate input with the resource's zod schema; return `failValidation(parsed.error)` on failure.
3. Call `db` from `@/lib/db`, wrapped in `try/catch` — catch around the DB call specifically, not the whole handler, so a genuine bug still surfaces.
4. Return through an `api-response` helper — `ok`, `created`, `fail`, `notFound`, `serverError`. Never a bare `NextResponse.json`.

## Errors

Never leak a raw error message or stack to the client. Log it, return `serverError()` with a fixed message.
