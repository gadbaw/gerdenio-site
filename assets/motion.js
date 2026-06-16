/* Gerdenio — refined motion (Tier A + B). All reduced-motion aware.
   - Lenis smooth momentum scroll (if the library loaded)
   - Living "dawn light" canvas behind the home hero (#dawn)
   - Soft page-transition crossfade via the .page-veil overlay
   Degrades gracefully: if anything is missing, the site works normally. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Page-transition crossfade ----------
     The veil fades OUT on load via CSS (safe even if JS fails). Here we only
     fade it back IN on internal navigation, then follow the link. */
  if (!reduce) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;                 // external link
      if (url.pathname === location.pathname) return;             // same page / anchor
      if (!/\.html?$/.test(url.pathname) && url.pathname !== '/') return; // only page nav
      e.preventDefault();
      document.documentElement.classList.add('leaving');
      setTimeout(function () { location.href = a.href; }, 430);
    });
  }

  function start() {
    /* ---------- Smooth momentum scroll ---------- */
    if (!reduce && window.Lenis) {
      try {
        var lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 0.9 });
        (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
        document.addEventListener('click', function (e) {
          var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
          if (!a) return;
          var id = a.getAttribute('href');
          if (id.length < 2) return;
          var target = document.querySelector(id);
          if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -72 }); }
        });
      } catch (err) {}
    }

    /* ---------- Living dawn light (home hero) ---------- */
    var cv = document.getElementById('dawn');
    if (cv && cv.getContext && !reduce) {
      var ctx = cv.getContext('2d');
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = 0, H = 0;
      /* soft drifting pools of morning light: pale sky, a warm apricot glow, blue haze */
      var pools = [
        { x: 0.18, y: 0.28, r: 0.62, c: [188, 214, 240], a: 0.55 },
        { x: 0.74, y: 0.18, r: 0.50, c: [247, 227, 198], a: 0.40 },
        { x: 0.52, y: 0.74, r: 0.66, c: [214, 228, 246], a: 0.55 },
        { x: 0.88, y: 0.62, r: 0.46, c: [201, 221, 243], a: 0.45 }
      ];
      function size() {
        W = cv.clientWidth; H = cv.clientHeight;
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      var t0 = null;
      function draw(t) {
        if (t0 === null) t0 = t;
        var s = (t - t0) / 1000;
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < pools.length; i++) {
          var b = pools[i];
          var dx = Math.sin(s * 0.05 + i * 1.7) * 0.05;
          var dy = Math.cos(s * 0.045 + i * 2.1) * 0.045;
          var cx = (b.x + dx) * W, cy = (b.y + dy) * H, rr = b.r * Math.max(W, H);
          var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
          g.addColorStop(0, 'rgba(' + b.c[0] + ',' + b.c[1] + ',' + b.c[2] + ',' + b.a + ')');
          g.addColorStop(1, 'rgba(' + b.c[0] + ',' + b.c[1] + ',' + b.c[2] + ',0)');
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        }
        requestAnimationFrame(draw);
      }
      size();
      window.addEventListener('resize', size);
      requestAnimationFrame(draw);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
