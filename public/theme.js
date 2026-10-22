// Apply before the first paint. Only this appearance preference is persisted.
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let preference = 'system';
try {
  const saved = localStorage.getItem('msidlecalc-theme');
  if (['system', 'light', 'dark'].includes(saved)) preference = saved;
} catch { /* Appearance still works when browser storage is blocked. */ }
function applyTheme() {
  document.documentElement.dataset.theme = preference === 'system'
    ? (systemTheme.matches ? 'dark' : 'light') : preference;
}
applyTheme();
systemTheme.addEventListener('change', applyTheme);
document.addEventListener('DOMContentLoaded', () => {
  const select = document.querySelector('#theme');
  select.value = preference;
  select.addEventListener('change', () => {
    preference = select.value;
    try { localStorage.setItem('msidlecalc-theme', preference); } catch { /* Optional. */ }
    applyTheme();
  });
});
