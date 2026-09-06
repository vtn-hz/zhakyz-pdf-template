#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(cd "${DIR}/.." && pwd)"

echo "==> Compilando informe de ejemplo Zhakyz..."
"${SKILL_ROOT}/scripts/cli.sh" build "${DIR}/informe-estrategico.md" -o "${DIR}/informe-estrategico.pdf"

echo "==> Documento generado en: ${DIR}/informe-estrategico.pdf"
