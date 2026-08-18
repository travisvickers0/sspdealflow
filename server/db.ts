import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Local development against a plain (non-Neon) Postgres. When PG_WS_PROXY is set
// (e.g. Cloud Agent / local dev), route the driver's WebSocket transport through
// a self-hosted proxy that pipes to TCP Postgres. Unset in production/Replit, so
// the default Neon Cloud behavior is preserved.
if (process.env.PG_WS_PROXY) {
  neonConfig.wsProxy = process.env.PG_WS_PROXY;
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineConnect = false;
  neonConfig.pipelineTLS = false;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
