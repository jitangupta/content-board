// Prevent flash of wrong theme (FOWT) — runs before React
(function() {
  var t = localStorage.getItem('theme-preference');
  var d = t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  if (d) document.documentElement.classList.add('dark');
})();
