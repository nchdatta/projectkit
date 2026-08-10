import { http as mswHttp, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api-error";
import { healthService } from "@/services/health.service";
import { API_URL } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";

/**
 * Reference **server** service test. Same MSW setup as the client test — MSW
 * intercepts native `fetch` too — so `request` from `@/lib/fetcher` and its
 * error handling are
 * covered without a running server.
 */
describe("healthService (server)", () => {
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

    await expect(healthService.get()).resolves.toMatchObject({ status: "ok", database: "up" });
  });

  it("sends the token it is given", async () => {
    let authorization: string | null = null;

    server.use(
      mswHttp.get(`${API_URL}/health`, ({ request }) => {
        authorization = request.headers.get("authorization");
        return HttpResponse.json({
          success: true,
          status: 200,
          message: "OK",
          data: { status: "ok", database: "up", timestamp: "2026-01-01T00:00:00.000Z" },
        });
      }),
    );

    await healthService.get({ token: "abc123" });

    expect(authorization).toBe("Bearer abc123");
  });

  it("turns a failure envelope into an ApiError", async () => {
    server.use(
      mswHttp.get(`${API_URL}/health`, () =>
        HttpResponse.json(
          { success: false, status: 503, message: "Database unreachable", data: null },
          { status: 503 },
        ),
      ),
    );

    await expect(healthService.get()).rejects.toBeInstanceOf(ApiError);
    await expect(healthService.get()).rejects.toMatchObject({
      message: "Database unreachable",
      status: 503,
    });
  });
});
