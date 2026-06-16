/* Gerdenio — soft page-transition crossfade (reduced-motion aware).
   The .page-veil fades OUT on load via CSS (safe even if JS fails); this only
   fades it back IN on internal navigation, then follows the link. The hero
   "dawn light" glow is now pure CSS (see styles.css), so nothing here touches
   scrolling. */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;                  // external
    if (url.pathname === location.pathname) return;              // same page / anchor
    if (!/\.html?$/.test(url.pathname) && url.pathname !== '/') return;
    e.preventDefault();
    document.documentElement.classList.add('leaving');
    setTimeout(function () { location.href = a.href; }, 430);
  });
})();
