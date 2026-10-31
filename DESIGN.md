---
name: Campus Pulse
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
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an empathetic, organized, and cognitive-load-reducing digital ecosystem for higher education students navigating dense deadlines, course schedules, and campus life.

### Design Aesthetic & Personality
The aesthetic blends contemporary soft-minimalism with purposeful, tactile clarity:
- **Calm & Grounded:** Replacing academic panic with serene organization, clear structure, and non-punitive signaling.
- **Empathetic & Approachable:** Softly rounded geometries, generous breathing room, and humanized micro-copy remove clinical intimidation.
- **Focused & Motivating:** Urgent tasks highlight gracefully without alarming alarmist visuals; success states deliver subtle, rewarding delight.

### Visual Principles
- **Clarity Over Clutter:** Interfaces prioritize whitespace and structured grouping over dense information packing.
- **Supportive Urgency:** Deadlines leverage warm amber tints rather than aggressive crimson tones, framing priority as timely focus rather than failure.
- **Intentional Delight:** Fluid micro-interactions, subtle scale adjustments on interaction, and clean pill indicators encourage forward momentum.

## Colors

The palette balances academic structure with emotional grounding, strictly calibrated for accessibility (WCAG 2.1 AA/AAA compliance across both modes).

### Surface & Neutral Tiers
- **Light Mode Foundation:**
  - Base canvas: `#F8FAFC` (Slate 50)
  - Surface cards & panels: `#FFFFFF`
  - Subtle borders / dividers: `#E2E8F0` (Slate 200)
  - Primary text: `#0F172A` (Slate 900)
  - Muted secondary text: `#64748B` (Slate 500)
- **Dark Mode Foundation:**
  - Base canvas: `#0F172A` (Slate 900)
  - Elevated surfaces (Cards/Sidebars): `#1E293B` (Slate 800)
  - Overlaid dialogs & popovers: `#334155` (Slate 700)
  - Subtle borders: `#334155` (Slate 700)
  - Primary text: `#F8FAFC` (Slate 50)
  - Muted secondary text: `#94A3B8` (Slate 400)

### Role Assignments
- **Primary (`#4F46E5` - Refined Indigo):** Anchors core actions, navigation states, active filters, and primary progress arcs. Communicates quiet confidence and sharp focus.
- **Secondary (`#F59E0B` - Warm Amber):** Manages attention, pending assignments, upcoming exams, and soft-urgency alerts without triggering anxiety.
- **Tertiary (`#10B981` - Emerald):** Rewards completion, verified attendance, submitted course assignments, and positive balance states.
- **Urgent Accent (`#EF4444` - Crimson Rose):** Strictly reserved for overdue coursework and critical system notifications. Used sparingly to avoid stress fatigue.

## Typography

Typography establishes an effortless hierarchy between high-level scheduling and detailed course syllabi.

- **Headlines & Display (Plus Jakarta Sans):** Selected for its friendly, rounded geometry and open counters. It provides an encouraging, contemporary campus atmosphere that reads comfortably in titles, course headers, and modal prompts.
- **Body Text (Inter):** Highly legible, neutral, and structurally disciplined for extensive lecture notes, assignment descriptions, and calendar details.
- **Labels & Micro-data (Plus Jakarta Sans):** Semi-bold and medium treatments ensure immediate recognizability in badges, urgency tags, and navigational tabs.
- **Typographic Scale Adaptation:** Headlines smoothly transition down on mobile devices (`< 768px`) to prevent awkward line breaks on smaller screens while retaining prominent visual anchors.

## Layout & Spacing

This design system uses a fluid-responsive column grid system grounded in an 8pt rhythmic base scale.

### Grid System
- **Desktop (1024px+):** 12-column fluid grid, `2rem` (32px) margins, `1.5rem` (24px) gutters. Allows persistent sidebar navigation (fixed 260px) alongside 2 to 3 module columns.
- **Tablet (768px - 1023px):** 8-column grid, `1.5rem` (24px) margins, `1rem` (16px) gutters. Sidebars fold into a collapsed icon rail or bottom sheet.
- **Mobile (< 768px):** 4-column fluid grid, `1rem` (16px) margins, `1rem` (16px) gutters. Single-column stacked layout with top sticky date anchors and bottom primary navigation bar.

### Spacing Philosophy
- Consistent use of internal component padding ensures breathing room: cards default to `space-lg` padding on desktop and `space-md` on mobile.
- Section groupings use `space-xl` separation to clearly partition disparate campus concerns (e.g., separating "Due Today" from "Study Groups").

## Elevation & Depth

Visual hierarchy uses ambient diffusion, soft boundaries, and surface contrast rather than harsh, stacked shadows.

### Ambient Shadow Strategy
- **Base Level (Canvas):** Flat with no elevation.
- **Layer 1 (Cards, Course Tiles, Task Blocks):**
  - Light mode: `0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03)` with a subtle `1px solid #E2E8F0` stroke.
  - Dark mode: Surface distinction via `#1E293B` canvas fill, accented by a subtle `1px solid rgba(255, 255, 255, 0.06)` boundary.
- **Layer 2 (Dropdowns, Floating Filters, Hovered Cards):**
  - `0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)`. Elevates interacted items without stark borders.
- **Layer 3 (Modals, Overlays, Command Palette):**
  - `0 20px 35px -8px rgba(15, 23, 42, 0.16), 0 1px 3px rgba(15, 23, 42, 0.08)`. Accompanied by a `backdrop-blur(8px)` darkened scrim (`rgba(15, 23, 42, 0.45)`).

### Subtle Urgency Border Treatment
Tasks and timelines with impending deadlines use a left-edge indicator (`3px` accent stroke) or a soft ambient border glow (`rgba(245, 158, 11, 0.35)`) rather than loud full-card warning colors.

## Shapes

The shape philosophy prioritizes softness and approachable structure:
- **Base Components (Inputs, Buttons, Cards):** Standardized on `0.5rem` (8px) for buttons and inputs, and `1rem` (16px) for cards and main modules.
- **Pills & Status Indicators:** Fixed with complete rounded edges (`rounded-full` / `9999px`) for category tags, countdown chips, and quick filters.
- **Modal Containers & Large Panels:** Scaled to `1.5rem` (24px) corner radii (`rounded-xl`) to preserve organic friendliness across deep surfaces.

## Components

### Buttons
- **Primary:** Background `#4F46E5`, text `#FFFFFF`, radius `8px`, `px-4 py-2.5`. Hover state gently darkens to `#4338CA` with a subtle scale transform (`scale-102`). Focus rings use `#4F46E5` at 30% opacity with `2px` offset.
- **Secondary:** Surface fill with `1px solid #E2E8F0` (light) or `1px solid #334155` (dark). Text is `#0F172A` (light) / `#F8FAFC` (dark).
- **Urgent Action / Danger:** Soft tinted amber/rose background (`#FEF3C7` / `#FEE2E2`) with high-contrast text (`#B45309` / `#B91C1C`) to communicate priority without high-stress visual dominance.

### Chips & Badges
- **Status Pills:** Fully rounded (`rounded-full`), `px-3 py-1`, typography `label-sm` or `label-md`.
- **Urgent / Approaching:** Warm Amber tint (`#FEF3C7` bg with `#B45309` text in light mode; `rgba(245, 158, 11, 0.15)` bg with `#FBBF24` text in dark mode).
- **Completed / On Track:** Emerald tint (`#D1FAE5` bg with `#047857` text in light mode; `rgba(16, 185, 129, 0.15)` bg with `#34D399` text in dark mode).
- **Category Filter Chips:** Neutral outlines that shift to solid `#4F46E5` text and tinted background upon active selection.

### Cards & Assignment Tiles
- **Base Card:** Clean container with `16px` border-radius, `space-lg` padding, subtle boundary stroke.
- **Urgent Assignment Modifier:** Incorporates an unobtrusive `3px` solid `#F59E0B` left rail border and an accompanying pill badge ("Due in 2h") to clearly guide focus.
- **Interactive Hover:** Translates upward `2px` with expanded ambient shadow (`Layer 2`).

### Lists
- Dividers are minimal `1px solid` muted borders.
- Task items feature interactive leading checkboxes with generous tap targets (`min-h-12`). Completed items transition smoothly with strike-through text and subtle opacity reduction (`opacity-60`).

### Checkboxes & Radios
- Checkboxes use `6px` rounded corners; radios are circular.
- Unchecked: `1.5px solid #CBD5E1`.
- Checked: Fill `#4F46E5` featuring a crisp white geometric icon checkmark. Micro-animation creates a brief 10% pop scale effect on check.

### Input Fields
- `8px` corner radius, `px-3.5 py-2.5`, font `body-md`.
- Default: `#FFFFFF` (light) / `#1E293B` (dark), border `1px solid #CBD5E1` / `#334155`.
- Focus state: Border transitions to `#4F46E5` with an outer soft glow ring `box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15)`.

### Student-Specific Components
- **Daily Focus Dial / Progress Bar:** Thin `8px` rounded meter showing assignment completion percentage with smooth emerald gradient transitions.
- **Course Schedule Timeline:** Fluid vertical rail with rounded node connectors marking current, upcoming, and completed lectures.
- **Quick-Log Action FAB (Mobile):** Rounded pill button floating bottom-center, combining an intuitive icon and "Add Task" label.