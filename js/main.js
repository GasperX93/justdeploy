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
