// TraceX Manifest V3 Background Service Worker (Vanilla JavaScript)

const BACKEND_SCAN_URL = 'http://localhost:8080/api/v1/scan';

// Fast in-memory cache to prevent redundant scans and sub-millisecond execution
const benignCache = new Set();
const userBypassCache = new Set();

// Schemes and hosts to ignore
const IGNORED_SCHEMES = ['chrome:', 'chrome-extension:', 'about:', 'edge:', 'view-source:', 'data:', 'javascript:'];
const IGNORED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

// Reputable apex domains that should not trigger false positives on legitimate navigation
const TRUSTED_DOMAINS = new Set([
  'google.com', 'google.co.in', 'google.co.uk', 'google.ca', 'google.de', 'google.fr', 'google.com.au',
  'groww.in', 'zerodha.com', 'upstox.com',
  'bing.com', 'duckduckgo.com', 'yahoo.com',
  'apple.com', 'microsoft.com', 'amazon.com', 'amazon.in',
  'github.com', 'gitlab.com', 'bitbucket.org',
  'linkedin.com', 'twitter.com', 'x.com', 'facebook.com', 'instagram.com',
  'wikipedia.org', 'netflix.com', 'spotify.com', 'reddit.com'
]);

function extractApex(hostname) {
  if (!hostname) return '';
  const parts = hostname.toLowerCase().split('.');
  if (parts.length <= 2) return hostname.toLowerCase();

  const lastTwo = parts[parts.length - 2] + '.' + parts[parts.length - 1];
  if (['co.in', 'co.uk', 'com.au', 'co.jp', 'com.br', 'gov.in', 'org.uk'].includes(lastTwo)) {
    if (parts.length >= 3) {
      return parts[parts.length - 3] + '.' + lastTwo;
    }
  }
  return parts[parts.length - 2] + '.' + parts[parts.length - 1];
}

function shouldSkipUrl(rawUrl) {
  if (!rawUrl) return true;
  try {
    const parsed = new URL(rawUrl);
    if (IGNORED_SCHEMES.includes(parsed.protocol)) return true;
    if (IGNORED_HOSTS.includes(parsed.hostname)) return true;

    // If hostname contains punycode (xn--) or raw IP, never skip - always scan!
    const isPuny = parsed.hostname.includes('xn--') || rawUrl.toLowerCase().includes('xn--');
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname);

    if (!isPuny && !isIp) {
      const apex = extractApex(parsed.hostname);
      if (TRUSTED_DOMAINS.has(apex) || TRUSTED_DOMAINS.has(parsed.hostname.toLowerCase())) {
        return true; // Verified legitimate service (e.g. Google Search, Groww)
      }
    }

    if (userBypassCache.has(rawUrl)) return true;
    if (benignCache.has(rawUrl)) return true;
    return false;
  } catch (e) {
    return true; // malformed or internal
  }
}

/**
 * Intercept navigation events before socket establishment.
 */
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only intercept main frame top-level navigations
  if (details.frameId !== 0) return;

  const targetUrl = details.url;
  if (shouldSkipUrl(targetUrl)) return;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s timeout safeguard

    const response = await fetch(BACKEND_SCAN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: targetUrl }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[TraceX] Backend responded with HTTP ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log(`[TraceX] Scan result for ${targetUrl}:`, data);

    if (data.status === 'MALICIOUS' || data.riskScore >= 0.60) {
      // Malicious link intercepted! Block and redirect to high-impact warning page
      const triggersParam = encodeURIComponent(JSON.stringify(data.features || {}));
      const warningUrl = chrome.runtime.getURL(
        `warning.html?target=${encodeURIComponent(targetUrl)}&score=${data.riskScore}&latency=${data.inferenceLatencyMs}&triggers=${triggersParam}`
      );

      // Redirect the tab before socket establishment is complete
      chrome.tabs.update(details.tabId, { url: warningUrl });
    } else {
      // Benign link verified, cache to ensure zero overhead on subsequent navigations
      benignCache.add(targetUrl);
    }
  } catch (err) {
    // Fail-open strategy to avoid breaking browsing if backend is momentarily restarting
    console.warn('[TraceX] Background interceptor error (fail-open):', err);
  }
});

/**
 * Listen for messages from warning.html or popup.html
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'BYPASS_URL' && message.url) {
    userBypassCache.add(message.url);
    sendResponse({ success: true });
  } else if (message.action === 'GET_STATS') {
    sendResponse({
      cachedBenignCount: benignCache.size,
      bypassedCount: userBypassCache.size
    });
  }
  return true;
});
