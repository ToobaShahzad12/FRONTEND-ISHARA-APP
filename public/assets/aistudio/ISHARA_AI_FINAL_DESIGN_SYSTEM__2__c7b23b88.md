# ISHARA AI — Final Design System Specification

**Concept:** Premium Editorial Technology
**Status:** Design planning only. No code, packages, components or routes have been created or changed.
**Source of truth for the existing app:** *ISHARA AI Frontend Redesign Audit* (23 route entries: 5 public, 5 user, 13 admin; React 19, React Router 7, Vite 8, plain CSS).
**Date:** 20 Nov 2026 · **Revision 3** (supersedes revisions 1 and 2)

---

## 0. Document status, inputs and how to read this

**Inputs received:** the original audit (as text) and your brief with provisional hex values. **The NASCON screenshots did not arrive in the message I received**, so I did not (and could not) verify or refine colors against them. Every color here derives from your seven provisional hex values. If you want the palette tuned against the screenshots, re-send them; the structure below does not depend on it, because only primitive values would change.

**Verification performed:** every text and interactive color pair in sections 2–3 was computed with the WCAG 2.x relative-luminance formula. Ratios quoted are calculated, not estimated. Where a provisional color failed, it was adjusted and the adjustment is stated.

**Conventions**
- Tokens use the prefix `--ds-` so they can coexist with the legacy `--ish-` tokens during migration. Legacy tokens are not removed until every screen is migrated.
- "MUST / MUST NOT" marks rules a design tool cannot interpret freely. "SHOULD" marks strong defaults.
- Sizes are in px for clarity; implementation should use `rem` (16 px root) for type and spacing, `px` only for borders and hairlines.
- All layout rules use **logical properties** (start/end, inline/block) so Urdu/RTL needs no redesign.
- Nothing in this document changes behavior. Where a visual change would require a behavior change (for example replacing `window.confirm` with a dialog), the change is **not made**: it is listed as deferred (7.7) or flagged for explicit approval in section 15.
- **The local repository is the source of truth.** The route table, file list and counts in this document come from an uploaded archive snapshot. Before anything is changed they are re-verified against the real local repository (16.0.1); any difference stops the work and is reported, never guessed.

---

**Revision 3 (20 Nov 2026) — what changed.** Three final amendments; the approved visual direction, palette, typography, layouts, screen specifications and functionality-preservation requirements are unchanged.
1. **Strictly UI-focused: native `window.confirm` is preserved.** The four native confirmation calls and their handlers are **not** replaced by an asynchronous `ConfirmDialog` in this redesign. No confirm dialog is built. The dialog specification is kept only as a deferred, reference-only note (7.7). Affected text was updated in 7.1, 7.7, 9, 10, 11.15 to 11.17, 11.20, 12.2, 15.3, 15.5, 16.1, 16.2 (new test CNF-01) and the phase table (phases 0, 7 and 9).
2. **Stronger Git safety** (new 16.0.2, plus 15.1, 16.1 and the phase table): `git status` first; all existing local changes preserved; a safe baseline on a separate redesign branch; the actual diff of every changed file reviewed before each phase is accepted; and **no reset, discard, overwrite, merge, push or deploy without explicit approval**.
3. **Verify the real repository before implementation** (new 16.0.1, plus 15.8 and phase 0): `App.jsx`, the route entries, the protected files, tooling versions and the baseline counts are re-checked against the local repository. **If it differs from this specification, work stops and the discrepancy is reported** rather than guessed.

**Revision 2 (20 Nov 2026) — what changed.** Four approved changes were applied; everything else from the first version stands.
1. **Landing authentication behavior** (11.1): verified against the code; the landing page stays static and shows Sign in and Create account to everyone. The limitation is documented.
2. **Route preservation and 404** (11.21, 15.2, 15.3, new 15.8 and 15.9): verified route table, safe wildcard rules, and a route regression checklist.
3. **Mascot asset preservation** (13.2, 13.5, 15.2, 16): the original SVG is kept as an unused asset; only its visual usage and the dashboard placeholder are removed; new artwork is separate.
4. **Implementation and regression gates** (section 16, rewritten): every phase carries build, lint, route verification, responsive review, named regression tests and a git diff review, with explicit checks for camera, upload, Google Sign-In, Google linking, profile, history and admin operations.

---

## 1. Final brand identity and design principles

### 1.1 Brand idea
ISHARA AI turns the movement of hands into language. The identity is **warm, serious, and human**: a library-and-gallery warmth (cream, burgundy, gold) rather than the cold blue-and-white of typical AI tools. The product is a communication aid for Pakistani Sign Language users, so the interface must feel trustworthy, dignified and calm, never gimmicky.

### 1.2 Identity pillars
1. **Burgundy is the voice.** Brand areas, navigation, primary actions, and the strongest headlines.
2. **Cream is the room.** Pages, reading surfaces and breathing space.
3. **Gold is the signal.** Sparse highlights, selected states, one emphasized call to action per view. If gold is everywhere, it signals nothing.
4. **Terracotta is the warm accent.** Restrained: small tags, illustration accents, secondary emphasis. Never a large fill.
5. **The hand-trace is the signature.** One distinctive line motif inspired by the path of a signing hand (section 13).

### 1.3 Design principles
1. **Usability before decoration.** Camera, upload and admin tables are tools. Decoration stops where work starts.
2. **Editorial hierarchy.** Big condensed headlines, quiet body text, deliberate whitespace, varied section compositions. Avoid rows of identical cards; vary scale, alignment and density between sections.
3. **Calm motion.** Motion explains state changes. It never entertains.
4. **Honest states.** Where the backend does not exist yet (translation submit, history, profile save), the UI says so plainly. No fabricated results, saves or progress.
5. **Accessible by default.** AA contrast, visible focus, 44 px touch targets, reduced-motion support, labelled controls. Existing ARIA attributes are preserved.
6. **One system.** User, admin, auth and landing share the same tokens and components. The admin is not a different product.
7. **Future-ready.** English now; logical properties, font fallbacks and layered tokens keep Urdu/RTL and dark mode open.

### 1.4 Voice and copy
- Plain, respectful, short. Sentence case for UI; Oswald uppercase only for display headlines and eyebrows.
- Brand name: **ISHARA AI** in prose and titles; wordmark rendered as `ishara.ai` lowercase in the logo lockup only. Remove the "Ishara AI" and "ishara.ai" inconsistencies in body copy.
- No emoji in product UI. No "Premium workspace" style badges that claim more than the product delivers.
- Placeholder states use the pattern: *what this will do* + *what is available now*. Example: "Translation results will appear here once translation is available."

### 1.5 What to avoid (hard list)
Generic dashboard card grids with identical icon-title-text tiles; decorative gradients and floating blobs; glassmorphism; stock "AI sparkle" iconography; more than one gold-filled button per view; text smaller than the minimums in section 4; animation that loops or competes with a task; color as the only status signal.

---

## 2. Color tokens

### 2.1 Primitive palette
Primitives are raw values. Components MUST NOT use primitives directly; they use semantic tokens (2.2). Primitives exist so a future dark theme can remap semantics.

| Token | Hex | Notes |
|---|---|---|
| `--ds-burgundy-900` | `#3E0D10` | Deep Burgundy (your value, unchanged) |
| `--ds-burgundy-800` | `#4A1013` | Pressed/active on burgundy fills; hover on deep surfaces |
| `--ds-burgundy-700` | `#601719` | **Primary Burgundy** (your value, unchanged) |
| `--ds-burgundy-600` | `#7A1F23` | Hover on burgundy fills |
| `--ds-burgundy-50` | `#FBE4E0` | Tint, used only behind error states |
| `--ds-cream-50` | `#FFFFFF` | White |
| `--ds-cream-100` | `#F8F1E1` | **Paper**: page canvas (lighter than your Warm Cream, see note) |
| `--ds-cream-200` | `#F3EAD4` | Sunken wells, row hover |
| `--ds-cream-300` | `#F1E4C8` | **Warm Cream** (your value, unchanged): brand bands, landing sections |
| `--ds-cream-400` | `#EADBB8` | Selected rows/tabs, pressed secondary |
| `--ds-cream-500` | `#E3D5B5` | Inactive nav text on burgundy |
| `--ds-cream-600` | `#E7DAB9` | Hairline dividers (decorative) |
| `--ds-cream-700` | `#D8C79F` | Subtle borders (decorative) |
| `--ds-cream-800` | `#E9DFC9` | Disabled surfaces |
| `--ds-gold-300` | `#E8CF98` | Gold text on burgundy |
| `--ds-gold-400` | `#D9BC7E` | Gold hover; focus ring on dark |
| `--ds-gold-500` | `#C9A65E` | **Antique Gold** (your value, unchanged) |
| `--ds-gold-600` | `#B8934A` | Gold pressed |
| `--ds-gold-700` | `#9C7A2E` | Gold for graphics on light backgrounds (not text) |
| `--ds-gold-800` | `#7A5C14` | **Gold-ink**: the only gold allowed as text on light backgrounds |
| `--ds-terra-300` | `#F0C4BA` | Terracotta tint for text/graphics on burgundy |
| `--ds-terra-500` | `#A34C43` | **Muted Terracotta** (your value, unchanged) |
| `--ds-terra-700` | `#8F3F37` | Terracotta-ink: terracotta as text on cream/selected |
| `--ds-ink-900` | `#321719` | **Main Ink** (your value, unchanged) |
| `--ds-ink-700` | `#5A4443` | Secondary text |
| `--ds-ink-500` | `#6B5753` | Muted text |
| `--ds-ink-400` | `#7A6560` | Disabled text |
| `--ds-ink-300` | `#8A7468` | Interactive borders (inputs, controls) |
| `--ds-success-600` | `#2F6B4F` | Success text/solid |
| `--ds-success-50` | `#E3EFE4` | Success tint |
| `--ds-warning-700` | `#8A5A00` | Warning text |
| `--ds-warning-400` | `#E8B54A` | Warning solid (ink text on it) |
| `--ds-warning-50` | `#FBEBC5` | Warning tint |
| `--ds-danger-600` | `#A12A26` | Error text/solid. Cooler red, deliberately distinct from burgundy |
| `--ds-danger-700` | `#861F1C` | Error hover |
| `--ds-danger-800` | `#6E1815` | Error pressed |
| `--ds-info-600` | `#2B5C7D` | Info text/solid |
| `--ds-info-50` | `#E1ECF3` | Info tint |

**Adjustments to your provisional values (all your hex values are kept as brand colors):**
- **Warm Cream `#F1E4C8` is kept** but is rather saturated for large reading areas, so the page canvas is the lighter **Paper `#F8F1E1`**, and `#F1E4C8` is used for bands and brand sections. This keeps the identity while reducing glare and improving long-form readability.
- **Antique Gold `#C9A65E` cannot be text on any light background** (2.05:1 on Paper). It is kept for fills, borders on dark, graphics and the focus ring on dark. A darker **Gold-ink `#7A5C14`** is added for the rare case gold-toned text is needed on light surfaces (4.95:1 on Warm Cream).
- **Muted Terracotta `#A34C43`** passes as text on Paper (5.08) and white (5.72), but only 4.54 on Warm Cream and **4.17 on selected cream, which fails**. `#8F3F37` is added as terracotta text, and `#A34C43` is reserved for fills and graphics.
- **Terracotta on burgundy fails (2.25:1)**; on burgundy use `#F0C4BA` (8.15:1).
- **Error red is a separate cooler red** (`#A12A26`). Burgundy and terracotta are brand colors and MUST NOT signal errors; otherwise "brand" and "failure" blur together.

### 2.2 Semantic tokens (light theme)

Surfaces and backgrounds

| Token | Value | Usage |
|---|---|---|
| `--ds-bg-canvas` | `cream-100` `#F8F1E1` | Default page background |
| `--ds-bg-band` | `cream-300` `#F1E4C8` | Landing/marketing bands, empty-state panels |
| `--ds-bg-surface` | `#FFFFFF` | Cards, inputs, tables, dialogs |
| `--ds-bg-sunken` | `cream-200` `#F3EAD4` | Wells, code/log areas, hover rows |
| `--ds-bg-brand` | `burgundy-700` `#601719` | Top bar, brand panels, hero |
| `--ds-bg-brand-deep` | `burgundy-900` `#3E0D10` | Admin sidebar, footer, deepest sections |
| `--ds-bg-selected` | `cream-400` `#EADBB8` | Selected row/tab/option on light |
| `--ds-bg-disabled` | `cream-800` `#E9DFC9` | Disabled controls |
| `--ds-bg-scrim` | `rgba(50,23,25,.60)` | Modal/drawer overlay |

Text

| Token | Value | Usage |
|---|---|---|
| `--ds-text-primary` | `#321719` | Headings, body |
| `--ds-text-secondary` | `#5A4443` | Supporting text |
| `--ds-text-muted` | `#6B5753` | Helper text, metadata (still AA on all light surfaces) |
| `--ds-text-disabled` | `#7A6560` | Disabled labels (on `bg-disabled`) |
| `--ds-text-on-brand` | `#FFFFFF` | Text on burgundy |
| `--ds-text-on-brand-secondary` | `#E3D5B5` | Secondary/inactive text on burgundy |
| `--ds-text-on-brand-accent` | `#E8CF98` | Eyebrows, active nav, highlights on burgundy |
| `--ds-text-accent` | `#8F3F37` | Terracotta-ink text on light |
| `--ds-text-gold` | `#7A5C14` | Gold-ink text on light (rare) |
| `--ds-text-link` | `#601719` (underlined) | Links on light |
| `--ds-text-link-hover` | `#3E0D10` | Link hover |
| `--ds-text-on-accent` | `#321719` | Text on gold fills |

Borders and dividers

| Token | Value | Usage |
|---|---|---|
| `--ds-border-divider` | `#E7DAB9` | Hairlines between sections (decorative) |
| `--ds-border-subtle` | `#D8C79F` | Card outlines (decorative; a card MUST also differ from its background by fill or shadow) |
| `--ds-border-control` | `#8A7468` | Input, select, checkbox, table-control boundaries (3.9:1 on Paper, 4.4:1 on white) |
| `--ds-border-strong` | `#5A4443` | Emphasis, focused fields |
| `--ds-border-brand` | `#601719` | Secondary button outline, active tab underline |
| `--ds-border-gold` | `#C9A65E` | Ornament on dark; MUST NOT be the only boundary of an interactive control on light |

Actions

| Token | Rest | Hover | Active | Disabled |
|---|---|---|---|---|
| Primary (bg / text) | `#601719` / `#FFFFFF` | `#7A1F23` / `#FFFFFF` | `#4A1013` / `#FFFFFF` | `#E9DFC9` / `#7A6560` |
| Accent-gold (bg / text) | `#C9A65E` / `#321719` | `#D9BC7E` / `#321719` | `#B8934A` / `#321719` | `#E9DFC9` / `#7A6560` |
| Secondary (outline) | bg transparent, border `#601719`, text `#601719` | bg `#F3EAD4` | bg `#EADBB8` | bg transparent, border `#8A7468`, text `#7A6560` |
| Tertiary (text) | text `#601719` | bg `#F3EAD4` | bg `#EADBB8` | text `#7A6560` |
| Danger (bg / text) | `#A12A26` / `#FFFFFF` | `#861F1C` | `#6E1815` | as primary disabled |
| On-dark nav item | text `#E3D5B5` | bg `#4A1013`, text `#FFFFFF` | bg `#601719`, text `#FFFFFF` | text `#E3D5B5` at 50% opacity (disabled items are not announced as links) |

Selected state: on light, `bg-selected #EADBB8` + text `#601719` + a 3 px inline-start indicator in `#601719`. On dark nav, bg `#601719` + text `#FFFFFF` + a 3 px inline-start indicator in `#C9A65E`. Selection MUST NOT rely on color alone: the indicator bar and `aria-current="page"` are both required.

Focus

| Context | Ring |
|---|---|
| Light surfaces | 2 px solid `#601719`, 2 px offset (offset gap shows the surface color) |
| Dark surfaces (burgundy, deep) | 2 px solid `#D9BC7E`, 2 px offset |
| Inside a field | border becomes `#5A4443` and the standard ring is added |
Rings use `outline` (never `box-shadow` alone) so they survive Windows High Contrast mode. The current `box-shadow` focus ring MUST be replaced by this spec, because `box-shadow` is stripped in forced-colors mode. Ring appears on `:focus-visible` only.

Status (each status = icon + label + color, never color alone)

| Status | Text | Tint background | Solid | Icon |
|---|---|---|---|---|
| Success | `#2F6B4F` | `#E3EFE4` | `#2F6B4F` (white text) | check-circle |
| Warning | `#8A5A00` | `#FBEBC5` | `#E8B54A` (ink text) | alert-triangle |
| Error | `#A12A26` | `#FBE4E0` | `#A12A26` (white text) | alert-circle |
| Info | `#2B5C7D` | `#E1ECF3` | `#2B5C7D` (white text) | info |
| Recording | `#A12A26` dot + the word "Recording" | n/a | n/a | filled dot |

### 2.3 Future dark mode structure (not built now)
- Components consume **semantic tokens only**. Primitives are never referenced in component CSS.
- Semantic tokens are declared once on `:root` (light) and can be remapped inside a reserved `[data-theme="dark"]` block. That block is intentionally empty for now.
- `color-scheme: light` is set on `:root` today and becomes `light dark` only when a dark theme ships.
- Any raster texture or shadow is expressed through tokens (`--ds-texture-opacity`, `--ds-shadow-color`) so it can be retuned per theme.
- Burgundy surfaces are already dark and require little remapping; the work is canvas, surface and text inversion.

### 2.4 Texture
- Page canvas uses a barely visible paper-grain texture: a small tileable monochrome noise (target under 6 KB, either inline SVG filter or a small image) at **opacity 3–5%** over `#F8F1E1`.
- Texture MUST NOT appear under data tables, forms or the camera stage (solid `#FFFFFF` surfaces there).
- Contrast calculations assume the flat canvas color; at 5% max opacity the worst-case shift is below 0.1 contrast units, which all body-text ratios absorb.

---

## 3. Accessibility contrast decisions

Targets: normal text ≥ 4.5:1; large text (≥ 24 px, or ≥ 18.66 px bold) ≥ 3:1; UI boundaries, focus indicators and meaningful graphics ≥ 3:1. Ratios are calculated.

### 3.1 Text on light surfaces
| Foreground | Background | Ratio | Result |
|---|---|---|---|
| Ink `#321719` | Paper `#F8F1E1` | 14.67 | AAA |
| Ink | Warm Cream `#F1E4C8` | 13.10 | AAA |
| Ink | White | 16.51 | AAA |
| Secondary `#5A4443` | Paper / Cream / White | 7.97 / 7.12 / 8.96 | AAA |
| Muted `#6B5753` | Paper / Cream / White | 5.99 / 5.35 / 6.75 | AA |
| Muted `#6B5753` | Selected `#EADBB8` | 4.92 | AA |
| Burgundy `#601719` (links, outline buttons) | Paper / Cream / White | 11.42 / 10.20 / 12.85 | AAA |
| Terracotta-ink `#8F3F37` | Paper / White / Cream | 6.36 / 7.16 / 5.68 | AA |
| Gold-ink `#7A5C14` | Paper / Cream / White | 5.54 / 4.95 / 6.23 | AA |
| Disabled `#7A6560` | Disabled bg `#E9DFC9` | 4.11 | Exempt (disabled), still legible |

### 3.2 Text on brand surfaces
| Foreground | Background | Ratio | Result |
|---|---|---|---|
| White | Burgundy `#601719` | 12.85 | AAA |
| White | Deep `#3E0D10` | 16.54 | AAA |
| Warm Cream `#F1E4C8` | Burgundy / Deep | 10.20 / 13.13 | AAA |
| Nav-inactive `#E3D5B5` | Deep / Burgundy | 11.38 / 8.84 | AAA |
| Gold-300 `#E8CF98` | Burgundy | 8.45 | AAA |
| Gold-500 `#C9A65E` | Burgundy / Deep | 5.57 / 7.17 | AA (use for large text, icons, rules) |
| Gold-500 | Burgundy-hover `#7A1F23` | 4.44 | **Fails for small text. On hover states use gold-300, not gold-500** |
| Terracotta-300 `#F0C4BA` | Burgundy / Deep | 8.15 / 10.48 | AAA |
| Terracotta-500 `#A34C43` | Burgundy | 2.25 | **Fail. Never use together** |

### 3.3 Interactive combinations
| Combination | Ratio | Result |
|---|---|---|
| Primary button: white on `#601719` | 12.85 | AAA |
| Primary hover: white on `#7A1F23` | 10.26 | AAA |
| Primary active: white on `#4A1013` | 15.28 | AAA |
| Gold button: ink on `#C9A65E` | 7.15 | AAA |
| Gold hover: ink on `#D9BC7E` | 9.00 | AAA |
| Gold active: ink on `#B8934A` | 5.75 | AA |
| Danger button: white on `#A12A26` | 7.31 | AAA |
| Danger hover / active: white on `#861F1C` / `#6E1815` | 9.43 / 11.64 | AAA |
| Secondary hover text: burgundy on `#F3EAD4` | 10.73 | AAA |
| Selected: burgundy on `#EADBB8` | 9.38 | AAA |
| Status success text on tint | 5.31 | AA |
| Status warning text on tint | 5.02 | AA |
| Status error text on tint | 6.01 | AA |
| Status info text on tint | 5.97 | AA |
| White on success solid `#2F6B4F` | 6.29 | AA |
| White on info solid `#2B5C7D` | 7.17 | AAA |
| Ink on warning solid `#E8B54A` | 8.76 | AAA |

### 3.4 Non-text contrast
| Element | Ratio | Decision |
|---|---|---|
| Input border `#8A7468` on white / Paper | 4.39 / 3.90 | Passes 3:1. **Use as the only input boundary** |
| Input border on Warm Cream / selected | 3.49 / 3.21 | Passes but is near the limit; inputs MUST sit on white or Paper, not on selected cream |
| Focus ring burgundy vs Paper | 11.42 | Passes |
| Focus ring gold-400 vs Deep | 9.01 | Passes |
| Gold-500 border on Paper | 1.83 | **Fails. Gold borders are ornament only, never a control boundary** |
| Subtle border `#D8C79F` on Paper | 1.48 | Decorative only; cards must also be distinguished by fill or shadow |
| Terracotta-500 fill vs Paper | 5.08 | Passes as meaningful graphic |

### 3.5 Prior issues resolved
The audit found muted grays at about 3.2:1 and 4.0:1 and white-on-blue at about 4.2:1. The new muted text is 5.35–6.75:1 on every light surface, and the primary button is 12.85:1.

### 3.6 Further accessibility rules
- Minimum text size is defined in section 4.4; no 9–11 px text as in the current admin.
- Touch targets ≥ 44×44 px for any control on touch layouts; desktop admin dense controls may be 36 px high but MUST have a 44 px hit area on screens ≤ 1023 px.
- All motion respects `prefers-reduced-motion` (section 10.6).
- Support `forced-colors`: borders on cards, buttons and inputs use real `border`/`outline` (not shadow-only) so controls stay visible.
- Support 200% zoom and text-spacing overrides without clipping; no fixed-height text containers.
- Preserve every existing `aria-*` attribute, `role`, `aria-live` region, label association and `data-label` (list in section 15).

---

## 4. Typography system

### 4.1 Families
| Role | Family | Weights | Licence / hosting |
|---|---|---|---|
| Display (headlines, eyebrows) | **Oswald** (condensed) | 500, 600 | SIL OFL; self-host (variable file preferred) |
| UI and body | **DM Sans** | 400, 500, 600, 700 (+ italic 400 optional) | SIL OFL; self-host |
| Serif accent | **Source Serif 4** (recommended) | 400 italic, 600 | SIL OFL; self-host |
| Urdu / future RTL | **Noto Nastaliq Urdu** | 400, 600 | SIL OFL; self-host; load only when `lang="ur"` or `dir="rtl"` |

Notes
- **Oswald** is acceptable but very common; keep it to display sizes with generous tracking and mix with the serif accent so headlines are not generic. If a more distinctive condensed face is wanted later (for example Barlow Condensed or Antonio, both OFL), it is a one-token swap.
- **Serif accent rule:** Source Serif 4 *italic* is used for a single emphasized word or short phrase inside a display headline, and for pull quotes, captions and landing-page editorial lines. It MUST NOT be used for UI controls, tables or body paragraphs.
- Fonts MUST be self-hosted (`woff2`, `font-display: swap`) with subsetting for Latin; the current render-blocking Google Fonts `@import` is removed. Preload only Oswald 600 and DM Sans 400/600.
- Licensing: all four families are SIL Open Font License 1.1, permitting self-hosting and embedding; include their license files in the repo.

Fallback stacks
- Display: `"Oswald", "Arial Narrow", "Roboto Condensed", system-ui, sans-serif`
- UI: `"DM Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
- Serif: `"Source Serif 4", Georgia, "Times New Roman", serif`
- Urdu: `"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", "Noto Naskh Arabic", serif`
- **Oswald has no Arabic-script glyphs.** In RTL/Urdu contexts the display role falls back to Noto Nastaliq Urdu at its own sizes (4.5). Never mix a condensed Latin font with Urdu text in one heading without testing.

### 4.2 Type scale (fluid)
Sizes use `clamp(min, preferred, max)` between the 360 px and 1440 px viewports.

| Token | Family / weight | Size (mobile → desktop) | Line height | Letter spacing | Case |
|---|---|---|---|---|---|
| `display-xl` | Oswald 600 | 48 → 96 px (`clamp(3rem, 2rem + 4.5vw, 6rem)`) | 0.95 | −0.01em | UPPER |
| `display-l` | Oswald 600 | 40 → 72 px | 1.0 | −0.005em | UPPER |
| `h1` | Oswald 600 | 32 → 48 px | 1.08 | 0.005em | Upper for page titles in shells; sentence case on long titles |
| `h2` | Oswald 500 | 26 → 36 px | 1.15 | 0.01em | Sentence |
| `h3` | DM Sans 700 | 20 → 24 px | 1.25 | −0.005em | Sentence |
| `h4` | DM Sans 700 | 17 → 18 px | 1.3 | 0 | Sentence |
| `body-l` | DM Sans 400 | 18 px | 1.6 | 0 | n/a |
| `body` | DM Sans 400 | 16 px | 1.6 | 0 | n/a |
| `body-s` | DM Sans 400 | 14 px | 1.5 | 0 | n/a |
| `label` | DM Sans 600 | 14 px | 1.3 | 0.005em | Sentence |
| `caption` | DM Sans 500 | 13 px | 1.4 | 0.01em | Sentence |
| `eyebrow` | Oswald 500 | 13 px | 1.2 | 0.14em | UPPER |
| `button` | DM Sans 600 | 15–16 px | 1 | 0.01em | Sentence |
| `table-head` | DM Sans 600 | 13 px | 1.3 | 0.04em | UPPER |
| `table-cell` | DM Sans 400 | 14–15 px | 1.4 | 0 | n/a |
| `serif-accent` | Source Serif 4 italic 400 | inherits headline size | inherits | 0 | n/a |
| `quote` | Source Serif 4 italic 400 | 20 → 28 px | 1.4 | 0 | n/a |

### 4.3 Weights and emphasis
- Display uses weight 600; never bold on top of Oswald 600.
- In running text, emphasis is DM Sans 600 (not 700) and, for one-off editorial emphasis, the serif italic.
- Links are always underlined (2 px, `text-underline-offset: 3px`), because color alone (burgundy vs ink) is only about 1.4:1 apart and cannot distinguish links.

### 4.4 Minimum sizes (hard rules)
- Body and any paragraph: **16 px**.
- Table cells and form helper text: **14 px**.
- Labels, captions, badges, nav on mobile: **13 px**, never below.
- Eyebrows only may be **12 px** and only when uppercase with ≥ 0.12em tracking and the 7:1 contrast colors from 3.1–3.2.
- Nothing under 12 px anywhere. This removes the current 9 px admin brand sublabel and the ~11 px user labels.

### 4.5 Measure and rhythm
- Reading width: 60–72 characters (`max-inline-size: 68ch`) for paragraphs; headings may be wider.
- Paragraph spacing: 1em. Heading-to-body gap: 0.5em above body, 1.5em above a heading following body.
- Numerals in tables and stat blocks use tabular figures (`font-variant-numeric: tabular-nums`).

### 4.6 Urdu / RTL readiness
- Urdu body in Noto Nastaliq Urdu requires larger size and much taller line height: **18 px minimum, line-height 2.0 (body), 1.7 (headings)**. Urdu does not use letter spacing (set `letter-spacing: 0`) and does not use uppercase.
- Set `lang` and `dir` on `<html>` when Urdu is introduced; all spacing uses logical properties so layouts mirror automatically.
- Icons that imply direction (chevrons, arrows, back, "next") flip in RTL; icons that do not (camera, upload, user) do not.
- The hand-trace motif is mirrored in RTL by the same `dir` rule, since it implies reading flow.
- Mixed text (English names inside Urdu) uses `unicode-bidi: isolate` on inline names, emails, and file names.

---

## 5. Spacing, sizing, radius, shadow and breakpoint scales

### 5.1 Spacing (4 px base)
| Token | px | Typical use |
|---|---|---|
| `--ds-space-0` | 0 | n/a |
| `--ds-space-1` | 4 | Icon-to-label gap, tight badge padding |
| `--ds-space-2` | 8 | Inline gaps, chip padding-block |
| `--ds-space-3` | 12 | Input padding-inline, compact stack |
| `--ds-space-4` | 16 | Default gap, card padding (mobile), page margin (mobile) |
| `--ds-space-5` | 20 | Form field gap |
| `--ds-space-6` | 24 | Card padding (desktop), section gap in app |
| `--ds-space-8` | 32 | Page margin (tablet), group separation |
| `--ds-space-10` | 40 | Page top padding (desktop) |
| `--ds-space-12` | 48 | Page margin (desktop), large group gap |
| `--ds-space-16` | 64 | Section padding (mobile landing) |
| `--ds-space-20` | 80 | Section padding (tablet landing) |
| `--ds-space-24` | 96 | Section padding (desktop landing) |
| `--ds-space-32` | 128 | Hero vertical padding (desktop) |

Rhythm rules: in-app sections separated by 32–48 px; landing sections by 64–128 px, varied (not identical) to avoid a mechanical feel. Related items sit closer (8–16 px) than unrelated groups (32+ px).

### 5.2 Layout grid and containers
| Breakpoint | Columns | Gutter | Page margin |
|---|---|---|---|
| < 768 | 4 | 16 | 16 |
| 768–1023 | 8 | 24 | 32 |
| ≥ 1024 | 12 | 32 | 48 |

| Container | Max inline size | Use |
|---|---|---|
| `narrow` | 480 | Auth card, dialogs |
| `reading` | 720 | Long copy, article body |
| `app` | 1200 | User screens, landing content |
| `wide` | 1440 | Landing full-bleed content, admin tables |
Admin content is fluid up to 1360 px, then centered.

### 5.3 Component sizing
| Item | Size |
|---|---|
| Control height: small / medium / large / hero CTA | 36 / 44 / 52 / 56 |
| Minimum touch target | 44×44 (small controls get a 44 px invisible hit area on touch layouts) |
| Icon: inline / default / feature | 16 / 20–24 / 32–40 |
| Avatar: small / medium / large | 32 / 40 / 72 |
| User top bar | 64 (56 on < 768) |
| Mobile bottom tab bar | 64 + `env(safe-area-inset-bottom)` |
| Admin sidebar: expanded / rail | 264 / 72 |
| Admin top bar | 64 (56 on < 768) |
| Table row: default / compact | 56 / 48 |
| Camera stage aspect ratio | 16:9 landscape; 3:4 portrait on phones in portrait |

### 5.4 Radius
| Token | px | Use |
|---|---|---|
| `--ds-radius-xs` | 4 | Badges, tags |
| `--ds-radius-sm` | 8 | Buttons, inputs, selects |
| `--ds-radius-md` | 12 | Cards, tables, alerts |
| `--ds-radius-lg` | 20 | Dialogs, large panels, camera stage |
| `--ds-radius-xl` | 32 | Landing hero panels |
| `--ds-radius-full` | 999 | Avatars, pills, tabs |
| `--ds-shape-arch` | 999 999 16 16 | Landing image/stage frames (organic) |
| `--ds-shape-leaf` | 32 4 32 4 | One accent callout per page at most |
Organic shapes are used sparingly: at most **one per viewport**, only on landing and empty/brand moments, never on data tables, forms or the camera stage controls.

### 5.5 Shadow (warm, never gray)
| Token | Value | Use |
|---|---|---|
| `--ds-shadow-1` | `0 1px 2px rgba(62,13,16,.08)` | Cards at rest |
| `--ds-shadow-2` | `0 4px 12px rgba(62,13,16,.10)` | Raised cards, menus |
| `--ds-shadow-3` | `0 12px 32px rgba(62,13,16,.14)` | Popovers, drawers |
| `--ds-shadow-4` | `0 24px 64px rgba(62,13,16,.22)` | Modals |
Cards use `border-subtle` plus `shadow-1`; do not combine more than one elevation level on one element. In `forced-colors` mode shadows disappear, so every elevated element has a real border.

### 5.6 Breakpoints
| Name | Min width | Typical device |
|---|---|---|
| `xs` | 0 | Small phones (design floor 320) |
| `sm` | 480 | Large phones, phones in landscape |
| `md` | 768 | Tablets portrait |
| `lg` | 1024 | Tablets landscape, small laptops |
| `xl` | 1280 | Laptops, desktops |
| `2xl` | 1536 | Large desktops |
This **replaces the 13 ad-hoc breakpoints** found in the audit. CSS variables cannot be used inside media queries, so the pixel values are written literally and documented here as the single source. Use `min-width` (mobile-first). Where a component depends on its container rather than the viewport (tables, cards), use container queries.
Verification widths: 320, 360, 390, 768, 1024, 1280, 1440, 1920, in portrait and landscape where relevant.

### 5.7 Z-index scale
`base 0` · `sticky 100` · `drawer 300` · `modal 400` · `toast 500` · `tooltip 600`. No arbitrary values.

---

## 6. Iconography guidelines

### 6.1 Set
One consistent icon set: **Lucide** (ISC license; confirm at install). Chosen because its 24 px, round-capped, single-weight stroke matches the hand-trace line and the editorial tone. It can be used as inline SVG or a tree-shaken package; either way, only icons actually used ship.

### 6.2 Style rules
- Stroke 1.75 px at 20–24 px size; 2 px at 16 px; round caps and joins; `currentColor`; no fills except the recording dot and the logo mark.
- Sizes: 16 (inline with text), 20 (buttons, nav), 24 (headers, empty states), 32–40 (feature/empty-state illustrations).
- Color follows the text it sits with. Standalone decorative icons use `text-muted`; active/selected icons use the active text color.
- **Decorative icons** are `aria-hidden="true"` and `focusable="false"`. **Meaningful icon-only buttons** have an accessible name (`aria-label`) and, on desktop, a tooltip.
- Never rely on an icon alone for status; pair with a label.
- Do not use Unicode glyphs (♙ ◎ ◷ ✓ ＋ ✎ → ↓) or emoji as icons or in copy. They render inconsistently by OS font.
- Directional icons (chevrons, arrows, back) mirror in RTL.

### 6.3 Icon assignments (Lucide names)
| Meaning | Icon |
|---|---|
| Dashboard / overview | `layout-dashboard` |
| Live camera / recording | `video` |
| Upload video | `upload` |
| Translation history | `history` |
| Profile / user | `user-round` |
| Settings | `settings` |
| Sign out | `log-out` |
| Users (admin) | `users` |
| PSL dictionary | `hand` |
| Knowledge base | `book-open-text` |
| System logs | `scroll-text` |
| Processing activity | `activity` |
| Admin | `shield-check` |
| Search / filter | `search` / `sliders-horizontal` |
| Add | `plus` |
| Edit | `pencil` |
| Delete | `trash-2` |
| Export / download | `download` |
| Email | `mail` |
| Password | `lock` |
| Time / duration | `clock` |
| Date | `calendar` |
| Video file / image file | `file-video` / `image` |
| Menu / close | `menu` / `x` |
| Row actions | `ellipsis` |
| Expand | `chevron-down` |
| Success / warning / error / info | `circle-check` / `triangle-alert` / `circle-alert` / `info` |
| Recording indicator | filled circle (custom, not an icon) |
Password show/hide keeps its **text label** ("Show"/"Hide", existing behavior and accessible name); an `eye`/`eye-off` icon may precede the text.

### 6.4 Custom marks (the only non-library graphics)
The logo mark and the hand-trace motif (section 13). No other custom icons are needed.

---

## 7. Component specifications

General: every interactive component has rest, hover, active, focus-visible, disabled and (where relevant) loading and error states using the tokens in 2.2. Hover is never the only way to reveal functionality (touch devices).

### 7.1 Buttons
| Variant | Look | Use |
|---|---|---|
| **Primary** | Burgundy fill, white text, radius 8 | Main action per view (Sign in, Create account, Record, Save) |
| **Accent (gold)** | Gold fill, ink text | The single emphasized CTA on a dark/brand surface or the landing hero (for example "Get started"). **At most one per view**; never beside a primary on cream |
| **Secondary** | 1.5 px burgundy outline, burgundy text, transparent bg | Alternative actions (Choose video, Record again) |
| **Tertiary** | Text-only burgundy, underline on hover | Low emphasis (Cancel, View all) |
| **Danger** | Error-red fill, white text | Buttons that start a destructive action (the existing native prompt still follows, 7.7) |
| **On-dark variants** | Primary-on-dark = gold; secondary-on-dark = 1.5 px cream outline + cream text; tertiary-on-dark = cream text | Use on burgundy surfaces |
| **Icon button** | 44×44 (36 dense desktop), radius 8, transparent, icon 20 | Row actions, menu, close |

Rules
- Heights 36/44/52/56 (5.3); padding-inline 16/20/24/28; icon-to-label gap 8; DM Sans 600.
- **Loading** (existing behavior): the button is disabled, `aria-busy="true"`, and the label is replaced by the existing loading text (for example "Signing in…"). A 16 px spinner may precede the text. The spinner is a pure CSS ring (cream on burgundy).
- **Disabled**: disabled fill/text from 2.2. Because disabled controls are not focusable, anything that explains *why* (for example "Stop becomes available once recording starts") stays visible as text, not as a tooltip.
- **Full width**: forms on < 480 px use full-width primary buttons; button groups stack with the primary first (visually and in DOM order).
- Links styled as buttons (`PrimaryButton` with `to`) render as links with the same visuals.
- Press feedback: translate-y 1 px and the active color; no scale bounce.

### 7.2 Text input, textarea, search
- Height 48 (min 44); padding-inline 12–16; radius 8; background `#FFFFFF`; border 1 px `#8A7468`.
- Label **above** the field (DM Sans 600, 14 px, `text-primary`), always visible. Placeholder is an example, never a label (`text-muted`).
- Helper text below (14 px, `text-muted`). Requirement hints (for example password rules) are a list under the field, ticking visually when met; the underlying validation and messages are unchanged.
- States: hover border `#5A4443`; focus border `#5A4443` + focus ring (2.2); error border `#A12A26` 1.5 px + error text with icon below + `aria-invalid="true"`; disabled bg `#E9DFC9`, text `#7A6560`.
- Error message wording is the existing wording. Existing `aria-describedby` wiring (`errorId`, `requirementsId`) is preserved.
- Password field: trailing "Show"/"Hide" text button inside the field (44 px hit area), `aria-pressed` preserved.
- Textarea: min-height 120; vertical resize only; the Knowledge-base article body keeps its formatting toolbar (buttons are 36 px icon buttons in a toolbar row with `role="toolbar"`) and cursor-insert behavior.
- Search: leading `search` icon (20), clear button appears when non-empty; `type="search"`.

### 7.3 Select (dropdown)
- Use the **native `<select>`** styled to match inputs (48 px, chevron icon at inline-end, `appearance: none`). Native selects give correct mobile pickers, keyboard behavior and screen-reader support, and do not change existing state handling.
- Filter selects in toolbars may be 44 px high with an inline label ("Status") above or as visually-hidden text.
- A custom popover menu is used **only** for the account menu and row-action menus (7.9), not for form selects.

### 7.4 Checkbox, radio, segmented option
- Checkbox/radio visual 24 px with a 44 px label-click area; checked = burgundy fill with white check; border `#8A7468`; focus ring per 2.2.
- The article "Save as Draft / Published" choice and similar 2-option choices render as **segmented option cards** (two large radio-backed options, the selected one gets `bg-selected` plus the indicator bar and a check icon). Underlying radios and `name`/`checked` handling are unchanged.

### 7.5 Badges and status
- Pill, radius full, 13 px 600, height 24, padding-inline 10, icon 14 + label.
- Variants: success, warning, error, info, neutral (cream-400 bg, ink text), brand (burgundy bg, white text), gold (gold-500 bg, ink text; reserved for "Admin"/"Published"-type emphasis).
- Mapping from existing statuses: Active → success; Pending/Processing → warning; Suspended/Failed → error; Completed → success; Draft → neutral; Published → success; Reviewed → info; Admin role → brand; User role → neutral; Verified → success; Not verified → warning.
- Always icon + label.

### 7.6 Alerts and feedback (replaces `AuthFeedback` visuals)
- Block with radius 12, 1 px border in the status color at 30%, tint background, 20 px status icon, optional bold title, body 14–15 px, status text color.
- Roles unchanged: error → `role="alert"` + `aria-live="assertive"`; success/info/loading → `role="status"` + `aria-live="polite"`.
- Inline alerts sit above the primary action of the form. Maximum one visible alert per form.
- **Toast** (new, optional): bottom-center on mobile, bottom-end on desktop, max 420 px, auto-dismiss 6 s (never for errors needing action), pause on hover/focus, `role="status"`. Toasts are only for confirmations of already-working actions (for example "Article published"), never for fabricated saves.

### 7.7 Confirmation prompts: native `window.confirm` is preserved (ConfirmDialog deferred)
**Decision (Revision 3):** the redesign is strictly UI-focused. The four existing native `window.confirm` calls (delete user, delete PSL sign, delete article, cancel pending email change) and **their handlers are not replaced, wrapped, made asynchronous or refactored** in this redesign. **No `ConfirmDialog` or other confirmation modal is built.** Replacing them can be considered separately, after the visual redesign is complete and accepted.

Rules
- The calls stay exactly where they are, with **identical message text** and identical synchronous control flow: the existing API call runs only if the browser prompt returns true.
- Only the **trigger buttons** are restyled (for example a `trash-2` icon button in the danger variant with its accessible name, or the tertiary "Cancel email change" button). Their `onClick` handlers and surrounding logic are untouched.
- The prompt itself is browser UI and cannot be themed; this is accepted.
- Do not introduce a custom dialog, a `<dialog>` element, a bottom sheet or an `await`-style confirmation helper for these actions.
- Tripwire: the `window.confirm` count in `src` stays **exactly 4** (gate G6) and test **CNF-01** verifies all four prompts.

**Deferred future specification (reference only; do not implement now).** If a custom confirmation dialog is approved later: white container, radius 20, shadow-4, max inline size 480; tinted icon circle, title, body, Cancel then Confirm (danger) at inline-end; `role="alertdialog"` with `aria-modal`, `aria-labelledby`, `aria-describedby`; initial focus on Cancel for destructive actions; focus trap, inert background, Escape and scrim cancel, focus returns to the trigger; bottom-sheet layout below 480 px; busy state with both buttons disabled. It would require converting the synchronous prompts to asynchronous flows in four handlers, so it needs its own approval, design review and regression tests.

### 7.8 Data table
- Container: white, radius 12, `border-subtle`, shadow-1, overflow hidden.
- **Toolbar** above: search (grows), filter selects, view controls, and the primary action ("Add user") at inline-end. On < 768, search is full-width and filters collapse behind a **Filters** button (44 px) opening a bottom sheet with the *same* controls and the same state (no behavior change); active filters show as removable chips below the search.
- **Header row**: bg `#F3EAD4`, 13 px 600 uppercase, `text-secondary`, tracking 0.04em, height 48. Sticky within the scroll container.
- **Body rows**: height 56, text 14–15 px, bottom divider `#E7DAB9`, hover bg `#F3EAD4`, selected bg `#EADBB8` plus indicator bar. No zebra stripes.
- **Cells**: text aligned to start; numbers and durations to end with tabular figures; truncation with ellipsis only for secondary text, and the full value is available via `title`/accessible text; primary identifiers (name, label) wrap rather than truncate.
- **Actions column**: up to two visible icon buttons (36 px) on desktop; more actions go in a row menu. Delete is never the first icon and uses `trash-2` with `aria-label="Delete {name}"`.
- **Status column**: status badges (7.5).
- **Footer**: results summary at start ("Showing 1–8 of 42 users") and pagination at end.
- **Mobile < 768: stacked record cards.** Each row becomes a card (white, radius 12, padding 16) with: title row (primary identifier + status badge), 2–3 key fields as label/value pairs using the existing `data-label` values as labels, and an action row (44 px buttons). The existing `data-label` attributes drive the labels, so no data or semantic structure changes. Cards are separated by 12 px.
- **Loading**: 5 skeleton rows of the real row height. **Empty**: designed empty state (7.10) inside the table container. **Error**: inline alert plus the existing Retry button.
- Table semantics preserved: real `<table>`, `<th scope="col">`, `aria-label` on the section.
- Horizontal scroll is a last resort for wide logs on md; the wrapper gets `tabindex="0"`, `role="region"` and an accessible name so it is keyboard-scrollable.

### 7.9 Menus, tabs, pagination
- **Account menu / row-action menu**: a button (`aria-haspopup="menu"` pattern or a disclosure) opening a popover (white, radius 12, shadow-3, min 200 px). Items 44 px high, icon + label; Esc closes; focus returns to the trigger; arrow keys optional. On < 768 the account menu is a bottom sheet.
- **Tabs / segmented control**: pill track on `#F3EAD4`, active tab `#601719` fill with white text (primary) or underline style (page-level tabs: 2 px burgundy underline). Active = `aria-selected="true"`.
- **Pagination**: Previous, numbered pages (max 5 visible with ellipsis), Next; 44×44 buttons; current page burgundy fill with `aria-current="page"`; disabled ends have `aria-disabled`. On < 480: Previous, "Page 2 of 5", Next.
- **Breadcrumb**: 14 px, `text-muted` links separated by `chevron-right` (mirrors in RTL), current page `text-primary` with `aria-current="page"`. Collapses to "← Parent" on < 768.

### 7.10 Other components
- **Empty state**: centered block max 480 px: 40 px icon in a tinted circle *or* a hand-trace "trail" variant (13.3), h3 title, one-sentence explanation of what will appear and when, 1–2 actions. No fake data.
- **Skeleton**: `#F3EAD4` blocks with a slow (1.6 s) opacity pulse between 100% and 60% (no shimmer sweep); static under reduced motion.
- **Spinner**: 20/32 px CSS ring, stroke 2.5, 0.8 s linear.
- **Avatar**: circle, `#F1E4C8` fill with burgundy initials (13–16 px 700) on light; on the burgundy top bar, cream fill with burgundy initials. Initials logic (first letters of up to two words) is unchanged.
- **File dropzone**: 7.11.
- **Tooltip**: ink bg, white 13 px text, radius 8; appears on hover and focus; never carries essential information.
- **Progress**: only for real, known progress. For unknown duration, use the spinner and say so in text. No fake progress bars.

### 7.11 File dropzone (used by video upload and PSL media)
- Border 2 px dashed `#8A7468`, radius 20, bg `#FFFFFF`, min-height 220 (160 on mobile). Center: `upload` icon 32, title ("Drop your video here or choose a file"), a line of format and size chips, a **Choose file** secondary button (the real `<input type="file">` stays and its label/button remains keyboard-operable).
- States: hover/drag-over bg `#EADBB8`, border `#601719` solid; error: border `#A12A26`, alert beneath with the existing message; filled: dropzone is replaced by the preview (section 11).
- Accepted types, size limits and validation messages are unchanged (video: MP4/WebM/AVI, 250 MB; PSL media: existing image and video rules).

### 7.12 Google sign-in container
- The Google button is an iframe rendered by Google and **cannot be restyled**. It sits in a 44–48 px high bordered container, full width up to 400 px (the existing width logic needs a container of at least 200 px), centered. Around it: the "or continue with" divider (hairline + 13 px uppercase label, `text-muted`).
- Loading/disabled: the existing blocker overlay remains; the container shows reduced opacity. Error text and "Try Google sign-in again" use the alert styling (7.6) and a tertiary button.

---

## 8. User and Admin application shells

### 8.1 Shared shell rules
- First focusable element on every authenticated page: **"Skip to main content"** (visible on focus, gold-ring on burgundy).
- Landmarks: `<header>`, `<nav aria-label="…">`, `<main id>`, optional `<footer>`. The existing nav `aria-label` strings ("User dashboard navigation", etc.) are preserved.
- Page canvas: `bg-canvas` + texture (2.4). Page content in the `app` container.
- Route changes move focus to the page `<h1>` (or `main`) and update `document.title`.

### 8.2 User shell (Dashboard, Camera, Upload, History, Profile)
This replaces the five copy-pasted headers with one shared header.

**Top bar** (≥ 768): bg `#601719`, height 64, bottom 1 px `#4A1013`. Inline layout: logo lockup · primary nav · spacer · account area.
- **Logo lockup**: hand-trace mark (gold) + wordmark `ishara.ai` (Oswald 600, cream, 24 px). Links to `/dashboard`. The current 286 KB PNG is not used in the UI; use an SVG lockup. Keep the PNG as the favicon until replaced.
- **Primary nav** (all existing routes): *Dashboard* `/dashboard`, *Live Camera* `/dashboard/live-camera`, *Upload Video* `/dashboard/upload-video`, *History* `/dashboard/translation-history`, *Profile* `/dashboard/profile-settings`. Items: 15 px 600, `#E3D5B5`; hover text white + bg `#4A1013`; active text `#E8CF98` + 2 px gold underline + `aria-current="page"`. Visible labels keep the existing wording; "Translation History" may be shortened to "History" only if the full name remains in the link's `aria-label`.
- **Account area**: avatar (cream/burgundy initials) + name (≥ 1024, truncated at 160 px) + **Sign out** (tertiary-on-dark). Sign out keeps its behavior: `logoutUser()` then navigate to `/login` with replace.

**Mobile (< 768)**
- Top bar 56 px: logo mark + wordmark at start, avatar button at end opening the account sheet (name, email, Profile, Sign out).
- **Bottom tab bar**: fixed, bg `#601719`, height 64 + safe-area. Five tabs (Home, Camera, Upload, History, Profile) with 22 px icon above a 13 px label; active tab text `#E8CF98` with a 3 px gold bar above the icon; each tab ≥ 48 px wide. Content gets bottom padding equal to the bar height.
- During **recording** and **file preview** the bottom bar stays visible but navigation away does not change recording behavior (the existing unmount cleanup runs exactly as today).

**Page header (PageHeader component)**: eyebrow (optional) · h1 · one-line description · actions at inline-end (wraps below on mobile). Under it, an optional hand-trace arc rule (decorative, once per page).

### 8.3 Admin shell (13 admin routes)
Same structure as today (`AdminLayout` > `AdminSidebar` + `AdminHeader` + `Outlet`), restyled and made responsive.

**Sidebar** (≥ 1024): bg `#3E0D10`.
- ≥ 1280: expanded, 264 px. 1024–1279: **icon rail** 72 px (labels exposed via `aria-label` and tooltip; expands on hover/focus as an overlay, not by shifting content).
- Top: logo lockup + "ADMIN" eyebrow (`#E8CF98`, 12 px, 0.14em tracking).
- Groups with 12 px uppercase labels (`#E8CF98`): **Overview** (Overview) · **People** (Users) · **Content** (PSL dictionary, Knowledge base) · **Operations** (System logs, Processing activity) · **Account** (Profile & settings). The seven existing links and paths are unchanged; grouping is visual only.
- Items: 44 px high, radius 8, icon 20 + label 15 px 500, text `#E3D5B5`; hover bg `#4A1013` + white text; active bg `#601719` + white text + 3 px gold inline-start bar + `aria-current="page"`. Sub-routes (for example `/admin/users/edit/:id`) keep the parent item active (existing `NavLink` behavior).
- Overflow: sidebar scrolls independently; account block is not duplicated here.

**Drawer** (< 1024): the same sidebar becomes an off-canvas drawer from the inline-start edge, `min(86vw, 320px)`, shadow-3, scrim behind. Opened by a 44 px hamburger in the top bar. It traps focus, closes on Escape, scrim tap and **on navigation**, and returns focus to the hamburger. This makes all 13 screens reachable on phones.

**Top bar**: bg `#F8F1E1` with 1 px `#E7DAB9` bottom, height 64 (56 on mobile). Start: hamburger (< 1024) + breadcrumb (page path, e.g. *Users / Edit user*). End: account menu button (avatar + name + email on ≥ 1024) opening the menu with *Profile & settings* and **Sign out** (same `logoutUser()` + navigate behavior). The visible "Administration" title is retained as the visually-hidden or breadcrumb root label so the existing heading remains.
- The displayed name/email continue to update live from the existing `ishara:admin-profile-updated` event.

**Content**: padding 16 / 24 / 32 (mobile / md / lg+), max 1360, `bg-canvas`. Every admin page starts with the PageHeader. The **AdminDemoNotice** becomes an info banner under the header (tint `#E1ECF3`, 3 px inline-start bar, `info` icon, bold "Demo data" kept, text unchanged, `role="note"` kept).

**Footer**: a single quiet line ("ISHARA AI Administration Panel · © 2026 ISHARA AI") in `text-muted`, 13 px.

---

## 9. Responsive behavior for every major layout

General: mobile-first; nothing scrolls horizontally at 320 px except a deliberately scrollable table region; line length ≤ 72ch; safe-area insets on notched phones (`env(safe-area-inset-*)`); landscape phones use the `sm` layouts.

| Layout | xs (<480) | sm–md (480–1023) | lg+ (≥1024) |
|---|---|---|---|
| **Landing** | Single column; hero headline 48 px stacked over the CTA; hand-trace as a thin band between sections; sticky compact header with menu button | Hero 2 columns from 768: copy start, framed stage/illustration end; sections alternate alignment | Full editorial composition; asymmetrical grids; header inline links |
| **Auth** (5 screens) | Brand panel collapses to a 120–160 px burgundy header strip (logo + short line + hand-trace) above the form; the card is edge-to-edge with 16 px padding | Same strip but 200 px; centered card max 480 | Split 40/60: burgundy brand panel start, cream form panel end; form vertically centered |
| **User shell** | Bottom tab bar + 56 px top bar | Bottom tab bar until 768; top bar nav from 768 | Top nav with all five links + account |
| **Dashboard** | Primary "Record" panel first, "Upload" second, recent translations below; all single column | 2 columns from 768 (asymmetric 3/2) | Asymmetric hero action (spans 7/12), upload (5/12), recent strip full width |
| **Live camera** | Stage full-bleed to the edges (radius 0 on xs), controls pinned below in thumb reach (Record/Stop 56 px), tips collapsed into an expandable section; portrait 3:4 stage, landscape 16:9 | Stage + controls stacked; tips beside from 768 (2/3 – 1/3) | Stage 8/12 + tips panel 4/12 |
| **Upload video** | Dropzone full width, 160 px tall; preview replaces it; details stacked | Dropzone + details in two columns from 768 once a file is chosen | Same, larger preview |
| **Translation history** | Record cards; filters behind a Filters sheet | Cards until 768, table from 768 | Table with sticky header |
| **Profile / settings** | Single column, sections stacked | Single column with wider fields | Two columns: identity summary at start (sticky), settings sections at end |
| **Admin shell** | Drawer + 56 px top bar | Drawer to 1023, icon rail 1024–1279 | Expanded sidebar ≥ 1280 |
| **Admin tables** | Record cards, Filters sheet, 44 px actions | Cards to 767, table from 768 (hide lowest-priority columns first) | Full table with all columns |
| **Admin forms** | One column; sticky bottom action bar (Save / Cancel) above safe area | One column, max 640 | Two-pane forms (main + side panel) where specified in section 11 |
| **Admin overview** | Single column; "needs attention" first | 2 columns | Asymmetric 8/4 grid |
| **Menus / sheets** | Bottom sheets (account menu, filters) | Bottom sheets | Popovers |

Hide-column priority for tables between 768 and 1023: keep the primary identifier, status and actions; hide dates/secondary metadata first, and expose them inside the row via a disclosure if needed. Nothing is *removed*; it moves.

Responsive rules
- Touch layouts (≤ 1023): 44 px targets, 16 px minimum input text (prevents iOS zoom), no hover-only controls.
- Sticky bars (top bar, bottom tabs, form action bar) always add safe-area padding and never cover focused fields (scroll-padding).
- Images and videos: `max-inline-size: 100%`, explicit aspect ratios to prevent layout shift.
- Orientation: the camera screen must remain usable when the phone is rotated; stage resizes, controls reposition to the inline-end edge in landscape.
- Test widths: 320, 360, 390, 768, 1024, 1280, 1440, 1920; plus 200% browser zoom and large system text.

---

## 10. Animation and interaction guidelines

Principle: motion explains change and confirms action. It never delays a task and never loops for decoration. CSS only; no animation library.

### 10.1 Motion tokens
| Token | Value | Use |
|---|---|---|
| `--ds-dur-instant` | 80 ms | Press feedback |
| `--ds-dur-fast` | 140 ms | Hover, color, border changes |
| `--ds-dur-base` | 220 ms | Alerts, menus, tabs, pill/status changes |
| `--ds-dur-slow` | 360 ms | Drawers, sheets, page enter |
| `--ds-dur-hero` | 560 ms | Landing hero entrance only |
| `--ds-ease-standard` | `cubic-bezier(.2, 0, 0, 1)` | Most transitions |
| `--ds-ease-enter` | `cubic-bezier(.05, .7, .1, 1)` | Things appearing |
| `--ds-ease-exit` | `cubic-bezier(.3, 0, .8, .15)` | Things leaving |
Animate only `opacity` and `transform`, plus color/background/border color for state changes. Never animate layout properties (width, height, top, margin) or blur.

### 10.2 Global patterns
| Moment | Behavior |
|---|---|
| Page enter | Main content blocks fade in and rise 8 px over 360 ms, staggered 40 ms across at most four blocks. Plays once per navigation. **No exit animation** (never delay navigation). Where supported, the View Transitions API may cross-fade routes in 200 ms as progressive enhancement |
| Button | Color change 140 ms; press = 1 px downward shift in 80 ms; no scale bounce |
| Input | Border color 140 ms. The focus ring appears **immediately** (no animation) |
| Alert / feedback | Fades in and rises 8 px in 220 ms. Removal is instant |
| Toast | Slide 16 px + fade, 220 ms in; fade out 140 ms |
| Sheet / drawer | Scrim fades 220 ms; bottom sheet slides up 360 ms; drawer slides from the inline-start edge (see Drawer row). *(Confirmation dialogs are deferred, 7.7.)* |
| Drawer (admin) | Slides from the inline-start edge, 360 ms; scrim fade 220 ms |
| Menus / popovers | Fade + 4 px rise, 140 ms |
| Tabs / segmented | Selected pill or underline slides between options, 220 ms |
| Table | Row hover 140 ms. **Filter and search results change instantly** (no animation that delays data). Loading = skeleton rows (1.6 s opacity pulse) |
| Skeleton | Opacity pulse 100% to 60%; no shimmer sweep |
| Spinner | 0.8 s linear rotation |

### 10.3 Screen-specific motion
- **Live camera:** status pill color and label cross-fade in 220 ms between phases (permission, ready, recording, review). While recording, the red recording dot pulses (1.6 s opacity 100% to 40%, ease-in-out). The recording **timer does not animate** and uses tabular figures so it does not jitter. The framing-guide brackets fade to 40% when recording begins. Moving to review fades the stage content in 220 ms. The recording state is always also communicated with the word "Recording" so the pulse is never the only cue.
- **Stepper (record, review, submit):** the current marker fills in 220 ms; completed markers show a check.
- **Upload:** dropzone drag-over state changes color and border in 140 ms; the preview replaces the dropzone with a 220 ms fade. Validation errors appear with the alert pattern.
- **Auth:** card content fades up once (360 ms). On the verify-email success state the hand-trace draws once (see below).
- **Landing:** hero headline lines rise and fade in sequence (560 ms, 80 ms stagger, once). Sections reveal on scroll once (fade + 16 px rise, 360 ms) using IntersectionObserver or CSS scroll-driven animations as progressive enhancement; content is fully visible without them.
- **Hand-trace draw-on:** the line draws along its path over 1.2 s (enter easing) **once**, only on the landing hero, auth brand panel first paint, and verify-email success. Everywhere else it is static.
- **Admin:** only the shell and component motion above. No decorative animation in tables, logs or forms.

### 10.4 Interaction rules
- Acknowledge every action within 100 ms (pressed state, spinner or disabled state).
- **Never show success before the API returns.** No optimistic fake saves; the existing double-submit guards (`submitting` refs) and busy states are preserved.
- Destructive actions keep their existing native confirmation prompts (7.7).
- Keyboard: Tab order follows visual order; Escape closes drawers, menus and sheets; focus returns to the trigger; focus never lands on an off-screen element.
- Errors move focus or use `aria-live` announcements exactly as the existing forms do (preserved `role="alert"`, `aria-live`).
- Hover states are enhancements only; every hover affordance has a focus and touch equivalent.

### 10.5 Prohibited
Parallax, auto-playing carousels, looping decorative animation, animated gradients, bounce/spring effects, cursor-following effects, scroll-jacking, page-load splash animations, shimmer sweeps, animated numbers counting up.

### 10.6 Reduced motion
A single global `@media (prefers-reduced-motion: reduce)` rule (replacing the six per-file rules) sets transitions to opacity-only at ≤ 100 ms and disables transforms and entrance animations. Specifically:
- Hand-trace appears already drawn; page and scroll reveals are immediately visible; drawers and sheets appear without sliding.
- The recording dot is static (label "Recording" remains); skeletons are static; the spinner may remain (it conveys progress) or be replaced by the text "Loading…".
- No behavior depends on motion; everything functions identically.

### 10.7 Performance
Use only compositor-friendly properties, no `will-change` except during an active transition, no animation on large blurred or filtered elements, and keep the texture and hand-trace as lightweight inline SVG or small images. Target a smooth experience on low-end Android phones.

---

## 11. Page-by-page visual specifications

Conventions for this section
- **Preserve** lists what must remain functionally identical. **New** lists additions.
- Heading *levels* in the existing markup are unchanged; visual size is controlled by classes, independent of level.
- Copy shown in quotes is the existing copy, kept unless marked *new*.
- No screen shows fabricated data, numbers or testimonials.

### 11.1 Landing page `/` (new)
**Purpose:** introduce ISHARA AI and lead visitors to create an account or sign in. **Static page, no API calls.** *Placeholder copy below is a proposal for approval; do not add claims about accuracy, vocabulary size, speed or user counts.*

**Header:** transparent over the hero, becomes solid burgundy on scroll. Logo lockup at start; inline links (anchors on the page: *How it works*, *Two ways to start*) from ≥ 1024; **Sign in** (tertiary-on-dark) and **Create account** (secondary-on-dark, cream outline). The header deliberately has no gold button so the hero holds the single gold CTA of that view. Mobile: logo + a 44 px menu button opening a sheet with the same links.

**1. Hero** (burgundy `#601719`, min-height 88vh desktop): eyebrow "PAKISTAN SIGN LANGUAGE" (Oswald, `#E8CF98`) · `display-xl` headline "COMMUNICATION *without barriers.*" (Oswald uppercase for the first words; the final phrase in Source Serif 4 italic, `#E8CF98`) · a 18 px line: "A more accessible way to connect through Pakistan Sign Language." · CTAs: **Create account** as the hero's one gold button, plus **Sign in** as a cream-outline secondary (the header's two buttons are quieter than the hero's). At the end side, an **arch-framed** panel (`--ds-shape-arch`) in deep burgundy containing a redrawn single hand line illustration and the hand-trace in gold, **not** a fake app screenshot. A large, low-opacity hand-trace arcs behind the content, kept clear of the text blocks. Bottom edge transitions to cream with a soft organic curve (single SVG curve, not a blob).

**2. How it works** (cream `#F8F1E1`): an editorial timeline, not cards: three numbered steps (Oswald numerals, 72 px, `#601719`) connected by a hand-trace line. Steps: **Record or upload** ("Sign into your camera or choose a PSL video.") · **Review your clip** ("Play it back to check it captured your whole thought.") · **Read the translation** ("Text translation will appear here once translation is available.") — the third step is explicitly labelled as upcoming with a neutral "Coming soon" badge. Desktop: horizontal with alternating vertical offsets; mobile: vertical with the line running down the inline-start edge.

**3. A statement band** (warm cream `#F1E4C8`, large): one editorial sentence in `quote` style (serif italic 28–40 px) about the purpose, e.g. "Built for Pakistan Sign Language." with a short supporting paragraph. No attributed quotes or testimonials.

**4. Two ways to start** (white-on-paper asymmetric split): left, a tall panel "Use your camera" (burgundy, Record icon, short copy, text link "Create an account to start"); right, a shorter cream panel "Upload a recording". Different sizes and alignment, not identical cards.

**5. Designed to be easy to use** (paper): a short list of honest interface qualities — works on phones, tablets and computers; high-contrast, keyboard-friendly interface; clear feedback at every step. No product-performance claims.

**6. Closing CTA band** (deep burgundy `#3E0D10`): headline "Start communicating." · gold **Create account** (the single gold CTA in this viewport; the hero's is out of view) · **Sign in** secondary-on-dark.

**Footer** (deep burgundy): logo, "Communication without barriers.", links to Sign in and Create account, © line. *Terms and Privacy pages do not exist today; the footer shows the text "Terms and Privacy Policy" only if those pages are supplied.*

**Responsive:** per section 9. **Motion:** hero entrance + scroll reveals + one hand-trace draw (10.3).
**Preserve:** `/login`, `/signup`, `/forgot-password`, `/verify-email`, `/reset-password` unchanged. `/` stops redirecting to `/login` and renders this page.

#### Landing authentication behavior (approved requirement, verified against the code)
**Requirement:** signed-out visitors see **Sign in** and **Create account**. Signed-in users see **Go to dashboard** *only if* reliable authenticated-user state already exists and can be reused **without** a new authentication API request and **without** changing authentication or session logic, and the role-based destinations (admin → `/admin`, others → `/dashboard`) are preserved. Otherwise the page stays static and the limitation is documented.

**Verification performed** (read `App.jsx`, `api/auth.js`, `Login.jsx` in the uploaded source):
- **There is no shared auth state.** The app has no context, provider or store. The only user object lives in `ProtectedRoute`'s local state, created by one `getCurrentUser()` call (`GET /api/auth/me`). It exists only while a protected route is mounted and is discarded when the user navigates to `/`.
- **The only persistent client signal is the session token** in `sessionStorage` (`ishara_access_token`, readable through `getAccessToken()`). A token proves neither validity nor role: it may be expired, revoked or belong to a suspended account, and only `/me` (inside `ProtectedRoute`) can confirm it.
- **Role is not stored on the client.** `Login` picks `/admin` or `/dashboard` from the login response (`result.user.role`), and `ProtectedRoute` decides access from `/me`. Also, `/dashboard` is not role-restricted, so admins can open it; a single "Go to dashboard" link to `/dashboard` would **not** honor the admin → `/admin` destination.
- Obtaining a trustworthy signed-in state and role on `/` would therefore need one of: a new `/me` request from the landing page (prohibited), a new shared auth provider that alters `ProtectedRoute` and session logic (prohibited), or trusting the bare token (unreliable; it would show wrong or stale links).

**Decision: existing authentication state cannot be safely reused, so the landing page remains static for every visitor.** The header and CTAs always show **Sign in** (`/login`) and **Create account** (`/signup`). There is **no** "Go to dashboard" action in this redesign.

**Rules for implementation**
- The landing page MUST NOT call any API, read `sessionStorage` or `localStorage`, call `getAccessToken()` or `getCurrentUser()`, or listen to session events.
- Landing copy must not imply the visitor is signed out ("Welcome back" and similar are not used).
- The header's end-side button slot holds exactly two buttons, with no reserved or hidden third slot.

**Documented limitation:** a signed-in visitor who opens `/` sees Sign in and Create account. Choosing Sign in goes to `/login`, where existing behavior applies unchanged (the Login page does not auto-redirect signed-in users today). This is not a regression: `/` currently redirects everyone to `/login`.

**Future path (not part of this redesign; needs separate approval):** a single shared auth-state provider wrapping the existing `getCurrentUser()` call and `ProtectedRoute` would let the landing show "Go to dashboard" with a role-aware destination and a short neutral loading state that never flashes the wrong buttons. That is a change to authentication structure, so it is deliberately excluded here.

### 11.2 Auth shell (all five auth screens + session states)
Layout (≥ 1024): split 40/60.
- **Brand panel (start, 40%)**: bg `#601719`, padding 48–64. Logo lockup top; centered message: `display-l` "COMMUNICATION *without barriers.*" (serif italic gold-300 on the italic phrase) and the existing line "A more accessible way to connect through Pakistan Sign Language."; a large hand-trace in `#C9A65E` at 35% opacity curving through the lower half (clear of text); footer line small cream. Replaces the teal/yellow circles.
- **Form panel (end, 60%)**: `bg-canvas` + texture. Form in a `narrow` container (440 px), vertically centered, **no card border on desktop** (inputs on Paper). On < 1024 the form sits on a white card (radius 20, shadow-2) overlapping the brand strip by 24 px.
- Mobile brand strip: 120–160 px burgundy with logo, one short line and a small hand-trace; the strip never pushes the form below the fold on a 667 px-tall screen.

Common form elements: title (Oswald, `h1`-size visual on the form), supporting line (`text-secondary`), alert region, fields, primary button (full width), tertiary links. Spacing: 20 px between fields, 28 px before the primary button.

### 11.3 Login `/login`
- Title "Welcome back", line "Sign in to continue your Ishara AI journey" (brand name styled consistently as "ISHARA AI" in new copy only if approved).
- Fields: Email address, Password (Show/Hide), "Forgot password?" tertiary link at inline-end under the password field.
- Primary: **Sign in** (loading labels "Signing in…" / "Signing in with Google…").
- Divider "OR CONTINUE WITH" (13 px). Google container (7.12). Bottom: "Don’t have an account? **Create one**".
- Error alert variants, all existing: generic failure ("We couldn’t sign you in."), unverified (inbox help), suspended (admin help), Google account conflict (explicit-link help). Texts unchanged.
- **Preserve:** role-based redirect, 403/409 handling based on message and status, `submitting` guard, Google callbacks, `aria-busy`.

### 11.4 Signup `/signup`
- Title "Create your account", line, "Already have an account? Sign in".
- Order preserved: Google sign-up first, divider "OR SIGN UP WITH EMAIL", then fields: Full name, Email, Password (rule checklist: 8+ characters, 1 uppercase letter, 1 number, ticking as met), Confirm password; **Create account**; terms line.
- Field-level errors under each field (existing messages).
- **Success state** (replaces the form in place): a check-circle in a success tint, title, the existing message, "Destination: **email**", the existing inbox/spam paragraphs, **Return to sign in** primary.
- **Preserve:** validation rules and messages, 409 handling, Google sign-up handler.

### 11.5 Forgot password `/forgot-password`
- Title "Forgot your password?", line, one Email field, **Send reset link**, and the tertiary "Return to sign in".
- Success replaces the form with the existing non-revealing message ("If an account exists with this email, a password reset link will be sent.") in a success alert, plus the return link.

### 11.6 Verify email `/verify-email`
- Centered state inside the auth shell. **Loading:** spinner + "Verifying your email…" (`role="status"`). **Success:** large check-circle; the hand-trace draws once around it; title "Email verified"; existing message; **Return to sign in**. **Error:** error-circle; title "Verification unsuccessful"; existing message; **Return to sign in**.
- **Preserve:** token read from the URL, one-time request logic (including StrictMode-safe refs), `aria-live="polite"`.

### 11.7 Reset password `/reset-password`
- Title "Reset your password", line. Fields: New password and Confirm new password, **using the shared `PasswordField`** (visual alignment with Signup; this replaces the hand-built markup) with the 3-rule checklist. **Reset password** primary.
- States: invalid/missing token → error alert only (no form); success → existing message + **Return to sign in**.
- **Preserve:** exact validation order and messages (length, uppercase, number, confirm), token handling, `key={token}` reset behavior.

### 11.8 Session gate states (inside `ProtectedRoute`)
- **Checking:** auth shell, centered spinner, title "Checking your session", existing line.
- **Unreachable backend:** error alert with the existing message, **Try again** primary (reloads the page, as today).
- Redirects (no session → `/login`; wrong role → `/dashboard`) are behavior and unchanged.

### 11.9 User dashboard `/dashboard`
**Purpose:** get a signed-in user to a task in one click.
- **Header band** (paper, no card): eyebrow "DASHBOARD"; `h1` "Hello, {first name}." (no emoji); line "Welcome back to Ishara AI. Ready to communicate?". The "Premium workspace" badge and the mascot placeholder (with its `aria-label`) are **removed**. A slim hand-trace arc underlines the header.
- **Start section** (asymmetric, ≥ 1024): a large **burgundy panel** (7/12) "Use Live Camera" with `video` icon, "Record your PSL signing using your camera.", and the page's single **gold** button **Open Camera**; beside it (5/12) a **warm-cream panel** "Upload a Video" with "Choose a previously recorded PSL video." and a secondary **Choose Video**. Panels differ in color, scale and emphasis. Mobile: stacked, camera first. The existing "Live" and "Recorded" tags become small badges.
- **Recent translations**: section header (h2 "Recent Translations", line, tertiary **View All** link to history). Because there is no data, show the designed **empty state**: hand-trace "trail" illustration, "No translations yet", "Your recent translations will show up here once you get started.", with a link to the camera. When data exists later: a compact list (one row each: icon tile, source name, date, duration, status badge), not cards.
- Footer line "Communication without barriers." in serif italic.
- **Preserve:** navigation targets (`/dashboard/live-camera`, `/dashboard/upload-video`, `/dashboard/translation-history`), user name/initials logic, sign out.

### 11.10 Live camera `/dashboard/live-camera`
**Purpose:** capture one complete signed thought. Priority is clarity and control, not decoration.
- PageHeader: h1 "Live Camera", line "Record your signing to translate it into text.", **Back to Dashboard** tertiary at inline-end.
- **Stage** (radius 20; edge-to-edge on xs): 16:9 landscape (3:4 portrait phones), background `#3E0D10`, solid, no texture. Content by phase:
  - *Permission required:* centered shield icon (`shield-check`), "Your camera is not on yet", "Allow camera access to see your preview here." Below the stage, a control row with the explanation ("Let’s set up your camera" + existing sentence) and **Allow Camera** (primary; label "Requesting…" while pending).
  - *Camera ready:* live video fills the stage (`object-fit: cover`). The preview is **not mirrored today and stays unmirrored**; mirroring would change what signers see and is a product decision, not a styling one. Overlays: top-start **status pill** ("Camera ready", success tint); a framing guide of four corner brackets and a subtle head-and-shoulders/hands zone at 40% white; bottom text "Position yourself comfortably, then select Record."
  - *Recording:* pill becomes red-dot + "Recording"; top-end shows the elapsed time; guide fades to 40%; line "Sign naturally. Select Stop when you have finished."
  - *Review:* the recorded clip (native controls); pill "Recording stopped".
- **Control row** (white strip under the stage, radius 12): start — duration block ("Recording time" / "Complete clip" label above a 32 px Oswald timer, tabular); end — buttons. Ready/recording: **Record** (primary, 56 px, red dot icon; disabled while recording) and **Stop** (secondary with square icon; enabled only while recording). Review: **Record Again** (secondary) and **Submit for Translation** (primary). Existing disabled logic unchanged.
- **Placeholder honesty:** pressing Submit shows the existing info alert "Translation backend integration is not available yet. Your recording has not been submitted." (info alert, `role="alert"` as present). Do not display a processing state.
- **Stepper** below: "Record your clip → Review your recording → Submit for translation"; current step filled; the third step carries a neutral "Not available yet" note.
- **Tips** (desktop end column 4/12, below on mobile) as a simple list with icons, not cards: Face and upper body visible · Keep both hands in view · Use good, even lighting (existing titles and sub-lines). In review: "Check your clip" and "Happy with your recording?" content retained. Footnote retained ("Translation starts only after you finish, review and submit your clip.").
- Errors: camera/recording errors in an error alert (`role="alert"`) directly under the stage.
- **Preserve:** `getUserMedia` flow, MediaRecorder with its type preferences, 250 ms chunking, timer logic, track-ended handling, object URL revocation, cleanup on unmount and sign out, all state phases and messages, `aria-label`s on the videos.

### 11.11 Upload video `/dashboard/upload-video`
**Purpose:** choose a PSL video and check it plays.
- PageHeader (existing title and line).
- **Empty:** the **dropzone** (7.11), full width of the main column; helper chips "MP4", "WebM", "AVI", "Up to 250 MB".
- **Error:** alert naming the file (existing `fileErrorName` and message), dropzone returns to the empty state.
- **Selected:** the dropzone is replaced by a **preview panel**: 16:9 video player (native controls, `playsInline`), under it a file summary row — video icon tile, file name (wraps), format badge, size, duration (existing "Duration unavailable" fallback) — and actions: **Choose another** (secondary), **Remove** (tertiary), **Submit for translation** (primary). Submit shows the existing info alert "Upload is not available yet" with its message. Preview errors use an error alert.
- Tips panel and the footnote ("Uploading a video does not start translation…") as on Camera.
- **Preserve:** accepted extensions, 250 MB limit, empty-file check, `canPlayType` check, object URL lifecycle, drag-and-drop handling, hidden input accept list, all messages.

### 11.12 Translation history `/dashboard/translation-history`
- PageHeader (existing title and line).
- **Toolbar:** search ("Search by title"), Status select (All statuses, Completed, Processing, Failed), Date select (Any date, Today, Last 7 days, Last 30 days), **Clear filters** tertiary. Mobile: search + **Filters** sheet.
- **Results summary** ("N translations" + "Newest first").
- **Table** (7.8): Translation (video-icon tile + name + language sub-label), Date & time, Duration (clock icon + tabular value), Status badge. Mobile: record cards using the existing `data-label` values.
- **Empty (no records at all):** hero-sized empty state: trail motif; h2 "Your first translation starts here"; the existing paragraph; **Open Camera** (primary) and **Choose Video** (secondary); the line "One complete thought. One step closer to connection." in serif italic. **No-results (filters):** search icon, "No translations found", existing text, **Clear filters**.
- The existing table footer line ("Translation history appears here when processing becomes available.") is retained as `text-muted` helper text.
- **Preserve:** the `records` prop contract, field fallbacks (`created_at`/`createdAt`/`date`, etc.), filtering and sorting logic, status normalization, row keys.

### 11.13 User profile / settings `/dashboard/profile-settings`
- PageHeader: "Profile & Settings" with its existing line.
- **Layout (≥ 1024):** sticky identity summary at start (avatar 72, name, email, verification badge, "Google linked" badge when linked, **Edit profile** button); settings column at end as **ruled settings rows** (not boxed cards): each row = title + description at start, action at end, divided by hairlines.
- Rows/sections: *Personal information* (full name), *Account information* (email, email verification as definition list), *Password & security* ("Use the existing password reset flow…" with **Request password reset** link to `/forgot-password`), *Google sign-in* (explanatory text; when unlinked, the Google button container; success/error/notice alerts; when linked, a success badge), *Account session* (explanatory text + **Sign out**).
- **Edit mode:** identity block shows a **Choose picture** button (image types, 5 MB limit; "Local preview only" label retained), a Full name field with the existing validation messages, **Save** and **Cancel**. After Save, the existing notice is shown in an info alert: "This is a temporary preview only. Profile updates cannot be saved to your account yet." No success confirmation is invented.
- **Preserve:** `linkGoogleAccount` call and states, local-only profile edit, picture preview object-URL handling, name validation, sign out.

### 11.14 Admin overview `/admin`
- PageHeader h1 "System overview", line "Monitor platform activity, content and translation operations."; DemoNotice banner (existing text).
- **At a glance** (not four equal cards): a single white panel, a **hero figure** (Total users, Oswald 72 px, with its note "Registered platform users") at start and three smaller supporting figures (Active users, Pending users, Admin users with their notes) separated by vertical hairlines at end; mobile: hero figure on top, three in a row (or stacked on xs). Loading shows "…" skeleton blocks; the existing "—" fallback when unavailable; error alert above on failure.
- **Recent activity** (8/12): ruled list of the latest 5 log events: severity icon + badge, event (bold), "source · time". States: loading, error, empty ("No system activity has been recorded yet."). **View all** → `/admin/system-logs`.
- **Data availability** (4/12): list rows with a status chip: Connected = success; "Not connected"/"Not available" = neutral with an `info` icon. Content hard-coded exactly as today.
- **Quick actions** (4/12 under availability): three large link rows (icon, label, arrow): Manage users, Add a PSL sign, Edit knowledge articles, with the same destinations.
- Footer line retained.

### 11.15 User management `/admin/users`, `/admin/users/add`, `/admin/users/edit/:userId`
**List:** PageHeader with **Add user** (primary). Toolbar: search, Role select (All/Admin/User), Status select (All/Active/Pending/Suspended). Table columns: **User** (avatar + name, email beneath), **Role** badge, **Status** badge, **Joined**, **Actions** (Edit, Delete). 8 per page with pagination. Loading skeleton; error alert with the existing **Retry**; no-results state with Clear filters. Delete keeps its existing native `window.confirm` prompt and handler (7.7); the row shows busy state while `deletingUserId` is set; `deleteError` in an alert above the table. Mobile: cards with name, email, badges and 44 px Edit/Delete buttons.
**Add user:** single-column form (max 640): Full name*, Email address*, Role* (select: User, Admin), Account status* (select: Invited, Active); **Create user** (primary) and Cancel; sticky action bar on mobile. Existing validation/messages unchanged.
**Edit user:** loading ("Loading account…") and "User unavailable" states preserved. Layout (≥ 1024): form at start (Full name*, Email address*, Role if present today) and a **side panel** at end with current-status badge, verification state, and actions: **Suspend/Activate** (existing behavior, no new confirmation), **Resend confirmation** (shown when a pending email exists), plus the existing info notice. Save keeps the existing success/error/503 handling. When the admin edits their own account, the existing layout-update event still fires.
- **Preserve:** derived status logic (suspended / pending-or-unverified / active), pagination reset on filter change, delete-and-repage logic, `useOutletContext` self-detection.

### 11.16 PSL dictionary `/admin/psl-dictionary`, `/add`, `/edit/:signId`
**List:** PageHeader (existing title "PSL sign dictionary" and line) with **Add sign** (primary). Toolbar: search ("Search sign or English meaning") and a single chip row. The **six existing filters** (All, Greetings, Food, Travel, Draft, Reviewed) stay **single-select with identical filtering logic**; visually they are grouped as *Category* chips and *Review status* chips separated by a divider and labelled with visually-hidden group names. Changing them into independent facets would alter behavior and is out of scope.
Table: **Sign label**, **Category**, **Update date**, **Review status** badge, **Actions** (status update where existing, Edit, Delete with its existing native confirmation). 7 per page. Optional (needs approval, adds image requests): a small thumbnail column using the existing `image_url`. Mobile: cards.
**Form (add/edit)** — two panes (≥ 1024): *Sign entry* at start (Sign label*, Category* select, Notes textarea) and *Media* at end: **Reference image** and **Reference video** each with a dropzone (7.11), existing validation, live preview of the selected file and, in edit mode, the current media loaded from `API_BASE_URL + url`, with the existing "New … preview" / "Current …" captions and a remove-selected button. Save (primary) shows "Saving…" while the existing sequence runs (create/update the record, **then** upload image, **then** video). Edit page: loading and error states from `getPSLSignById`.
- **Preserve:** field mapping (`label` ⇄ `word`, `notes` ⇄ `description`), media upload order and `media_type` values, preview URL cleanup, error handling.

### 11.17 Knowledge base `/admin/knowledge-base`, `/add`, `/edit/:articleId`
**List:** PageHeader "Knowledge base" with **Add article**. Toolbar: search ("Search articles, categories, or keywords"), Category select, Status select, Sort select (recent first etc., existing options). Table: **Title** (+ summary line), **Category**, **Status** badge (Published = success, Draft = neutral), **Updated**, **Actions** (Publish/Unpublish toggle with its existing request, Edit, Delete with its existing native confirmation). Pagination as today. Mobile: cards.
**Form:** main column — Title*, Summary, **Article body*** with the existing formatting toolbar (icon buttons, `role="toolbar"`, cursor-position insertion unchanged) and a taller text area (min 320 px); side panel (stacks below on mobile) — *Publication settings*: current-status badge, Category* select, **Save as** segmented Draft/Published, **Save** (primary) and Cancel. Existing validation and messages unchanged; default category "Video guidance" unchanged.
**Edit:** loading, error and not-found handling preserved (the existing `Navigate` behavior stays).

### 11.18 System logs `/admin/system-logs`
- PageHeader "System logs" + **Export CSV** (secondary, `download` icon) — the same client-side export and file name.
- Toolbar: search, Time-range select, Severity select.
- **Severity summary:** one segmented strip (counts per severity as inline badges, not four cards); clicking is not added (no new behavior).
- Table: **Time** (local format as today), **Severity** badge, **Event**, **Source**. Monospace (`ui-monospace`, 13 px) only for IDs/technical strings. Mobile: cards with severity at the top.
- Loading, error and empty states as in 7.8. Limit and refresh behavior unchanged.

### 11.19 Processing activity `/admin/processing-activity`
- PageHeader + **Export CSV**; DemoNotice banner (existing text).
- **Status summary strip** (Pending, Processing, Completed, Failed counts) in one segmented bar with matching badges.
- **Filter form** keeps the existing *Apply* model: Status select (and any existing filters) with **Apply** (primary) and **Reset** (tertiary); applied filters shown as chips below.
- Table: job/file, **Submitted** (Pakistan Time date + time, existing formatting), **Processing time** ("Waiting", "In progress", or duration as today), **Status** badge. Mobile: cards.
- **Preserve:** PKT formatting helpers, status labelling, applied-vs-draft filter state, CSV export.

### 11.20 Admin profile / settings `/admin/profile-settings`
- Same visual pattern as 11.13 (identity summary + ruled settings rows). Sections: *Personal information* (Full name), *Email* (Email field with the pending-email flow), *Google sign-in*, plus the DemoNotice.
- **Pending email:** a warning alert showing the pending address, with **Resend confirmation** and **Cancel email change** (the latter keeps its existing native `window.confirm` with the message "Cancel the pending email change? Your current email will remain active."). Existing success/info messages kept.
- After a successful update the existing `ishara:admin-profile-updated` event still updates the shell's name and email.
- **Preserve:** `getUserById`/`updateUser` use, pending-email resend/cancel, Google linking, event dispatch, all message wording.

### 11.21 404 page (new)
- Renders for any **genuinely unmatched** path in place of today's redirect to `/login`. Every existing valid route is untouched. Safety rules, the verified route table and the regression checklist are in 15.8 and 15.9.
- Behavior difference to expect (and test): an unknown URL, including an unknown nested URL such as `/admin/typo` or `/dashboard/typo`, now shows the 404 page instead of redirecting to `/login`. The 404 page is outside `ProtectedRoute`/`AdminRoute`, so it never reveals or depends on session state.
- Composition: full viewport, burgundy panel with a giant "404" (`display-xl`, `#E8CF98`) whose final stroke becomes a hand-trace line that trails off the page; heading "We can’t find that page."; line "The link may be broken, or the page may have moved."; actions **Back to home** (`/`, primary-on-dark/gold) and **Sign in** (secondary-on-dark).
- Standalone (no shell), no API calls, sets `document.title` accordingly.

### 11.22 Future translation-result component
Specified in full in section 14. It is not routed and not wired to any screen yet.

---

## 12. Component reuse strategy

### 12.1 Rules
1. **Extend, don't rename.** Existing components keep their names, file paths and props: `AuthLayout`, `AuthFeedback`, `FormField`, `PasswordField`, `PrimaryButton`, `GoogleIdentityButton`, `AdminLayout`, `AdminSidebar`, `AdminHeader`, `AdminDemoNotice`, `PSLSignForm`, `ArticleForm`, `ProtectedRoute`/`AdminRoute`. Their internals and styling change; their **props, ARIA wiring and behavior do not**.
2. New shared components are **added next to** them; pages migrate one at a time.
3. Components consume **semantic tokens only**. No hex values inside component or page CSS.
4. Pages contain layout and content only; anything used by two or more pages becomes a shared component.

### 12.2 Component inventory and mapping
| New / shared component | Replaces or extends | Used by |
|---|---|---|
| `tokens.css`, `base.css` | Legacy `--ish-*` tokens, `index.css` | Everything |
| `Icon` (single set) | Per-page inline `Icon` helpers, Unicode glyphs, emoji | Everywhere |
| `Logo` (lockup + mark), `HandTrace` | Text "ishara.ai", PNG, circle decoration | Shells, auth, landing, empty states |
| `Button` (variants) | `PrimaryButton` (kept as thin wrapper), ad-hoc `.ish-user-action-button`, `.ish-live-button`, etc. | All pages |
| `Field`, `Input`, `Select`, `Textarea`, `Checkbox/Radio` | `FormField`, per-page field CSS | All forms |
| `PasswordField` (kept) | Reset password's hand-built password markup | Login, Signup, Reset |
| `Alert` | `AuthFeedback`, `.ish-error-message`, admin error blocks, `AdminDemoNotice` (variant) | All pages |
| `Toast` | none (new) | Confirmations only |
| *ConfirmDialog* — **deferred, not built** | Nothing: the 4 native `window.confirm` calls stay | n/a (7.7) |
| `Drawer` / `BottomSheet` | none (new) | Admin nav, filters, account menu |
| `UserShell` (+ `UserTopBar`, `BottomTabBar`) | 5 duplicated user headers | All user pages |
| `AdminShell` (restyles `AdminLayout` + `AdminSidebar` + `AdminHeader`) | Current admin layout | All admin pages |
| `PageHeader`, `Breadcrumb` | Per-page headings | All app pages |
| `DataTable` (+ `Toolbar`, `FilterSheet`, `Pagination`, `ResultsSummary`) | Per-page table, toolbar and pagination CSS (Users, PSL, Knowledge base, Logs, Processing, History) | 6 pages |
| `StatusBadge` | Per-page badge styles | Tables, profile, overview |
| `EmptyState`, `Skeleton`, `Spinner` | Per-page empty/loading text | All list pages |
| `FileDropzone` + `VideoPreview` | Upload dropzone, PSL upload areas | Upload video, PSL form |
| `VideoStage` + `Stepper` + `TipsList` | Camera markup | Camera, Upload (tips) |
| `SettingsRow`, `IdentitySummary` | Profile sections | User profile, Admin profile |
| `StatStrip`, `ActivityList`, `LinkRow` | Overview blocks | Admin overview |
| `Avatar`, `AccountMenu` | Header avatar/name/sign-out clusters | Shells |
| `AuthShell` (restyles `AuthLayout`) | Brand panel and card | 5 auth pages + session states |
| `TranslationResult` (placeholder) | none (new) | Future, non-routed |

### 12.3 CSS architecture
- File layout: `styles/tokens.css` (primitives + semantic + reserved dark block) → `styles/base.css` (reset, typography, focus, reduced motion) → `components/*.css` (one per component) → page CSS (layout only, shrinking). Use `@layer reset, tokens, base, components, pages, utilities;` so specificity is predictable.
- Class naming: `ds-` prefix for new components (`ds-button`, `ds-table`), BEM-style modifiers. Legacy `ish-*`, `admin-*` and page prefixes are removed from a screen **only after** that screen is migrated and verified.
- Global CSS risk is controlled by migrating screen by screen (section 16) and never reusing a legacy class name with new meaning.
- All new layout uses logical properties; physical `left/right` only where a graphic genuinely must not mirror.
- Fonts and icons are loaded once at the app root; no per-page font imports.

---

## 13. Mascot usage recommendation and the hand-trace motif

### 13.1 Assessment of the existing `ishara-auth-mascots.svg`
I opened the file. Facts:
- It is a 2 KB SVG (viewBox 600×440) and is **not referenced anywhere in the app today**.
- Despite the name, it contains **no character**. It is an illustration of one open raised hand with a shadow copy, two tilted sign cards (one red with a star, one blue with lines) and two stars.
- Palette: saturated blue `#0879B9`, red `#E63D35`, yellow `#FFD42A`, cream `#FFF4D6`. Style: thick 4.5–13 px outlines, flat fills, playful.

Findings against the new identity:
- The primary red/yellow/blue palette **clashes** with burgundy, cream and gold; recoloring would be required.
- The heavy cartoon outline conflicts with the refined, single-weight line language of the hand-trace and the editorial tone.
- It is not a mascot, so it does not fill the "future character illustration" role that the Dashboard placeholder referred to.
- A raised open palm can be read as a specific sign or gesture; depicting hands in an app for sign language carries a **correctness and cultural risk** if shapes are arbitrary.

### 13.2 Recommendation (approved) and asset preservation
1. **Retire the illustration from the UI, but preserve the file.** `public/ishara-auth-mascots.svg` is **not deleted, renamed, moved, overwritten or edited**. It stays in the project exactly as it is, as an **unused project asset**. (It is already referenced nowhere in `src` or `index.html`, so removing its visual usage requires no change to the file itself.)
2. **Remove only the visual usage and the unfinished placeholder:** the dashboard "Future character illustration" placeholder block (including its `aria-label`), the "Premium workspace" badge, and any decorative use of the old circle motif tied to it. Nothing else is removed under this item.
3. **Do not use the file as the source of the new artwork.** The new hand-trace, hand illustration and logo mark are **separately created assets** with their own file names (for example under `public/brand/` or `src/assets/brand/`). A new asset must never reuse the name `ishara-auth-mascots.svg` or overwrite any existing file. The old hand silhouette may be used only as a drafting reference.
4. **Do not commission or add a mascot character now.** If a character is introduced later it must be reviewed with Deaf community members and PSL experts for cultural appropriateness; it uses the system palette only; it appears only on landing and in empty or celebratory moments; it never appears on the camera, upload or any admin screen; and it never performs a specific sign unless that sign has been verified as correct PSL.
5. Any hand illustration shown in the product should be abstract (silhouette or line without a specific handshape) or reviewed by a PSL expert before release.

### 13.3 The hand-trace motif (signature element)
**Concept:** the path a signing hand takes through space, drawn as one continuous line. It symbolizes movement becoming language and replaces the circle decoration.

**Construction (for the designer to draw; no asset is provided here)**
- A single continuous stroke composed of 2–3 large, generous arcs and one tight loop, flowing roughly diagonally like a palm sweeping through signing space.
- The path ends in 1–3 **hollow ring nodes** (10–14 px diameter, same stroke weight) marking handshape contact points. The nodes are the only "filled-looking" parts and are never solid.
- Uniform stroke, round caps and joins, no fills, no gradients, no variable width.
- Stroke weight 2–3 px, constant at every scale (`vector-effect: non-scaling-stroke`).

**Variants**
| Variant | Shape / ratio | Used for |
|---|---|---|
| **Arc rule** | Wide shallow wave, about 12:1 | Under PageHeader, between landing sections, divider in drawers |
| **Loop** | Large composition, about 4:3 | Landing hero, auth brand panel (one per viewport) |
| **Trail** | Small, about 1:1, 1–2 nodes | Empty states, 404, verify-email success |
| **Mark** | Simplified single loop with one node, about 1:1 | Logo mark, favicon, tab bar logo |

**Color**
- On burgundy: `#C9A65E` at 40–60% opacity (large variants) or 100% (small variants).
- On deep burgundy: `#E8CF98`.
- On cream/paper: `#601719` at 12–20% opacity (large) or 100% (rule and trail).
- Drawn in `currentColor` so the token decides the color.

**Rules**
- Decorative: `aria-hidden="true"`, no title. Hidden in forced-colors mode.
- Inline SVG, each under about 2 KB.
- **Never behind body text.** Keep 24 px clear of text, or keep the opacity at or below 15% and re-verify contrast.
- At most **one Loop per viewport**; Arc rules and Trails may repeat but not adjacent to one another.
- Static everywhere except the three one-time draw-on moments (10.3).
- Mirrors in RTL because it implies reading and movement direction.
- It is **not** a progress indicator, loader or data visualization, and it never depicts a specific sign.

### 13.4 Logo lockup
- Wordmark `ishara.ai`: Oswald 600, lowercase, 0.02em tracking; the `.ai` in `#E8CF98` on burgundy, in `#601719` on light. Mark: the hand-trace Mark in gold on burgundy, burgundy on light.
- Clear space equals the height of the letter "i"; minimum 24 px high; one-color versions (cream, burgundy, ink) for flexibility.
- Deliverables for the designer: SVG lockup, SVG mark, and a favicon set. The existing 286 KB PNG is replaced by SVG in the UI and may remain as a temporary favicon.

### 13.5 Asset handling rules (all brand and illustration files)
- **Never delete or overwrite an existing asset** during this redesign. This covers `public/ishara-auth-mascots.svg`, `public/ishara_logo.png` and everything in `public/icons/` (`camera.png`, `handRaise.png`, `message.png`, `padlock.png`, `user.png`).
- New assets are **added** under new names and, if they supersede an old one in the UI, the old file stays on disk unused.
- At the cleanup phase, produce a **report** of assets no longer referenced. Deleting anything requires a separate explicit approval.
- Each phase's git diff review (16.1, gate G6) checks that no deleted or modified binary/SVG asset appears in the diff.

---

## 14. Translation-result placeholder design

### 14.1 Purpose and constraints
A **non-routed** component, `TranslationResult`, designed now so the future flow (camera/upload review, history details, dashboard recents) has a ready, consistent surface. **It is not mounted on any screen and not connected to any API.** It must **never render fabricated or sample translations in the application**. Until real data exists, the only content it can show is an honest "not available" message. Sample text may appear only in clearly labelled design-file mockups ("SAMPLE — not real output") and never in the shipped app or in screenshots shared as product.

### 14.2 Structure
Panel: white, radius 20, border subtle, shadow-1, padding 24. Layout ≥ 1024: two areas side by side (source 5/12, result 7/12) separated by a hairline; < 1024: stacked.
- **Source area:** 16:9 media frame (shows the recorded or uploaded video using the existing preview) with a caption row: file or "Recording" name, duration (tabular), date.
- **Result area:** header row with h3 "Translation" and a `StatusBadge`; body (varies by state); footer row with metadata (language label, completed time) and actions.

### 14.3 States
| State | Presentation | When it can appear |
|---|---|---|
| **Unavailable** (only state used today) | `file-text` icon in a tinted circle; title "Translation isn’t available yet"; text "Translation results will appear here once translation is available. Your recording has not been submitted."; hand-trace Trail; no actions | Default until the backend exists |
| **Empty** | "Nothing selected yet." + the prompt to record or upload | When embedded in a picker context |
| **Processing** | Spinner (indeterminate), "Translating…", real elapsed time computed from the record's timestamps; **no percentage or fake progress**; `aria-live="polite"` | Only when the backend reports `processing` |
| **Completed** | Translated text in `body-l` at reading width, language label; **Copy text** secondary button (`copy` icon; announces "Copied" via `role="status"`); metadata footer | Only with real text from the backend |
| **Failed** | Error alert with the backend's own message; **Try again** only if a retry action exists | Only when the backend reports `failed` |
Status mapping reuses the existing history statuses (Completed, Processing, Failed, status unavailable).

### 14.4 Content and typography
- Result text is rendered with `dir="auto"` so English and Urdu both lay out correctly; Urdu uses Noto Nastaliq Urdu at 18 px minimum with line height 2.0, English uses DM Sans 18 px / 1.6. Text area scrolls internally above 320 px height; no truncation.
- Long text wraps; no fixed heights.
- A text-size control is not included in v1.

### 14.5 Data contract (non-binding)
The component accepts whichever fields the backend later provides, using the names the history screen already tolerates: a display name (`source`/`file_name`), `created_at`, `duration_seconds`, `status`, and a result text field to be defined by the backend. **The backend contract is not invented here**; the mapping is finalized when the API exists.

### 14.6 Accessibility
Result region has an accessible name; status changes are announced politely; the Copy button has a visible label; the media frame has an `aria-label`; contrast per section 3; no information conveyed by color alone.

### 14.7 Future placement (not now)
Beneath the camera and upload review after a real submit; in a history-row details drawer; as the first item in Dashboard recents. These are not built or wired in this redesign.

---

## 15. Technical constraints and functionality-preservation checklist

### 15.1 Non-negotiable
Do not change: backend logic, database schemas, API endpoints or payloads, authentication behavior, Google Sign-In and linking, session and token handling, existing route paths and protected-route behavior, camera lifecycle and recording logic, upload validation rules, admin media upload behavior, existing cross-component events, and existing accessibility attributes. No fake translations, saves or backend functionality. **Git:** the Git safety protocol in 16.0.2 applies to every phase, and the repository verification in 16.0.1 happens before any change.

### 15.2 Files and areas treated as read-only logic
| Area | Rule |
|---|---|
| `src/api/auth.js`, `src/api/admin.js` | **Do not edit.** Verify with a diff at every phase |
| `GoogleIdentityButton.jsx` | Logic untouched; only its container and CSS may change |
| `App.jsx` route table, `ProtectedRoute`, `AdminRoute` | Only **two route elements change**: the element of `path="/"` (was a redirect to `/login`, becomes the landing page) and the element of `path="*"` (was a redirect to `/login`, becomes the 404 page). All other routes, nesting, ordering, guards, role redirects, the session-expired listener and the `cloneElement({ user })` injection stay byte-for-byte. See 15.8 |
| `public/ishara-auth-mascots.svg`, `public/ishara_logo.png`, `public/icons/*` | **Preserve unchanged.** No delete, rename, move or overwrite (13.5) |
| `LiveCamera.jsx` logic | Stream, recorder, timer, cleanup, phases, messages untouched; markup and classes may change |
| `UploadVideo.jsx` validation | Extension map, 250 MB limit, `canPlayType`, object-URL lifecycle untouched |
| `PSLSignForm.jsx`, `ArticleForm.jsx` submit logic | Field mapping, create-then-upload sequence, toolbar insertion logic untouched |
| `main.jsx`, `vite.config.js`, env variable names | Untouched (`VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`) |

### 15.3 Places where a visual change touches handler or structure code (require care and explicit review)
1. **`window.confirm` is preserved** (4 places, Revision 3): native confirmations and their handlers are **not** touched in this redesign (7.7). Replacing them with an asynchronous dialog is deferred and would need separate approval.
2. **Routes:** the landing page at `/` and the 404 at `*` replace two `Navigate` redirects (the only two route-table edits). Unknown URLs, including unknown nested ones such as `/admin/typo`, show the 404 page instead of redirecting to `/login`. No new route paths are added.
3. **Shells:** each user page currently renders its own `<main>` and header. Moving to `UserShell` changes page structure but pages must still receive the `user` prop exactly as today; `AdminLayout` must still provide `useOutletContext` and the profile-update listener.
4. **Reset password** moves to the shared `PasswordField`; validation order and messages are unchanged.
5. **Mobile filter sheets** reuse the same state variables as desktop toolbars (no new filtering logic).
6. **New dependencies** (self-hosted fonts, icon set): each added deliberately, versions pinned, licenses recorded.

### 15.4 Preservation checklist (tick every item at the end of each phase for the screens touched)
**Auth and session**
- [ ] Login: success redirects (admin → `/admin`, user → `/dashboard`); wrong password message; unverified (403) help; suspended (403) message; Google conflict (409) help
- [ ] Signup: all validation messages; 409 message; success state shows destination email; Google sign-up works
- [ ] Forgot password: invalid-email message; generic success message
- [ ] Verify email: valid token → success; missing/invalid token → error; request fires once (StrictMode safe)
- [ ] Reset password: rules and messages; invalid link state; success state
- [ ] Session: checking state, unreachable-backend retry, `ishara:session-expired` returns to login, wrong role → `/dashboard`
- [ ] Token stays in `sessionStorage` under `ishara_access_token`; sign out clears it

**User screens**
- [ ] Dashboard links go to camera, upload, history, profile; initials and name correct
- [ ] Camera: permission request, denied/not found/in-use/overconstrained errors, ready, record, stop, duration, review playback, record again, track-ended recovery, cleanup on route change and sign out, Submit shows the existing "not available" message
- [ ] Upload: MP4/WebM/AVI only, empty-file and over-250 MB errors, unplayable-format error, drag and drop, preview, duration, remove, Submit shows the existing message
- [ ] History: search, status and date filters, clear filters, empty and no-results states, mobile `data-label` labels
- [ ] Profile: local-only edit and picture preview (5 MB, image types), validation messages, preview-only notice, Google link success/cancel/error, reset-password link, sign out

**Admin**
- [ ] All 13 routes reachable by sidebar/drawer on desktop and phone; active item highlights on sub-routes
- [ ] Header name/email updates on `ishara:admin-profile-updated`
- [ ] Overview: summary stats, 5 recent logs, error/empty states, quick links
- [ ] Users: search, role/status filters, pagination (8/page), delete with confirm and re-paging, retry; add and edit (status toggle, resend confirmation, 503 handling)
- [ ] PSL: search, six filters, pagination (7/page), status update, delete with confirm; form: label/category/notes, image and video validation and preview, create/update then upload sequence
- [ ] Knowledge base: search, category/status/sort, publish toggle, delete with confirm; form: toolbar insertion, validation, Draft/Published, default category
- [ ] Logs: filters, severity counts, CSV export (same file name and contents)
- [ ] Processing: status counts, Apply/Reset filters, PKT formatting, CSV export, demo notice
- [ ] Admin profile: name/email update, pending-email resend and cancel (confirm), Google link

**Cross-cutting**
- [ ] `git diff` shows **no change** in `src/api/*`
- [ ] `public/ishara-auth-mascots.svg` (and the other existing assets) still present and byte-identical
- [ ] Every existing `aria-*`, `role`, `aria-live`, `aria-busy`, `aria-invalid`, `aria-describedby`, `aria-current`, `aria-pressed`, `aria-label` and `data-label` is still present
- [ ] `npm run lint` and `npm run build` pass
- [ ] No hard-coded hex values in new component CSS; no text under the minimum sizes; no sub-44 px touch targets on touch layouts

### 15.5 Accessibility acceptance (per screen)
Keyboard-only operation complete; visible focus everywhere; tab order logical; drawers and sheets trap and restore focus; screen-reader pass on forms and status changes; contrast per section 3; 200% zoom without loss; forced-colors mode keeps controls visible; reduced-motion mode removes non-essential motion; touch targets ≥ 44 px; no horizontal scroll at 320 px.

### 15.6 Notes for the implementation tool (for example Lovable)
- I have **not verified** how Lovable currently works. Design and code-generation tools commonly scaffold their own stack (often Tailwind and prebuilt component libraries) and may restructure routing or state. This project is plain CSS on React 19 / React Router 7 / Vite 8 with a working backend.
- Therefore: give the tool the existing repository; instruct it to **keep plain CSS driven by the `--ds-` tokens** (or supply an explicit token mapping if another approach is chosen); forbid edits to the files in 15.2; run **one phase at a time**; and review every diff before accepting, especially around routes, `src/api`, the camera, upload and form submit logic.
- Provide it this document, the token values, and the per-phase checklist. Reject any generated change that renames routes, replaces the router, or rewrites data-fetching.

### 15.7 Known project risks carried over from the audit
Global per-page CSS (hence screen-by-screen migration), no automated tests (hence the manual checklist plus lint/build gates), stale committed `dist/` (rebuild, never edit), strict React-hooks lint rules (do not alter effect logic), and bundle/supply-chain cost of new dependencies (pin and record versions).

### 15.8 Route verification and 404 safety

**Verified route table** (read directly from `App.jsx` of the uploaded source; 25 `path=` entries). It must be re-verified against the real repository at implementation time (see "Before changing the wildcard").

| # | Path | Element | Guard | Notes |
|---|---|---|---|---|
| 1 | `/` | `Navigate to="/login" replace` | none | **Changes** to the landing page |
| 2 | `/login` | `Login` | none | |
| 3 | `/signup` | `Signup` | none | |
| 4 | `/verify-email` | `VerifyEmail` | none | Uses `?token=` |
| 5 | `/forgot-password` | `ForgotPassword` | none | |
| 6 | `/reset-password` | `ResetPassword` | none | Uses `?token=` |
| 7 | `/dashboard` | `Dashboard` | `ProtectedRoute` (no role) | Admins can open it today |
| 8 | `/dashboard/live-camera` | `LiveCamera` | `ProtectedRoute` | |
| 9 | `/dashboard/upload-video` | `UploadVideo` | `ProtectedRoute` | |
| 10 | `/dashboard/translation-history` | `TranslationHistory` | `ProtectedRoute` | |
| 11 | `/dashboard/profile-settings` | `UserProfileSettings` | `ProtectedRoute` | |
| 12 | `/admin` | `AdminLayout` (layout route) | `AdminRoute` (`requiredRole="admin"`) | Non-admin → `/dashboard`; signed-out → `/login` |
| 13 | `/admin` (index) | `AdminDashboard` | via 12 | |
| 14 | `/admin/users` | `UserManagement` | via 12 | |
| 15 | `/admin/users/add` | `AddUser` | via 12 | |
| 16 | `/admin/users/edit/:userId` | `EditUser` | via 12 | |
| 17 | `/admin/psl-dictionary` | `PSLDictionary` | via 12 | |
| 18 | `/admin/psl-dictionary/add` | `AddPSLSign` | via 12 | |
| 19 | `/admin/psl-dictionary/edit/:signId` | `EditPSLSign` | via 12 | |
| 20 | `/admin/knowledge-base` | `KnowledgeBase` | via 12 | |
| 21 | `/admin/knowledge-base/add` | `AddArticle` | via 12 | |
| 22 | `/admin/knowledge-base/edit/:articleId` | `EditArticle` | via 12 | |
| 23 | `/admin/system-logs` | `SystemLogs` | via 12 | |
| 24 | `/admin/processing-activity` | `ProcessingActivity` | via 12 | |
| 25 | `/admin/profile-settings` | `ProfileSettings` | via 12 | |
| 26 | `*` | `Navigate to="/login" replace` | none | **Changes** to the 404 page |

This is the same 5 public + 5 user + 13 admin set as the audit (the audit counts `/` and `*` as redirects, not screens).

**Before changing the wildcard (mandatory, in Phase 4)**
1. Re-read the real local `App.jsx` and compare its route list line by line with the table above; any difference **stops the work and is reported** (16.0.1), not reconciled by guesswork.
2. List every `<Route path=…>` mechanically (for example by searching `path=` in `App.jsx`) and confirm the count and values match (25 entries expected). Any other number is a discrepancy to report.
3. Confirm there is no other router file, no lazy or dynamic route registration, and no route defined outside `App.jsx`.
4. Confirm the hosting/dev server returns `index.html` for deep links (the redesign must not make deep-link refresh worse than today).

**Rules for the landing and 404 routes**
- Only the two route elements change (rows 1 and 26). No route is added, removed, renamed, reordered or re-nested.
- `*` remains the **last** top-level route, and **no `*` or splat route is added inside `/admin` or `/dashboard`**. React Router ranks the global `*` lowest, so it matches only URLs that no other route matches; verify this by test, not by assumption.
- Path `/` matches only the exact root (React Router matching is exact for a leaf route). The landing page must not catch `/login`, `/signup`, or any other path.
- The 404 page is **not** wrapped in `ProtectedRoute` or `AdminRoute`, makes no API call and reads no session or storage.
- Dynamic admin URLs with an unknown id (for example `/admin/users/edit/999`) still match their route and show **that page's own** not-found/error state, not the global 404.
- React Router's default matching is case-insensitive and ignores a trailing slash; that existing behavior must be unchanged (so `/Login` and `/login/` still reach Login, not the 404). Query strings and hashes never affect matching (`/verify-email?token=…` still works).
- `ProtectedRoute` and `AdminRoute` bodies, the `ishara:session-expired` listener and the role redirects are not edited.

### 15.9 Route regression checklist
Run against a local backend with three states: **signed out**, **signed in as a normal user**, **signed in as admin**. Record the result, date, commit and browser. "Unchanged" means identical to the Phase 0 baseline.

| ID | Check | Signed out | User | Admin |
|---|---|---|---|---|
| RTE-01 | `/` | Landing page (**new**; was redirect) | Landing page | Landing page |
| RTE-02 | `/login`, `/signup`, `/forgot-password` | Page renders | Page renders (unchanged) | Page renders (unchanged) |
| RTE-03 | `/verify-email` with valid, invalid and no token | Success / error / error states (unchanged) | same | same |
| RTE-04 | `/reset-password` with valid, invalid and no token | Form / invalid-link state / invalid-link state (unchanged) | same | same |
| RTE-05 | `/dashboard` | → `/login` | Dashboard | Dashboard (unchanged) |
| RTE-06 | `/dashboard/live-camera`, `/upload-video`, `/translation-history`, `/profile-settings` | → `/login` | Each page renders | Each page renders (unchanged) |
| RTE-07 | `/admin` | → `/login` | → `/dashboard` | Admin overview |
| RTE-08 | Each of the 12 other admin routes (`users`, `users/add`, `users/edit/:userId`, `psl-dictionary`, `/add`, `/edit/:signId`, `knowledge-base`, `/add`, `/edit/:articleId`, `system-logs`, `processing-activity`, `profile-settings`) | → `/login` | → `/dashboard` | Page renders inside the admin shell |
| RTE-09 | Unknown URL, e.g. `/does-not-exist` | **404 page** (was → `/login`) | **404 page** | **404 page** |
| RTE-10 | Unknown nested URLs, e.g. `/admin/does-not-exist`, `/dashboard/does-not-exist` | **404 page** | **404 page** | **404 page** |
| RTE-11 | Unknown id on a valid route, e.g. `/admin/users/edit/999999` | → `/login` | → `/dashboard` | The page's own not-found/error state, **not** the 404 |
| RTE-12 | Case and slashes: `/Login`, `/login/`, `/admin/users/` | Matches the existing route (unchanged) | same | same |
| RTE-13 | Login redirect: sign in as user, then as admin | n/a | → `/dashboard` | → `/admin` |
| RTE-14 | Session expiry on a protected page (clear the token or let it expire, then act) | n/a | → `/login` via the existing event | → `/login` |
| RTE-15 | Deep link refresh (browser reload) on `/dashboard/live-camera` and `/admin/users` | → `/login` | Page reloads | Page reloads |
| RTE-16 | Browser back/forward across landing, login, dashboard, 404 | Works, no redirect loops | same | same |
| RTE-17 | 404 page links (**Back to home**, **Sign in**) | Work | Work | Work |
| RTE-18 | Route-table diff against 15.8: 25 `path=` entries, only rows 1 and 26 changed | Pass | n/a | n/a |

---

## 16. Implementation plan and regression gates

Every phase is small enough to review as one change, can be reverted independently, and **must pass the standard gate (16.1) and its named regression tests (16.2) before the next phase starts.** No phase is merged with a failing gate. Phases are implemented one at a time. **Nothing is changed until the repository verification (16.0.1) and the Git safety checks (16.0.2) are complete and reported.**

### 16.0 Mandatory pre-implementation protocol

#### 16.0.1 Verify the real repository (source of truth)
**Principle:** the local repository on your machine is the source of truth. This document's route table, file list and counts were taken from an uploaded archive, which may be older or newer than your repository. Where they differ, the repository is correct and the specification is flagged. Nothing is guessed, adapted or silently reconciled.

**Read-only checks (no file is modified):**
1. Confirm the repository root and that `package.json` is the frontend project (`ishara-ai-frontend`).
2. Re-read `src/App.jsx` in full and compare with 15.8: the 25 `path=` entries (every path, element and guard, including the 12 nested admin children and the admin index), `*` last, and the bodies of `ProtectedRoute` and `AdminRoute` (one `getCurrentUser()` call, the `ishara:session-expired` listener, role mismatch → `/dashboard`, no session → `/login`, `cloneElement(children, { user })`).
3. Confirm every protected file exists at the expected path and matches its described role: `src/api/auth.js`, `src/api/admin.js`, `src/components/GoogleIdentityButton.jsx`, `src/components/admin/AdminLayout.jsx`, `src/pages/LiveCamera.jsx`, `src/pages/UploadVideo.jsx`, `src/pages/admin/psl/PSLSignForm.jsx`, `src/pages/admin/knowledge/ArticleForm.jsx`, `src/main.jsx`, `vite.config.js`.
4. Re-measure the baseline counts and compare with the expected values:

| Measure | Expected | Read-only way to measure |
|---|---|---|
| `path=` entries in `App.jsx` | 25 | search `path=` in `src/App.jsx` |
| `/api/` occurrences in `src` | 61 | search `/api/` in `src` |
| `getCurrentUser(` call sites | 1 (`App.jsx`) | search `getCurrentUser` in `src` |
| `sessionStorage`/`localStorage` uses | 6 | search both terms in `src` |
| `fetch(` outside `src/api` / inside `src/api` | 0 / 5 | search `fetch(` |
| `ishara:` event strings | 9 | search `ishara:` in `src` |
| `getUserMedia` / `new MediaRecorder` / `createObjectURL`+`revokeObjectURL` | 3 / 1 / 17 | search in `src` |
| `window.confirm` | **4** | search `window.confirm` in `src` |

5. Confirm tooling: scripts `dev`, `build`, `lint`, `preview` present and **no** `test` script; `react ^19.2.8`, `react-dom ^19.2.8`, `react-router-dom ^7.18.4`, `vite ^8.3.0`; lockfile present; environment variable names `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID`.
6. Confirm the assets exist and record SHA-256 checksums: `public/ishara-auth-mascots.svg`, `public/ishara_logo.png`, `public/icons/*`.
7. Confirm the screen inventory matches the audit (5 public, 5 user and 13 admin routes, their page files, and the shared components listed in section 2 of the audit).

**Stop rule.** If **any** item differs (a route added, removed or changed; a file missing, renamed or moved; a count, version or script different; an extra router or route file; new authentication code; a different structure), **STOP**. Do not proceed, do not guess and do not adapt this specification silently. Produce a **discrepancy report** containing: the item; what the specification says; what the repository actually has (file and line); the likely impact on the redesign and on functionality preservation; a recommendation and the options. **Wait for your decision.** Only then is the specification amended as a new revision, and only the values you acknowledge become the baseline.

#### 16.0.2 Git safety protocol
**A. Inspect first (read-only).** Record the output of: `git status` (and the porcelain form), the current branch, the current commit hash, the stash list, the remotes and the last few commits. If the repository is in any unusual state (detached HEAD, merge/rebase/cherry-pick in progress, unresolved conflicts, submodules, extra worktrees), **STOP and report**.

**B. Preserve all existing local changes.** If the working tree has modified, staged or untracked files, **STOP and report the exact list.** Existing local changes are never stashed, committed, reset, cleaned, checked out over or reformatted without your explicit approval. You decide: you commit or stash them yourself, or you approve a specific baseline commit of them. A clean tree proceeds to C.

**C. Safe baseline on a separate redesign branch** (only after A and B, and only after your final go-ahead). Create a new branch from the current commit, for example `redesign/ishara-ui` (name confirmed by you). Never work on `main`/`master` or on your current working branch. Create a **local** tag `baseline/pre-redesign` on the starting commit and record its hash. Neither the branch nor the tag is pushed.

**D. During the work.** All edits happen on the redesign branch. Stage by **explicit file path** (never a blind `add -A` or `add .`). Never commit `.env*`, secrets, `node_modules` or `dist`. Commit only after a phase is accepted, with a message of the form `phase N: <summary>`. Never amend, rebase or rewrite history.

**E. Review the actual diffs before accepting each phase.** Run `git status` and `git diff --stat`, then **read the actual diff of every changed file** (not just the summary), and read every new file in full. Check binary and asset changes, confirm line endings (existing files use CRLF) are preserved with no unrelated formatting churn, confirm protected files changed only as allowed (15.2), and confirm the tripwire counts (16.1 G6). A phase is accepted only after this review is signed off.

**F. Actions that need your explicit approval, every time:** `git reset` (any mode), `git checkout` or `git restore` that discards changes, `git clean`, any stash operation, `git rebase`, `git commit --amend`, any force option, `git merge` (including into `main`), `git cherry-pick`, `git push` (any branch, tag or remote), deleting a branch or tag, changing Git config, bypassing hooks (`--no-verify`), any deploy or publish, and deleting or overwriting files outside the current phase's scope. **Allowed without a separate request:** read-only commands (status, diff, log, show, listing branches), and the redesign-branch creation, local baseline tag, staging and phase commits described in C and D.

**G. If a phase fails or must be undone:** never run a hard reset. Stop and report. With your approval the options are to fix forward, to `git revert` the phase's commit (a new commit, history preserved), or to discard specific uncommitted files after listing them for you.

**H. Handoff.** The redesign branch is left unmerged and unpushed. Merging, pushing, opening pull requests and deploying are your decisions.

**I. Git safety log.** For each phase record: branch, commit hash, a summary of `git status`, who reviewed the diffs, and every approval you gave.

### 16.1 Standard gate (applies to every phase, no exceptions)
| Gate | Requirement | Evidence to record |
|---|---|---|
| **G1 Production build** | `npm run build` succeeds with no new errors; any new warning is explained; note the output bundle sizes against baseline | Build log, bundle sizes |
| **G2 Lint** | `npm run lint` shows **no new errors or warnings** versus the Phase 0 baseline (pre-existing issues are listed at baseline so they are not mistaken for regressions) | Lint output diffed against baseline |
| **G3 Route verification** | Required whenever a phase touches `App.jsx`, a shell, navigation, auth pages or redirects; otherwise a **core route smoke** (RTE-01, RTE-02, RTE-05, RTE-07, RTE-13) is still run. Full RTE matrix (15.9) at phases 4, 8 and 11 | RTE results |
| **G4 Responsive visual review** | Every screen touched is reviewed at 320, 375, 768, 1024, 1280, 1440 and 1920 px (portrait; plus landscape for camera and phones), at 200% zoom, with keyboard-only navigation, forced-colors and reduced-motion spot checks, and compared with the Phase 0 baseline screenshots. No horizontal scroll, no clipped text, 44 px targets on touch layouts, contrast per section 3 | Screenshot set, reviewer notes |
| **G5 Regression tests** | The named tests in 16.2 for every feature the phase can affect, run on a local backend; results recorded pass/fail with date, commit and browser. A failure that also fails at baseline is noted, not ignored | Test log |
| **G6 Git diff review** | See below | Diff report and reviewer sign-off |
| **G7 Sign-off and rollback** | The reviewer confirms G1–G6; the phase is tagged; a revert plan exists | Tag, sign-off |

**G6 Git diff review (backend, database, API contracts and authentication untouched)**
0. Apply 16.0.2-E: the actual diff of every changed file has been read, not only the summary, and no existing local change or protected area was disturbed.
1. Diff the phase against the previous phase tag and against the Phase 0 baseline tag.
2. `src/api/*` shows **no changes** (`git diff <baseline>..HEAD --stat -- src/api` is empty). Authentication logic files and logic inside `GoogleIdentityButton.jsx`, `ProtectedRoute`/`AdminRoute`, `LiveCamera.jsx`, `UploadVideo.jsx`, `PSLSignForm.jsx` and `ArticleForm.jsx` show no logic changes (markup and class changes only; the reviewer reads those hunks).
3. **Scope:** only `src/**`, additions under `public/**`, and `index.html` (font preload/meta only) appear. This repository contains the **frontend only**; there is no backend or database code in it, so the diff must also contain no files outside the frontend project. `package.json` and the lockfile change only for approved dependencies (versions pinned, license recorded). Any change to `vite.config.js`, `eslint.config.js`, `.env*` or env variable names is rejected unless separately approved.
4. **Tripwire counts**, compared with the values verified at Phase 0 (16.0.1; the bracketed values are the expected ones from the specification, and the local repository's verified values are authoritative once you have acknowledged any difference):
   - occurrences of `/api/` in `src` [61] — unchanged
   - call sites of `getCurrentUser(` [1, in `App.jsx`] — unchanged
   - `sessionStorage`/`localStorage` uses [6] — unchanged (the landing and 404 add none)
   - `fetch(` outside `src/api` [0] — stays 0; inside `src/api` [5] — unchanged
   - `ishara:` event strings [9] — unchanged
   - `getUserMedia` [3], `new MediaRecorder` [1], `createObjectURL`/`revokeObjectURL` [17] — unchanged
   - `window.confirm` [4] — **must remain exactly 4** (native confirmations are preserved, 7.7)
   - `path=` entries in `App.jsx` [25] — unchanged
5. No deleted or modified asset: `public/ishara-auth-mascots.svg`, `public/ishara_logo.png` and `public/icons/*` are byte-identical (13.5).
6. Existing files use CRLF line endings; keep them to avoid noisy diffs, and flag any whole-file line-ending rewrite.
7. Search the diff for new API strings, new endpoints, `Authorization` handling, `TOKEN_KEY` changes and altered payload shapes; each must be absent.

### 16.2 Regression test catalog
Manual, scripted tests (the project has no automated test runner). Each ID is executed exactly as written, on a local backend, and recorded. Tests marked **device** must also run on real phones (iOS Safari and Android Chrome) and on desktop Chrome, Edge, Firefox and Safari where available. Populated states that the app cannot reach today (for example history records) are tested with a temporary local-only harness that is never committed.

**Authentication and session**
- **AUTH-01** Login as a normal user → `/dashboard`. **AUTH-02** Login as admin → `/admin`.
- **AUTH-03** Wrong password shows the existing failure message. **AUTH-04** Unverified account shows the verification help (403). **AUTH-05** Suspended account shows the suspended message (403).
- **AUTH-06** Signup: every validation message, 409 message, success state shows the destination email.
- **AUTH-07** Forgot password: invalid email message; generic success message.
- **AUTH-08** Verify email: valid, invalid and missing token; exactly one request fires.
- **AUTH-09** Reset password: length, uppercase, number and confirm rules in the existing order; invalid-link state; success state.
- **AUTH-10** Session gate: checking state, backend unreachable with Try again, `ishara:session-expired` returns to login.
- **AUTH-11** Sign out from a user page and from an admin page clears `ishara_access_token` and returns to login.

**Google Sign-In**
- **GSI-01** Existing user signs in with Google and lands on the correct dashboard for their role.
- **GSI-02** Google sign-up from Signup creates the session as today.
- **GSI-03** Google/email conflict (409) shows the explicit-link help.
- **GSI-04** Dismissing the Google prompt or a failed attempt shows the existing error with retry.
- **GSI-05** The Google button renders and works from 320 to 1440 px (the width logic needs a container of at least 200 px); the nonce challenge request still fires once per render as today. **device**
- **GSI-06** With the client ID unavailable, the existing fallback behavior is unchanged.

**Google account linking**
- **GLK-01** User profile: link a Google account successfully. **GLK-02** An already-linked account shows the linked state. **GLK-03** Cancelled or failed link shows the existing error. **GLK-04** Admin profile: the same three outcomes.

**Profile**
- **PRF-01** User profile: edit name; the validation messages are unchanged; picture type and 5 MB limit enforced; preview shows; **Save shows the existing preview-only notice and fires no network request** (verify in the Network tab).
- **PRF-02** Reset-password link goes to `/forgot-password`. **PRF-03** Sign out works (AUTH-11). **PRF-04** Initials and email display match the account.

**Dashboard**
- **DSH-01** Camera, upload, history, profile links go to the right routes; name and initials correct; the placeholder is gone; Recent Translations shows the empty state.

**Camera** (**device** for all)
- **CAM-01** Permission prompt, denied, no camera found, camera in use and constraints errors each show the existing message.
- **CAM-02** Granting permission shows the live preview. **CAM-03** Record, timer counts, Stop works; Stop is disabled when not recording.
- **CAM-04** Review plays back; Record Again returns to ready with a clean state.
- **CAM-05** Submit for Translation shows the existing "not available" message and **fires no network request**.
- **CAM-06** Navigating away, signing out, or closing the tab during recording or preview turns the camera off (indicator light goes out; tracks stopped).
- **CAM-07** Unplugging the camera or revoking permission mid-session is handled as today.
- **CAM-08** Recording works with each browser's supported MediaRecorder format (including iOS Safari).
- **CAM-09** Rotating the phone keeps the stage usable and the recording intact.
- **CAM-10** Ten consecutive Record Again cycles show no leaks (object URLs are revoked; the preview does not freeze).

**Video upload**
- **UPL-01** Valid MP4, WebM and AVI: preview plays; duration shows. **UPL-02** Wrong extension error. **UPL-03** Empty-file error. **UPL-04** File over 250 MB error. **UPL-05** Unplayable-format error.
- **UPL-06** Drag and drop works; keyboard file selection works. **UPL-07** Remove and Choose another reset cleanly (object URL revoked).
- **UPL-08** Submit shows the existing "not available" message and **fires no network request**.

**Translation history**
- **HIS-01** Empty state (no records). **HIS-02** With harness records: search, status filter, date filter, newest-first order, Clear filters, no-results state. **HIS-03** Mobile record cards show the `data-label` values. **HIS-04** The existing footer text is retained.

**Admin operations**
- **ADM-NAV-01** All 13 admin routes reachable from the sidebar or drawer on desktop and phone; active item correct on sub-routes; non-admin cannot enter (RTE-07).
- **ADM-OVW-01** Summary stats, 5 recent logs, loading/error/empty states, quick links.
- **ADM-USR-01** List, search, role and status filters, pagination at 8 per page, Retry on error. **ADM-USR-02** Add user (validation and success). **ADM-USR-03** Edit user; Suspend/Activate. **ADM-USR-04** Resend confirmation. **ADM-USR-05** Delete: the **native browser confirmation** appears with the same message as at baseline; Cancel does nothing; OK deletes; the list re-pages. **ADM-USR-06** Editing your own account updates the header via the existing event.
- **ADM-PSL-01** List, search, the six filters, pagination at 7 per page. **ADM-PSL-02** Create with image and video: record created first, then image upload, then video upload. **ADM-PSL-03** Invalid media rejected with existing messages. **ADM-PSL-04** Edit shows current media and previews of new files. **ADM-PSL-05** Status update. **ADM-PSL-06** Delete shows the same native confirmation (Cancel does nothing, OK deletes).
- **ADM-KB-01** List, search, category/status/sort, pagination. **ADM-KB-02** Create as Draft and as Published. **ADM-KB-03** Toolbar inserts at the cursor position. **ADM-KB-04** Edit. **ADM-KB-05** Publish/Unpublish toggle. **ADM-KB-06** Delete shows the same native confirmation (Cancel does nothing, OK deletes).
- **ADM-LOG-01** List, time and severity filters, severity counts. **ADM-LOG-02** CSV export matches the baseline file name and columns.
- **ADM-PRC-01** List, status counts, Apply and Reset filters. **ADM-PRC-02** Pakistan-time formatting unchanged. **ADM-PRC-03** CSV export matches baseline. **ADM-PRC-04** Demo notice present.
- **ADM-PRO-01** Admin profile name and email update. **ADM-PRO-02** Pending email resend. **ADM-PRO-03** Cancel pending email shows the same native confirmation (Cancel keeps the pending email, OK cancels it). **ADM-PRO-04** Header updates from `ishara:admin-profile-updated`. **ADM-PRO-05** Google linking (GLK-04).

**Native confirmations**
- **CNF-01** All four triggers (delete user, delete PSL sign, delete article, cancel pending email change) show the **native browser prompt** with message text identical to baseline; Cancel leaves data unchanged; OK performs the existing action; the code still contains exactly 4 `window.confirm` calls and no custom confirmation dialog.

**Routes:** RTE-01 to RTE-18 (15.9).

### 16.3 Phases
Each phase row lists its scope and what it adds to the standard gate. **Every phase also runs the standard gate G1–G7** and the **core smoke** (RTE-01, RTE-02, RTE-05, RTE-07, RTE-13, AUTH-01, AUTH-02).

| # | Phase | Scope | Route verification (G3) | Regression tests (G5) | G6 focus |
|---|---|---|---|---|---|
| 0 | **Repository verification, Git safety and baseline** | Execute **16.0.1** (verify the real local repository; stop and report any discrepancy) and **16.0.2 A–C** (inspect Git state, preserve local changes, then, after your go-ahead, create the redesign branch and local baseline tag). Then `npm ci`; record build and lint results; capture screenshots of every route and state; run the **entire** catalog once on the unmodified app and save results, baseline CSV exports and the verified tripwire counts | Full RTE once (baseline) | Full catalog (baseline) | Verification report and Git safety log recorded; discrepancies resolved by you; asset checksums recorded |
| 1 | **Foundation** | `tokens.css`, `base.css`, self-hosted fonts, icon set, global reduced-motion and focus rules; legacy tokens kept | Core smoke | AUTH-01/02, plus a visual pass on every screen for font loading and no layout break | `package.json`/lockfile diff for approved dependencies only; fonts licenses recorded |
| 2 | **Primitives** | Icon, Logo, HandTrace, Button, Field/Input/Select/Textarea, Alert, StatusBadge, Spinner, Skeleton; `PrimaryButton`, `FormField`, `PasswordField`, `AuthFeedback` re-skinned with unchanged props | Core smoke | AUTH-03 to AUTH-09, GSI-05; admin form smoke (ADM-USR-02, ADM-KB-02) because shared fields are reused | Component props unchanged; no logic hunks |
| 3 | **Auth screens** | AuthShell; Login, Signup, Forgot, Verify, Reset; session-gate states | RTE-02, RTE-03, RTE-04, RTE-13 | **AUTH-01 to AUTH-11, GSI-01 to GSI-06**, GLK not affected | `GoogleIdentityButton.jsx` and `src/api` untouched; no change to redirect logic |
| 4 | **Landing and 404** | Change the two route elements only (rows 1 and 26 of 15.8); build both pages; pre-change route verification steps of 15.8 | **Full RTE-01 to RTE-18** | AUTH-01/02, AUTH-10; confirm the landing makes no request and reads no storage (Network tab, code search) | Route table diff = two elements; `getCurrentUser(` call sites still 1; storage use count unchanged; mascot SVG untouched |
| 5 | **User shell, Dashboard, Profile** | UserShell with bottom tab bar; Dashboard (placeholder removed, asset kept); User profile | RTE-05, RTE-06 | DSH-01, **PRF-01 to PRF-04, GLK-01 to GLK-03**, AUTH-10, AUTH-11, nav active states | `cloneElement({ user })` contract intact; `linkGoogleAccount` call unchanged |
| 6a | **History** | Translation history | RTE-06 | **HIS-01 to HIS-04** | `records` prop contract and filter logic unchanged |
| 6b | **Upload video** | Upload screen (dropzone, preview) | RTE-06 | **UPL-01 to UPL-08** (device) | Validation constants, `canPlayType`, object-URL lifecycle unchanged; tripwire counts |
| 6c | **Live camera** (last user screen, own change set) | Camera stage, controls, stepper, tips | RTE-06 | **CAM-01 to CAM-10** on real devices | `getUserMedia` (3), `MediaRecorder` (1) and object-URL (17) counts unchanged; cleanup effects untouched |
| 7 | **Data and navigation components** | Drawer, BottomSheet (filters, account menu), DataTable, Toolbar, Pagination, EmptyState, FilterSheet; pilot on **Users**. **No ConfirmDialog**: native `window.confirm` stays (7.7) | RTE-07, RTE-08 (users routes) | **ADM-USR-01 to ADM-USR-06, CNF-01**; drawer and sheet focus trap, Esc, focus return | `window.confirm` count still **4**; delete handlers unchanged |
| 8 | **Admin shell** | Restyle layout; sidebar, rail, mobile drawer, top bar, breadcrumb, notice banner | **Full RTE-07, RTE-08, RTE-11, RTE-14** | **ADM-NAV-01**, ADM-USR-06, ADM-PRO-04, AUTH-11 (admin), phone drawer test | `AdminLayout` outlet context and event listener unchanged |
| 9a | **Admin overview** | Overview screen | RTE-07 | ADM-OVW-01 | `getAdminDashboardSummary`/logs calls unchanged |
| 9b | **Users add/edit** | Add and edit user | RTE-08 | ADM-USR-02 to ADM-USR-06, CNF-01 | Payloads unchanged |
| 9c | **PSL dictionary** | List and add/edit forms | RTE-08 | **ADM-PSL-01 to ADM-PSL-06, CNF-01** (media upload order verified in the Network tab) | `PSLSignForm` submit logic unchanged; `media_type` values unchanged |
| 9d | **Knowledge base** | List and add/edit forms | RTE-08 | **ADM-KB-01 to ADM-KB-06, CNF-01** | `ArticleForm` submit and toolbar logic unchanged |
| 9e | **System logs** | Logs | RTE-08 | **ADM-LOG-01, ADM-LOG-02** | Export code unchanged |
| 9f | **Processing activity** | Processing | RTE-08 | **ADM-PRC-01 to ADM-PRC-04** | Time formatting helpers unchanged |
| 9g | **Admin profile** | Admin profile/settings | RTE-08 | **ADM-PRO-01 to ADM-PRO-05, GLK-04, CNF-01** | Pending-email calls and event dispatch unchanged |
| 10 | **Translation-result placeholder** | Build `TranslationResult` isolated and **not mounted** anywhere (reviewed through a temporary local harness that is removed before merge) | Core smoke | Confirm it is imported by no page; renders only the "unavailable" state | No API usage; no sample text in shipped code |
| 11 | **Polish and cleanup** | Motion pass, full accessibility audit (automated plus manual), cross-browser and device matrix, remove migrated legacy CSS, **asset report (no deletions)**, README and `.env.example` | **Full RTE-01 to RTE-18** | **Entire catalog** (16.2, including CNF-01) on desktop and real devices | Whole-redesign diff against the Phase 0 tag: `src/api` empty, tripwire counts match, assets byte-identical, only approved files changed |

**Sequencing rationale:** foundation and primitives first so every later screen is consistent; auth next (smallest, most visible, easiest to verify); landing and 404 immediately after so the only two route changes are isolated and verified before more code depends on them; the camera last among user screens because it carries the most behavior; shared data components proven on one admin screen before rolling out to five more; cleanup last, and cleanup never deletes assets.

**If a gate fails:** stop, fix within the same phase, rerun the full gate; do not carry a failure forward. Never undo work with a reset or discard (16.0.2-G). If a fix would require touching a protected area (15.2), stop and raise it for approval instead.

---

## 17. Open items and assumptions

1. **NASCON screenshots were not received.** Colors are your provisional values, extended and contrast-tested. Send the screenshots if you want a refinement pass.
2. **Landing page copy** is proposed placeholder text and needs your approval; it contains no performance claims by design.
3. **Logo mark, hand-trace and hand illustration** must be drawn by a designer as **new, separately named assets**; this document specifies them but provides no artwork. The original `ishara-auth-mascots.svg` stays in the project untouched.
4. **Terms and Privacy** pages do not exist; the signup text mentions them. Provide them or keep the text as is.
5. **Fonts:** confirm Oswald as the display face (or choose Barlow Condensed or Antonio); confirm Source Serif 4 as the serif accent. All are SIL OFL; verify license files when downloading.
6. **Icon set:** Lucide is recommended; verify its current license at install.
7. **Camera preview mirroring:** unchanged (not mirrored). Changing it is a product decision.
8. **Landing for signed-in visitors (resolved in revision 2):** verified that no reusable authenticated-user state exists, so `/` stays static for everyone and there is no "Go to dashboard". A shared auth provider would be a separate, separately approved change (11.1).
9. **PSL thumbnail column** (optional) adds image requests; needs approval.
10. **Hand illustration correctness:** any depicted handshape should be reviewed by PSL experts before release.
11. **Urdu strings** are not translated; only the typography, direction and layout are prepared.
12. **Git baseline (updated in Revision 3):** the uploaded archive contains no `.git` directory, and your **local repository is the source of truth**. Follow 16.0.2: inspect Git state, preserve existing local changes, then branch and tag locally. No Git change of any kind is made until you approve implementation, and nothing is ever reset, discarded, overwritten, merged, pushed or deployed without your explicit approval.
13. **No automated tests exist.** The regression gates use the scripted manual catalog in 16.2. Adding an automated test runner would be a new dependency and is not proposed unless you approve it.
14. **Specification versus repository:** if the local repository differs from this specification in any way, work stops and a discrepancy report is produced for your decision (16.0.1).
15. **Native confirmations preserved:** the four `window.confirm` calls stay as they are. A custom confirmation dialog is deferred and would need its own approval, design review and regression tests (7.7).
