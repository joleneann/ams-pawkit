# scripts/translate-admin-microcopy.ps1
# Phase 3b: Sarvam batch translation of admin microcopy EN to MR.
# Parses microcopy/admin.md tables, skips Latin-locked + placeholder-only + already-Devanagari rows,
# translates remaining EN strings via Sarvam Translate (sarvam-translate:v1, formal mode, en-IN to mr-IN),
# writes microcopy/admin-mr.md as bilingual review file.
# ASCII-only source on purpose: PS 5.1 reads non-BOM UTF-8 as Windows-1252 and mangles parse.
# Runtime output (admin-mr.md) goes through .NET UTF-8 stream writers; Devanagari renders correctly there.
# Usage: PowerShell.exe -ExecutionPolicy Bypass -File .\scripts\translate-admin-microcopy.ps1

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$ProjectRoot = "D:\Claude Code Projects\Animal Medical Services"
$AdminMdPath = Join-Path $ProjectRoot "microcopy\admin.md"
$OutputPath = Join-Path $ProjectRoot "microcopy\admin-mr.md"
$CachePath = Join-Path $ProjectRoot "microcopy\admin-mr-cache.json"
$EnvPath = Join-Path $ProjectRoot ".env.local"
$ThrottleMs = 1000  # 1 call/sec to stay under Sarvam rate limit (hit 429 at ~100 calls/min during prior run)

# --- read API key ---
$envContent = Get-Content $EnvPath
$keyLine = $envContent | Where-Object { $_ -match '^SARVAM_API_KEY=' } | Select-Object -First 1
if (-not $keyLine) { throw "SARVAM_API_KEY not found in $EnvPath" }
$apiKey = $keyLine.Substring($keyLine.IndexOf('=') + 1).Trim()
Write-Host "API key loaded ($($apiKey.Length) chars)"

# --- sarvam translate (UTF-8 safe via raw stream; retries on 429 with exponential backoff) ---
function Invoke-SarvamTranslate {
    param([string]$Text, [string]$ApiKey, [int]$MaxRetries = 4)
    $bodyObj = @{
        input = $Text
        source_language_code = "en-IN"
        target_language_code = "mr-IN"
        model = "sarvam-translate:v1"
        mode = "formal"
    }
    $bodyJson = $bodyObj | ConvertTo-Json -Compress
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
    $headers = @{
        "Content-Type" = "application/json"
        "api-subscription-key" = $ApiKey
    }
    $attempt = 0
    while ($true) {
        try {
            $response = Invoke-WebRequest -Uri "https://api.sarvam.ai/translate" -Method Post -Headers $headers -Body $bodyBytes -UseBasicParsing -ContentType "application/json"
            $jsonText = [System.Text.Encoding]::UTF8.GetString($response.RawContentStream.ToArray())
            $obj = $jsonText | ConvertFrom-Json
            return $obj.translated_text
        } catch {
            $is429 = ($_.Exception.Message -match '429' -or $_.Exception.Message -match 'Too Many Requests')
            if ($is429 -and $attempt -lt $MaxRetries) {
                $waitSec = [math]::Pow(2, $attempt) * 15  # 15, 30, 60, 120 sec
                Write-Host ("    rate limited; waiting " + $waitSec + "s then retrying...")
                Start-Sleep -Seconds $waitSec
                $attempt++
                continue
            }
            throw
        }
    }
}

# --- load cache (so reruns skip already-translated entries) ---
$cache = @{}
if (Test-Path $CachePath) {
    $cacheJson = [System.IO.File]::ReadAllText($CachePath, [System.Text.Encoding]::UTF8)
    $cacheObj = $cacheJson | ConvertFrom-Json
    foreach ($prop in $cacheObj.PSObject.Properties) {
        $cache[$prop.Name] = $prop.Value
    }
    Write-Host ("Loaded " + $cache.Count + " cached translations from " + $CachePath)
}

# --- parse admin.md (read as UTF-8 explicitly) ---
$lines = Get-Content $AdminMdPath -Encoding UTF8
$entries = New-Object System.Collections.ArrayList
$currentSection = ""
$inSkipSection = $false

foreach ($line in $lines) {
    # Section heading
    if ($line -match '^## (.+)$') {
        $currentSection = $matches[1].Trim()
        # Skip the voice-violations + what-is-pending tail sections (no translation needed)
        $inSkipSection = ($currentSection -match '^Voice\.md violations' -or $currentSection -match '^What')
        continue
    }
    if ($inSkipSection) { continue }

    # Table row (must start with pipe, exclude header separator rows + table headers)
    if ($line -match '^\|' -and $line -notmatch '^\|[\s\-:]+\|' -and -not $line.StartsWith("| Key |") -and -not $line.StartsWith("| # |")) {
        $cols = $line -split '\|' | ForEach-Object { $_.Trim() }
        if ($cols.Count -lt 5) { continue }
        $rawKey = $cols[1]
        $rawCtx = $cols[2]
        $rawEn = $cols[3]

        # Strip backtick code formatting
        $key = $rawKey -replace '`', ''
        $en = $rawEn -replace '`', ''

        # Skip empty or header rows that slipped through
        if (-not $key -or $key -eq "Key" -or $key -eq "#" -or $key -eq "Mockup string" -or $key -eq "Placeholder EN") { continue }
        if (-not $en) { continue }

        $entry = [PSCustomObject]@{
            Section = $currentSection
            Key = $key
            Context = $rawCtx
            EN = $en
            MR = $null
            Skip = $false
            Reason = ""
        }

        # Apply skip rules
        # 1. Source-flagged no-translation (e.g. "(no string; field omitted from render)")
        if ($en -match '^\(.+\)$' -and ($en -match 'no string' -or $en -match 'no translation' -or $en -match 'placeholder' -or $en -match 'pending')) {
            $entry.Skip = $true
            $entry.Reason = "Source flagged no-translation"
        }
        # 2. Already Devanagari (Marathi already present in EN cell, e.g. the language pill)
        # Use [char] codepoints to build the regex (avoids embedding Devanagari literal in script source
        # which PS 5.1 reads as Win-1252 and mangles into a reverse-order char class).
        elseif ($en -match ("[" + [char]0x0900 + "-" + [char]0x097F + "]")) {
            $entry.Skip = $true
            $entry.Reason = "Already Devanagari"
        }
        # 3. Latin-locked clinic / brand identity
        elseif ($en -in @("Animal Medical Services", "Pune", "Pawkit", "v0.1")) {
            $entry.Skip = $true
            $entry.Reason = "Latin-locked identity"
        }
        # 4. Pure placeholder rows (only `{var}` in the EN cell)
        elseif ($en -match '^\{[^}]+\}$') {
            $entry.Skip = $true
            $entry.Reason = "Placeholder only"
        }
        # 5. GSTIN format template (keep as English template, GSTIN is a regulatory acronym)
        elseif ($en -match '^GSTIN \{') {
            $entry.Skip = $true
            $entry.Reason = "GSTIN format template, regulatory acronym"
        }

        [void]$entries.Add($entry)
    }
}

Write-Host "Parsed $($entries.Count) entries from admin.md"

# --- translate (with cache hits + throttle) ---
$totalChars = 0
$translatedCount = 0
$skippedCount = 0
$failedCount = 0
$cachedCount = 0

for ($i = 0; $i -lt $entries.Count; $i++) {
    $entry = $entries[$i]
    if ($entry.Skip) {
        $entry.MR = "_(no translation; " + $entry.Reason + ")_"
        $skippedCount++
        continue
    }
    # Cache hit?
    if ($cache.ContainsKey($entry.Key)) {
        $entry.MR = $cache[$entry.Key]
        $cachedCount++
        continue
    }
    try {
        $mr = Invoke-SarvamTranslate -Text $entry.EN -ApiKey $apiKey
        $entry.MR = $mr
        $cache[$entry.Key] = $mr
        $totalChars += $entry.EN.Length
        $translatedCount++
        if (($translatedCount % 10) -eq 0) {
            Write-Host "  ...$translatedCount translated"
            # Save cache after every 10 to make script crash-resumable
            $cacheJsonOut = $cache | ConvertTo-Json
            [System.IO.File]::WriteAllText($CachePath, $cacheJsonOut, [System.Text.UTF8Encoding]::new($false))
        }
        Start-Sleep -Milliseconds $ThrottleMs
    } catch {
        $entry.MR = "_(ERROR: " + $_.Exception.Message + ")_"
        $failedCount++
        Write-Host ("  FAILED [" + $entry.Key + "]: " + $_.Exception.Message)
    }
}

# Final cache save
$cacheJsonOut = $cache | ConvertTo-Json
[System.IO.File]::WriteAllText($CachePath, $cacheJsonOut, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "Cached (skipped this run): $cachedCount, Translated (this run): $translatedCount, Skipped (no-translation rule): $skippedCount, Failed: $failedCount"
Write-Host "Sarvam chars used (this run): $totalChars, est cost (this run): Rs $([math]::Round($totalChars * 0.002, 2))"

# --- generate output (Devanagari only enters via API responses, never in script source) ---
$o = New-Object System.Text.StringBuilder
[void]$o.AppendLine("# Admin microcopy -- Marathi translations (Sarvam first-pass)")
[void]$o.AppendLine("")
[void]$o.AppendLine("Generated 2026-05-12 via Sarvam Translate, model ``sarvam-translate:v1``, mode ``formal``, ``en-IN`` -> ``mr-IN``.")
[void]$o.AppendLine("")
[void]$o.AppendLine("**Every MR string is review pending** until the Pune-native-speaker pass refines it.")
[void]$o.AppendLine("")
[void]$o.AppendLine("Known MT limitations to watch for during native-speaker review:")
[void]$o.AppendLine("- **Metaphorical terms translated literally** (e.g., ""open windows"" of the inbox usually comes back as the Marathi word for physical window). Conceptual rewrites needed.")
[void]$o.AppendLine("- **Semantic errors** on technical vocabulary (e.g., ""transcription"" rendered as transliteration; not the same thing).")
[void]$o.AppendLine("- **Honorific calibration**: formal ""tumcha"" for vet-facing dashboard chrome is the default; check whether any string needs intimate ""tujha"".")
[void]$o.AppendLine("- **Dialect**: Pune Marathi, not Mumbai/Nagpur. Specific lexical choices may differ.")
[void]$o.AppendLine("- **Dr Sagar**: render consistently as the locked form per voice.md ('Dr.' with period in Devanagari abbreviation).")
[void]$o.AppendLine("- **Western numerals** in both languages (per existing decisions-log lock).")
[void]$o.AppendLine("- **Placeholders in braces** (e.g., ``{pet_name}``, ``{count}``): should be preserved verbatim. If Sarvam translated a placeholder, restore the brace form.")
[void]$o.AppendLine("")
[void]$o.AppendLine("**Stats:** $translatedCount strings translated, $skippedCount skipped (Latin-locked / placeholder-only / already-Devanagari / source-flagged-no-translation), $failedCount failed. Sarvam input chars used: $totalChars. Estimated cost: Rs $([math]::Round($totalChars * 0.002, 2)).")
[void]$o.AppendLine("")

$sections = $entries | Group-Object -Property Section
foreach ($section in $sections) {
    [void]$o.AppendLine("---")
    [void]$o.AppendLine("")
    [void]$o.AppendLine("## $($section.Name)")
    [void]$o.AppendLine("")
    [void]$o.AppendLine("| Key | EN | MR (Sarvam first-pass) |")
    [void]$o.AppendLine("|---|---|---|")
    foreach ($entry in $section.Group) {
        $key = $entry.Key
        $en = $entry.EN -replace '\|', '\|'
        $mr = $entry.MR -replace '\|', '\|'
        [void]$o.AppendLine("| ``$key`` | $en | $mr |")
    }
    [void]$o.AppendLine("")
}

# --- write file as UTF-8 without BOM ---
[System.IO.File]::WriteAllText($OutputPath, $o.ToString(), [System.Text.UTF8Encoding]::new($false))
Write-Host ""
Write-Host "Written: $OutputPath ($($o.Length) chars)"
