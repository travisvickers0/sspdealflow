# Shared dev environment variables for Cloud Agent / local development.
# Source this file (`source scripts/cloud-agent-env.sh`) before starting
# services or the dev server. Every value uses `${VAR:-default}` so that any
# real Secret injected into the environment always takes precedence over these
# development placeholders.

# Database. When DATABASE_URL is not provided (no Neon secret), fall back to the
# local Postgres reached through the dev WebSocket proxy (see server/db.ts).
if [ -z "${DATABASE_URL:-}" ]; then
  export DATABASE_URL='postgres://ssp:ssp@localhost:5432/sspdealflow'
  export PG_WS_PROXY="${PG_WS_PROXY:-localhost:5480/v1}"
  export SSP_USE_LOCAL_DB=1
else
  export SSP_USE_LOCAL_DB=0
fi

export PG_WS_PROXY_PORT="${PG_WS_PROXY_PORT:-5480}"

# App runtime.
export NODE_ENV="${NODE_ENV:-development}"
export PORT="${PORT:-5000}"
export SESSION_SECRET="${SESSION_SECRET:-dev-session-secret-change-me}"

# Built-in demo login (server/replitAuth.ts -> POST /api/login/simple).
export TEST_LOGIN_EMAIL="${TEST_LOGIN_EMAIL:-test@ssp.com}"
export TEST_LOGIN_PASSWORD="${TEST_LOGIN_PASSWORD:-houses}"

# Placeholders that let the app boot without the optional third-party
# integrations. Provide the real values as Secrets to enable each feature:
#   OPENAI_API_KEY        -> BPO document extraction
#   REPL_ID               -> Replit OIDC login (email/Google/GitHub/Apple)
#   GOOGLE_MAPS_API_KEY   -> property & comparable maps
export OPENAI_API_KEY="${OPENAI_API_KEY:-sk-dummy-dev-placeholder}"
export REPL_ID="${REPL_ID:-dev-repl-id}"
