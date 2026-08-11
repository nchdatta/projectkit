# Backend code style

Basic rules. This file grows — new rules get appended below, existing ones only change on explicit instruction.

## Route files

- One file per resource: `src/app/api/<resource>/route.ts` for the collection (`GET` list, `POST` create), `src/app/api/<resource>/[id]/route.ts` for a single item (`GET`, `PATCH`, `DELETE`).
- No verbs in the path — the HTTP method is the verb. `POST /api/leads`, not `POST /api/leads/create`.
- Handlers are named function declarations matching the HTTP method exactly, per the Next.js file convention — `export async function GET(request: NextRequest)`, not an arrow assigned to a const.

## Handler body order

1. Await `params` if the route is dynamic — destructure immediately: `const { id } = await params;`.
2. Parse and validate input with the resource's zod schema: `const parsed = schema.safeParse(await request.json());` → `if (!parsed.success) return failValidation(parsed.error);`.
3. Call `db` from `@/lib/db`, wrapped in `try/catch`.
4. Shape the result to match the entity in `src/services/types.ts` — never return a raw Prisma row with fields the client shouldn't see.
5. Return through an `api-response` helper.

No business logic beyond orchestration lives in the handler. A genuinely complex step gets its own named function in the same file — never a call into `src/services` (that would make the API call itself over HTTP).

## Response style

- Always the helpers in `@/lib/api-response` — `ok`, `created`, `fail`, `failValidation`, `notFound`, `unauthorized`, `forbidden`, `serverError`. Never a bare `NextResponse.json`.
- Status codes: `200` for a successful read/update/delete, `201` for create, `404` when the id doesn't resolve, `422` for a failed parse, `500` for anything unexpected caught in the `try/catch`.
- Every response carries a human-readable `message` — write one, don't rely on the helper defaults for anything client-visible.

## Errors

- Unhandled exceptions inside the handler are a bug in the handler: catch around the Prisma call specifically, not the whole function body, so a genuine programmer error still surfaces instead of being swallowed into a generic 500.
- Never leak a raw error message or stack to the client — log it, return `serverError()` with a fixed message.
