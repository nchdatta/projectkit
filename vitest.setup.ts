import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "@/test/msw/server";

/**
 * Services talk HTTP, so tests intercept HTTP with MSW rather than mocking axios
 * internals — the interceptors in `src/lib/http.ts` stay under test.
 *
 * `onUnhandledRequest: "error"` makes a forgotten handler fail loudly instead of
 * hanging until the axios timeout.
 */
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => server.close());
