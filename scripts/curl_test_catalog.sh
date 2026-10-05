#!/usr/bin/env bash
# TraceX CURL Command Test Catalog

BASE_URL="http://localhost:8080/api/v1"

echo "=== TEST 1: Phishing Lure with Keyword Injection ==="
curl -i -X POST "${BASE_URL}/scan" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://secure-login.apple-support-verify.com/auth"}'

echo -e "\n\n=== TEST 2: Punycode Homograph Spoofing ==="
curl -i -X POST "${BASE_URL}/scan" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://xn--pple-43d.com/login"}'

echo -e "\n\n=== TEST 3: Raw IPv4 Host Routing ==="
curl -i -X POST "${BASE_URL}/scan" \
  -H "Content-Type: application/json" \
  -d '{"url":"http://192.168.1.100/paypal/login.php"}'

echo -e "\n\n=== TEST 4: High-Abuse TLD (.xyz) ==="
curl -i -X POST "${BASE_URL}/scan" \
  -H "Content-Type: application/json" \
  -d '{"url":"http://account-update-banking.xyz/session/verify"}'

echo -e "\n\n=== TEST 5: Legitimate Benign Domain (Google) ==="
curl -i -X POST "${BASE_URL}/scan" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com"}'

echo -e "\n\n=== TEST 6: Legitimate Long Path (GitHub) ==="
curl -i -X POST "${BASE_URL}/scan" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com/microsoft/onnxruntime/tree/main/docs"}'

echo -e "\n\n=== TEST 7: Query Historical Audit Logs (Paginated) ==="
curl -i -X GET "${BASE_URL}/history?page=0&size=5"

echo -e "\n\n=== TEST 8: Aggregated Telemetry Statistics ==="
curl -i -X GET "${BASE_URL}/stats"
