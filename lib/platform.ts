import type { D1Database, R2Bucket } from "@cloudflare/workers-types";
// Node/Vercel uses process.env and Supabase. Vite swaps this module for Workers.
export const env: { DB?: D1Database; BUCKET?: R2Bucket; [key: string]: unknown } = {};
