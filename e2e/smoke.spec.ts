import { expect, test } from "@playwright/test";

test("home page renders", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBeLessThan(400);
  await expect(page).toHaveTitle(/projectkit/i);
});

test("leads endpoint returns a paginated envelope", async ({ request }) => {
  const response = await request.get("/api/leads");

  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    success: true,
    status: 200,
    data: { items: expect.any(Array), total: expect.any(Number) },
  });
});
