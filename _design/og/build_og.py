#!/usr/bin/env python3
"""Build a per-page Open Graph card (1200x630 PNG) for every public page.

Each card is rendered from card.html (Daybreak palette, site fonts) with the page's
own eyebrow / title / byline / standfirst, screenshotted with headless Chrome, and
written to assets/img/og/<slug>.png. The page's og:image / twitter:image /
og:image:alt tags are then rewritten to point at that card (cache-busted by content hash).

Usage (from the repo root):
    python3 _design/og/build_og.py            # all pages
    python3 _design/og/build_og.py services   # one slug (or several)

Skipped: index.html (keeps the brand card), education-psychodynamic-capacities.html
(bespoke portrait card), redirect stubs, and newsletter-issue-01.html (email archive).
"""
import hashlib, html, os, re, signal, subprocess, sys, tempfile, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "img" / "og"
TEMPLATE = (Path(__file__).parent / "card.html").read_text(encoding="utf-8")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SITE = "https://gerdenio.com"
SITE_NAME = "Gerdenio Manuel Center for Psychotherapy"
SKIP = {"index", "education-psychodynamic-capacities", "newsletter-issue-01"}

def clean(s):
    return re.sub(r"\s+", " ", s or "").strip()

def text(s):
    return clean(html.unescape(re.sub(r"<[^>]+>", "", s or "")))

def title_html(s):
    # keep only <em> for the italic-sky turn; drop every other tag
    s = re.sub(r"<(?!/?em\b)[^>]+>", "", s or "")
    return clean(s)

def meta(src):
    m = re.search(r'<meta name="description" content="([^"]*)"', src)
    return html.unescape(m.group(1)) if m else ""

def extract(path):
    src = path.read_text(encoding="utf-8")
    if re.search(r'http-equiv="refresh"', src):
        return None
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", src, re.S)
    if not h1:
        return None
    post = re.search(r'<p class="post-meta">(.*?)</p>', src, re.S)
    if post:                                   # a Reflections piece
        eyebrow = text(post.group(1))
        byline = re.search(r'<p class="byline">(.*?)</p>', src, re.S)
        stand = re.search(r'<p class="standfirst">(.*?)</p>', src, re.S)
        return dict(eyebrow=eyebrow, title=title_html(h1.group(1)),
                    byline=text(byline.group(1)) if byline else "",
                    sub=text(stand.group(1)) if stand else meta(src))
    eye = re.search(r'<p class="eyebrow[^"]*"[^>]*>(.*?)</p>', src, re.S)
    lede = re.search(r'<p class="lede[^"]*"[^>]*>(.*?)</p>', src, re.S)
    return dict(eyebrow=text(eye.group(1)) if eye else SITE_NAME,
                title=title_html(h1.group(1)), byline="",
                sub=meta(src) or (text(lede.group(1)) if lede else ""))

def render(card, png):
    doc = TEMPLATE
    for k, v in card.items():
        doc = doc.replace("{{" + k + "}}", v if k == "title" else html.escape(v))
    png = Path(png)
    if png.exists():
        png.unlink()
    with tempfile.TemporaryDirectory() as td:
        page = Path(td) / "card.html"
        page.write_text(doc, encoding="utf-8")
        # Chrome writes the screenshot and then lingers (its updater keeps the process alive
        # on this machine), so wait for the file to land and settle, then kill the whole group.
        proc = subprocess.Popen([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                                 "--no-first-run", "--no-default-browser-check",
                                 f"--user-data-dir={td}/profile", "--window-size=1200,630",
                                 "--force-device-scale-factor=1", "--virtual-time-budget=10000",
                                 f"--screenshot={png}", page.as_uri()],
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                start_new_session=True)
        try:
            deadline = time.time() + 90
            size = -1
            while time.time() < deadline:
                time.sleep(0.5)
                if png.exists():
                    cur = png.stat().st_size
                    if cur and cur == size:
                        break
                    size = cur
            else:
                raise RuntimeError(f"Chrome never wrote {png.name}")
        finally:
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            proc.wait()

def retag(path, slug, alt):
    src = path.read_text(encoding="utf-8")
    digest = hashlib.sha1((OUT / f"{slug}.png").read_bytes()).hexdigest()[:8]
    url = f"{SITE}/assets/img/og/{slug}.png?v={digest}"
    n = 0
    for pat in (r'(property="og:image" content=")[^"]*(")', r'(name="twitter:image" content=")[^"]*(")'):
        src, k = re.subn(pat, lambda m: m.group(1) + url + m.group(2), src); n += k
    src, k = re.subn(r'(property="og:image:alt" content=")[^"]*(")',
                     lambda m: m.group(1) + html.escape(alt, quote=True) + m.group(2), src); n += k
    path.write_text(src, encoding="utf-8")
    return n

def main(only):
    OUT.mkdir(parents=True, exist_ok=True)
    for path in sorted(ROOT.glob("*.html")):
        slug = path.stem
        if slug in SKIP or (only and slug not in only):
            continue
        card = extract(path)
        if not card:
            print(f"skip   {slug}"); continue
        png = OUT / f"{slug}.png"
        render(card, png)
        alt = f"{text(card['title'])} · {SITE_NAME}"
        n = retag(path, slug, alt)
        print(f"built  {slug}.png  ({png.stat().st_size//1024} KB, {n} tags)")

if __name__ == "__main__":
    main(set(sys.argv[1:]))
