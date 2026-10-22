// Pre-paint selection. Only this preference is persisted; comparison data stays in memory.
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
let preference = 'system';
try {
  const saved = localStorage.getItem('msidlecalc-theme');
  if (['system', 'light', 'dark'].includes(saved)) preference = saved;
} catch { /* Storage is optional. */ }
function applyTheme() {
  const active = preference === 'system' ? (systemTheme.matches ? 'dark' : 'light') : preference;
  document.documentElement.dataset.theme = active;
  const status = document.querySelector('#theme-status');
  if (status) {
    status.textContent = preference === 'system' ? `System: ${active === 'light' ? 'BasilMarket' : 'Hidden Street'}` : `${active === 'light' ? 'BasilMarket' : 'Hidden Street'} skin`;
    document.querySelector('#theme').title = status.textContent;
  }
}
applyTheme();
systemTheme.addEventListener('change', applyTheme);
document.addEventListener('DOMContentLoaded', () => {
  const select = document.querySelector('#theme');
  select.value = preference;
  applyTheme();
  select.addEventListener('change', () => {
    preference = select.value;
    try { localStorage.setItem('msidlecalc-theme', preference); } catch { /* Optional preference. */ }
    applyTheme();
  });
});
