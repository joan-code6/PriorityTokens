param(
    [Parameter(Mandatory = $true)]
    [string]$PiHost,

    [Parameter(Mandatory = $true)]
    [string]$PiUser,

    [string]$PiDir = "~/prioritytokens-dataset",
    [string]$OutputFile = "dataset.jsonl",
    [int]$Count = 1500,
    [int]$Seed = 42,
    [int]$Concurrency = 4,
    [string]$PythonCmd = "python3",
    [switch]$CopyEnv
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Assert-CommandExists {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' not found in PATH."
    }
}

Assert-CommandExists -Name "ssh"
Assert-CommandExists -Name "scp"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$filesToCopy = @(
    "generate_dataset.py",
    "requirements.txt",
    $OutputFile
)

if ($CopyEnv) {
    $filesToCopy += ".env"
}

foreach ($file in $filesToCopy) {
    $localPath = Join-Path $scriptDir $file
    if (-not (Test-Path $localPath)) {
        throw "Missing local file: $localPath"
    }
}

$target = "$PiUser@$PiHost"

Write-Host "[1/4] Creating remote directory $PiDir"
ssh $target "mkdir -p $PiDir"

Write-Host "[2/4] Copying files"
foreach ($file in $filesToCopy) {
    $localPath = Join-Path $scriptDir $file
    Write-Host "  - $file"
    scp $localPath "$target`:$PiDir/$file" | Out-Null
}

Write-Host "[3/4] Preparing env + dependencies"
$setupCmd = @"
set -e
cd $PiDir
if [ ! -d .venv ]; then
  $PythonCmd -m venv .venv
fi
. .venv/bin/activate
pip install --upgrade pip >/dev/null
pip install -r requirements.txt >/dev/null
"@
ssh $target "bash -lc '$setupCmd'"

Write-Host "[4/4] Starting detached generator (resume-safe)"
$runCmd = @"
set -e
cd $PiDir
. .venv/bin/activate
nohup python generate_dataset.py --output $OutputFile --count $Count --seed $Seed --concurrency $Concurrency >> run.log 2>&1 < /dev/null &
echo \$! > run.pid
echo PID: \$(cat run.pid)
echo Log: $PiDir/run.log
echo Last lines:
tail -n 5 run.log || true
"@
ssh $target "bash -lc '$runCmd'"

Write-Host ""
Write-Host "Started on Raspberry Pi." -ForegroundColor Green
Write-Host "Check status: ssh $target 'bash -lc ''cd $PiDir; ps -p `$(cat run.pid) -o pid,etime,cmd'''"
Write-Host "Tail logs:    ssh $target 'bash -lc ''cd $PiDir; tail -f run.log'''"
