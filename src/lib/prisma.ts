import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

function buildClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set.");
  const adapter = new PrismaNeonHttp(url, {});
  return new PrismaClient({ adapter });
}

// Reuse a single client across all requests (both dev and production).
// This prevents connection exhaustion under load.
// In serverless environments the module is re-evaluated per cold start anyway.
function getClient(): PrismaClient {
  if (!global._prisma) {
    global._prisma = buildClient();
  }
  return global._prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
