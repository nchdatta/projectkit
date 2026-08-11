# Backend code style

Must-follow. Append-only — existing entries change only on explicit instruction.

## Route files

One file per resource. No verbs in the path — the HTTP method is the verb (`POST /api/items`, not `POST /api/items/create`). Handlers are named function declarations matching the method, per the Next.js file convention: `export async function GET(request: NextRequest)`.

## Handler body order

1. Await `params` if the route is dynamic, destructure immediately.
2. Validate input with the resource's zod schema; `failValidation(parsed.error)` on failure.
3. Call `db` from `@/lib/db` inside `try/catch` — wrap the DB call specifically, not the whole handler, so a genuine bug still surfaces.
4. Return through an `api-response` helper (`ok`, `created`, `fail`, `notFound`, `serverError`). Never a bare `NextResponse.json`.

Never leak a raw error message or stack to the client — log it, return `serverError()` with a fixed message. Comments are one line, max: the non-obvious why, not the what.
