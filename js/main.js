// Tooltip info icons
document.querySelectorAll('.tip').forEach(el => {
  const icon = document.createElement('span');
  icon.className = 'tip-icon';
  icon.textContent = 'ⓘ';
  el.appendChild(icon);
});

// Copy buttons
document.querySelectorAll('.step-code').forEach(block => {
  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.setAttribute('aria-label', 'Copy');
  btn.innerHTML = '<i data-lucide="copy"></i>';
  btn.addEventListener('click', () => {
    const text = block.innerText.replace(/^\$\s*/, '').trim();
    navigator.clipboard.writeText(text).then(() => {
      btn.innerHTML = '<i data-lucide="check"></i>';
      lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = '<i data-lucide="copy"></i>';
        lucide.createIcons();
      }, 1500);
    });
  });
  block.appendChild(btn);
});

// Theme toggle
const themeToggle = document.getElementById('themeToggle');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeToggle.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
  lucide.createIcons();
}

// Init icon to match current theme
setTheme(document.documentElement.getAttribute('data-theme') || 'dark');

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// Stamp calculator — mirrors Nook's calcStampCost logic (ui/src/api/bee.ts)
// Effective (utilised) capacities from Swarm docs — accounts for bucket overflow
const EFFECTIVE_SIZE = { 19:'110 MB', 20:'680 MB', 21:'2.6 GB', 22:'7.7 GB' };
const SIZE_HUMAN = { 19:'110MB', 20:'680MB', 21:'2.6GB', 22:'7.7GB' };
const TTL_HUMAN = { 1:'1month', 3:'3months', 6:'6months', 12:'1y' };
const BLOCKS_PER_MONTH = 518400n; // Gnosis chain ~5s blocks
const PLUR_PER_BZZ = 10n ** 16n;
// Network price in PLUR per chunk per block
const FALLBACK_PRICE = 24000n; // estimate — update periodically
let networkPrice = FALLBACK_PRICE;
let priceIsLive = false;
let calcDepth = 20;
let calcMonths = 3;
let calcImmutable = true;

function depthToSize(depth) {
  return EFFECTIVE_SIZE[depth] || '—';
}

// Try fetching live price from local Bee node (advanced users run one)
async function fetchNetworkPrice() {
  try {
    const res = await fetch('http://localhost:1633/chainstate');
    const data = await res.json();
    if (data.currentPrice) {
      networkPrice = BigInt(data.currentPrice);
      priceIsLive = true;
    }
  } catch (e) { /* use fallback */ }
  updateStampCmd();
}

fetchNetworkPrice();

// Same formula as Nook: amount = price * blocks, bzzCost = amount * 2^depth
function calcStampCost(depth, months, price) {
  const durationBlocks = BigInt(months) * BLOCKS_PER_MONTH;
  const amount = price * durationBlocks;
  const totalPlur = amount * (1n << BigInt(depth));
  const whole = totalPlur / PLUR_PER_BZZ;
  const frac = ((totalPlur % PLUR_PER_BZZ) * 10000n) / PLUR_PER_BZZ;
  const bzzCost = `${whole}.${String(frac).padStart(4, '0')}`;
  return { amount: amount.toString(), bzzCost };
}

function updateStampCmd() {
  const el = document.getElementById('stamp-cmd');
  const costEl = document.getElementById('stamp-cost');
  if (!el) return;

  const { bzzCost } = calcStampCost(calcDepth, calcMonths, networkPrice);
  const immutableFlag = calcImmutable ? '' : ' --immutable false';
  const textEl = el.querySelector('.stamp-cmd-text');
  if (textEl) textEl.textContent = `swarm-cli stamp create --capacity ${SIZE_HUMAN[calcDepth]} --ttl ${TTL_HUMAN[calcMonths]}${immutableFlag}`;
  const prefix = priceIsLive ? 'Cost' : 'Estimated cost';
  const approx = priceIsLive ? '' : '~';
  if (costEl) costEl.innerHTML = `${prefix}: <strong>${approx}${bzzCost} BZZ</strong>`;
}

document.querySelectorAll('#calc-size .calc-btn').forEach(btn => {
  btn.textContent = depthToSize(parseInt(btn.dataset.depth));
  btn.addEventListener('click', () => {
    document.querySelectorAll('#calc-size .calc-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    calcDepth = parseInt(btn.dataset.depth);
    updateStampCmd();
  });
});

document.querySelectorAll('#calc-duration .calc-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#calc-duration .calc-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    calcMonths = parseInt(btn.dataset.months);
    updateStampCmd();
  });
});

document.querySelectorAll('#calc-type .calc-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#calc-type .calc-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    calcImmutable = btn.dataset.immutable === 'true';
    updateStampCmd();
  });
});

// Swarm inline accordion
const swarmToggle = document.getElementById('swarmToggle');
const swarmAccordion = document.getElementById('swarmAccordion');
swarmToggle.addEventListener('click', () => {
  const isOpen = swarmAccordion.classList.toggle('open');
  swarmToggle.textContent = isOpen ? 'what is swarm? ↑' : 'what is swarm? ↓';
});

function showSteps(level) {
  const section = document.getElementById('steps-' + level);
  const card = document.querySelector('[data-level="' + level + '"]');
  const isActive = card.classList.contains('active');

  // hide all
  document.querySelectorAll('.steps-section').forEach(el => el.classList.remove('visible'));
  document.querySelectorAll('.skill-card').forEach(el => el.classList.remove('active'));

  // if it wasn't active, show it
  if (!isActive) {
    section.classList.add('visible');
    card.classList.add('active');
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
}

// Nook download button: link straight to the file for the visitor's system.
// Same logic as the Nook website (nook-drive.eth.limo, app.js). Without an
// answer from GitHub, or on an unknown system, the button keeps pointing at
// the latest-release page.
(function nookDownload() {
  const button = document.querySelector('.js-nook-download');
  if (!button) return;
  const label = document.querySelector('.js-nook-download-label');
  const note = document.querySelector('.js-nook-download-note');
  const REPO = 'GasperX93/nook';

  function detectOs() {
    const p = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '').toLowerCase();
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod|android/.test(ua)) return 'mobile';
    if (p.includes('mac') || ua.includes('mac os')) return 'mac';
    if (p.includes('win') || ua.includes('windows')) return 'windows';
    if (p.includes('linux') || ua.includes('linux')) return 'linux';
    return 'unknown';
  }

  // Apple silicon vs Intel: only Chromium browsers can tell. Safari always
  // reports Intel, so default to Apple silicon and always offer the Intel build.
  function detectMacArch() {
    const uad = navigator.userAgentData;
    if (!uad || !uad.getHighEntropyValues) return Promise.resolve('arm64');
    return uad.getHighEntropyValues(['architecture'])
      .then(v => (v && v.architecture === 'x86' ? 'x64' : 'arm64'))
      .catch(() => 'arm64');
  }

  function link(href, text) {
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.textContent = text;
    return a;
  }

  function show(href, text, noteParts) {
    button.href = href;
    label.textContent = text;
    note.replaceChildren(...noteParts);
  }

  const os = detectOs();
  if (os === 'mobile') {
    show(button.href, 'Download Nook', ['Nook runs on macOS, Windows and Linux']);
    return;
  }

  Promise.all([
    fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null),
    os === 'mac' ? detectMacArch() : Promise.resolve(null),
  ]).then(([release, arch]) => {
    if (!release || !Array.isArray(release.assets)) return;
    const find = re => {
      const asset = release.assets.find(x => re.test(x.name));
      return asset ? asset.browser_download_url : null;
    };
    const v = ' · v' + String(release.tag_name || '').replace(/^v/, '');

    if (os === 'mac') {
      const arm = find(/-arm64\.dmg$/i);
      const intel = find(/-x64\.dmg$/i);
      const primary = arch === 'x64' ? intel : arm;
      const other = arch === 'x64' ? arm : intel;
      if (!primary) return;
      const parts = [(arch === 'x64' ? 'Intel' : 'Apple silicon') + v];
      if (other) parts.push(' · ', link(other, arch === 'x64' ? 'Apple silicon' : 'Intel Mac'), '?');
      show(primary, 'Download Nook for Mac', parts);
    } else if (os === 'windows') {
      const exe = find(/setup\.exe$/i);
      if (exe) show(exe, 'Download Nook for Windows', ['Windows 10 and later' + v]);
    } else if (os === 'linux') {
      const deb = find(/\.deb$/i);
      const rpm = find(/\.rpm$/i);
      if (deb) show(deb, 'Download Nook for Linux', rpm ? ['.deb' + v + ' · ', link(rpm, '.rpm')] : ['.deb' + v]);
    }
  });
})();
