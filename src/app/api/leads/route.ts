import type { NextRequest } from 'next/server';

import { created, failValidation, ok, serverError } from '@/lib/api-response';
import { db } from '@/lib/db';
import { createLeadSchema, listLeadsQuerySchema } from '@/lib/validations/lead';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = listLeadsQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return failValidation(parsed.error);

  const { page, limit, search } = parsed.data;
  const where = {
    deleted_at: null,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  try {
    const items = await db.lead.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    return ok(items);
  } catch {
    return serverError('Could not load leads');
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);

  try {
    const lead = await db.lead.create({ data: parsed.data });
    return created(lead);
  } catch {
    return serverError('Could not create lead');
  }
}
