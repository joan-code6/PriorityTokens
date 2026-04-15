#!/usr/bin/env bash
set -euo pipefail

# Runs generate_dataset.py detached via nohup so it keeps running after logout.
# Safe to run multiple times: it resumes from existing output lines.

COUNT="${COUNT:-1500}"
SEED="${SEED:-42}"
CONCURRENCY="${CONCURRENCY:-8}"
OUTPUT="${OUTPUT:-dataset.jsonl}"
PYTHON_CMD="${PYTHON_CMD:-python3}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ -f run.pid ]]; then
  OLD_PID="$(cat run.pid || true)"
  if [[ -n "${OLD_PID}" ]] && kill -0 "${OLD_PID}" 2>/dev/null; then
    echo "A generator process is already running (PID ${OLD_PID})."
    echo "Tail logs: tail -f run.log"
    exit 0
  fi
fi

if [[ ! -d .venv ]]; then
  "${PYTHON_CMD}" -m venv .venv
fi

# shellcheck disable=SC1091
source .venv/bin/activate
python -m pip install --upgrade pip >/dev/null
python -m pip install -r requirements.txt >/dev/null

nohup python generate_dataset.py \
  --output "${OUTPUT}" \
  --count "${COUNT}" \
  --seed "${SEED}" \
  --concurrency "${CONCURRENCY}" \
  >> run.log 2>&1 < /dev/null &

echo $! > run.pid

echo "Started generate_dataset.py in background"
echo "PID: $(cat run.pid)"
echo "Log: ${SCRIPT_DIR}/run.log"
echo "Output: ${SCRIPT_DIR}/${OUTPUT}"
echo "Status: ps -p $(cat run.pid) -o pid,etime,cmd"
echo "Follow logs: tail -f run.log"
