import type { RequestHandler } from "msw";

// Applies to every test; a test needing a specific response calls server.use(...) locally instead.
export const handlers: RequestHandler[] = [];

export const API_URL = "http://localhost:3000/api";
