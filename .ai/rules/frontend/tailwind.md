# TailwindCSS Rules — LabCircuitos

1. Use only Tailwind utility classes in JSX
2. Extract repeated patterns into `@layer components` in `index.css` when reused (`.btn-primary`, `.metric-card`, etc.)
3. Use the project tokens: `surface`, `primary`, `gold`, `ink` — not arbitrary grays
4. Responsive: mobile-first with sm:, md:, lg:, xl: prefixes
5. Tema claro fijo — no `dark:` prefix; see `docs/TEMA_UI.md`
6. Prefer semantic classes from `index.css` over long inline class strings
