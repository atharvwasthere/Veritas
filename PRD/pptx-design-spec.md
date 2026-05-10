# Veritas — PPTX Design Spec
**For use with PptxGenJS or python-pptx. Feed this to your coding agent before generating slides.**

---

## Design philosophy

Every slide is a data artifact, not a presentation. Think Bloomberg terminal printed on paper — monochrome, precise, no decoration that doesn't carry information. The slides should look like they came out of a McKinsey print room, not a Canva template.

---

## Global tokens

```
Slide dimensions:   10" × 5.625" (16:9 widescreen)

Colors:
  --ink:          #111111   primary text
  --white:        #FFFFFF   page background
  --sage:         #F3EFEB   card/section fill
  --stone:        #E9EAEB   borders, dividers
  --gray:         #615E5B   secondary/muted text
  --concrete:     #D8D3CC   ghost borders
  --black:        #000000   primary action, dark slides
  --orange:       #FF9900   single accent — used sparingly

Fonts:
  Headers:        Geist (substitute: Inter)       weight 700
  Subheads/UI:    Geist                           weight 500
  Body:           Geist                           weight 400
  Numbers/data:   Geist Mono (substitute: JetBrains Mono)  weight 500
  Labels/caps:    Geist Mono                      weight 500  letter-spacing +0.08em

Margins:
  Slide padding:  0.5" all sides
  Card padding:   0.3" internal
  Element gap:    0.25"
  Section gap:    0.4"
```

---

## Slide 1 — Cover

**Background:** `#000000` (full bleed black — only dark slide in the deck)

**Layout:**

```
┌─────────────────────────────────────────────┐
│  VERITAS  ·  AUDIT REPORT          [V mark] │  ← top bar, white Geist Mono 10pt
│                                             │
│                                             │
│  {Company Name}                             │  ← Geist 52pt weight 700, white
│  {company URL}                              │  ← Geist Mono 12pt, #615E5B
│                                             │
│  Overall risk                               │  ← Geist Mono 10pt caps, #615E5B
│  ██ RED                                     │  ← colored dot + Geist Mono 20pt white
│                                             │
│  {one-line risk summary, max 120 chars}     │  ← Geist 13pt, #615E5B, italic
│                                             │
│  ─────────────────────────────────────────  │  ← 0.5pt white line, 10% opacity
│  Powered by Anakin · {date}                 │  ← Geist Mono 9pt, #615E5B, bottom
└─────────────────────────────────────────────┘
```

**Risk dot colors:**
- GREEN: `#22C55E`
- AMBER: `#FF9900`
- RED: `#EF4444`

**Notes:**
- V logomark top right — white SVG, 28pt equivalent
- Company name is the hero — it should be the largest text on the slide
- No images, no illustrations on this slide — let the black breathe

---

## Slide 2 — Six Audit Categories

**Background:** `#FFFFFF`

**Layout:** 3-column × 2-row grid of score cards

```
┌─────────────────────────────────────────────┐
│  Six audit categories                       │  ← Geist 22pt weight 500, #111111
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │LEGITIMACY│ │FINANCIAL │ │ ONLINE   │    │  ← Geist Mono 9pt caps, #615E5B
│  │          │ │ SIGNALS  │ │PRESENCE  │    │
│  │   7/10   │ │   5/10   │ │   8/10   │    │  ← Geist Mono 36pt weight 500, #111111
│  │ ████░░░  │ │ ████░░░  │ │ ████░░░  │    │  ← score bar: 2pt height, #111111 fill / #E9EAEB bg
│  │ reason…  │ │ reason…  │ │ reason…  │    │  ← Geist 10pt, #615E5B, 2 lines max
│  └──────────┘ └──────────┘ └──────────┘    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │COMPLIANCE│ │  SOCIAL  │ │  GROWTH  │    │
│  │          │ │  PROOF   │ │ SIGNALS  │    │
│  │   9/10   │ │   4/10   │ │   6/10   │    │
│  │ ████░░░  │ │ ████░░░  │ │ ████░░░  │    │
│  │ reason…  │ │ reason…  │ │ reason…  │    │
│  └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────┘
```

**Score card spec:**
- Background: `#F3EFEB`
- Border radius: 12pt (use rounded rect shape in pptx)
- Card size: ~2.8" × 2.1"
- Category label: Geist Mono 9pt weight 500, `#615E5B`, all caps, tracked
- Score number: Geist Mono 36pt weight 500, `#111111`
- Score bar: full-width inside card, 2pt height — `#111111` fill for filled portion, `#E9EAEB` for empty
- Reason text: Geist 10pt weight 400, `#615E5B`, 2 lines max, truncate with ellipsis

**Score colouring rule:**
- 0–3: score number in `#EF4444`
- 4–6: score number in `#F59E0B`
- 7–10: score number in `#111111`

---

## Slide 3 — Top Discrepancies

**Background:** `#FFFFFF`

**Layout:** Vertical list of discrepancy cards

```
┌─────────────────────────────────────────────┐
│  Top discrepancies found                    │  ← Geist 22pt weight 500
│  Cross-verified across 8 public sources     │  ← Geist 12pt, #615E5B
│                                             │
│  ┌─────────────────────────────────────┐    │
│  ▌ CLAIM                               │    │  ← 3pt left border #FF9900
│  │ What the company states publicly    │    │  ← Geist 13pt weight 500, #111111
│  │                                     │    │
│  │ EVIDENCE                            │    │  ← Geist Mono 9pt caps, #615E5B
│  │ What Veritas found                  │    │  ← Geist 12pt, #615E5B
│  │                               [src] │    │  ← Geist Mono 9pt, #D8D3CC pill
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  ▌ CLAIM                               │    │
│  │ ...                                 │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  ▌ CLAIM                               │    │
│  │ ...                                 │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Discrepancy card spec:**
- Background: `#FFFFFF`
- Border: 0.5pt `#E9EAEB` all sides
- Left accent border: 3pt `#FF9900` — the only orange in the deck
- Corner radius: 8pt
- Card height: ~1.0" per item
- Max 3 discrepancies per slide — if more, add a second slide

**If no discrepancies found:**
- Single centered message: Geist 14pt weight 500, `#615E5B`, italic
- Text: *"No material discrepancies surfaced across verified sources."*
- Add a small checkmark icon in `#111111` above it

---

## Slide 4 — SWOT

**Background:** `#FFFFFF`

**Layout:** 2×2 grid, full-bleed quadrants with thin dividers

```
┌─────────────────────────────────────────────┐
│  SWOT analysis                              │  ← Geist 22pt weight 500, top-left
│                                             │
│  ┌──────────────────┬──────────────────┐    │
│  │ S  STRENGTHS     │ W  WEAKNESSES    │    │  ← label: Geist Mono 10pt caps + letter
│  │                  │                  │    │
│  │ • Point one      │ • Point one      │    │  ← Geist 11pt, #111111, bullets
│  │ • Point two      │ • Point two      │    │
│  │ • Point three    │ • Point three    │    │
│  ├──────────────────┼──────────────────┤    │  ← 0.5pt #E9EAEB dividers
│  │ O  OPPORTUNITIES │ T  THREATS       │    │
│  │                  │                  │    │
│  │ • Point one      │ • Point one      │    │
│  │ • Point two      │ • Point two      │    │
│  │ • Point three    │ • Point three    │    │
│  └──────────────────┴──────────────────┘    │
└─────────────────────────────────────────────┘
```

**Quadrant spec:**
- S quadrant background: `#F3EFEB`
- W quadrant background: `#FFFFFF`
- O quadrant background: `#FFFFFF`
- T quadrant background: `#F3EFEB`
- (Alternating fills create subtle visual rhythm without color)
- Quadrant label letter (S/W/O/T): Geist Mono 20pt weight 500, `#111111`, top-left of quadrant
- Quadrant label word (STRENGTHS etc): Geist Mono 9pt weight 500, `#615E5B`, caps, next to letter
- Bullets: Geist 11pt weight 400, `#111111`, max 4 bullets per quadrant
- Bullet symbol: `—` (em dash) not `•` — matches Titan's style
- Divider lines: 0.5pt `#E9EAEB`

---

## Slide 5 — PESTLE

**Background:** `#FFFFFF`

**Layout:** Two-column table — factor left, analysis right

```
┌─────────────────────────────────────────────┐
│  PESTLE risk analysis                       │  ← Geist 22pt weight 500
│                                             │
│  FACTOR          ANALYSIS                   │  ← Geist Mono 9pt caps, #615E5B
│  ──────────────────────────────────────     │  ← 0.5pt #E9EAEB rule
│                                             │
│  POLITICAL       Finding from audit data…   │  ← factor: Geist Mono 11pt weight 500
│                  Second point if needed     │    analysis: Geist 11pt weight 400, #615E5B
│  ──────────────────────────────────────     │
│  ECONOMIC        Finding from audit data…   │
│  ──────────────────────────────────────     │
│  SOCIAL          Finding from audit data…   │
│  ──────────────────────────────────────     │
│  TECHNOLOGICAL   Finding from audit data…   │
│  ──────────────────────────────────────     │
│  LEGAL           Finding from audit data…   │
│  ──────────────────────────────────────     │
│  ENVIRONMENTAL   Finding from audit data…   │
└─────────────────────────────────────────────┘
```

**Table spec:**
- Column split: 1.5" factor / 7.5" analysis
- Factor: Geist Mono 11pt weight 500, `#111111`, all caps
- Analysis: Geist 11pt weight 400, `#615E5B`, sentence case
- Row divider: 0.5pt `#E9EAEB`
- Alternating row fills: none — dividers are enough
- Header row (FACTOR / ANALYSIS): Geist Mono 9pt weight 500, `#615E5B`, all caps, tracked
- High-risk factors: factor label in `#EF4444` instead of `#111111`

---

## Slide order

| # | Slide | Background |
|---|-------|-----------|
| 1 | Cover | `#000000` |
| 2 | Six audit categories | `#FFFFFF` |
| 3 | Top discrepancies | `#FFFFFF` |
| 4 | SWOT analysis | `#FFFFFF` |
| 5 | PESTLE risk analysis | `#FFFFFF` |

Dark → light → light → light → light. The black cover sets tone, everything after is clean and readable.

---

## Typography do's and don'ts

**Do:**
- Geist Mono for all numbers, scores, category labels, factor names
- Geist regular for all body text and analysis
- Weight 500 for slide titles and section headers
- All-caps + letter-spacing for category labels — never title case
- Em dash `—` for bullets, not `•`

**Don't:**
- No accent lines under titles — ever
- No colored header bars or footer strips
- No gradients or shadows
- No bold body text — use weight 500 max
- No images or illustrations inside the report slides (illustration is a web-only element)
- No centered body text — left-align everything except the cover company name

---

## PptxGenJS quick reference

```js
// Dark slide background
slide.background = { color: '000000' };

// Off-white sage card fill
slide.addShape(pres.ShapeType.roundRect, {
  x: 0.5, y: 1.2, w: 2.8, h: 2.1,
  fill: { color: 'F3EFEB' },
  line: { color: 'F3EFEB' },
  rectRadius: 0.12
});

// Geist Mono score number
slide.addText('7/10', {
  x: 0.6, y: 1.5, w: 2.6,
  fontFace: 'JetBrains Mono',
  fontSize: 36,
  bold: true,
  color: '111111'
});

// Category label (caps + tracking)
slide.addText('LEGITIMACY', {
  x: 0.6, y: 1.25, w: 2.6,
  fontFace: 'JetBrains Mono',
  fontSize: 9,
  bold: true,
  color: '615E5B',
  charSpacing: 3
});

// Score bar — empty track
slide.addShape(pres.ShapeType.rect, {
  x: 0.6, y: 2.5, w: 2.6, h: 0.04,
  fill: { color: 'E9EAEB' },
  line: { color: 'E9EAEB' }
});

// Score bar — filled portion (score/10 * width)
const fillWidth = (score / 10) * 2.6;
slide.addShape(pres.ShapeType.rect, {
  x: 0.6, y: 2.5, w: fillWidth, h: 0.04,
  fill: { color: '111111' },
  line: { color: '111111' }
});

// Orange left-border accent for discrepancy cards
slide.addShape(pres.ShapeType.rect, {
  x: 0.5, y: 1.5, w: 0.05, h: 0.9,
  fill: { color: 'FF9900' },
  line: { color: 'FF9900' }
});
```
