import { z } from 'zod';

// Every env var is declared and parsed here; never read `process.env` directly elsewhere.

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

const clientSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url('NEXT_PUBLIC_API_BASE_URL is required'),
});

// Referenced statically so the Next.js bundler can inline it on the client.
const clientEnvInput = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
};

function parse<T extends z.ZodTypeAny>(schema: T, input: unknown, scope: string): z.infer<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');

    throw new Error(`Invalid ${scope} environment variables:\n${issues}`);
  }

  return result.data;
}

export const clientEnv = parse(clientSchema, clientEnvInput, 'client');

// Parsed only on the server; importing this from a Client Component just leaves it undefined.
export const serverEnv =
  typeof window === 'undefined'
    ? parse(serverSchema, process.env, 'server')
    : (undefined as unknown as z.infer<typeof serverSchema>);

export const isDevelopment = serverEnv?.NODE_ENV === 'development';
