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

// Stamp calculator
// Effective volumes from https://docs.ethswarm.org/docs/concepts/incentives/postage-stamps/#effective-utilisation-table
// Unencrypted / NONE erasure coding, <0.1% failure rate
const EFFECTIVE_SIZE = { 17:'44.7 kB', 18:'6.7 MB', 19:'112 MB', 20:'688 MB', 21:'2.6 GB', 22:'7.7 GB', 23:'19.9 GB', 24:'47.1 GB', 25:'105.5 GB' };
const AMOUNT_PER_DAY = 1335104641;
let calcDepth = 20;
let calcDays = 30;

function depthToSize(depth) {
  return EFFECTIVE_SIZE[depth] || '—';
}

function updateStampCmd() {
  const amount = Math.round(AMOUNT_PER_DAY * calcDays);
  const el = document.getElementById('stamp-cmd');
  if (el) el.innerHTML = `<span>$</span> swarm-cli stamp buy --amount ${amount} --depth ${calcDepth} --immutable false`;
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
    calcDays = parseInt(btn.dataset.days);
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
  // hide all
  document.querySelectorAll('.steps-section').forEach(el => el.classList.remove('visible'));
  document.querySelectorAll('.skill-card').forEach(el => el.classList.remove('active'));

  // show selected
  document.getElementById('steps-' + level).classList.add('visible');
  document.querySelector('[data-level="' + level + '"]').classList.add('active');

  // scroll to steps
  setTimeout(() => {
    document.getElementById('steps-' + level).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}
