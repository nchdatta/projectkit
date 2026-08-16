import { http as mswHttp, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api-error";
import { leadService } from "@/services/lead.service";
import { API_URL } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";

const lead = {
  id: "lead_1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: null,
  status: "NEW",
  source: null,
  notes: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

// Reference server service test — MSW intercepts native fetch too, no running server needed.
describe("leadService (server)", () => {
  it("unwraps the response envelope", async () => {
    server.use(
      mswHttp.get(`${API_URL}/leads`, () =>
        HttpResponse.json({
          success: true,
          status: 200,
          message: "OK",
          data: { items: [lead], total: 1, page: 1, limit: 20 },
        }),
      ),
    );

    await expect(leadService.list()).resolves.toMatchObject({ items: [lead], total: 1 });
  });

  it("sends the token it is given", async () => {
    let authorization: string | null = null;

    server.use(
      mswHttp.get(`${API_URL}/leads/${lead.id}`, ({ request }) => {
        authorization = request.headers.get("authorization");
        return HttpResponse.json({ success: true, status: 200, message: "OK", data: lead });
      }),
    );

    await leadService.get({ id: lead.id, token: "abc123" });

    expect(authorization).toBe("Bearer abc123");
  });

  it("turns a failure envelope into an ApiError", async () => {
    server.use(
      mswHttp.get(`${API_URL}/leads/${lead.id}`, () =>
        HttpResponse.json(
          { success: false, status: 404, message: "Lead not found", data: null },
          { status: 404 },
        ),
      ),
    );

    await expect(leadService.get({ id: lead.id })).rejects.toBeInstanceOf(ApiError);
    await expect(leadService.get({ id: lead.id })).rejects.toMatchObject({
      message: "Lead not found",
      status: 404,
    });
  });
});
