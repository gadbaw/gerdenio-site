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

    var all = reveals.concat(lines);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    all.forEach(function (el) { io.observe(el); });

    /* Failsafe: reveal anything already in/near the viewport right away, using
       layout (always computed) rather than waiting on the observer — which can
       fail to fire in non-painting / embedded contexts and leave content stuck
       hidden. The observer still handles below-the-fold elements on scroll. */
    function revealInView() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      all.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) { el.classList.add('is-in'); io.unobserve(el); }
      });
    }
    revealInView();
    /* one more pass after first paint, and a final safety net */
    requestAnimationFrame(revealInView);
    setTimeout(function () { all.forEach(function (el) { el.classList.add('is-in'); }); }, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
