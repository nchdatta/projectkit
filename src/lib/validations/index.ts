/**
 * Zod schemas live in this directory, one module per resource
 * (`lead.ts`, `deal.ts`, …), and are re-exported here.
 *
 * Each schema is used twice:
 *  1. In the Route Handler, to parse `await request.json()` before touching the DB.
 *  2. In the form, through `@hookform/resolvers/zod`.
 *
 * That is the whole point — one declaration guards both edges, so the client
 * cannot send a shape the server rejects for a reason the form never showed.
 *
 * Schemas describe *input payloads*. Entity shapes are declared by hand in
 * `src/services/types.ts` — do not export `z.infer` entity types from here.
 */

export {};
