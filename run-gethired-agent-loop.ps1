<#
  GetHired autonomous agent loop - runs until YOU stop it, not on a time budget.

  HOW TO STOP IT GRACEFULLY:
  Create a file named STOP_AGENT in the project root, e.g.:
      New-Item -ItemType File -Path "D:\GetHired\STOP_AGENT"
  The script checks for this BETWEEN tasks (the safe boundary the agent
  already commits at per its own safety rules) and will exit cleanly there
  rather than mid-task. This is the recommended way to stop it.

  Ctrl+C also works but is an immediate kill of whatever's running right
  now - since the agent commits after every small task, you'll lose at
  most the current in-flight increment, not prior progress. Prefer the
  STOP_AGENT file when you can.

  Either way, a summary is written to SESSION_SUMMARY.md and printed to
  the console every time the loop stops, for any reason.

  READ THIS BEFORE RUNNING UNATTENDED (unchanged from before):
  1. Run `claude` interactively once first and confirm auth/headless mode
     works (you already verified this).
  2. Flags below match `claude --help` output as of this session.
#>

$ProjectDir  = "D:\GetHired"
$PromptFile  = Join-Path $ProjectDir "AGENT_MASTER_PROMPT.md"
$StateFile   = Join-Path $ProjectDir "AGENT_STATE.md"
$StopFile    = Join-Path $ProjectDir "STOP_AGENT"
$SummaryFile = Join-Path $ProjectDir "SESSION_SUMMARY.md"
$LogDir      = Join-Path $ProjectDir "agent-logs"
$RateLimitWaitSeconds   = 3600   # recheck hourly once a limit is hit
$BetweenSessionPause    = 30     # short breather between clean sessions
$RetryOnErrorPause      = 300    # base pause before retrying after a process-level failure (backs off exponentially, capped at 1hr, never gives up)

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

# Resolve the real path to the claude command up front. On Windows, npm
# global installs typically create claude.cmd, claude.ps1, and a
# no-extension shell shim in the same folder. Start-Process can execute
# a .cmd directly but NOT a .ps1 (Windows won't run scripts via
# CreateProcess), so explicitly prefer the .cmd sibling. If only a .ps1
# turns up, fall back to invoking it through powershell.exe -File.
$ClaudeCmdInfo = Get-Command claude -All -ErrorAction SilentlyContinue
if (-not $ClaudeCmdInfo) {
    Write-Error "Could not find 'claude' on PATH. Run 'claude --version' manually to confirm it works, then re-run this script."
    exit 1
}

$ClaudeExe = $null
foreach ($c in $ClaudeCmdInfo) {
    if ($c.Source -like "*.cmd") { $ClaudeExe = $c.Source; break }
}
if (-not $ClaudeExe) {
    $first = $ClaudeCmdInfo | Select-Object -First 1
    $dir = Split-Path $first.Source -Parent
    $candidate = Join-Path $dir "claude.cmd"
    if (Test-Path $candidate) { $ClaudeExe = $candidate } else { $ClaudeExe = $first.Source }
}

$UseClaudeViaPowershell = $ClaudeExe -like "*.ps1"
if ($UseClaudeViaPowershell) {
    Write-Host "Only found a .ps1 entry point - will invoke it via powershell.exe -File."
}
Write-Host "Using claude at: $ClaudeExe"

if (-not (Test-Path $PromptFile)) {
    Write-Error "AGENT_MASTER_PROMPT.md not found at $PromptFile. Place it there before running."
    exit 1
}

function Get-Timestamp { Get-Date -Format "yyyy-MM-dd_HH-mm-ss" }

function Invoke-ClaudeSession {
    $logFile = Join-Path $LogDir "session_$(Get-Timestamp).log"
    Write-Host "[$(Get-Date)] Starting Claude Code session -> $logFile"

    # Uses --permission-mode dontAsk (the purpose-built headless flag) and
    # defines real subagents via --agents so research/build/review/verify
    # are genuinely separate agent contexts, not just prose role-switching.
    $agentsJson = '{"researcher":{"description":"Researches design questions using web search before implementation decisions are made. Reports concrete findings, not vague impressions."},"reviewer":{"description":"Reviews a diff as if it were someone elses PR: correct scope, no risk, no secrets, no destructive commands."},"verifier":{"description":"Verifies a change actually works using real evidence: build success, preview deployment status, and functional checks. Never takes success on faith."}}'

    $claudeArgs = @("-p", "--permission-mode", "auto", "--output-format", "stream-json", "--verbose", "--agents", $agentsJson, "--add-dir", "D:\web")

    if ($UseClaudeViaPowershell) {
        $proc = Start-Process -FilePath "powershell.exe" `
            -ArgumentList (@("-NoProfile", "-File", $ClaudeExe) + $claudeArgs) `
            -WorkingDirectory $ProjectDir `
            -RedirectStandardInput $PromptFile `
            -RedirectStandardOutput $logFile `
            -RedirectStandardError "$logFile.err" `
            -NoNewWindow -PassThru -Wait
    } else {
        $proc = Start-Process -FilePath $ClaudeExe `
            -ArgumentList $claudeArgs `
            -WorkingDirectory $ProjectDir `
            -RedirectStandardInput $PromptFile `
            -RedirectStandardOutput $logFile `
            -RedirectStandardError "$logFile.err" `
            -NoNewWindow -PassThru -Wait
    }

    return [pscustomobject]@{
        ExitCode = $proc.ExitCode
        LogFile  = $logFile
    }
}

function Test-RateLimitHit($logFile) {
    if (-not (Test-Path $logFile)) { return $false }
    $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return $false }
    return ($content -match "(?i)(rate.?limit|usage limit|quota exceeded|resets? at|try again (in|later))")
}

function Test-ProjectComplete {
    if (-not (Test-Path $StateFile)) { return $false }
    $state = Get-Content $StateFile -Raw
    return ($state -match "(?im)^status:\s*complete\s*$")
}

function Write-Summary($reason) {
    $summary = @()
    $summary += "# GetHired Agent - Session Summary"
    $summary += ""
    $summary += "Stopped: $(Get-Date)"
    $summary += "Reason: $reason"
    $summary += ""
    $summary += "## Current AGENT_STATE.md contents"
    $summary += ""
    if (Test-Path $StateFile) {
        $summary += (Get-Content $StateFile -Raw)
    } else {
        $summary += "(AGENT_STATE.md does not exist yet - no work has been recorded)"
    }
    $text = $summary -join "`n"
    Set-Content -Path $SummaryFile -Value $text
    Write-Host ""
    Write-Host "================ SUMMARY ================"
    Write-Host $text
    Write-Host "==========================================="
    Write-Host ""
    Write-Host "Full summary also saved to: $SummaryFile"
}

Write-Host "=== GetHired autonomous agent loop starting ==="
Write-Host "Project: $ProjectDir"
Write-Host "Logs:    $LogDir"
Write-Host "State:   $StateFile"
Write-Host ""
Write-Host "To stop gracefully: New-Item -ItemType File -Path '$StopFile'"
Write-Host "(checked between tasks, so nothing gets left half-done)"
Write-Host ""

$consecutiveFailures = 0

while ($true) {

    if (Test-Path $StopFile) {
        Remove-Item $StopFile -Force
        Write-Summary "Stop requested via STOP_AGENT file."
        break
    }

    if (Test-ProjectComplete) {
        Write-Summary "AGENT_STATE.md reports status: complete."
        break
    }

    $result = Invoke-ClaudeSession

    if (Test-RateLimitHit $result.LogFile) {
        Write-Host "[$(Get-Date)] Usage/rate limit detected. Waiting, rechecking hourly."
        $consecutiveFailures = 0
        while ($true) {
            if (Test-Path $StopFile) {
                Remove-Item $StopFile -Force
                Write-Summary "Stop requested while waiting out a rate limit."
                exit
            }
            Start-Sleep -Seconds $RateLimitWaitSeconds
            Write-Host "[$(Get-Date)] Rechecking whether the limit has reset..."
            $probe = Invoke-ClaudeSession
            if (-not (Test-RateLimitHit $probe.LogFile)) {
                Write-Host "[$(Get-Date)] Limit appears reset. Resuming main loop."
                break
            }
            Write-Host "[$(Get-Date)] Still limited. Waiting another hour."
        }
        continue
    }

    if ($result.ExitCode -ne 0) {
        $consecutiveFailures++
        # Exponential backoff, capped at 1 hour - but never gives up entirely.
        # App-level bugs are handled INSIDE the agent (see master prompt);
        # this only covers the outer Claude Code process itself failing to
        # run (crash, transient error) - those get retried indefinitely
        # rather than halting the whole system.
        $backoffSeconds = [Math]::Min($RetryOnErrorPause * [Math]::Pow(2, [Math]::Min($consecutiveFailures - 1, 5)), 3600)
        Write-Host "[$(Get-Date)] Session exited with code $($result.ExitCode) (failure $consecutiveFailures in a row)."
        Write-Host "  Check $($result.LogFile) and $($result.LogFile).err for details."
        Write-Host "  Not stopping - retrying in $([Math]::Round($backoffSeconds)) seconds. Use STOP_AGENT if this looks like a genuine dead end."
        Start-Sleep -Seconds $backoffSeconds
        continue
    }

    $consecutiveFailures = 0
    Write-Host "[$(Get-Date)] Session completed. Next cycle in $BetweenSessionPause s."
    Start-Sleep -Seconds $BetweenSessionPause
}

Write-Host ""
Write-Host "=== Loop ended. See summary above / $SummaryFile ==="