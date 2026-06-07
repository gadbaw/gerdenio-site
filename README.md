# Gerdenio Manuel Center for Psychotherapy — website

Static marketing site (plain HTML + CSS, no build step). Designed in the spirit of
the Austen Riggs Center and the Boston Change Process Study Group: calm, text-forward,
serif-led, generous whitespace, muted sage/cream palette.

Target domain: **gerdenio.com** (not yet purchased).

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Home — hero, philosophy, services overview, name tribute, CTA |
| `about.html` | The Center — orientation, philosophy of change, the name, history |
| `services.html` | Individual therapy · Couples therapy · Psychological assessment |
| `clinicians.html` | Bios for Dr. Gerdenio "Sonny" Manuel and Benjamin Gadbaw |
| `contact.html` | Inquiry form (mailto) + contact details |
| `assets/styles.css` | Shared stylesheet (design tokens at top) |
| `assets/img/manuel-bellarmine-yearbook.jpg` | Archival yearbook profile used in About/Home |

## ⚠️ Placeholders to fill before going live
These are stand-ins I could not verify — please confirm/replace:

1. ~~**Headshots.**~~ ✅ Done — `assets/img/sonny-manuel.jpg` and `assets/img/ben-gadbaw.jpg` are in
   place and wired into `clinicians.html`.
2. ~~**Phone number.**~~ ✅ Done — `(415) 569-3735` set on the contact page and in all footers.
3. **Email** — `hello@gerdenio.com` is assumed; set up the mailbox once the domain is registered.
4. ~~**Address.**~~ ✅ Done — Loyola Jesuit Community, 2600 Turk Blvd, San Francisco, CA 94118.
5. **Fees / insurance** — `services.html` has general language; tighten once panels/sliding scale are confirmed.
6. **Ben's title** — described as "Registered Psychological Associate under the supervision of Dr. Manuel."
   Confirm this matches the actual supervision/registration arrangement for the practice.

## Content sources
- Dr. Manuel: the "Sonny Two-Pager.docx" + usfca.edu faculty page (bio, credentials, testimonials).
- Ben: Psychology Today profile (credentials, modalities, approach).
- History image + "baby Jesuit" detail: the IMG_0726 yearbook scan.
- The Jesuits West "Little Brown Brother" article blocks automated fetch — no content was pulled from it.
  Paste any passages you'd like quoted and I'll add them.

## Run locally
```bash
cd ~/gerdenio-site
python3 -m http.server 4178
# open http://localhost:4178
```
(There's also a `serve.sh` helper and a Claude Code preview config named `gerdenio-site`.)

> Note: this lives in `~/gerdenio-site` (home dir) rather than `~/Documents` because the
> macOS TCC sandbox blocks the preview server from serving files out of `Documents` on this machine.

## Deploy (when gerdenio.com is ready)
Any static host works — Netlify, Cloudflare Pages, GitHub Pages, S3. Drag the folder in, or
point the host at this directory. No build command; publish directory is the folder root.

## Disclaimers in place
Every page footer and the contact page carry a 988 / 911 crisis line, since this is a
mental-health practice site.
