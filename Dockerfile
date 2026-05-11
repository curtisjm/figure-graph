# syntax=docker/dockerfile:1
#
# World of Floorcraft — development container
#
# Mirrors what flake.nix provides for the nix dev shell:
#   - Node 22 + pnpm (latest, via corepack)
#   - PostgreSQL 15 server binaries (initdb, pg_ctl, postgres — needed by
#     tests/setup/global-setup.ts, which spins up a temp instance on :5433)
#   - Python 3 with pyyaml + anthropic (for scripts/data pipeline)
#   - poppler-utils (PDF processing)
#
# Run via docker-compose; see docker-compose.yml in this directory.

FROM node:22-bookworm

ENV DEBIAN_FRONTEND=noninteractive

# System packages — keep this in one RUN to share the apt cache layer.
RUN apt-get update && apt-get install -y --no-install-recommends \
        postgresql \
        postgresql-contrib \
        python3 \
        python3-pip \
        poppler-utils \
        git \
        ca-certificates \
        curl \
        less \
        vim-tiny \
    && rm -rf /var/lib/apt/lists/*

# Python deps for the data pipeline. Debian bookworm's pip is "externally
# managed" per PEP 668; --break-system-packages is fine inside a dev container.
RUN pip3 install --break-system-packages --no-cache-dir pyyaml anthropic

# Debian installs PG server binaries (initdb, pg_ctl, postgres, psql) under
# /usr/lib/postgresql/15/bin/. The default PATH doesn't include them — fix that
# so the test harness can find them without extra config.
ENV PATH="/usr/lib/postgresql/15/bin:${PATH}"

# pnpm via corepack — Node 22 ships corepack, so this just activates it.
RUN corepack enable && corepack prepare pnpm@latest --activate

# The node:22 image ships with a `node` user at uid 1000. On most Linux hosts
# the developer is also uid 1000, so files written through the bind mount are
# owned correctly without further fuss.
USER node
WORKDIR /workspace

EXPOSE 3000

CMD ["bash"]
