# TraceX Latency & Classification Accuracy Benchmark Script (PowerShell)
param (
    [string]$Endpoint = "http://localhost:8080/api/v1/scan",
    [int]$Iterations = 50
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " TraceX Pre-Socket Forensic Engine - Sub-5ms Benchmark Suite " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Endpoint: $Endpoint"
Write-Host "Iterations: $Iterations consecutive evaluations`n"

$testUrls = @(
    "https://secure-login.apple-support-verify.com/auth",
    "https://google.com",
    "https://xn--pple-43d.com/login",
    "http://192.168.1.100/paypal/login.php",
    "http://account-update-banking.xyz/session/verify",
    "https://github.com/microsoft/onnxruntime",
    "https://amazon.com/dp/B08N5WRWNW",
    "http://paypal-verification-account.security-alert.ml/webscr"
)

# 1. Warm-up invocation
Write-Host "[1/3] Pre-warming JVM and ONNX session..." -ForegroundColor Yellow
$warmupBody = @{ url = "https://google.com" } | ConvertTo-Json
try {
    $warmupResp = Invoke-RestMethod -Uri $Endpoint -Method Post -Body $warmupBody -ContentType "application/json" -TimeoutSec 5
    Write-Host "      Warm-up successful: $($warmupResp.status), Latency: $($warmupResp.inferenceLatencyMs)ms`n" -ForegroundColor Green
} catch {
    Write-Host "      ERROR: Failed to connect to $Endpoint. Is the backend running on port 8080?" -ForegroundColor Red
    exit 1
}

# 2. Benchmark Loop
Write-Host "[2/3] Executing $Iterations consecutive inference requests..." -ForegroundColor Yellow
$latencies = @()
$roundtrips = @()
$passedCount = 0

for ($i = 1; $i -le $Iterations; $i++) {
    $targetUrl = $testUrls[($i - 1) % $testUrls.Length]
    $body = @{ url = $targetUrl } | ConvertTo-Json

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $res = Invoke-RestMethod -Uri $Endpoint -Method Post -Body $body -ContentType "application/json"
    $sw.Stop()

    $latencies += $res.inferenceLatencyMs
    $roundtrips += $sw.Elapsed.TotalMilliseconds

    $isMaliciousExpected = $targetUrl -match "(apple|paypal|banking|security|xn--|\.xyz|\.ml)"
    $isCorrect = ($isMaliciousExpected -and $res.status -eq "MALICIOUS") -or (-not $isMaliciousExpected -and $res.status -eq "BENIGN")
    if ($isCorrect) { $passedCount++ }

    if ($i % 10 -eq 0 -or $i -eq $Iterations) {
        Write-Host "      Progress: $i/$Iterations scans executed..." -ForegroundColor Gray
    }
}

# 3. Statistical Analysis
$avgLatency = ($latencies | Measure-Object -Average).Average
$minLatency = ($latencies | Measure-Object -Minimum).Minimum
$maxLatency = ($latencies | Measure-Object -Maximum).Maximum

$sortedLat = $latencies | Sort-Object
$p95Index = [Math]::Floor($Iterations * 0.95)
$p95Latency = $sortedLat[$p95Index]

$avgRoundtrip = ($roundtrips | Measure-Object -Average).Average
$accuracy = ($passedCount / $Iterations) * 100

Write-Host "`n[3/3] Benchmark & Verification Summary:" -ForegroundColor Yellow
Write-Host "------------------------------------------------------------"
Write-Host " In-Process ML Inference Latency:"
Write-Host "   - Average:  $([Math]::Round($avgLatency, 2)) ms" -ForegroundColor $(if ($avgLatency -lt 5.0) { "Green" } else { "Yellow" })
Write-Host "   - Min:      $([Math]::Round($minLatency, 2)) ms" -ForegroundColor Green
Write-Host "   - Max:      $([Math]::Round($maxLatency, 2)) ms"
Write-Host "   - P95:      $([Math]::Round($p95Latency, 2)) ms"
Write-Host " Total HTTP Round-Trip Time (including localhost network overhead):"
Write-Host "   - Average:  $([Math]::Round($avgRoundtrip, 2)) ms"
Write-Host " Classification Accuracy on Test Samples:"
Write-Host "   - Accuracy: $([Math]::Round($accuracy, 1))% ($passedCount/$Iterations passed)" -ForegroundColor Green
Write-Host " Sub-5ms SLA Status:"
if ($avgLatency -lt 5.0) {
    Write-Host "   [PASS] Average inference is well below the 5.0ms SLA!" -ForegroundColor Green
} else {
    Write-Host "   [WARN] Average inference exceeded 5.0ms" -ForegroundColor Red
}
Write-Host "============================================================`n"
