/* gerdenio.com — first-party visit counter.
 *
 * This site is static on GitHub Pages and has no server of its own, so each page
 * reports itself to the practice's own app at portal.gerdenio.com. That app is the
 * only thing that ever hears about a visit: there is no Google Analytics, no
 * advertising pixel, no session recorder, and no third party in the path. For a
 * psychotherapy practice that is not a nicety — a visit to this site is a sensitive
 * fact, and it stays inside the practice.
 *
 * The request carries the page path, the referring URL, and any utm_* tags. It does
 * not set a cookie or read one, does not touch localStorage, and sends no identifier
 * of any kind; the server counts visitors by a code it derives from the connection
 * and throws away nightly (see app/analytics.py).
 *
 * sendBeacon with a text/plain body is a CORS-"simple" request, so this makes no
 * preflight call and needs no cross-origin headers on the far end. The reply is never
 * read, and every failure path is silent — a counter must never be something a
 * visitor can notice.
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://portal.gerdenio.com/a/e';

  // Global Privacy Control: a visitor asking not to be measured isn't measured. Also
  // checked server-side (browsers send Sec-GPC as a header), but stopping here means
  // the request is never made at all.
  if (navigator.globalPrivacyControl) return;

  // Local development and previews shouldn't land in the practice's numbers.
  if (location.protocol === 'file:' || /^(localhost|127\.|\[?::1)/.test(location.hostname)) return;

  try {
    var params = {};
    new URLSearchParams(location.search).forEach(function (v, k) {
      if (k.indexOf('utm_') === 0) params[k] = v;
    });

    var payload = JSON.stringify({
      p: location.pathname,
      r: document.referrer || '',
      q: params
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'text/plain' }));
    } else {
      // Older Safari. keepalive lets the request outlive the page; no-cors because
      // there is nothing to read back.
      fetch(ENDPOINT, {
        method: 'POST', body: payload, keepalive: true, mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' }
      }).catch(function () {});
    }
  } catch (e) { /* never break a page over a page count */ }
})();
