import { describe, expect, it } from "vitest";
import { z } from "zod";

import { fail, failValidation, ok } from "@/lib/api-response";

describe("api-response", () => {
  it("wraps success payloads in the envelope", async () => {
    const response = ok({ id: "1" });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      status: 200,
      message: "OK",
      data: { id: "1" },
    });
  });

  it("wraps failures in the envelope", async () => {
    const response = fail("Nope", 403);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      success: false,
      status: 403,
      message: "Nope",
      data: null,
    });
  });

  it("keys a zod error by dotted field path", async () => {
    const schema = z.object({ email: z.email(), profile: z.object({ age: z.number().min(18) }) });
    const parsed = schema.safeParse({ email: "not-an-email", profile: { age: 12 } });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const response = failValidation(parsed.error);
    expect(response.status).toBe(422);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.data).toBeNull();
    expect(Object.keys(body.errors ?? {})).toEqual(
      expect.arrayContaining(["email", "profile.age"]),
    );
    expect(body.errors?.["profile.age"]).toHaveLength(1);
  });
});
