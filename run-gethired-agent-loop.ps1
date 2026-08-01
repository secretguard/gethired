<#
  GetHired autonomous agent loop - runs until YOU stop it, not on a time budget.

  HOW TO STOP IT GRACEFULLY:
  Create a file named STOP_AGENT in the project root, e.g.:
      New-Item -ItemType File -Path "D:\GetHired\STOP_AGENT"
  Checked between tasks and while waiting, never mid-task.

  Every 15 minutes (and immediately at startup), it prints a plain-
  language progress update - what's been done, not filenames/commands.

  A hard cumulative spend cap stops the loop automatically once reached.
  This tracking is BEST-EFFORT, parsed from Claude Code's own reported
  cost per session. Anthropic's Console (console.anthropic.com) supports
  a real, server-enforced spend limit - set one there too as the
  authoritative backstop, not just this script's number.

  Either way it stops, a full summary (progress, cost, tokens, agents
  used, and why it stopped) is written to SESSION_SUMMARY.md and printed.
#>

$ProjectDir  = "D:\GetHired"
$PromptFile  = Join-Path $ProjectDir "AGENT_MASTER_PROMPT.md"
$StateFile   = Join-Path $ProjectDir "AGENT_STATE.md"
$StopFile    = Join-Path $ProjectDir "STOP_AGENT"
$SummaryFile = Join-Path $ProjectDir "SESSION_SUMMARY.md"
$LogDir      = Join-Path $ProjectDir "agent-logs"
$TotalsFile  = Join-Path $LogDir "usage_totals.json"

$RateLimitWaitSeconds   = 1800    # recheck every 30 min once a limit is hit (was 1hr)
$BetweenSessionPause    = 30
$RetryOnErrorPause      = 300
$ProgressIntervalSec    = 900     # 15 minutes
$PollIntervalSec        = 20      # how often we check on a running session
$MaxTotalCostUsd        = 10.0    # hard cumulative cap - loop stops, does not exceed

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

# --- resolve claude executable (from earlier fixes) ---
$ClaudeCmdInfo = Get-Command claude -All -ErrorAction SilentlyContinue
if (-not $ClaudeCmdInfo) {
    Write-Error "Could not find 'claude' on PATH."
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
Write-Host "Using claude at: $ClaudeExe"

if (-not (Test-Path $PromptFile)) {
    Write-Error "AGENT_MASTER_PROMPT.md not found at $PromptFile."
    exit 1
}

function Get-Timestamp { Get-Date -Format "yyyy-MM-dd_HH-mm-ss" }

# --- cumulative usage tracking ---
function Get-Totals {
    if (Test-Path $TotalsFile) {
        try {
            $t = (Get-Content $TotalsFile -Raw | ConvertFrom-Json)
            # Backward compat: older totals files from before overage
            # tracking existed won't have this field.
            if (-not (Get-Member -InputObject $t -Name "overageCostUsd" -MemberType Properties)) {
                $t | Add-Member -NotePropertyName "overageCostUsd" -NotePropertyValue 0.0
            }
            return $t
        } catch { }
    }
    return [pscustomobject]@{
        totalCostUsd      = 0.0
        overageCostUsd    = 0.0
        totalInputTokens  = 0
        totalOutputTokens = 0
        sessionCount      = 0
        subagentSpawns    = @()
    }
}

function Save-Totals($totals) {
    $totals | ConvertTo-Json -Depth 5 | Set-Content -Path $TotalsFile
}

# Parses a session's stream-json log for cost/token/subagent data.
# Best-effort: field names confirmed from a real observed log
# (total_cost_usd, usage.input_tokens, usage.output_tokens), but Claude
# Code's output format can change between versions - if parsing finds
# nothing, we log that plainly rather than silently assuming zero cost.
function Update-TotalsFromSession($logFile) {
    $totals = Get-Totals
    if (-not (Test-Path $logFile)) { return $totals }
    $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return $totals }

    $sessionCost = 0.0
    $costMatches = [regex]::Matches($content, '"total_cost_usd":([\d.]+)')
    # Take the MAXIMUM value seen, not the last one. Subagents (Researcher,
    # etc.) are themselves mini-sessions that can emit their own smaller
    # "total_cost_usd" result line, and that can land AFTER the main
    # session's own final result in the raw log depending on completion
    # order - taking "last" grabbed a subagent's partial cost instead of
    # the true session total in a real run, undercounting badly ($51.65
    # actual spend vs a $10 cap that should have stopped it). The main
    # session's total should always be >= any individual subagent's cost
    # since subagent cost is normally folded into it, so MAX is the safer
    # choice regardless of ordering.
    foreach ($m in $costMatches) {
        $v = [double]$m.Groups[1].Value
        if ($v -gt $sessionCost) { $sessionCost = $v }
    }

    $inTok = 0; $outTok = 0
    $inMatches = [regex]::Matches($content, '"input_tokens":(\d+)')
    foreach ($m in $inMatches) { $inTok += [int]$m.Groups[1].Value }
    $outMatches = [regex]::Matches($content, '"output_tokens":(\d+)')
    foreach ($m in $outMatches) { $outTok += [int]$m.Groups[1].Value }

    # Second real miss on generic "Task" - the custom agents defined via
    # --agents (researcher/reviewer/verifier) are most likely invoked by
    # their own names as tool calls, not a generic "Task" wrapper. Match
    # any of the actual names defined, plus keep "Task" as a fallback in
    # case a future built-in subagent mechanism does use that name.
    $agentNamePattern = '"name":"(researcher|reviewer|verifier|Task)"'
    $taskNameMatches = [regex]::Matches($content, $agentNamePattern)
    $taskDescMatches = [regex]::Matches($content, '"description":"([^"]{1,120})"[^}]*?' + $agentNamePattern)
    $spawns = @()
    foreach ($m in $taskDescMatches) { $spawns += $m.Groups[1].Value }
    # If we got a count but couldn't extract descriptions, still record the count.
    if ($spawns.Count -eq 0 -and $taskNameMatches.Count -gt 0) {
        foreach ($m in $taskNameMatches) { $spawns += "($($m.Groups[1].Value) - purpose not captured)" }
    }

    if ($costMatches.Count -eq 0) {
        Write-Host "[$(Get-Date)] Note: could not find a cost figure in this session's log - totals may be undercounted. Check console.anthropic.com for the real number."
    }

    $isOverage = ($content -match '"isUsingOverage":true')

    $totals.totalCostUsd = [Math]::Round($totals.totalCostUsd + $sessionCost, 4)
    $totals.totalInputTokens += $inTok
    $totals.totalOutputTokens += $outTok
    $totals.sessionCount += 1
    if ($spawns.Count -gt 0) {
        $totals.subagentSpawns = @($totals.subagentSpawns) + $spawns
    }

    # Only count toward the actual $10 cap once this session shows real
    # evidence of drawing on paid overage/credits, not just subscription-
    # included usage. On a Pro plan, included usage doesn't cost anything
    # extra - it would be wrong to stop the loop over notional cost that
    # was fully covered by the subscription. If a session shows overage,
    # count its FULL cost toward the cap (approximate - we can't split a
    # single session's cost precisely between included and overage, but
    # this errs toward being conservative rather than under-capping again).
    if ($isOverage) {
        $totals.overageCostUsd = [Math]::Round($totals.overageCostUsd + $sessionCost, 4)
        Write-Host "[$(Get-Date)] This session drew on paid overage/credits (not just included Pro usage)."
    }

    Save-Totals $totals
    Write-Host "[$(Get-Date)] This session cost approx `$$([Math]::Round($sessionCost,2)) USD (notional). Overage/credit spend counted toward cap: `$$($totals.overageCostUsd) of `$$MaxTotalCostUsd."
    return $totals
}

# --- plain-language progress, not filenames/commands ---
function Show-Progress {
    $totals = Get-Totals
    Write-Host ""
    Write-Host "---- Progress update ($(Get-Date)) ----"
    if (Test-Path $StateFile) {
        $state = Get-Content $StateFile -Raw
        $doneCount = ([regex]::Matches($state, '(?m)^\s*-\s*\[x\]', 'IgnoreCase')).Count
        $todoCount = ([regex]::Matches($state, '(?m)^\s*-\s*\[ \]')).Count
        Write-Host "Backlog: $doneCount done, $todoCount still open."
        $logMatch = [regex]::Match($state, '(?s)## Session log\s*\n(.*)$')
        if ($logMatch.Success) {
            $recent = $logMatch.Groups[1].Value.Trim()
            if ($recent.Length -gt 600) { $recent = $recent.Substring($recent.Length - 600) }
            if ($recent) {
                Write-Host "Most recent update from the agent:"
                Write-Host $recent
            }
        }
    } else {
        Write-Host "No work recorded yet - first session hasn't reported in."
    }
    Write-Host "Notional usage so far: `$$($totals.totalCostUsd) total (most likely covered by Pro's included quota). Overage/credit spend counted toward cap: `$$($totals.overageCostUsd) of `$$MaxTotalCostUsd, across $($totals.sessionCount) session(s)."
    Write-Host "----------------------------------------"
    Write-Host ""
}

function Invoke-ClaudeSession {
    $logFile = Join-Path $LogDir "session_$(Get-Timestamp).log"
    Write-Host "[$(Get-Date)] Starting a new work session..."

    $agentsJson = '{"researcher":{"description":"Researches design questions using web search before implementation decisions are made. Reports concrete findings, not vague impressions."},"reviewer":{"description":"Reviews a diff as if it were someone elses PR: correct scope, no risk, no secrets, no destructive commands."},"verifier":{"description":"Verifies a change actually works using real evidence: build success, preview deployment status, and functional checks. Never takes success on faith."}}'
    $claudeArgs = @("-p", "--permission-mode", "auto", "--output-format", "stream-json", "--verbose", "--agents", $agentsJson, "--add-dir", "D:\web")

    if ($UseClaudeViaPowershell) {
        $proc = Start-Process -FilePath "powershell.exe" `
            -ArgumentList (@("-NoProfile", "-File", $ClaudeExe) + $claudeArgs) `
            -WorkingDirectory $ProjectDir -RedirectStandardInput $PromptFile `
            -RedirectStandardOutput $logFile -RedirectStandardError "$logFile.err" `
            -NoNewWindow -PassThru
    } else {
        $proc = Start-Process -FilePath $ClaudeExe `
            -ArgumentList $claudeArgs `
            -WorkingDirectory $ProjectDir -RedirectStandardInput $PromptFile `
            -RedirectStandardOutput $logFile -RedirectStandardError "$logFile.err" `
            -NoNewWindow -PassThru
    }

    # Poll instead of blocking with -Wait, so we can print progress
    # updates every 15 minutes even while a single session is still
    # mid-flight (a research+build+verify cycle can genuinely take a while).
    $lastProgress = Get-Date
    while (-not $proc.HasExited) {
        Start-Sleep -Seconds $PollIntervalSec
        if (((Get-Date) - $lastProgress).TotalSeconds -ge $ProgressIntervalSec) {
            Show-Progress
            $lastProgress = Get-Date
        }
        if (Test-Path $StopFile) {
            Write-Host "[$(Get-Date)] Stop requested mid-session - letting the current step finish, then stopping."
        }
    }

    return [pscustomobject]@{ ExitCode = $proc.ExitCode; LogFile = $logFile }
}

function Test-RateLimitHit($logFile) {
    if (-not (Test-Path $logFile)) { return $false }
    $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return $false }
    return ($content -match "(?i)(rate.?limit|usage limit|quota exceeded|resets? at|try again (in|later))")
}

# Claude Code emits real-time "rate_limit_event" lines with a precise
# utilization figure (0.0-1.0) and a resetsAt unix timestamp - confirmed
# from a live session log. This lets us pause proactively near the limit
# instead of only reacting after an outright failure.
function Get-RateLimitStatus($logFile) {
    $result = [pscustomobject]@{ NearLimit = $false; Utilization = 0.0; ResetsAt = $null; IsUsingOverage = $false }
    if (-not (Test-Path $logFile)) { return $result }
    $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return $result }

    $matches = [regex]::Matches($content, '"rate_limit_event"[^}]*?"utilization":([\d.]+)[^}]*?"resetsAt":(\d+)')
    if ($matches.Count -gt 0) {
        $last = $matches[$matches.Count - 1]
        $util = [double]$last.Groups[1].Value
        $resetsAtEpoch = [long]$last.Groups[2].Value
        $result.Utilization = $util
        $result.ResetsAt = [DateTimeOffset]::FromUnixTimeSeconds($resetsAtEpoch).LocalDateTime
        $result.NearLimit = ($util -ge 0.9)
    }

    # Whether this session ever actually drew on paid overage/credits, as
    # opposed to staying within the Pro subscription's included usage.
    # total_cost_usd is a notional list-price figure regardless of which
    # of those two it was - this flag is what actually matters for a
    # dollar cap on a subscription account.
    if ($content -match '"isUsingOverage":true') {
        $result.IsUsingOverage = $true
    }

    return $result
}

function Test-ProjectComplete {
    if (-not (Test-Path $StateFile)) { return $false }
    $state = Get-Content $StateFile -Raw
    return ($state -match "(?im)^status:\s*complete\s*$")
}

function Write-Summary($reason) {
    $totals = Get-Totals
    $summary = @()
    $summary += "# GetHired Agent - Session Summary"
    $summary += ""
    $summary += "Stopped: $(Get-Date)"
    $summary += "Reason: $reason"
    $summary += ""
    $summary += "## Usage (best-effort - verify actual spend at console.anthropic.com)"
    $summary += "- Total sessions run: $($totals.sessionCount)"
    $summary += "- Total notional usage: `$$($totals.totalCostUsd) USD (list-price equivalent - most likely covered by your Pro subscription's included quota, not actual extra spend)"
    $summary += "- Overage/credit spend counted toward the `$$MaxTotalCostUsd cap: `$$($totals.overageCostUsd) USD (this only accrues once a session shows real evidence of drawing on paid overage/credits beyond included usage)"
    $summary += "- Total input tokens: $($totals.totalInputTokens)"
    $summary += "- Total output tokens: $($totals.totalOutputTokens)"
    $summary += "- Subagent invocations observed: $($totals.subagentSpawns.Count)"
    if ($totals.subagentSpawns.Count -gt 0) {
        $summary += "  Purposes:"
        foreach ($s in ($totals.subagentSpawns | Select-Object -Unique)) { $summary += "  - $s" }
    }
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
Write-Host "Spend cap: `$$MaxTotalCostUsd USD (best-effort tracking - also set a real limit at console.anthropic.com)"
Write-Host ""
Write-Host "To stop gracefully: New-Item -ItemType File -Path '$StopFile'"
Write-Host ""

Show-Progress

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

    $currentTotals = Get-Totals
    if ($currentTotals.overageCostUsd -ge $MaxTotalCostUsd) {
        Write-Summary "Stopped: overage/credit spend cap of `$$MaxTotalCostUsd reached (estimated `$$($currentTotals.overageCostUsd) of paid overage used, on top of `$$($currentTotals.totalCostUsd) total notional usage most of which was likely covered by the Pro subscription's included quota). Raise `$MaxTotalCostUsd in the script and re-run to continue, or treat this as a natural checkpoint."
        break
    }

    $result = Invoke-ClaudeSession
    Update-TotalsFromSession $result.LogFile | Out-Null

    $rateStatus = Get-RateLimitStatus $result.LogFile
    if ($rateStatus.NearLimit -and $rateStatus.ResetsAt) {
        $waitSeconds = [Math]::Max(60, [int](($rateStatus.ResetsAt - (Get-Date)).TotalSeconds) + 60)
        Write-Host "[$(Get-Date)] Approaching the 5-hour usage limit ($([Math]::Round($rateStatus.Utilization*100))% used). Pausing proactively until it resets at $($rateStatus.ResetsAt) (~$([Math]::Round($waitSeconds/60)) min)."
        $waited = 0
        while ($waited -lt $waitSeconds) {
            if (Test-Path $StopFile) {
                Remove-Item $StopFile -Force
                Write-Summary "Stop requested while proactively waiting for the usage limit to reset."
                exit
            }
            $chunk = [Math]::Min(300, $waitSeconds - $waited)
            Start-Sleep -Seconds $chunk
            $waited += $chunk
        }
        Write-Host "[$(Get-Date)] Reset window should have passed. Resuming."
        continue
    }

    if (Test-RateLimitHit $result.LogFile) {
        Write-Host "[$(Get-Date)] Usage/rate limit detected. Waiting, rechecking every 30 min."
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
            Update-TotalsFromSession $probe.LogFile | Out-Null
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
        $backoffSeconds = [Math]::Min($RetryOnErrorPause * [Math]::Pow(2, [Math]::Min($consecutiveFailures - 1, 5)), 3600)
        Write-Host "[$(Get-Date)] Session ended with an error (failure $consecutiveFailures in a row)."
        Write-Host "  Check $($result.LogFile) and $($result.LogFile).err for details."
        Write-Host "  Not stopping - retrying in $([Math]::Round($backoffSeconds)) seconds."
        Start-Sleep -Seconds $backoffSeconds
        continue
    }

    $consecutiveFailures = 0
    Write-Host "[$(Get-Date)] Session completed cleanly. Next cycle in $BetweenSessionPause s."
    Start-Sleep -Seconds $BetweenSessionPause
}

Write-Host ""
Write-Host "=== Loop ended. See summary above / $SummaryFile ==="
