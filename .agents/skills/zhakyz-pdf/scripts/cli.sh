#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export NODE_PATH="${HOME}/.npm-global/lib/node_modules:${SCRIPT_DIR}/../node_modules:${SCRIPT_DIR}/../../../node_modules:${NODE_PATH}"

node "${SCRIPT_DIR}/assemble.js" "$@"
