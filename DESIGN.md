---
name: Drops
description: A quiet personal ledger for daily, connected learning.
colors:
  canvas: "oklch(1 0 0)"
  canvas-dark: "oklch(0.12 0 0)"
  surface: "oklch(0.975 0.004 140)"
  surface-dark: "oklch(0.17 0.008 140)"
  ink: "oklch(0.19 0.018 140)"
  ink-dark: "oklch(0.94 0.008 140)"
  muted: "oklch(0.46 0.018 140)"
  muted-dark: "oklch(0.72 0.014 140)"
  rule: "oklch(0.89 0.008 140)"
  rule-dark: "oklch(0.28 0.012 140)"
  moss: "oklch(0.55 0.11 140)"
  moss-strong: "oklch(0.43 0.12 140)"
  signal: "oklch(0.58 0.16 35)"
typography:
  display:
    fontFamily: "Manrope, ui-sans-serif, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 650
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Source Sans 3, ui-sans-serif, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Source Sans 3, ui-sans-serif, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
rounded:
  control: "8px"
  surface: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.moss-strong}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  ledger-entry:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "24px 0"
---

# Design System: Drops

## 1. Overview

**Creative North Star: "The Window-Side Ledger"**

Drops feels like a clean personal desk in gentle morning light: an open notebook, accumulated dates, and one moss-green pencil. It is quiet without becoming precious and structured without resembling a dashboard. The composition is mostly flat, typographic, and linear; whitespace and fine rules organize the record.

The system uses a restrained palette and familiar product controls so attention stays on the lesson. Display typography gives dates and lesson titles a distinct editorial cadence, while a humanist body face makes long reading comfortable. Dark mode preserves the same low-noise hierarchy rather than turning into a neon developer theme.

**Key Characteristics:**

- Reading-first hierarchy with a 68ch prose measure
- Ledger-like dates, rules, and completion marks
- Restrained moss used for actions and current state only
- Flat surfaces with minimal, structural elevation
- Familiar controls and unhurried spacing

## 2. Colors

Neutral daylight and near-black night surfaces carry a restrained botanical accent inspired by a single green pencil on a clean page.

### Primary

- **Ledger Moss** (`oklch(0.55 0.11 140)`): current navigation, meaningful links, and selected states.
- **Deep Moss** (`oklch(0.43 0.12 140)`): filled primary actions with white text.

### Secondary

- **Margin Signal** (`oklch(0.58 0.16 35)`): rare warnings or attention states, never decoration.

### Neutral

- **Day Canvas** (`oklch(1 0 0)`): the light-mode reading surface.
- **Night Canvas** (`oklch(0.12 0 0)`): the dark-mode reading surface.
- **Soft Surface** (`oklch(0.975 0.004 140)`): secondary regions and quiet form groups.
- **Botanical Ink** (`oklch(0.19 0.018 140)`): primary light-mode text.
- **Graphite Rule** (`oklch(0.89 0.008 140)`): dividers and control boundaries.

**The One Pencil Rule.** Moss occupies less than ten percent of a screen. It indicates action, selection, or progress; it does not decorate empty space.

## 3. Typography

**Display Font:** Manrope (with `ui-sans-serif` fallback)  
**Body Font:** Source Sans 3 (with `ui-sans-serif` fallback)

**Character:** Manrope provides composed, slightly geometric titles while Source Sans 3 remains open and human at reading sizes. They contrast in purpose without making the application feel like a magazine theme.

### Hierarchy

- **Display** (650, 44px, 1.05): page title or the current lesson title only.
- **Headline** (650, 28px, 1.15): lesson titles in history and major section headings.
- **Title** (650, 20px, 1.25): grouped settings and reflection headings.
- **Body** (400, 17px, 1.7): lesson prose with a maximum measure of 68ch.
- **Label** (600, 14px, 0.01em): dates, metadata, controls, and navigation; sentence case by default.

**The Long Read Rule.** Lesson prose always uses Source Sans 3, never display type, and never exceeds 68ch.

## 4. Elevation

The system is flat by default. Depth comes from tonal surfaces and one-pixel rules; a small shadow appears only on temporary overlays such as menus or dialogs. Lesson entries never float as generic cards.

### Shadow Vocabulary

- **Overlay** (`0 4px 8px oklch(0.12 0 0 / 0.12)`): menus and dialogs only.

**The Bound Ledger Rule.** Permanent content is separated by space and rules, not floating card shadows.

## 5. Components

### Buttons

- **Shape:** restrained corners (`8px`) with a minimum 40px visual height and 44px touch area.
- **Primary:** Deep Moss fill, white text, and 10px 16px padding.
- **Hover / Focus:** darken by one tonal step; focus uses a 2px moss ring with 2px offset.
- **Secondary / Ghost:** transparent or neutral surface, Botanical Ink text, and no decorative shadow.

### Chips

- **Style:** used only for real filtering or status, with a quiet surface and concise sentence-case text.
- **State:** selected chips use a pale moss tint plus an icon or check, never color alone.

### Cards / Containers

- **Corner Style:** `12px` only when a bounded form or empty state needs containment.
- **Background:** Day Canvas or Soft Surface.
- **Shadow Strategy:** none for persistent content.
- **Border:** one-pixel Graphite Rule when grouping cannot be expressed through spacing.
- **Internal Padding:** 16px on mobile and 24px on larger screens.

### Inputs / Fields

- **Style:** Day Canvas, one-pixel Graphite Rule, `8px` corners, and 10px 12px padding.
- **Focus:** 2px Ledger Moss ring with 2px offset; placeholder contrast remains readable.
- **Error / Disabled:** text and icon accompany color; disabled controls retain legible labels.

### Navigation

Navigation uses Source Sans 3 at label weight. Desktop navigation is a compact top rail; mobile navigation becomes a simple bottom or overflow pattern without hiding the daily lesson. The active destination uses Moss plus a non-color indicator.

### Ledger Entry

A date marker, lesson title, rationale, reading time, source list, and completion control form one uninterrupted vertical entry separated from its neighbors by a full-width rule. It is the signature component and must never become a KPI card.

## 6. Do's and Don'ts

### Do:

- **Do** prioritize the current lesson and keep reading text within 68ch.
- **Do** use `oklch(0.43 0.12 140)` with white text for primary actions.
- **Do** preserve visible keyboard focus and pair status color with text or iconography.
- **Do** let dates, whitespace, and one-pixel rules create the ledger rhythm.
- **Do** honor system light/dark and reduced-motion preferences.

### Don't:

- **Don't** resemble a SaaS analytics dashboard, Notion workspace, Linear clone, Duolingo streak machine, chatbot transcript, or generic productivity tracker.
- **Don't** use gamification, achievement language, dense metric cards, decorative AI gradients, glassmorphism, or visual noise that competes with reading.
- **Don't** place lesson entries inside floating cards or pair decorative borders with broad shadows.
- **Don't** use gradient text, colored side-stripe borders, oversized radii, or tiny tracked uppercase eyebrows.
- **Don't** use moss as ambient decoration; it must communicate action, selection, or progress.
