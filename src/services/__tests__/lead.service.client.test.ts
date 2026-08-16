import { http as mswHttp, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api-error";
import { leadClientService } from "@/services/lead.service.client";
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

// Reference client service test — real axios instance and interceptors, only the network is faked.
describe("leadClientService", () => {
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

    await expect(leadClientService.list()).resolves.toEqual({
      items: [lead],
      total: 1,
      page: 1,
      limit: 20,
    });
  });

  it("posts a new lead and returns it", async () => {
    server.use(
      mswHttp.post(`${API_URL}/leads`, () =>
        HttpResponse.json(
          { success: true, status: 201, message: "Created", data: lead },
          { status: 201 },
        ),
      ),
    );

    await expect(leadClientService.create({ name: lead.name, email: lead.email })).resolves.toEqual(
      lead,
    );
  });

  it("normalizes a failure envelope into an ApiError", async () => {
    server.use(
      mswHttp.get(`${API_URL}/leads/${lead.id}`, () =>
        HttpResponse.json(
          { success: false, status: 404, message: "Lead not found", data: null },
          { status: 404 },
        ),
      ),
    );

    await expect(leadClientService.get(lead.id)).rejects.toBeInstanceOf(ApiError);
    await expect(leadClientService.get(lead.id)).rejects.toMatchObject({
      message: "Lead not found",
      status: 404,
    });
  });

  it("exposes validation problems keyed by field", async () => {
    server.use(
      mswHttp.post(`${API_URL}/leads`, () =>
        HttpResponse.json(
          {
            success: false,
            status: 422,
            message: "Validation failed",
            data: null,
            errors: { email: ["Invalid email"] },
          },
          { status: 422 },
        ),
      ),
    );

    const error = await leadClientService
      .create({ name: lead.name, email: "not-an-email" })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).isValidationError).toBe(true);
    expect((error as ApiError).errors).toEqual({ email: ["Invalid email"] });
  });
});
