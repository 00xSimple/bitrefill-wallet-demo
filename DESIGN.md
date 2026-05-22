# Design System

## 1. Visual Theme & Atmosphere

This project is a web wallet where users keep full asset sovereignty while experiencing near-zero blockchain complexity. The design language reflects this dual nature: it is calm and trustworthy enough for a financial interface, yet light and modern enough to feel like a consumer app. Every design decision serves the product principles — tokens over chains, clarity over chrome, and human control over automation.

The visual identity is built on the current runtime token system in `packages/ui/src/styles/globals.css`, consuming CSS semantic variables as the source of truth. Clean white page surfaces (`--background`, `--surface-page`) and soft neutral elevated surfaces (`--card`, `--popover`) dominate the canvas, providing an open and breathable backdrop for dense financial data. Primary Blue (`--primary`) remains the main interactive accent for CTAs, active states, and links. Supporting cyan (`--brand-secondary`) appears in brand moments, charts, and identity gradients, while `--accent` is reserved for selected and open-state surfaces.

Typography is anchored in **Inter** with **Noto Sans SC** as the Chinese fallback. Repo typography uses explicit semantic text tokens in `globals.css` rather than Figma style exports.

Dark mode is not an afterthought — it is a first-class citizen. The dark palette uses deep-ocean semantic surfaces, explicit border tokens, and mode-specific brand values from the current CSS token set.

**Key Characteristics:**
- Inter + Noto Sans SC type stack, with semantic text utilities such as `text-title-sm` and `text-body-md`
- Luminous light theme: white `--background` / `--surface-page` with soft neutral `--card` and `--popover` surfaces
- Single primary action family: `--primary`, `--primary-hover`, `--primary-active`, `--primary-disabled`, and `--primary-soft`
- Supporting cyan: `--brand-secondary` / `--chart-2` for gradients, charts, and secondary brand moments
- Semantic accent surface: `--accent` for subtle selected, open, and low-emphasis interactive backgrounds
- Token-centric data display — financial information presented in clean, scannable layouts
- Generous rounded corners (12–20px on cards, full pill on CTAs) creating a soft, approachable feel
- Soft, layered shadows using semantic shadow color tokens and CSS `color-mix(...)` for depth that scales by mode
- 4pt base spacing token with an 8px visual rhythm across components
- Dark mode as equal citizen — deep-ocean surfaces with explicit semantic foreground, border, and effect tokens

### Token Source Rules

- Treat `packages/ui/src/styles/globals.css` as the canonical source for colors, density, radius, motion, typography utilities, and effect tokens.
- Update this document when `globals.css` changes materially, so generated UI follows the app users actually see.
- Do not consume one-off Figma style names directly; map typography into explicit semantic text tokens first.
- Shadow color and structure are defined by the CSS `--shadow-*` variables.

## 2. Color Palette & Roles

### Brand

- **Primary Blue** (`#007fff`): `--primary`, `--brand`. The singular interactive accent — CTAs, active navigation, progress bars, and links. This is the identity color.
- **Brand Secondary Cyan** (`#0cc5ff`): `--brand-secondary`, `--chart-2`. Secondary brand color for gradients, chart accents, and supporting highlights. Never competes with Primary Blue for CTA attention.
- **Brand Hover** (`#006cd9`): `--brand-hover`, `--chart-3`. Darker blue for hover states and brand-derived chart accents.

### Surfaces — Light

- **Page Background** (`#ffffff`): `--background`, `--surface-page`. The base canvas for starter pages and demos.
- **Card Neutral** (`#f8f9fa`): `--card`, `--popover`, `--muted`, `--surface-cool`. Soft neutral surfaces for elevated cards and floating containers.
- **Input Surface** (`#f0f1f3`): `--input`, `--input-background`. Soft field and input chrome surface.
- **Cool Surface** (`#f8f9fa`): `--surface-cool`. Neutral light surface for subtle section differentiation.
- **Soft Surface** (`rgba(240, 241, 243, 0.96)`): `--surface-light`. Semi-transparent light surface for overlay contexts.
- **Secondary** (`#f0f1f3`): `--secondary`, `--muted`. Neutral gray for secondary buttons, muted backgrounds, and inactive states.
- **Accent Surface** (`#e7f1fc`): `--accent`. Soft accent wash for open states, subtle highlights, and low-emphasis interactive surfaces.
- **Surface Blue** (`#e7f1fc`): `--surface-blue`. Light blue wash for feature highlights and info backgrounds.
- **Surface Blue Light** (`#cfe4fa`): `--surface-blue-light`. Badge backgrounds, subtle blue tint areas.
- **Surface Blue Dim** (`#a2cdf7`): `--surface-blue-dim`. Softer blue surface for icon containers.
- **Surface Blue Info** (`#d0f0fa`): `--surface-blue-info`. Informational cyan-blue surface backgrounds.

### Surfaces — Dark

- **Dark Background** (`#0c1637`): dark `--background`, `--surface-page`, and `--surface-cool`. The deep-ocean canvas in dark mode.
- **Dark Card** (`#0f1a43`): Dark `--card`, `--popover`, `--secondary`, and elevated surfaces.
- **Dark Accent** (`#004c99`): Dark `--accent`, `--primary-soft`, and selected-state surfaces.
- **Dark Surface Blue** (`#002952`): Dark mode equivalent of blue-tinted surfaces.

### Text — Light

- **Foreground** (`#111d4a`): `--foreground`. Primary heading and body text on light backgrounds — a deep navy-black that is warmer than pure black.
- **Secondary Foreground** (`#111d4a`): `--secondary-foreground`. Matches foreground on secondary surfaces.
- **Muted Foreground** (`#99a1af`): `--muted-foreground`. Secondary text, descriptions, labels — a cool mid-gray.
- **Tertiary** (`#99a1af`): `--text-tertiary`. Placeholder text, least-prominent labels.
- **Secondary Gray** (`#475467`): `--text-secondary-gray`. Slightly darker than muted, for important secondary info.

### Text — Dark

- **Foreground** (`#ffffff`): Dark `--foreground`. Primary text on dark backgrounds.
- **Muted Foreground** (`rgba(255, 255, 255, 0.6)`): Dark `--muted-foreground`. Secondary text in dark mode.
- **Tertiary** (`rgba(255, 255, 255, 0.4)`): Dark `--text-tertiary`. Low-prominence labels in dark mode.
- **Secondary Gray** (`rgba(255, 255, 255, 0.6)`): Dark `--text-secondary-gray`.

### Semantic — Interactive

- **Primary** (`#007fff`): `--primary`. Button fills, active states, links.
- **Primary Foreground** (`#ffffff`): `--primary-foreground`. Text on primary-colored surfaces.
- **Accent** (`#f0f7ff` light / `#282b31` dark): `--accent`. Selected surfaces, close-button states, and low-emphasis interactive backgrounds.
- **Accent Foreground** (`#111d4a` light / `#ffffff` dark): `--accent-foreground`. Text on accent surfaces.
- **Ring** (`oklch(0.708 0 0)` light / `oklch(0.439 0 0)` dark): `--ring`. Neutral focus token used with `border-ring` and `ring-ring/50`.

### Semantic — Feedback

- **Success** (`#4bce71` light / `#62d082` dark): `--success`. Completed states, positive confirmations.
- **Success Text** (`#228e42` light / `#62d082` dark): `--success-text`. Text-optimized success color.
- **Success Surface** (`#daf1e1` light / `#2d7c44` dark): `--success-surface`. Background tint for success states.
- **Success Border** (`#8adaa1` light / `#30bb58` dark): `--success-border`. Subtle border for success cards.
- **Success Surface Tint** (`#daf1e1` light / `#2d7c44` dark): `--success-surface-tint`. Light success wash for completed step cards.
- **Warning** (`#fc8c4d` light / `#f88e53` dark): `--warning`. Cautionary highlights, warning borders, and low-emphasis warning backgrounds.
- **Positive** (`#4bce71` light / `#62d082` dark): `--positive`. Profit, gains, positive P&L values.
- **Positive Surface** (`#daf1e1` light / `#2d7c44` dark): `--positive-surface`. Background for positive badges.
- **Destructive** (`#f3636f` light / `#ef626e` dark): `--destructive`. Errors, dangerous actions, negative states.

### Borders

- **Border** (`#ecedf1` light / `#4d5677` dark): `--border`. Default border color — barely visible, structurally defining.
- **Input Token** (`#f0f1f3` light / `#080e25` dark): `--input`. Input border / field surface token for soft controls.
- **Info Border** (`#0cc5ff` light / `#32cafa` dark): `--info-border`. Active step card borders, informational highlights.

### Overlays

- **Overlay Scrim** (`bg-dark-surface/50`): Dialog, sheet, drawer, and alert overlays use the dark-surface token instead of pure black for a softer, theme-aligned backdrop.

### Charts

| Token | Light | Dark |
|-------|-------|------|
| `--chart-1` | `#007fff` | `#007fff` |
| `--chart-2` | `#0cc5ff` | `#0cc5ff` |
| `--chart-3` | `#006cd9` | `#007fff` |
| `--chart-4` | `#f8f9fa` | `#0c1637` |
| `--chart-5` | `#111d4a` | `#888ea4` |

## 3. Typography Rules

### Font Family

- **Primary**: `"Inter", "Noto Sans SC", ui-sans-serif, system-ui, -apple-system, sans-serif` — `--font-sans`
- **Heading**: Same as primary — `--font-heading`. No separate display font; weight and size create hierarchy.
- **Chinese**: `"Noto Sans SC", "Inter", ui-sans-serif, system-ui, sans-serif` — `--font-chinese`

### Rendering

- `text-rendering: optimizeLegibility`
- `-webkit-font-smoothing: antialiased`
- `-moz-osx-font-smoothing: grayscale`

### Hierarchy

| Role | Size | Weight | Line Height | Tracking | Token / Notes |
|------|------|--------|-------------|----------|---------------|
| Display / Hero | 40px (2.5rem) | 700 | 48px | tight | `--text-display-lg` |
| Page Title | 28px (1.75rem) | 700 | 36px | tight | `--text-title-lg` |
| Section Title | 24px (1.5rem) | 700 | 32px | snug | `--text-title-md` |
| Card Title | 20px (1.25rem) | 600 | 28px | normal | `--text-title-sm` |
| Body Large | 16px (1rem) | 400–600 | 24px | normal | `--text-body-lg` |
| Body | 14px (0.875rem) | 400–600 | 20px | normal | `--text-body-md` |
| Body Small | 13px (0.8125rem) | 400–500 | 20px | normal | `--text-body-sm` |
| Caption | 12px (0.75rem) | 400–600 | 16px | normal | `--text-caption` |
| Micro | 11px (0.6875rem) | 400–600 | 1.33 | normal | `--text-2xs` — stat cell labels, smallest text |
| Uppercase Label | 11px | 600 | 1.0 | 0.08em | Balance section label ("UNIFIED BALANCE") |

### Extended Font Sizes

| Token | Value | Use |
|-------|-------|-----|
| `--text-2xs` | 0.6875rem (11px) | Micro labels, stat cell labels |
| `--text-xs-plus` | 0.8125rem (13px) | Chat bubbles, descriptions, secondary info |
| `--text-sm-plus` | 0.9375rem (15px) | Step card labels, emphasized body text |

### Principles

- **Single family, variable weight**: Noto Sans Variable covers the full 100–900 weight axis. The design system uses 400 (regular), 600 (semibold), and 700 (bold). No other weights appear in components.
- **Size creates hierarchy, not font swapping**: All text uses the same typeface family. Hierarchy is established through size differences (11px to 40px), weight contrasts (400 vs 700), and color opacity shifts.
- **Tight headings, relaxed body**: Display and title text uses tight leading (1.0–1.3) for density and impact. Body text opens to 1.5 line-height for comfortable reading. Chat bubbles use `leading-relaxed`.
- **Semibold as workhorse**: Most emphasis uses weight 600 (semibold) rather than 700 (bold). Bold is reserved for primary headings and financial numbers.

## 4. Component Stylings

### Button

**Primary (Default CTA)**
- Background: `--primary` (`#007fff`)
- Text: `--primary-foreground` (`#ffffff`)
- Shadow: `--shadow-cta-sm` (`0 6px 16px color-mix(in srgb, var(--shadow-cta-color) 80%, transparent)`)
- Shape: `rounded-full` (pill)
- Height: 40px (default), 48px (lg), 56px (hero)
- Font: 14px, weight 500
- Hover: brightness shift
- Focus: `--ring` outline
- Hero variant: larger shadow `--shadow-cta` (`0 12px 28px var(--shadow-cta-color)`)

**Secondary**
- Background: `--secondary` (`#f0f1f3`)
- Text: `--secondary-foreground` (`#111d4a`)
- Shape: `rounded-full`
- Shadow: none
- Use: Secondary actions alongside Primary

**Outline**
- Background: transparent
- Border: 1px solid `--border`
- Shape: `rounded-full`
- Use: Tertiary actions, less emphasis

**Ghost**
- Background: transparent
- Text: `--muted-foreground`
- Hover: `foreground/6` background tint
- Shape: `rounded-full`
- Use: Toolbar actions, subtle interactions

**Foreground**
- Background: `--foreground` (`#111d4a` / `#ffffff`)
- Text: `--background` (inverse)
- Shape: `rounded-full`
- Use: High-contrast inverse CTA

**Destructive**
- Background: `--destructive`
- Text: `--destructive-foreground`
- Use: Dangerous actions (close, delete)

**Link**
- Text: `--primary` (`#007fff`)
- Underline on hover, offset 4px
- Use: Inline text links

**Size Scale**

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `hero` | 56px (h-14) | px-8 | 16px, semibold |
| `lg` | 48px (h-12) | px-6 | 14px, semibold |
| `default` | 40px (h-10) | px-5 | 14px, medium |
| `sm` | 32px (h-8) | px-4 | 12px, medium |
| `xs` | auto | px-3, py-2 | 12px, medium |
| `icon` | 36px (size-9) | — | — |
| `icon-sm` | 32px (size-8) | — | — |

### IconButton

Circular icon-only buttons for toolbar and nav actions.

| Variant | Background | Icon Color |
|---------|------------|------------|
| `ghost` | transparent → `foreground/6` on hover | `--text-tertiary` |
| `muted` | `--secondary` | `--secondary-foreground` |
| `foreground` | `--foreground` | `--background` |

| Size | Dimensions | Icon Size |
|------|------------|-----------|
| `sm` | 36×36px | 16px |
| `md` | 40×40px | 20px |
| `lg` | 48×48px | 20px |

### ActionButton & ActionBar

Full-width action buttons arranged in a responsive grid.

- **Primary**: `--primary` background, `--primary-foreground` text, `--shadow-cta-sm` shadow
- **Secondary**: `--secondary` background, `--secondary-foreground` text
- Height: 48px (h-12), `rounded-full`, semibold 14px
- Icon: 16px with stroke-width 2.5
- Grid: 2-column or 4-column (`grid-cols-2`, `xl:grid-cols-4`), gap 12px

### Badge

Status pills with icon support and semantic color variants.

| Variant | Background | Text |
|---------|------------|------|
| `primary` | `--surface-blue-light` | `--primary` |
| `success` | `--success-surface` | `--success-text` |
| `neutral` | `--secondary` | `--secondary-foreground` |
| `positive` | `--positive-surface` | `--positive` |
| `destructive` | `--destructive` at 10% opacity | `--destructive` |

| Size | Padding | Font |
|------|---------|------|
| `sm` | px-2, py-0.5 | 11px (`text-2xs`) |
| `md` | px-3, py-1.5 | 12px (`text-xs`) |
| `lg` | px-4, py-2 | 12px (`text-xs`) |

Shape: `rounded-full`, semibold weight. Optional leading icon at 16px.

### Toast / Toaster

Feedback toasts sit on a neutral card surface and communicate state through semantic border tokens.

- Base: `bg-card`, `border-border`, `text-foreground`, `shadow-[var(--shadow-card)]`
- Action button: `bg-primary`, `text-primary-foreground`
- Success: `border-success`
- Warning: `border-warning`
- Error: `border-destructive`
- Info: `border-primary`

### Avatar

Token and user avatars with image or letter fallback.

| Size | Dimensions | Image Size |
|------|------------|------------|
| `xs` | 28×28px | 16px |
| `sm` | 32×32px | 20px |
| `md` | 40×40px | 24px |
| `lg` | 48×48px | 32px |

- Shape: `rounded-full`
- Custom `bgColor` prop for token-branded backgrounds (e.g., `rgba(39,117,202,0.12)` for USDC)
- Fallback: `ReactNode` — typically a bold letter in the token's brand color

### Card

Multi-slot card component with flexible composition.

- Background: `--card` (`#ffffff` / `#282b31`)
- Text: `--card-foreground`
- Shape: `rounded-xl` (12px)
- Border: `ring-1 ring-foreground/10`
- Padding: 16px (default), 12px (`size="sm"`)
- Gap: 16px between slots (12px for small)
- Slots: `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`
- Footer: `border-t bg-muted/50`, rounded bottom corners

### SectionPanel

Section-level container for dashboard content.

| Variant | Shadow |
|---------|--------|
| `default` | `--shadow-card` |
| `elevated` | `--shadow-card-md` |
| `flat` | none |

| Padding | Value |
|---------|-------|
| `sm` | 16px |
| `md` | 20px |
| `lg` | 24px |
| `xl` | 24px → 32px at `sm:` breakpoint |

- Shape: `rounded-xl`, `border-border`, `bg-card`

### IconBox

Large icon containers for onboarding, hero, and feature sections.

| Variant | Background | Icon Color |
|---------|------------|------------|
| `primary` | `--primary` | `--primary-foreground` |
| `primary-soft` | `--surface-blue-dim` | `--primary` |
| `success` | `--success` | `--success-foreground` |
| `neutral` | `--secondary` | `--secondary-foreground` |
| `foreground` | `--foreground` | `--background` |

| Size | Dimensions | Corner Radius | Icon Size |
|------|------------|---------------|-----------|
| `xs` | 32×32px | 10px | 16px |
| `sm` | 40×40px | 12px | 20px |
| `md` | 64×64px | 20px | 32px |
| `lg` | 88×88px | 28px | 44px |
| `xl` | 96×96px | 28px | 48px |
| `2xl` | 122×122px | 34px | 64px |

### Chip

Selectable pill chips for filters and suggestions.

- Default: `border-border`, `bg-card`, `text-foreground`
- Selected: `border-primary`, `bg-primary/8`, `text-primary`
- Height: 32px (sm), 36px (md)
- Shape: `rounded-full`
- Font: 13px (`text-xs-plus`), medium weight

### ChatBubble

Agent chat message bubbles.

- **Incoming**: `bg-surface-blue`, `text-muted-foreground`
- **Outgoing**: `bg-primary`, `text-primary-foreground`, `--shadow-cta-sm` shadow
- Shape: `rounded-18` (18px)
- Padding: 16px
- Font: 13px (`text-xs-plus`), `leading-relaxed`

### Input

Standard text input field.

- Height: 48px
- Shape: `rounded-md` (12px in the current Tailwind token map)
- Border: 1px solid `--border`
- Background: `--input-background`
- Placeholder: `--muted-foreground`
- Focus: `border-ring`, `ring-3 ring-ring/50`
- Font: 14px (`text-body-md`)
- Padding: px-4

### Progress

Linear progress bar with animated fill.

| Variant | Track | Bar |
|---------|-------|-----|
| `primary` | `--primary` at 16% opacity | `--primary` |
| `success` | `--progress-track` | `--success` |

| Size | Height |
|------|--------|
| `sm` | 6px |
| `md` | 8px |

- Shape: `rounded-full`
- Animation: 420ms with `--ease-emphasis` timing function

### NavItem

Sidebar navigation items.

- Active: `bg-primary`, `text-primary-foreground`, `--shadow-nav-active`
- Inactive: `text-muted-foreground`, `hover:bg-secondary`
- Destructive: `text-destructive`, `hover:bg-destructive/8`
- Height: 44px (h-11)
- Shape: `rounded-lg`
- Icon: 16px, leading
- Font: 14px, medium weight
- Spacing: `mb-1` between items

### StepCard

Onboarding step indicators with tri-state visuals.

| State | Border | Background | Icon Container |
|-------|--------|------------|----------------|
| `completed` | `--success-border` | `--success-surface-tint` | `bg-success text-success-foreground` |
| `active` | `--info-border` | `--surface-blue` | `bg-surface-blue-dim text-primary` |
| `pending` | `--border` | `--card` | `bg-surface-blue-dim text-primary` |

- Shape: `rounded-xl`
- Icon container: 40×40px, `rounded-full`
- Completed icon overrides to checkmark
- Title: 15px (`text-sm-plus`), bold
- Detail: 13px (`text-xs-plus`), relaxed leading, `--muted-foreground`

### AssetRow

Token display row for portfolio views.

- Layout: flex, `justify-between`, `items-center`
- Padding: px-3, py-3
- Shape: `rounded-lg`
- Left: Avatar + symbol (16px semibold) + amount (14px muted)
- Right: value (16px semibold) + detail (14px medium, custom color)

### HoldingCard

Dashboard stat card for holdings.

- Shape: `rounded-20`, border, `bg-card`
- Shadow: `--shadow-card`
- Padding: 20px
- Label: 14px, `--muted-foreground`
- Amount: 24px (`text-2xl`), bold
- Suffix: 12px, `--muted-foreground`
- Value: 14px, semibold
- Change: 12px, `text-success`, semibold
- P&L: 12px, `--muted-foreground`

### TaskCard

Trading agent task cards with stats and progress.

- Shape: `rounded-18`, border
- Padding: 16px
- Title: 14px, semibold
- Subtitle: 12px, `--muted-foreground`
- Stats grid: 3-column (default) or 2-column (compact), gap 12px
- Progress: 6px track, `bg-primary/16` → `bg-primary` fill
- Actions: `border-t`, pt-4, flex with gap-2

### StatCell

Minimal label-value pair for data grids.

- Label: 11px (`text-2xs`), `--muted-foreground`
- Value: 13px (`text-xs-plus`), semibold
- Gap: mt-1 (4px) between label and value

### FeatureItem

Feature highlight rows for onboarding screens.

- Shape: `rounded-20`
- Background: `--surface-blue`
- Padding: px-4, py-3
- Icon container: 32×32px, `rounded-full`, `bg-card`, `--primary` icon, `--shadow-icon`
- Text: 14px, medium weight, `--foreground`

### ChecklistCard

Task checklist items.

- Shape: `rounded-lg`, border
- Padding: 16px
- Title: 14px, semibold
- Description: 12px, relaxed leading, `--muted-foreground`
- Optional `tone` background color prop
- Optional action slot (mt-3)

## 5. Layout Principles

### Spacing System

- **Base unit**: 4px (`--spacing: 0.25rem`)
- **Grid**: Strict 4pt system — all spacing, padding, margins, and sizes must be multiples of 4px
- **Primary rhythm**: Most layout cadence still lands on 8px increments layered on top of the 4px base
- **Scale**: 0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64px

| Token | Use |
|-------|-----|
| 2–4px | Micro spacing (badge padding, label gaps) |
| 8px | Icon gaps, tight element spacing |
| 12px | Component internal gaps, grid gaps |
| 16px | Standard padding (cards, panels, sections) |
| 20px | Elevated panel padding |
| 24px | Large panel padding, section spacing |
| 32px | Section-to-section gaps on desktop |
| 48px | Major section separation |

### Grid & Container

- Max content width: `max-w-5xl` (1024px) for main content
- Max form/card width: `max-w-md` (448px) for single-column content
- Max 2-column width: `max-w-2xl` (672px) for card grids
- Page horizontal padding: 24px (`px-6`)
- Content vertical padding: 32px (`py-8`)
- Section vertical gap: 48px (`space-y-12`)

### Border Radius Scale

| Token | Value | Use |
|-------|-------|-----|
| `--radius-xs` | 4px | Micro elements |
| `--radius-sm` | 8px | Inputs, small buttons, checklist cards |
| `--radius-10` | 10px | IconBox xs |
| `--radius-md` | 12px | Cards, section panels, step cards |
| `--radius-lg` | 16px | — |
| `--radius-18` | 18px | Chat bubbles, task cards |
| `--radius-20` | 20px | Holding cards, feature items, icon box md |
| `--radius-xl` | 24px | — |
| `--radius-28` | 28px | IconBox lg/xl |
| `--radius-2xl` | 32px | — |
| `--radius-34` | 34px | IconBox 2xl |
| `--radius-3xl` | 32px | Large app-level demo panels only |
| `--radius-4xl` / `--radius-pill` | 9999px | True pill controls |
| `--radius-full-pill` | 9999px | True pill controls |
| `rounded-full` | 9999px | Buttons, badges, avatars, chips, icon buttons — the signature pill shape |

### Whitespace Philosophy

- **Breathing room through surface color**: Rather than relying solely on spacing, the system uses `--surface-page` (warm off-white) as the page canvas with `--card` (pure white) cards floating above it. The color difference creates visual separation.
- **Tight within, generous between**: Components have compact internal spacing (12–16px padding) while section-to-section spacing is generous (48px). This creates dense, scannable information blocks separated by clear visual breaks.
- **Financial data density**: Portfolio views, stat grids, and trading cards pack data tightly (4–8px gaps between label/value pairs) while maintaining readability through color hierarchy (primary vs muted foreground).

## 6. Depth & Elevation

| Level | Token | Value | Use |
|-------|-------|-------|-----|
| Flat (Level 0) | — | No shadow | Page background, flat panels |
| Card (Level 1) | `--shadow-card` | `0 8px 24px color-mix(in srgb, var(--shadow-card-color) 55%, transparent)` | Default section panels, list cards |
| Card Medium (Level 2) | `--shadow-card-md` | `0 12px 32px color-mix(in srgb, var(--shadow-card-color) 70%, transparent)` | Elevated panels, page headers |
| Card Large (Level 3) | `--shadow-card-lg` | `0 24px 56px color-mix(in srgb, var(--shadow-card-color) 75%, transparent)` | Prominent feature cards |
| Icon | `--shadow-icon` | `0 10px 28px color-mix(in srgb, var(--shadow-card-color) 70%, transparent)` | Feature item icon containers |
| CTA Small | `--shadow-cta-sm` | `0 6px 16px color-mix(in srgb, var(--shadow-cta-color) 80%, transparent)` | Default primary buttons, outgoing chat bubbles |
| CTA | `--shadow-cta` | `0 12px 28px var(--shadow-cta-color)` | Hero buttons, large icon boxes |
| CTA Large | `--shadow-cta-lg` | `0 20px 48px color-mix(in srgb, var(--shadow-cta-color) 120%, transparent)` | Maximum emphasis CTAs |
| Nav Active | `--shadow-nav-active` | `0 10px 24px color-mix(in srgb, var(--shadow-cta-color) 90%, transparent)` | Active sidebar navigation item |
| Dialog | `--shadow-dialog` | `0 24px 60px var(--shadow-dialog-color)` | Modal dialogs, overlays |

### Shadow Philosophy

Shadows in this system serve two distinct purposes — structural elevation and brand emphasis. Structural shadows use `--shadow-card-color` and `color-mix(...)` to scale by theme. Brand shadows use `--shadow-cta-color`, creating a colored glow beneath interactive elements that draws attention and reinforces the brand palette.

The CTA shadow scale (sm → default → lg) allows progressive emphasis: a standard button gets a subtle blue underglow, a hero-sized button gets a dramatic one. Active navigation items share this blue shadow language, visually connecting them to the primary action palette.

## 7. Motion

| Token | Value | Use |
|-------|-------|-----|
| `--ease-emphasis` | `cubic-bezier(0.16, 1, 0.3, 1)` | Emphasized transitions — progress bars, hero animations |
| `--duration-fast` | 150ms | Micro-interactions — hover, focus |
| `--duration-normal` | 240ms | Standard transitions — color changes, opacity |
| `--duration-soft` | 360ms | Smooth transitions — progress fills, panel entries |
| `--duration-hero` | 500ms | Hero animations — page transitions, large element entries |

### Identity Gradient

The brand identity gradient animates through the brand palette for emphasis moments:

- Colors: `#007fff` → `#0038ad` → `#0d9488` → `#007fff`
- Background size: 280% for smooth looping
- Duration: 3.6s, `ease-in-out`, infinite
- Applied via `-webkit-background-clip: text` for gradient text effect
- Respects `prefers-reduced-motion`: falls back to static `--primary` color

## 8. Do's and Don'ts

### Do

- Use `--primary` (`#007fff`) for CTAs, links, and active states, and `--ring` for focus treatments
- Use `--background` / `--surface-page` (`#ffffff`) as the page background and `--card` (`#f8f9fa`) for elevated content
- Use `rounded-full` (pill) shape for all buttons and chips — this is the signature interactive shape
- Apply `--shadow-cta-sm` to primary buttons — the blue underglow is the brand's tactile signal
- Use `--muted-foreground` for secondary text — never raw opacity on foreground color
- Use semantic utility classes like `text-primary-foreground`, `border-warning`, and `bg-dark-surface/50` in component code
- Build with the 8px grid — all spacing must be multiples of 4px
- Use `--font-sans` (Noto Sans Variable) for all text — hierarchy comes from size and weight, not font families
- Use `cva` (class-variance-authority) for component variants and `cn()` for class merging
- Support both light and dark themes — test every component in both modes
- Use `data-slot` attributes on component root elements for testing and styling hooks
- When defining base theme values in `globals.css`, prefer `rgb(...)`, `rgba(...)`, and `oklch(...)`

### Don't

- Don't use raw hex values or palette utility classes (`text-white`, `bg-black/50`, `border-red-500`) in app, feature, or UI component code
- Don't introduce additional accent colors beyond `--primary`, `--brand-secondary`, and the semantic accent surfaces — the blue palette is the complete chromatic budget
- Don't use weight 800 or 900 — the maximum is 700 (bold), and even that is reserved for primary headings and financial numbers
- Don't use `rounded-lg` or `rounded-md` on buttons — buttons are always `rounded-full`
- Don't use `rounded-full` on cards — cards use `rounded-xl`, `rounded-18`, or `rounded-20`
- Don't add business logic, API calls, or signing logic to `packages/ui` — it is strictly a presentational component library
- Don't use React class components — functional components with hooks only
- Don't use `any` type — TypeScript strict mode is enforced
- Don't use heavy or multiple shadow layers — one shadow token per element maximum
- Don't use arbitrary spacing values (5px, 13px, 7px) — stay on the 4pt grid
- Don't place font imports in components — fonts are loaded globally via `globals.css`

## 9. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Default (Mobile) | <640px | Single column, compact spacing |
| `sm:` | ≥640px | 2-column grids begin, panel padding expands |
| `md:` | ≥1024px | Full desktop layout |
| `xl:` | ≥1280px | 4-column action grids |

### Touch Targets

- Primary buttons: 40–56px height with generous horizontal padding — exceeds 48px minimum at lg/hero sizes
- Icon buttons: 32–48px square — sm (32px) approaches minimum, md/lg (40–48px) meet or exceed
- Navigation items: 44px height with full-width hit area
- Chips: 32–36px height — adequate for thumb interaction
- Action buttons: 48px height — comfortable touch target

### Collapsing Strategy

- **Mobile-first**: All default styles target mobile viewport
- **ActionBar**: 2-column at mobile, optionally 4-column at `xl:` breakpoint
- **Card grids**: single column → 2-column at `sm:` → up to 4-column at `xl:`
- **Section panels**: padding scales from 16px (sm) → 24px (md/lg) → 32px (xl) at `sm:` breakpoint
- **Typography**: hero display text should scale down proportionally on mobile while maintaining tight line-height

### Utility Classes

- `.no-scrollbar`: hides scrollbars for horizontal scroll containers (WebKit + Firefox + IE)
- `.identity-gradient`: brand gradient text effect with motion-safe animation
- Overlay scrims in UI primitives use `bg-dark-surface/50`