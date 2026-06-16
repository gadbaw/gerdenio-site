/* Gerdenio — sprig motion ("Sprout").
   Swaps the static <img> sprigs for inline SVG so the strokes can animate, then
   plays the sprout entrance (stem draws, leaves grow from the node and settle)
   when each sprig scrolls into view. The hero sprig also breathes, faintly, ever
   after. No-JS keeps the original <img>; reduced-motion shows the sprig static
   (the hidden states live inside a prefers-reduced-motion:no-preference block). */
(function () {
  var SINGLE =
    '<svg class="sprig-svg sprig-svg--single" viewBox="0 0 300 56" fill="none" aria-hidden="true">' +
      '<g class="grp">' +
        '<path class="stem" pathLength="100" d="M6 38 C72 22 150 22 200 29 C246 35 280 25 296 19"/>' +
        '<path class="lb" pathLength="100" d="M150 29 C150 15 160 7 176 6 C175 22 164 30 150 29"/>' +
        '<path class="la" pathLength="100" d="M139 31 C139 19 129 12 114 13 C116 28 126 33 139 31"/>' +
      '</g>' +
    '</svg>';
  var DIVIDER =
    '<svg class="sprig-svg sprig-svg--divider" viewBox="0 0 240 34" fill="none" aria-hidden="true">' +
      '<g class="grp">' +
        '<path class="stem" pathLength="100" d="M6 21 C72 14 168 14 234 21"/>' +
        '<path class="lb" pathLength="100" d="M120 20 C120 9 112 4 102 4 C104 14 112 20 120 20"/>' +
        '<path class="la" pathLength="100" d="M120 20 C120 11 127 6 136 6 C134 15 128 20 120 20"/>' +
      '</g>' +
    '</svg>';

  function make(markup) {
    var box = document.createElement('div');
    box.innerHTML = markup;
    return box.firstChild;
  }

  function run() {
    var imgs = [].slice.call(document.querySelectorAll('img.sprig-accent, .botdiv img'));
    var svgs = [];
    imgs.forEach(function (img) {
      var divider = img.closest && img.closest('.botdiv');
      var svg = make(divider ? DIVIDER : SINGLE);
      img.parentNode.replaceChild(svg, img);
      svgs.push(svg);
    });
    if (!svgs.length) return;

    /* Only animate when the head guard enabled motion. Otherwise the inline SVG
       is already fully visible (hidden states are scoped to html.anim). */
    if (!document.documentElement.classList.contains('anim')) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('go'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    svgs.forEach(function (s) { io.observe(s); });

    /* Failsafe: sprout anything already in view via layout (the observer can fail
       to fire in non-painting contexts), then a final safety net so a sprig can
       never get stuck hidden. */
    function inView() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      svgs.forEach(function (s) {
        if (s.classList.contains('go')) return;
        var r = s.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) { s.classList.add('go'); io.unobserve(s); }
      });
    }
    inView();
    requestAnimationFrame(inView);
    setTimeout(function () { svgs.forEach(function (s) { s.classList.add('go'); }); }, 2600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
