# AuditAI — Agent Prompt Guide
**Paste this into Cursor / Claude Code before generating any component.**

---

## Design context (read before generating anything)

You are building AuditAI — an enterprise due diligence dashboard for VC analysts. The design follows the Titan financial design system: monochrome, high contrast, editorial. Think McKinsey report meets Linear app.

**Non-negotiables:**
- Fonts: Geist for all text, Geist Mono for all numbers and scores
- Colors: only the palette below — no blues, no grays outside this set
- Buttons: always pill-shaped (160px border-radius) — never square or slightly rounded
- Cards: 32px border-radius, Off-White Sage background (`#f3efeb`)
- No shadows, no gradients, no decorative color except `#ff9900` in SVGs only
- 80px vertical gap between major sections

---

## Quick color reference

```
text primary:    #111111  (--color-midnight-ink)
background:      #ffffff  (--color-canvas-white)
card surface:    #f3efeb  (--color-off-white-sage)
border/divider:  #e9eaeb  (--color-faded-stone)
muted text:      #615e5b  (--color-gunmetal-gray)
ghost border:    #d8d3cc  (--color-soft-concrete)
primary action:  #000000  (--color-action-black)
accent (SVG):    #ff9900  (--color-highlight-orange)
```

---

## Component prompts

### Primary CTA button
```
Create a primary button with:
- background: #000000
- text: #ffffff, Geist 14px weight 500
- border-radius: 160px
- padding: 12px 24px
- no shadow, no border
- hover: background #333333
```

### Ghost button
```
Create a ghost button with:
- background: transparent
- text: #111111, Geist 14px weight 500
- border: 1px solid #d8d3cc
- border-radius: 160px
- padding: 11px 24px
- hover: background #f3efeb
```

### Score card (one of 6 audit categories)
```
Create a score card component with:
- background: #f3efeb
- border-radius: 32px
- padding: 28px
- category label: Geist Mono 11px weight 500, #615e5b, uppercase, letter-spacing 0.06em
- category name: Geist 20px weight 500, #111111
- score number: Geist Mono 48px weight 500, #111111
- score bar: 4px height, full width, #e9eaeb background, #000000 fill
- justification text: Geist 14px weight 400, #615e5b, line-height 1.5
- no shadow, no border
```

### Overall risk badge
```
Create a risk badge component that takes a value: "green" | "amber" | "red"
- border-radius: 160px (pill)
- padding: 8px 20px
- font: Geist Mono 13px weight 500
- green:  background #f3efeb, text #111111, dot #22c55e
- amber:  background #f3efeb, text #111111, dot #ff9900
- red:    background #f3efeb, text #111111, dot #ef4444
- leading dot: 8px circle, colored, inline before text
- no colored backgrounds — only the dot carries the color signal
```

### Discrepancy item
```
Create a discrepancy list item with:
- background: #ffffff
- border: 1px solid #e9eaeb
- border-radius: 20px
- padding: 20px 24px
- left accent bar: 3px solid #ff9900, border-radius 0 on left side
- claim text: Geist 14px weight 500, #111111
- evidence text: Geist 14px weight 400, #615e5b
- source tag: Geist Mono 11px weight 500, #615e5b, background #e9eaeb, border-radius 10px, padding 2px 8px
```

### Loading stepper (shows Anakin API calls firing)
```
Create a loading stepper component with steps array prop.
Each step has: label (string), status ("pending" | "loading" | "done")
- container: no background, no border
- step row: Geist 14px, #111111, display flex, gap 12px, align center
- pending icon: 16px circle, border 1px solid #d8d3cc, no fill
- loading icon: 16px circle, border 2px solid #111111, spinning animation
- done icon: 16px circle, background #111111, white checkmark inside
- connector line: 1px solid #e9eaeb, 24px tall, centered under icon
- active step label: Geist weight 500
- done step label: Geist weight 400, color #615e5b
```

### Section header
```
Create a section header with:
- eyebrow: Geist Mono 11px weight 500, #615e5b, uppercase, letter-spacing 0.06em
- heading: Geist 32px weight 500, #111111, line-height 1.2
- subheading (optional): Geist 16px weight 400, #615e5b, line-height 1.5
- no decorative elements
- margin-bottom: 40px before section content
```

### URL input (homepage hero input)
```
Create a URL input field with:
- background: #ffffff
- border: 1px solid #e9eaeb
- border-radius: 160px (pill shape — matches button)
- padding: 14px 24px
- font: Geist 16px weight 400, #111111
- placeholder color: #615e5b
- focus: border-color #111111, no shadow
- paired with primary CTA button on the right inside the same pill container
- combined pill container border: 1px solid #e9eaeb, border-radius 160px
- button sits flush right inside the pill, no gap
```

### Framework tab panel (SWOT / PESTLE / Porter's)
```
Create a tab panel component for analytical frameworks.
Tabs: Overview | SWOT | PESTLE | Porter's 5 | Risk Heatmap
- tab bar: no background, border-bottom 1px solid #e9eaeb
- tab item: Geist 14px weight 400, #615e5b, padding 12px 0, margin-right 32px, no border-radius
- active tab: color #111111, weight 500, border-bottom 2px solid #111111
- tab panel background: #f3efeb, border-radius 0 32px 32px 32px, padding 32px
- SWOT grid: 2x2, each quadrant has label Geist Mono 11px uppercase + bullet list Geist 14px
- PESTLE table: two columns (factor, implication), Geist Mono 11px headers, Geist 14px rows
```

---

## Page layout

```
Max width: 1200px, centered
Padding: 0 40px on desktop, 0 20px on mobile

Sections in order:
1. Nav — logo left, "Run Audit" button right
2. Hero — headline left (60px Geist 700) + URL input, illustration right
3. How it works — loading stepper visualization, centered
4. Audit results — 6 score cards in 3x2 grid
5. Discrepancies — list of flagged contradictions
6. Frameworks — tabbed panel (SWOT, PESTLE, Porter's, Heatmap)
7. Export — single "Download Report" CTA button, centered
8. Footer — skyline illustration at low opacity, minimal links
```

---

## What NOT to generate

- No Tailwind `shadow-*` classes — zero shadows anywhere
- No `rounded-lg` or `rounded-xl` on buttons — must be `rounded-full` equivalent (160px)
- No color outside the palette — no blues, no purples, no greens on UI elements
- No `font-bold` on body text — max weight 500 for body, 700 only for hero display headline
- No horizontal rules or `<hr>` — use spacing and background color changes for separation
- No card hover lift effects — this is a data app, not a marketing site
