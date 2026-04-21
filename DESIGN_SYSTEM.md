# SSP Deal Flow — Design System

A reference for designing on-brand screens, components, and variants. Paste this whole document into Claude (or any AI design tool) as context when generating new UI for the platform.

---

## 1. Brand Identity

**Product:** SSP Deal Flow — a real estate JV investment platform for accredited investors. A division of Southern Specialty Properties.

**Voice:** Confident, premium, transparent. Numbers-forward. Avoid hype.

**Visual mood:** Two coexisting aesthetics:
- **Cream / editorial** — used for marketing surfaces (Home, Track Record, How It Works, Contact). Warm off-white background, ink-black type, accent red for emphasis. Feels like a luxury real estate brochure.
- **Dark luxury** — used for investor-facing detail surfaces (Property Detail, Invest, dialogs). Near-black background, warm cream type, accent red CTAs. Feels like a private investor dashboard.

**Logo:** `[SSP DEAL FLOW]`
- Bebas Neue, all caps, tracking `0.08em`
- Brackets in accent red `#e8432d`, slightly larger than the wordmark (28px vs 22px in nav, 22px vs 17px in footer)
- Wordmark color flips: `#0d0c0b` (cream surfaces) or `#f0ebe3` (dark surfaces)

---

## 2. Color Tokens

All colors live in `client/src/index.css` as CSS variables. Use the variables, not raw hex, when possible.

### 2.1 Cream palette (light surfaces)

| Token | Hex | Usage |
|---|---|---|
| `--cream-base` | `#f7f4ef` | Primary cream background (Home hero, Track Record) |
| `--cream-alt` | `#ede9e1` | Secondary cream (Featured Deals section) |
| `--cream-surface` | `#fffcf7` | Elevated cream card |
| `--cream-ink` | `#0d0c0b` | Primary ink/text on cream |
| `--cream-ink-muted` | `rgba(13,12,11,0.62)` | Body text on cream |
| `--cream-ink-soft` | `rgba(13,12,11,0.42)` | Tertiary text on cream |
| `--cream-border` | `rgba(13,12,11,0.10)` | Hairline border on cream |
| `--cream-border-strong` | `rgba(13,12,11,0.16)` | Emphasized border on cream |
| `--cream-accent-muted` | `rgba(232,67,45,0.08)` | Accent pill background |

### 2.2 Dark luxury palette

| Token | Hex | Usage |
|---|---|---|
| `--bg-hex` | `#0f0e0d` | App background (dark) |
| `--surface-hex` | `#181614` | Card surface |
| `--surface-2-hex` | `#201e1b` | Inset / secondary surface |
| `--surface-3-hex` | `#252220` | Tertiary surface, hover fills |
| `--line` | `#2a2724` | Standard border |
| `--line-light` | `#353129` | Emphasized border / input border |
| `--text-primary` | `#f0ebe3` | Headings on dark |
| `--text-secondary` | `#a89e91` | Body on dark |
| `--text-tertiary` | `#6b6158` | Labels, hints on dark |

### 2.3 Brand & semantic accents (work on both palettes)

| Token | Hex | Usage |
|---|---|---|
| `--accent-hex` | `#e8432d` | Brand red — CTAs, brackets, hot moments |
| `--accent-hover-hex` | `#d63520` | Hover state for accent |
| `--accent-muted` | `rgba(232,67,45,0.12)` | Soft accent fill |
| `--green-hex` | `#22c55e` | Profit, success, "live" |
| `--green-muted` / `--green-border` | rgba | Tinted green panels |
| `--blue-hex` | `#3b82f6` | Equity / projection emphasis |
| `--blue-muted` / `--blue-border` | rgba | Tinted blue panels |
| `--amber-hex` | `#f59e0b` | Warnings, "guaranteed minimum", cash deal |
| `--amber-muted` / `--amber-border` | rgba | Tinted amber panels |

> Tailwind utility colors (`bg-primary`, `text-primary`, `bg-background`, etc.) are wired through shadcn HSL tokens that map back to the dark palette. Use them when working inside shadcn components; use the named CSS variables everywhere else.

### 2.4 Status semantics

| Status | Color | Where |
|---|---|---|
| `AVAILABLE` / Open for Funding | green | Property cards, sidebar pill |
| `COMMITTED` | blue | Property cards, sidebar pill |
| `FUNDED` | blue (with grayscale photo) | Property cards |
| `SOLD` / Completed | amber | Closed deal cards, sidebar pill |
| `Cash Deal` (no JV) | amber | Track Record badge |

---

## 3. Typography

Three families, loaded as Google Fonts.

| Family | CSS var | Usage |
|---|---|---|
| **DM Sans** | `--font-sans` | Default UI font, all body and most headlines |
| **Instrument Serif** *italic* | `--font-serif` | Editorial accent words inside hero headlines (e.g. "*built for*", "*deals*", "*Every number.*") |
| **DM Mono** | `--font-mono` | All numeric values, prices, ROI %, ticker labels, micro-labels |
| **Bebas Neue** | (loaded inline in `Layout.tsx`) | Logo wordmark only |

### 3.1 Type scale (mobile-first, mostly fluid)

```text
Display hero       clamp(52px, 6vw, 76px)  font-bold  tracking-[-0.03em]  leading-[0.88]
Section title      clamp(36px, 4vw, 50px)  font-bold  tracking-[-0.025em] leading-none
Sub-section title  clamp(40px, 5vw, 64px)  font-bold  tracking-[-0.03em]  leading-[0.95]
H3 / card title    text-[15px]             font-semibold/bold
Body large         text-[16px]             leading-[1.75]
Body               text-[15px]             leading-[1.75]
Body small         text-[13px] / text-[12px]
Label / micro      text-[10px] / text-[11px]  font-semibold  tracking-[0.10em–0.14em]  uppercase
Mono numeric       font-mono text-[14px]–text-[clamp(36px,3.5vw,48px)]  tracking-[-0.02em]
```

### 3.2 Headline pattern (signature)

Mix the sans display face with one italic serif accent word. Use accent red for the italic when it sits inside a cream hero; keep it ink-black on white cards.

```tsx
<h1 className="font-bold tracking-[-0.03em] text-[#0d0c0b] mb-4"
    style={{ fontSize: "clamp(52px,6vw,76px)", lineHeight: "0.88" }}>
  Real estate
  <br />
  <em className="not-italic block"
      style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontStyle: "italic", fontWeight: 400, color: "#e8432d" }}>
    built for
  </em>
  investors
</h1>
```

### 3.3 Eyebrow / micro-label pattern

```tsx
<p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#e8432d] mb-3">
  Verified Closed Deals
</p>
```

---

## 4. Spacing, Radius, Layout

### 4.1 Container

- Marketing pages max width: `max-w-[1360px]` with `px-6 sm:px-10 lg:px-14`
- Property gallery max width: `max-w-[1280px]` with `px-4 sm:px-6 lg:px-6`
- App content uses `container mx-auto px-4 sm:px-8`

### 4.2 Section rhythm

- Hero (Home): `pt-6 pb-6 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20`
- Featured / next section: `pt-10 pb-20 lg:py-20`
- Generic content section: `py-12` to `py-20`

### 4.3 Radius scale

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `0.5rem` (8px) | Inline pills, tiny buttons |
| `--radius-md` | `0.75rem` (12px) | Default for buttons, inputs |
| `--radius-lg` | `1rem` (16px) | Small cards |
| `--radius-xl` | `1.5rem` (24px) | Large cards / panels |

In the codebase you'll see `rounded-[20px]` used heavily for hero/property cards (a hair tighter than `rounded-2xl`). Prefer that for any large surface.

### 4.4 Shadows

- Resting card: `shadow-[0_2px_8px_rgba(0,0,0,0.04)]`
- Slightly elevated: `shadow-[0_2px_12px_rgba(0,0,0,0.05)]`
- Hover lift: `hover:shadow-[0_20px_48px_rgba(0,0,0,0.10)]`
- Primary CTA hover (red glow): `hover:shadow-[0_8px_28px_rgba(232,67,45,0.30)]`

---

## 5. Motion

All keyframes live in `client/src/index.css` under `@layer utilities`.

| Keyframe | Used for |
|---|---|
| `fade-up` | Card / list-item entrance (apply with stagger via inline `animationDelay`) |
| `ken-burns` | Slow image zoom on hero photos |
| `tape-scroll-h` | Horizontal state ticker (52s linear infinite) |
| `tape-scroll`, `tape-h`, `ticker-left`, `ticker-right` | Other marquee strips |

Standard interaction:
- Buttons: `transition-all hover:-translate-y-px` (small) or `hover:-translate-y-0.5` (primary CTA)
- Cards: `transition-all hover:-translate-y-1` + image `group-hover:scale-[1.03]–[1.04]` on a `transition-transform duration-500` wrapper
- Nav background change: `transition: "background 0.5s, border-color 0.5s, backdrop-filter 0.5s"`

---

## 6. Component Patterns

### 6.1 Buttons

**Primary (cream surface)** — black pill that flips red on hover:
```tsx
<button className="bg-[#0d0c0b] hover:bg-[#e8432d] text-white font-semibold text-[14px]
                   px-7 py-3.5 rounded-[12px] flex items-center gap-2
                   transition-all hover:-translate-y-px">
  Explore Properties <ArrowRight className="h-4 w-4" />
</button>
```

**Primary (dark surface)** — full-width red CTA:
```tsx
<button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground
                   font-semibold text-[15px] py-4 rounded-[12px]
                   flex items-center justify-center gap-2 transition-all
                   hover:shadow-[0_8px_28px_rgba(232,67,45,0.3)] hover:-translate-y-0.5">
  I'm In · Contact Me →
</button>
```

**Secondary (cream surface)** — white pill, hairline border:
```tsx
<button className="bg-white text-[rgba(13,12,11,0.65)] border border-[rgba(13,12,11,0.1)]
                   hover:border-[rgba(13,12,11,0.25)] hover:text-[#0d0c0b]
                   font-medium text-[14px] px-6 py-3.5 rounded-[12px] transition-all">
  How It Works
</button>
```

**Ghost link button** (View All, etc.):
```tsx
<Link className="text-[13px] font-semibold text-[#0d0c0b]
                 border border-[rgba(13,12,11,0.12)] px-4 py-2.5 rounded-full
                 flex items-center gap-2 hover:bg-[#0d0c0b] hover:text-white transition-all">
  View All <ArrowRight className="h-3.5 w-3.5" />
</Link>
```

### 6.2 Accent pill (eyebrow with dot)

```tsx
<div className="inline-flex items-center gap-2 bg-[rgba(232,67,45,0.06)]
                border border-[rgba(232,67,45,0.16)] rounded-full px-3.5 py-1.5 w-fit">
  <span className="w-1.5 h-1.5 bg-[#e8432d] rounded-full animate-pulse" />
  <span className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-[#e8432d]">
    Accredited Investors Only
  </span>
</div>
```

### 6.3 Status badges (over photos)

Black glass badge — used on photos:
```tsx
<div className="flex items-center gap-1.5 bg-[rgba(10,9,8,0.7)] backdrop-blur-sm
                border border-[rgba(255,255,255,0.12)] rounded-full px-2.5 py-1">
  <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full" />
  <span className="text-[9px] font-bold tracking-[0.07em] uppercase text-[rgba(255,255,255,0.8)]">
    Completed
  </span>
</div>
```

Solid red status tag — sharp corners:
```tsx
<span className="bg-[#e8432d] text-white text-[8px] font-bold tracking-[0.07em]
                 uppercase px-2.5 py-1 rounded-[5px]">
  Open · Needs Funding
</span>
```

Tinted state pill (sidebar):
```tsx
<div className="bg-[var(--green-muted)] border-b border-[var(--green-border)]
                px-5 py-3.5 flex items-center justify-between">
  <div className="flex items-center gap-2 text-[12px] font-semibold text-green-400">
    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
    Open for Funding
  </div>
  <span className="text-[10px] uppercase tracking-wide text-green-400/60">LIVE</span>
</div>
```

### 6.4 Stat cards (cream)

White card with mono numeric, micro label, sparkline, footer row:
```tsx
<div className="bg-white border border-[rgba(13,12,11,0.06)] rounded-[20px] p-5
                flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
  <div className="font-mono text-[clamp(36px,3.5vw,48px)] font-medium text-[#0d0c0b]
                  leading-none tracking-[-0.02em] mb-1">119</div>
  <div className="text-[10px] font-semibold tracking-[0.1em] uppercase
                  text-[rgba(13,12,11,0.3)] mb-4">Deals Closed</div>
  {/* …optional sparkline / footer… */}
</div>
```

Solid red stat card (the equity card):
```tsx
<div className="bg-[#e8432d] rounded-[20px] p-5 relative overflow-hidden">
  <div className="font-mono text-[clamp(32px,3.2vw,44px)] font-medium text-white
                  leading-none tracking-[-0.02em] mb-1">$6.1M</div>
  <div className="text-[10px] font-semibold tracking-[0.1em] uppercase
                  text-[rgba(255,255,255,0.55)]">Total Equity</div>
</div>
```

### 6.5 3-up stat tile row (inside a card)

```tsx
<div className="grid grid-cols-3 gap-px bg-[rgba(13,12,11,0.07)] rounded-[10px] overflow-hidden">
  <div className="bg-[#f7f4ef] px-3 py-2.5">
    <div className="font-mono text-[14px] font-medium text-[#16a34a] leading-none mb-1">$84k</div>
    <div className="text-[8px] font-semibold tracking-[0.09em] uppercase text-[rgba(13,12,11,0.35)]">Profit</div>
  </div>
  {/* …two more tiles… */}
</div>
```

### 6.6 Property card (cream marketplace)

```tsx
<div className="group bg-white border border-[rgba(13,12,11,0.06)] rounded-[20px] overflow-hidden
                cursor-pointer transition-all hover:-translate-y-1
                hover:shadow-[0_20px_48px_rgba(0,0,0,0.1)] hover:border-[rgba(13,12,11,0.12)]
                shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
  <div className="relative aspect-[16/10] overflow-hidden bg-[#c8d8b0]">
    <img className="w-full h-full object-cover transition-transform duration-500
                    group-hover:scale-[1.04]" />
    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.25)] to-transparent" />
    {/* status tag top-left, equity badge bottom-right */}
  </div>
  <div className="p-4">{/* address, city, stat tile row, footer */}</div>
</div>
```

### 6.7 Dark sidebar card (Property Detail "Commit" panel)

```tsx
<div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[20px] overflow-hidden">
  {/* tinted status header */}
  <div className="bg-[var(--green-muted)] border-b border-[var(--green-border)] px-5 py-3.5">…</div>
  <div className="p-5 sm:p-6 space-y-5">
    {/* big mono number, inputs, primary CTA */}
  </div>
</div>
```

### 6.8 Inputs (dark)

```tsx
<input className="w-full bg-[var(--surface-hex)] border border-[var(--line-light)]
                  rounded-[8px] text-[var(--text-primary)] text-[14px] px-4 py-3
                  outline-none placeholder:text-[var(--text-tertiary)]
                  focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
```

### 6.9 State ticker (marquee)

Black strip, mono micro-label on the left, gradient mask, infinite scroll:
```tsx
<div className="bg-[#0d0c0b] py-3.5 overflow-hidden flex items-center">
  <div className="flex-shrink-0 px-6 font-mono text-[9px] font-medium tracking-[0.14em]
                  uppercase text-[rgba(255,255,255,0.25)] border-r border-[rgba(255,255,255,0.07)] mr-5">
    Active across
  </div>
  <div className="overflow-hidden flex-1"
       style={{ maskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)" }}>
    <div className="flex items-center w-max" style={{ animation: "tape-scroll-h 52s linear infinite" }}>
      {/* duplicate the list twice; each item: w-1 dot + uppercase label, separated by border-r */}
    </div>
  </div>
</div>
```

### 6.10 Photo gallery (Property Detail)

- Outer container: `max-w-[1280px]`, rounded `rounded-2xl`, `bg-[var(--surface-hex)]`, `shadow-xl ring-1 ring-black/5`
- Hero photo height: `h-[240px] sm:h-[340px] lg:h-[340px]` (kept short so stats appear above the fold on desktop)
- Top overlay gradient + glass back button (left) + "View All Photos" button (right) + `selected/total` counter (bottom-right)
- Thumbnail strip below: `h-[72px] w-[72px] sm:h-20 sm:w-20 lg:h-[88px] lg:w-[88px]`, selected has `ring-2 ring-white`
- Lightbox: `yet-another-react-lightbox` with `Thumbnails`, `Counter`, `Zoom` plugins; container bg `rgba(0,0,0,0.95)`

### 6.11 Dialog (shadcn)

Use shadcn `Dialog` primitives. They inherit the dark theme via the HSL tokens. Keep:
- Title: `text-[15px] font-semibold text-[var(--text-primary)]`
- Body: `text-[13px] text-[var(--text-secondary)]`
- Primary action uses the dark-surface CTA pattern from 6.1.

---

## 7. Page-Level Patterns

### 7.1 When to use which palette

| Surface | Palette | Notes |
|---|---|---|
| `Home`, `TrackRecord`, `HowItWorks`, `Contact`, `MetaLanding` | Cream | Use `<Layout transparentNavDark>` (cream nav before scroll, dark glass after) |
| `PropertyDetail`, `Invest`, `Qualify`, `SignIn`, `SignUp`, `Admin`, `Properties` (marketplace), dialogs | Dark luxury | Default `<Layout>` or `<Layout transparentNav>` |
| Footer | Always dark (`bg-[var(--bg-hex)]`) | Sits under both palettes |

### 7.2 Hero pattern (cream)

Two-column grid on desktop, stacked on mobile.
- Left column: accent pill → big headline with serif italic accent → muted subhead → CTA row → state pills (desktop) or inline ticker (mobile).
- Right column: a 2x2 grid containing a property hero photo card + two stat cards. On mobile, the photo card appears **after** the stat cards via Tailwind `order-1/2/3 lg:order-1/2/3`.

### 7.3 Hero pattern (dark)

- Tight max-width `max-w-[1280px]`
- Photo gallery first (rounded surface), then a 2-column layout: spec/finance content on the left, sticky `sidebarCommitCard` on the right (dark surface card with status header + CTA).
- Section dividers on the dark theme: `<div className="border-t border-[var(--line)] my-6">` with optional small uppercase label.

### 7.4 Section label (dark)

```tsx
<div className="hidden lg:flex items-center gap-3 mb-6">
  <span className="text-[10px] font-semibold uppercase tracking-[0.12em]
                   text-[var(--text-tertiary)] whitespace-nowrap">Property</span>
  <div className="flex-1 border-t border-[var(--line)]" />
</div>
```

### 7.5 Sticky filter bar (Track Record)

Cream bar `sticky top-[68px] z-40` with a pill group on the left (`bg-[rgba(13,12,11,0.06)] rounded-full p-1`) and a "Showing N deals" counter + select on the right.

---

## 8. Iconography

- Library: `lucide-react`. Stroke width default; never fill.
- Sizes: `h-3 w-3` (inline meta), `h-3.5 w-3.5` (button trailing), `h-4 w-4` (button leading), `h-5 w-5` (nav, generic UI).
- Color follows text color via `currentColor`. For decorative icons next to muted text, use `text-[var(--text-tertiary)]` on dark or `text-[rgba(13,12,11,0.4)]` on cream.

---

## 9. Accessibility & Test IDs

- Every interactive element gets a `data-testid` using `{action}-{target}` (e.g. `button-submit`, `input-email`, `link-profile`).
- Display-only meaningful elements use `{type}-{content}` (e.g. `text-username`, `card-deals-closed`).
- Dynamic items append the id: `card-property-${property.id}`.
- Custom card "buttons" (clickable `<div>`) MUST have `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler that fires the same action on `Enter` / `Space`.
- All images need an `alt` describing the property/content.
- Color contrast: keep accent red for emphasis only; never put long body copy in `#e8432d`. On cream, use `text-[#0d0c0b]` for primary text and `rgba(13,12,11,0.42–0.62)` for muted; on dark, use `--text-primary` / `--text-secondary`.

---

## 10. Copy Conventions

- Numbers are mono and always formatted: `$275,744` (full), `$84k` (compact ≥1k), `$6.4M` (compact ≥1M).
- ROI is shown to one or two decimals with a `%`: `15.3%`, `12.34%`.
- Days held: `94d`.
- Dates: `Apr 6, 2026` (`{ month: "short", day: "numeric", year: "numeric" }`).
- Status words are UPPERCASE in pills: `OPEN`, `COMMITTED`, `FUNDED`, `SOLD`, `CASH DEAL`.
- Marketing voice: short, declarative. e.g. *"Vetted off-market acquisitions across the country. 50/50 profit split at sale. No fees, no pooled capital."*

---

## 11. Cheat Sheet (copy-paste class strings)

```text
# Container
max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14

# Cream hero section
bg-[var(--cream-base)] pt-6 pb-6 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20

# Cream card (resting)
bg-white border border-[rgba(13,12,11,0.06)] rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]

# Cream card hover lift
hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.1)] hover:border-[rgba(13,12,11,0.12)] transition-all

# Dark card
bg-[var(--surface-hex)] border border-[var(--line)] rounded-[20px]

# Primary CTA (cream)
bg-[#0d0c0b] hover:bg-[#e8432d] text-white font-semibold text-[14px] px-7 py-3.5 rounded-[12px] transition-all hover:-translate-y-px

# Primary CTA (dark)
bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[15px] py-4 rounded-[12px] hover:shadow-[0_8px_28px_rgba(232,67,45,0.3)] hover:-translate-y-0.5 transition-all

# Eyebrow (red)
text-[11px] font-semibold tracking-[0.14em] uppercase text-[#e8432d]

# Micro label (muted, on cream)
text-[10px] font-semibold tracking-[0.1em] uppercase text-[rgba(13,12,11,0.3)]

# Mono numeric (large, cream)
font-mono text-[clamp(36px,3.5vw,48px)] font-medium text-[#0d0c0b] leading-none tracking-[-0.02em]

# Mono numeric (small, accent green)
font-mono text-[14px] font-medium text-[#16a34a] leading-none

# Italic serif accent inside an h1
style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontStyle: "italic", fontWeight: 400, color: "#e8432d" }}
```

---

## 12. Using This Doc with Claude (or any AI design tool)

When prompting:

1. **Paste this entire doc as system context** in the conversation.
2. State which palette the screen lives in (cream marketing vs dark luxury).
3. Reference component names from §6 and patterns from §7 by number — e.g. *"Use the eyebrow pattern (3.3), the dark sidebar card (6.7), and the section label (7.4)."*
4. When you want a new variant, ask for it in terms of tokens — e.g. *"replace the white card body in 6.4 with `--cream-surface` and a 1px `--cream-border-strong` ring"* — not raw hex.
5. Always require:
   - `data-testid` attributes on interactive and meaningful display elements (§9)
   - Mono font for any number, not sans
   - The `Instrument Serif` italic accent on at least one word in the headline of any new hero
   - Hover state matching §5

If the AI proposes new colors or fonts, push back — every new surface should be expressible in the tokens above.
