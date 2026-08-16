import { failValidation, notFound, ok, serverError } from "@/lib/api-response";
import { db } from "@/lib/db";
import { updateLeadSchema } from "@/lib/validations/lead";

export async function GET(_request: Request, { params }: RouteContext<"/api/leads/[id]">) {
  const { id } = await params;

  try {
    const lead = await db.lead.findFirst({ where: { id, deleted_at: null } });
    if (!lead) return notFound("Lead");
    return ok(lead);
  } catch {
    return serverError("Could not load lead");
  }
}

export async function PATCH(request: Request, { params }: RouteContext<"/api/leads/[id]">) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateLeadSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);

  try {
    const lead = await db.lead.update({ where: { id }, data: parsed.data });
    return ok(lead);
  } catch {
    return serverError("Could not update lead");
  }
}

export async function DELETE(_request: Request, { params }: RouteContext<"/api/leads/[id]">) {
  const { id } = await params;

  try {
    const lead = await db.lead.update({ where: { id }, data: { deleted_at: new Date() } });
    return ok(lead, "Lead deleted");
  } catch {
    return serverError("Could not delete lead");
  }
}
