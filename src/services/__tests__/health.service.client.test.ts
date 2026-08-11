import { http as mswHttp, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api-error";
import { healthClientService } from "@/services/health.service.client";
import { API_URL } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";

// Reference client service test — real axios instance and interceptors, only the network is faked.
describe("healthClientService", () => {
  it("unwraps the response envelope", async () => {
    server.use(
      mswHttp.get(`${API_URL}/health`, () =>
        HttpResponse.json({
          success: true,
          status: 200,
          message: "OK",
          data: { status: "ok", database: "up", timestamp: "2026-01-01T00:00:00.000Z" },
        }),
      ),
    );

    await expect(healthClientService.get()).resolves.toEqual({
      status: "ok",
      database: "up",
      timestamp: "2026-01-01T00:00:00.000Z",
    });
  });

  it("normalizes a failure envelope into an ApiError", async () => {
    server.use(
      mswHttp.get(`${API_URL}/health`, () =>
        HttpResponse.json(
          { success: false, status: 500, message: "Database unreachable", data: null },
          { status: 500 },
        ),
      ),
    );

    await expect(healthClientService.get()).rejects.toBeInstanceOf(ApiError);
    await expect(healthClientService.get()).rejects.toMatchObject({
      message: "Database unreachable",
      status: 500,
    });
  });

  it("exposes validation problems keyed by field", async () => {
    server.use(
      mswHttp.get(`${API_URL}/health`, () =>
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

    const error = await healthClientService.get().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).isValidationError).toBe(true);
    expect((error as ApiError).errors).toEqual({ email: ["Invalid email"] });
  });
});
