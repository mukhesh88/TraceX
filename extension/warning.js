// TraceX warning page forensic reporter & navigation controller

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get('target') || 'Unknown URL';
  const riskScore = parseFloat(params.get('score') || '0.90');
  const latency = params.get('latency') || '<5';
  let triggers = {};

  try {
    triggers = JSON.parse(params.get('triggers') || '{}');
  } catch (e) {
    triggers = {};
  }

  // Set URL display
  const targetDisplay = document.getElementById('targetUrlDisplay');
  if (targetDisplay) {
    targetDisplay.textContent = targetUrl;
  }

  // Set Risk Score
  const riskBadge = document.getElementById('riskScoreBadge');
  if (riskBadge) {
    riskBadge.textContent = `RISK: ${(riskScore * 100).toFixed(1)}% | LATENCY: ${latency}ms`;
  }

  // Populate Forensic Indicators
  const list = document.getElementById('indicatorsList');
  if (list) {
    const items = [];

    if (triggers.isPunycode) {
      items.push({
        title: 'IDN / Punycode Homograph Spoofing',
        desc: 'Hostname contains "xn--" encoded Cyrillic or Greek characters mimicking a reputable domain.'
      });
    }

    if (triggers.hasIpAddress) {
      items.push({
        title: 'Raw IP Host Routing',
        desc: 'Direct connection attempted using a numeric IPv4/IPv6 address bypassing domain legitimacy standards.'
      });
    }

    if (triggers.flaggedKeywords && triggers.flaggedKeywords.length > 0) {
      const pills = triggers.flaggedKeywords.map(k => `<span class="token-pill">${k}</span>`).join(' ');
      items.push({
        title: 'Credential Harvest Keyword Injection',
        desc: `High-risk authentication lure tokens detected: ${pills}`
      });
    }

    if (triggers.shannonEntropy && triggers.shannonEntropy > 3.8) {
      items.push({
        title: 'High Shannon Character Entropy',
        desc: `Structural randomness score is ${triggers.shannonEntropy.toFixed(2)} (indicates algorithmic domain generation or obfuscation).`
      });
    }

    if (triggers.subdomainCount && triggers.subdomainCount >= 2) {
      items.push({
        title: 'Excessive Subdomain Depth',
        desc: `Hostname includes ${triggers.subdomainCount} subdomains designed to deceive visual inspection.`
      });
    }

    if (triggers.tldRiskWeight && triggers.tldRiskWeight >= 0.70) {
      items.push({
        title: 'High-Abuse Top Level Domain',
        desc: 'Domain is registered under a TLD frequently associated with disposable phishing campaigns.'
      });
    }

    if (items.length === 0) {
      items.push({
        title: 'Heuristic & Neural Pattern Match',
        desc: 'Weighted lexical vector scores crossed the critical 0.60 threshold on static analysis.'
      });
    }

    list.innerHTML = items.map(item => `
      <li class="indicator-item">
        <span class="indicator-icon">&#x2716;</span>
        <div>
          <strong>${item.title}:</strong> ${item.desc}
        </div>
      </li>
    `).join('');
  }

  // Back to Safety button
  const backBtn = document.getElementById('backToSafetyBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'https://www.google.com';
      }
    });
  }

  // Proceed Anyway (Bypass) button
  const proceedBtn = document.getElementById('proceedAnywayBtn');
  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      if (confirm('WARNING: Navigating to this site may result in password theft or malware infection. Are you certain you want to proceed?')) {
        chrome.runtime.sendMessage({ action: 'BYPASS_URL', url: targetUrl }, () => {
          window.location.href = targetUrl;
        });
      }
    });
  }
});
