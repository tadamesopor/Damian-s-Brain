# Asset Replacement Checklist

A list of every image and video used on the portfolio, where it lives in
the code, and how to swap the placeholder for the real asset.

---

## Quick status board

Tick each box as you replace the placeholder.

- [ ] Hero background          (essential)
- [ ] About portrait           (essential)
- [ ] Reel video               (essential)
- [ ] Project 01 — Mouse Shader thumbnail
- [ ] Project 02 — PWA Challenge thumbnail
- [ ] Project 03 — API Challenge thumbnail
- [ ] Project 04 — Photography hero shot

---

## File naming convention

Save all real assets here:

```
showcase/
└── portfolio-images/
    ├── hero-bg.jpg              (or hero-bg.mp4 for video)
    ├── about-portrait.jpg
    ├── reel.mp4
    ├── reel-poster.jpg
    ├── project-01-mouse-shader.jpg
    ├── project-02-pwa-challenge.jpg
    ├── project-03-api-challenge.jpg
    └── project-04-photography.jpg
```

Keep the names exactly as listed — the find-and-replace instructions below
assume them.

---

## How to swap (the 30-second version)

1. Drop the new file into `portfolio-images/` with the exact filename.
2. Open `index.html`.
3. Press `Ctrl+F` and search for `ASSET:` — every asset has a comment
   marker right above its tag.
4. Replace the `picsum.photos/...` URL with the relative path
   (e.g. `portfolio-images/hero-bg.jpg`).
5. Save. Refresh the preview. Done.

---

## 1. Hero background  (REQUIRED)

```
File:        portfolio-images/hero-bg.jpg
Aspect:      wide  (2400 × 1400 minimum)
Format:      JPG or WebP, ≤ 600 KB
Mood:        cinematic landscape, misty mountain, golden hour,
             atmospheric fog, no people, no text
Comment tag: <!-- ASSET: hero-bg -->
```

Optionally use a short MP4 instead of a still:

```
File:        portfolio-images/hero-bg.mp4
Length:      6–12 sec, looped, MUTED
Codec:       H.264, ≤ 4 MB
Replace:     <img> with <video autoplay muted loop playsinline>
```

### AI prompt

```
Cinematic wide landscape of a misty mountain valley at golden hour,
atmospheric fog rolling between peaks, warm amber sunlight, moody
but warm, film grain, anamorphic 2.35:1, shot on Arri Alexa,
no people, no text
```

### Stock alternatives

- unsplash.com → search "misty mountain golden hour"
- pexels.com   → search "cinematic landscape fog"
- coverr.co    → search "mountain drone" (if going video)

---

## 2. About portrait  (REQUIRED)

```
File:        portfolio-images/about-portrait.jpg
Aspect:      3:4 vertical  (1200 × 1600 minimum)
Format:      JPG or WebP, ≤ 400 KB
Mood:        moody portrait, warm backlight, cinematic, OR an
             atmospheric outdoor self-shot if you don't have a
             portrait
Comment tag: <!-- ASSET: about-portrait -->
```

### AI prompt

```
Moody atmospheric portrait of a young man holding a camera in
a misty forest, warm golden backlight, cinematic, shallow depth
of field, 35mm film grain, 3:4 vertical, no text
```

### Stock alternatives

- unsplash.com → search "cinematic portrait fog"
- pexels.com   → search "photographer portrait moody"

---

## 3. Reel video  (REQUIRED)

```
File:        portfolio-images/reel.mp4
Aspect:      21:9 cinematic letterbox
Length:      10–30 sec, MUTED, autoplay loop
Codec:       H.264, ≤ 6 MB
Comment tag: <!-- ASSET: reel-video -->

Poster fallback (shown until video loads):
File:        portfolio-images/reel-poster.jpg
Aspect:      21:9, ~2400 × 1030
```

### AI prompt (Runway / Kling / Pixverse)

```
Slow aerial drone shot flying over misty pine forest at dawn,
warm golden light cutting through fog, cinematic anamorphic,
slow smooth motion, no cuts, no text
```

### Stock alternatives

- coverr.co              → free cinematic loops, no watermark
- pexels.com/videos      → search "cinematic landscape drone"
- pixabay.com/videos     → search "aerial mountain"

---

## 4. Project thumbnails  (4 cards)

Use REAL screenshots of your work — do not generate these.

```
Aspect:      16:10  (1400 × 875 recommended)
Format:      JPG or WebP, ≤ 250 KB each
Comment tag: <!-- ASSET: project-NN -->
```

| # | File                                  | Suggested content                              |
|---|---------------------------------------|------------------------------------------------|
| 01| project-01-mouse-shader.jpg           | Screenshot of your mouse-shader running        |
| 02| project-02-pwa-challenge.jpg          | Screenshot of the PWA in mobile or desktop     |
| 03| project-03-api-challenge.jpg          | Screenshot of the API project's UI             |
| 04| project-04-photography.jpg            | Your single best photograph                    |

### Tip for screenshots

- Capture at 2x resolution if your display supports it.
- Crop tightly — no browser chrome.
- Use a slight darkening pass in any image editor so they sit well
  on the dark background. The CSS already applies
  `brightness(0.7) contrast(1.05) saturate(0.9)`, so don't over-edit.

---

## Optimization workflow (recommended)

After you've gathered the raw files, run them through:

```
Tool:        squoosh.app  (free, browser-based, by Google)
Settings:    WebP, quality 75–80
Result:      40–60% smaller files, same visual quality
```

Save optimized versions OVER the originals so the filenames stay the
same — no code change needed.

For video:

```
Tool:        handbrake.fr  (free, desktop)
Preset:      "Web — Vimeo YouTube HQ 1080p60"
Format:      MP4, H.264, web-optimized
Bitrate:     ~2 Mbps for hero loops, ~3.5 Mbps for the reel
```

---

## Verifying after replacement

1. Open `index.html` in the preview.
2. Hard-refresh:  `Ctrl + Shift + R`
3. Check each section:
   - Hero image loads, Ken Burns zoom is smooth.
   - About portrait shows parallax on scroll.
   - Reel autoplays muted and loops.
   - All four project cards have your real screenshots.
4. Open DevTools → Network tab → reload. Confirm:
   - No 404s on any image/video.
   - Total page weight under 8 MB.
   - LCP (largest contentful paint) under 2.5 s.

---

## If something breaks

- **Image looks washed out**: the CSS filter is too strong. Open
  `style.css`, search for `brightness(0.7)`, and bump it to `0.85`.
- **Video won't autoplay**: must be `muted` AND `playsinline`. Both
  attributes are already set in the markup — don't remove them.
- **Layout shifts when image loads**: every image already has a fixed
  `aspect-ratio` on its container, so this shouldn't happen. If it
  does, check that you didn't change the container CSS.

---

_Last updated when the build was generated. Update the status board
as you go._
