# Global type declarations

Ambient and library-augmentation types live here — the `.d.ts` files that are not entity shapes:

- module augmentation for auth (`next-auth.d.ts`) when auth lands,
- `env.d.ts` style declarations,
- ambient declarations for untyped packages,
- global helper types shared across layers.

They are picked up automatically: `tsconfig.json` includes `**/*.ts`.

What does **not** belong here:

- **Entity shapes** — those are hand-written in `src/services/types.ts`, the client's view of an entity.
- **Input payload types** — those come from the zod schemas in `src/lib/validations`.
- **Prisma model types** — generated into `/generated/prisma`, used only inside `src/lib/db.ts` and Route Handlers.

`next-env.d.ts` stays at the project root; Next.js regenerates it there.
