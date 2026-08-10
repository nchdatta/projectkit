import { z } from "zod";

/**
 * Runtime environment contract.
 *
 * Every environment variable the app reads is declared here and parsed once at
 * module load. A missing or malformed variable fails immediately with a readable
 * message instead of surfacing as `undefined` deep inside a query or request.
 *
 * Never read `process.env` directly anywhere else.
 */

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
});

/**
 * Client variables must be referenced statically so the Next.js bundler can
 * inline them. Destructuring `process.env` on the client would yield `undefined`.
 */
const clientEnvInput = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

function parse<T extends z.ZodTypeAny>(schema: T, input: unknown, scope: string): z.infer<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid ${scope} environment variables:\n${issues}`);
  }

  return result.data;
}

export const clientEnv = parse(clientSchema, clientEnvInput, "client");

/**
 * Server variables are only parsed on the server. Importing this module from a
 * Client Component still works — `serverEnv` is simply never populated there.
 */
export const serverEnv =
  typeof window === "undefined"
    ? parse(serverSchema, process.env, "server")
    : (undefined as unknown as z.infer<typeof serverSchema>);

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
export const isTest = process.env.NODE_ENV === "test";
