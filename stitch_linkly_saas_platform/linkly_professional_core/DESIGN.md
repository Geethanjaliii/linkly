---
name: Linkly Professional Core
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#005b7c'
  on-tertiary: '#ffffff'
  tertiary-container: '#00759f'
  on-tertiary-container: '#e1f2ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for a premium, developer-first SaaS experience that prioritizes clarity, performance, and trust. The brand personality is anchored in professional reliability and cloud-native sophistication, mirroring the precision of high-end infrastructure tools.

The visual style is a hybrid of **Modern Corporate** and **Soft Minimalism**. It utilizes expansive white space to reduce cognitive load while employing "Vercel-inspired" high-fidelity details—such as hairline borders and subtle translucency—to signal quality. The emotional response should be one of absolute control and architectural stability, ensuring users feel their data and infrastructure are in expert hands.

## Colors

The palette is centered around a high-calibration Primary Blue (#2563EB), symbolizing security and the traditional "link" color, updated for modern displays. 

- **Primary:** Used for main actions, active states, and brand-critical identifiers.
- **Secondary (Slate):** A deep, professional navy used for headings and high-contrast text to ensure legibility.
- **Surface & Background:** Pure white (#FFFFFF) is the primary canvas, while Slate-50 (#F8FAFC) is used for structural grounding of cards and sidebars.
- **Accents:** Tertiary sky blue is reserved for data visualization and success indicators.
- **Status:** Standard semantic colors (Red-600 for error, Amber-500 for warning) should follow the same saturation levels as the primary blue to maintain visual cohesion.

## Typography

This design system employs a three-tier typeface strategy to balance marketing appeal with functional utility.

1.  **Geist (Headings):** Used for all headlines to provide a sharp, technical, and "developer-ready" aesthetic. It excels at tight letter spacing in display sizes.
2.  **Inter (UI & Body):** The workhorse for the interface. It ensures maximum readability in dense dashboards and settings pages.
3.  **JetBrains Mono (Data & Labels):** Applied to IDs, short links, API keys, and code snippets to reinforce the cloud-native and technical nature of the product.

Hierarchy is established through weight and color (Slate-900 for headlines vs Slate-600 for body) rather than excessive size variation.

## Layout & Spacing

The layout philosophy follows a **Strict Fluid Grid** model based on a 4px baseline unit. 

- **Desktop:** A 12-column grid with 24px gutters. Main content areas are centered with a max-width of 1280px to prevent line lengths from becoming unreadable.
- **Dashboards:** Use a sidebar-driven layout. The sidebar is fixed at 280px, while the content area fluidly expands using 40px margins.
- **Spacing Rhythm:** Generous vertical rhythm is prioritized. Components are separated by "Stack" variables to ensure a breathable, minimalist aesthetic. Padding within cards should never fall below 24px to maintain the premium feel.

## Elevation & Depth

Visual hierarchy in this design system is achieved through **Tonal Layering** and **Glassmorphism Accents**.

- **The Base:** The primary background is flat. Depth is created by placing white cards with 1px Slate-200 borders on top of the Slate-50 background.
- **Shadows:** Use extremely diffused "Ambient" shadows. Avoid harsh blacks; instead, use a 10% opacity version of the Primary Blue for shadows on active elements to create a subtle glow.
- **Glassmorphism:** Reserved for persistent navigation elements (Top bars, floating action menus). Use a `backdrop-filter: blur(12px)` with a 70% white tint and a 1px white inner-border to simulate frosted glass.
- **Depth Levels:**
    - Level 0: Background (Slate-50)
    - Level 1: Standard Cards (White, 1px border)
    - Level 2: Popovers/Modals (White, Soft Shadow, 1px border)

## Shapes

The shape language is contemporary and approachable, utilizing a **Rounded** (Level 2) corner strategy.

- **Standard Elements (Buttons, Inputs):** 8px (0.5rem) radius.
- **Large Elements (Cards, Modals):** 16px (1rem) radius.
- **Extra Large (Hero Sections, Containers):** 24px (1.5rem) radius.

All borders are 1px wide. Avoid "Heavy" borders; the goal is for lines to be crisp but nearly invisible, functioning as dividers rather than frames.

## Components

### Buttons
- **Primary:** Solid Primary Blue background with white text. High-contrast, 8px radius.
- **Secondary:** White background with a 1px Slate-200 border and Slate-900 text.
- **Ghost:** No background or border, Slate-600 text, turns to Slate-100 on hover.

### Cards & Analytics Widgets
- Cards must use a 1px Slate-200 border. 
- Analytics widgets should feature a subtle gradient background (White to Slate-50) and utilize Primary Blue for sparklines.
- Header sections within cards should be separated by a hairline divider.

### Input Fields
- Inputs use a 1px Slate-200 border that transitions to a 2px Primary Blue ring on focus.
- Placeholder text uses Slate-400 in Inter 14px.
- Use JetBrains Mono for inputs specifically for short-link slugs or API keys.

### Chips & Badges
- Used for status (Active, Pending, Expired).
- Use a "Soft" style: a very light tint of the semantic color for the background (e.g., Blue-50) and a darker version for the text (Blue-700). Radius should be 4px or fully pill-shaped for status.

### Lists
- Interactive lists (like a link history) should have a hover state of Slate-50.
- Each list item is separated by a 1px border-bottom, except for the last item.