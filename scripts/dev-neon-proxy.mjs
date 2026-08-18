// Dev-only WebSocket-to-TCP proxy for the Neon serverless driver.
//
// The app connects to Postgres through `@neondatabase/serverless`, whose Pool
// speaks the Postgres wire protocol over a WebSocket. Against Neon Cloud this
// terminates at Neon's own proxy, but for local development we point the driver
// at this tiny proxy (see the PG_WS_PROXY branch in server/db.ts) which simply
// pipes the WebSocket byte stream to a plain TCP Postgres connection.
//
// This mirrors the upstream `wsproxy` contract: the client connects to
// `ws://<host>/v1?address=<pgHost>:<pgPort>` and we relay to that TCP address.
import { WebSocketServer, createWebSocketStream } from "ws";
import net from "node:net";

const PORT = parseInt(process.env.PG_WS_PROXY_PORT || "5480", 10);
// Only allow proxying to loopback Postgres to avoid turning this into an open relay.
const ALLOWED_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`[dev-neon-proxy] listening on ws://localhost:${PORT}`);
});

wss.on("connection", (ws, req) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const address = url.searchParams.get("address");
  if (!address) {
    ws.close(1008, "missing address param");
    return;
  }

  const [host, portStr] = address.split(":");
  const port = parseInt(portStr, 10);
  if (!ALLOWED_HOSTS.has(host) || !Number.isFinite(port)) {
    ws.close(1008, `disallowed address: ${address}`);
    return;
  }

  const tcp = net.connect(port, host);
  const duplex = createWebSocketStream(ws);

  const cleanup = () => {
    tcp.destroy();
    duplex.destroy();
  };

  duplex.on("error", cleanup);
  tcp.on("error", cleanup);
  duplex.pipe(tcp);
  tcp.pipe(duplex);
});

wss.on("error", (err) => {
  console.error("[dev-neon-proxy] server error:", err);
  process.exit(1);
});
