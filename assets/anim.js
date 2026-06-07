/* Gerdenio — tasteful scroll reveals. No-op under reduced-motion / no IntersectionObserver.
   The <head> guard adds the `anim` class synchronously (before paint) so the CSS
   hidden states apply with no flash; this file only adds `is-in` as elements enter view. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('anim')) return;

  function init() {
    var revealSel = [
      '.hero .eyebrow', '.hero h1', '.hero .lede', '.hero-actions',
      'h2', '.card', '.person', '.figure',
      '.quote', 'blockquote', '.notice', '.tribute',
      '.contact-detail', '.field'
    ].join(',');

    var reveals = [].slice.call(document.querySelectorAll(revealSel));
    var lines = [].slice.call(document.querySelectorAll('.sprig-accent, .botdiv img'));

    /* gentle stagger between siblings sharing a parent */
    var seen = (typeof Map === 'function') ? new Map() : null;
    if (seen) {
      reveals.forEach(function (el) {
        var p = el.parentNode, n = seen.get(p) || 0;
        seen.set(p, n + 1);
        if (n) el.style.transitionDelay = Math.min(n, 6) * 70 + 'ms';
      });
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.concat(lines).forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
