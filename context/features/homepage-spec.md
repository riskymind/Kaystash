# Homepage

## Overview

Implement the marketing homepage at `app/page.tsx` based on the prototype in `prototypes/homepage/`. The page is publicly accessible (no auth required) and replaces the current root route.

## Sections

1. **Navbar** — fixed top, logo + nav links + auth CTAs + mobile menu
2. **Hero** — headline, sub-copy, CTAs, chaos-animation visual vs. dashboard mockup
3. **Features** — 6-card grid with Lucide icons
4. **AI Section** — Pro checklist + code editor mockup
5. **Pricing** — monthly/yearly toggle, Free vs. Pro cards
6. **CTA** — final conversion strip
7. **Footer** — brand blurb + link columns

---

## File Structure

```
src/
  app/
    page.tsx                          ← server component, composes all sections
  components/
    marketing/
      Navbar.tsx                      ← server shell; <NavbarClient> for scroll + mobile
      NavbarClient.tsx                ← 'use client' — scroll opacity, mobile drawer
      HeroSection.tsx                 ← server shell
      ChaosAnimation.tsx              ← 'use client' — rAF bounce + mouse repulsion
      FeaturesSection.tsx             ← server component
      AISection.tsx                   ← server component
      PricingSection.tsx              ← server shell
      PricingToggle.tsx               ← 'use client' — monthly/yearly state
      CTASection.tsx                  ← server component
      Footer.tsx                      ← server component
```

---

## Links & Routes

| Element | Destination |
|---|---|
| Logo | `/` |
| Sign In button | `/sign-in` |
| Get Started / Get Started Free | `/register` |
| Features nav link | `#features` |
| Pricing nav link | `#pricing` |
| "See Features" hero ghost button | `#features` |
| "View Demo" CTA ghost button | `/sign-in` |
| Footer: Features | `#features` |
| Footer: Pricing | `#pricing` |
| Footer: Changelog / About / Blog / Contact / Privacy / Terms | `#` (placeholder) |

---

## Component Requirements

### `app/page.tsx`
- Server component, no auth check
- Imports and renders all marketing section components in order
- Adds `id` anchors on sections so nav links scroll correctly: `id="features"`, `id="pricing"`

### `NavbarClient.tsx` (`'use client'`)
- Fixed position, full-width, `z-50`
- On scroll > 24px: add `backdrop-blur` + semi-transparent background (matches prototype `scrolled` state)
- Mobile hamburger button (hidden on `lg:`) toggles a dropdown mobile menu with same links
- Mobile menu closes when any link inside it is clicked
- Use shadcn `Button` for "Sign In" (ghost variant) and "Get Started" (default variant)

### `ChaosAnimation.tsx` (`'use client'`)
- 8 icon badges (Notion "N", GitHub SVG, Slack "#", VS Code "</\>", Browser globe SVG, Terminal ">\_", File SVG, Bookmark "★") bounce inside a fixed-height container
- `requestAnimationFrame` loop: wall bounce, velocity damping, min-speed kick, rotation
- Mouse repulsion: on `mousemove` over container, particles repel from cursor
- Pause animation when `document.hidden` (visibilitychange)
- Use inline `style` transforms (`translate`/`rotate`) — no CSS animation classes
- Container: `relative overflow-hidden` with fixed height (e.g. `h-52`)

### `PricingToggle.tsx` (`'use client'`)
- `useState` for `yearly: boolean` (default `false`)
- Toggle button with animated thumb (CSS transition)
- Monthly: Pro = `$8 / month`, desc = `Billed monthly`
- Yearly: Pro = `$6 / month`, desc = `Billed $72 / year`
- Active label highlighted; inactive label muted
- Free card price never changes
- "Get Started Free" (Free card) → `/register`
- "Get Started" (Pro card) → `/register`

### `FeaturesSection.tsx`
- 6 cards in a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- Use Lucide icons: `Code2` (Snippets), `Sparkles` (AI Prompts), `Search` (Instant Search), `Terminal` (Commands), `File` (Files & Docs), `LayoutGrid` (Collections)
- Each card: colored icon container, heading, description — matches prototype colors
- Files & Docs card note: "Available on Pro"

### `AISection.tsx`
- Two-column layout (`lg:grid-cols-2`), stacks on mobile
- Left: "Pro Feature" badge (shadcn `Badge`), heading, 4-item checklist with checkmark icons
- Right: code editor mockup — macOS chrome (3 dots + "typescript" label), syntax-highlighted `useAuth` snippet, AI tags row below. All static markup, no Monaco.

### `CTASection.tsx`
- Centered box with heading, sub-copy, two buttons: "Start for Free" → `/register`, "View Demo" → `/sign-in`

### `Footer.tsx`
- 4-column grid (brand + 3 link columns) on desktop, stacked on mobile
- Dynamic year via `new Date().getFullYear()` (server component, renders at build/request time)
- Logo reuses same markup as navbar

---

## Styling Notes

- Dark background: use `bg-[#080810]` or a close Tailwind equivalent (`bg-zinc-950`) — match prototype
- Gradient text: use `bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent`
- Scroll fade-in: add a global CSS class `.fade-in` with `opacity-0 translate-y-4 transition-all duration-500` that gains `.visible` (`opacity-100 translate-y-0`) via `IntersectionObserver` — implement in a thin `'use client'` hook or a single `ScrollReveal.tsx` wrapper component used on each section
- No `tailwind.config.ts` — any custom tokens go in `globals.css` via `@theme`
- Use shadcn `Button` for all CTAs; use shadcn `Badge` for "Pro Feature" and "Most Popular" labels
- Keep all section `id` attributes on the outermost `<section>` tag so anchor links work
