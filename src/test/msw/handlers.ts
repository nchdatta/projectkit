import type { RequestHandler } from "msw";

/**
 * Handlers that apply to every test. Keep this list small — a test that needs a
 * specific response should call `server.use(...)` locally so the expectation
 * lives next to the assertion.
 */
export const handlers: RequestHandler[] = [];

export const API_URL = "http://localhost:3000/api";
