# LLM Arena — Coding Standards & Guidelines

This document serves as the single source of truth for architectural conventions, code formatting, style rules, and development guidelines across the LLM Arena codebase.

---

## 1. Programming Style & Conventions

- **Functional Programming First**:
  - Prefer pure, deterministic functions without shared mutable state.
  - Side effects (I/O, database access, model streaming) must be pushed to the edges (Route Handlers, Server Actions, Provider modules).
  - Use `const` and `readonly` by default. Avoid mutating arrays or objects directly; use `map`, `filter`, `reduce`, `toSorted`, or structured cloning instead of `for`/`while` loops that mutate state.

- **Strict TypeScript (No `any`)**:
  - `noImplicitAny`, `strict`, and `skipLibCheck` enabled.
  - Never use `any` or `as any`. Use generic parameters, discriminated unions, `unknown` with narrowing, or explicit Zod schemas.

- **Fail-Fast Environment Variables**:
  - All server-side modules MUST import validated environment variables from [`app/env.ts`](file:///Users/amitgupta/Desktop/LLMArena/llmarena/app/env.ts).
  - Missing environment variables must throw an immediate error during startup/import time to prevent silent failures deep in execution.

---

## 2. Directory & Component Structure

- **Feature-Based Grouping**:
  - Organize code by feature directory rather than global layer folders (e.g. `app/arena/...`, `app/leaderboard/...`, `app/models/...`).
  - Co-locate related helpers, components, hooks, and types inside their respective feature folder.

- **Component Best Practices**:
  - Keep components modular, focused, and single-purpose.
  - Distinguish between Server Components (default) and Client Components (`"use client"`). Keep `"use client"` directives at the leaf component level whenever possible.

---

## 3. Styling & Accessibility

- **Design System & Tailwind**:
  - The design system uses warm brown/coffee background tones with a single bright rust accent color (`scope.md` design spec).
  - Reusable visual patterns, color tokens, and repeated class clusters belong in [`app/globals.css`](file:///Users/amitgupta/Desktop/LLMArena/llmarena/app/globals.css) or shared UI components. Never copy-paste the exact same sequence of 4+ Tailwind utility classes across multiple files.

- **Accessibility Baseline**:
  - Ensure high contrast ratios across both light and dark themes.
  - Visible focus rings (`focus-visible:outline-*`) on all interactive elements.
  - Full keyboard operability (Tab, Shift+Tab, Enter, Space, Esc).
  - Standard ARIA attributes (`aria-expanded`, `aria-controls`, `aria-label`) for dynamic UI controls.

---

## 4. Error Handling & User Experience

- **User-Facing Error Fallbacks**:
  - Never expose raw stack traces, DB exception objects, or provider error messages to the user.
  - Present plain, clear, human-readable sentences with an actionable retry button/flow.
  - Log detailed server-side stack traces using server logging or PostHog capture.

- **Cost Display**:
  - Every model in LLM Arena is currently free-tier. Cost will always read `$0.0000`. Show it explicitly as `$0.0000` rather than omitting or hiding it.

---

## 5. Tooling & Enforcement

- **Linting & Formatting**:
  - ESLint (`npm run lint`) enforces code quality rules and Next.js / React best practices.
  - Prettier (`npm run format`) enforces consistent formatting with `prettier-plugin-tailwindcss` for class sorting.
- **Git Hooks**:
  - Husky pre-commit hooks execute `npm run typecheck` and `npx lint-staged` on staged files before every commit.
- **No Automated Test Runners**:
  - Testing is performed manually via browser validation, dev server checks, and lightweight tools (`curl`). Do not install Jest, Vitest, Cypress, or Playwright.
