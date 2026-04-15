#!/usr/bin/env bash
set -euo pipefail

# Runs generate_dataset.py detached via nohup so it keeps running after logout.
# Safe to run multiple times: it resumes from existing output lines.

COUNT="${COUNT:-1500}"
SEED="${SEED:-42}"
CONCURRENCY="${CONCURRENCY:-8}"
OUTPUT="${OUTPUT:-dataset.jsonl}"
PYTHON_CMD="${PYTHON_CMD:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ -z "${PYTHON_CMD}" ]]; then
  if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
  elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
  else
    echo "No Python interpreter found (tried: python3, python)."
    echo "Install Python 3 + venv, then rerun."
    exit 1
  fi
fi

if ! command -v "${PYTHON_CMD}" >/dev/null 2>&1; then
  echo "Configured interpreter '${PYTHON_CMD}' not found in PATH."
  exit 1
fi

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

PID="$!"
echo "${PID}" > run.pid

# Detect immediate startup failures so the script does not report false success.
sleep 1
if ! kill -0 "${PID}" 2>/dev/null; then
  echo "Generator failed to start. Last log lines:"
  tail -n 30 run.log || true
  rm -f run.pid
  exit 1
fi

echo "Started generate_dataset.py in background"
echo "PID: $(cat run.pid)"
echo "Log: ${SCRIPT_DIR}/run.log"
echo "Output: ${SCRIPT_DIR}/${OUTPUT}"
echo "Status: ps -p $(cat run.pid) -o pid,etime,cmd"
echo "Follow logs: tail -f run.log"
