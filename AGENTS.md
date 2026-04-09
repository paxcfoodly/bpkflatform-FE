<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-08 | Updated: 2026-04-08 -->

# bpkflatform-FE

## Purpose
Next.js 14 App Router frontend for BPK Hub — a food manufacturing community platform and packaging equipment marketplace. Features include user authentication, product browsing/admin, community forums, AI product matching, inquiries, and mypage services. Deployed on Vercel with TypeScript, Tailwind CSS, shadcn/ui, Zustand, and TanStack Query.

## Key Files
| File | Description |
|------|-------------|
| package.json | Dependencies: Next.js 14, React 18, TanStack Query, Zustand, shadcn/ui, Tailwind, Tiptap editor |
| tsconfig.json | TypeScript strict mode, path aliases (@/*), incremental compilation |
| next.config.js | Image remotePatterns (Supabase, R2, picsum), security headers, CSP, GA4 setup |
| middleware.ts | Server-side route protection: /admin/*, /my/*, /ai/matching require bpk_authenticated cookie |
| instrumentation.ts | Analytics and monitoring initialization |
| vercel.json | Deployment configuration for Vercel |
| app/layout.tsx | Root layout: Pretendard font, metadata, GA4 script, LayoutSelector, JsonLd schema |
| app/providers.tsx | Client providers: QueryClientProvider (TanStack Query), ToastProvider, AuthHydration |
| app/page.tsx | Home page |
| app/robots.ts | SEO: robots.txt generation |
| app/sitemap.ts | SEO: sitemap.xml generation |
| app/error.tsx | Error boundary for app-wide error handling |
| app/not-found.tsx | 404 page |
| lib/api-client.ts | Base HTTP client: fetch wrapper with Bearer token injection, error handling |
| lib/utils.ts | Utility functions (cn, classname merge) |
| stores/authStore.ts | Zustand auth store: token persistence, hydration, silent refresh, logout |
| stores/app-store.ts | Global app state store |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| app/ | Next.js App Router pages: root layout, auth, admin, community, products, etc. |
| components/ | Reusable React components: UI, layout, form, domain-specific (auth, products, community) |
| hooks/ | Custom React hooks: TanStack Query hooks (use-admin, use-my, use-community) and utility hooks |
| lib/ | Utilities and API client code: api-client, utils, api/* (domain-specific API functions) |
| lib/api/ | Feature-scoped API client functions: auth, admin, community, products, announcements, etc. |
| stores/ | Zustand state management: authStore (token, user, session), app-store (global state) |
| types/ | TypeScript types: globals.d.ts, index.ts (User, ApiResponse, PaginatedResponse) |
| public/ | Static assets: fonts (Pretendard), images, favicon |

## For AI Agents

### Working In This Directory
- Next.js 14 App Router: routes live in `app/[route]/page.tsx` and `app/[route]/layout.tsx`
- Dynamic routes use `[param]` convention: `app/community/[boardType]/page.tsx`
- Server vs Client: use `'use client'` directive for interactive components; server components are default
- Environment variables: `NEXT_PUBLIC_*` exposed to browser (API_URL, GA_ID, SITE_URL)
- Authentication: tokens stored in localStorage, hydrated via authStore on mount; middleware guards /admin, /my, /ai/matching
- State management: Zustand for auth, TanStack Query v5 for server state (API cache)
- Styling: Tailwind CSS v4 with shadcn/ui components; use `cn()` from lib/utils to merge classnames
- Forms: React Hook Form + Zod validation (in components/form/*)
- Rich text: Tiptap editor (in components/form/*)
- Image upload: Custom ImageUpload component with HEIC support
- API layer: lib/api/* functions wrap apiClient with typed requests/responses

### Testing Requirements
- None currently automated; manual QA via `npm run dev` on localhost:3000
- E2E: ensure auth flow works (login → token → hydration → protected routes)
- Components: check responsive design (mobile via MobileMenu, desktop via GNB)
- API integration: verify endpoints match BE (check lib/api/* imports and payloads)
- Build: `npm run build` must complete without errors; lint via `next lint`

### Common Patterns
- **Auth flow**: User logs in → authStore.loginSuccess() → token persisted → hydrate on app mount
- **Protected pages**: Wrap in middleware or client-side useAuthStore check; redirect to /auth/login if no user
- **API calls**: import from lib/api/*, use TanStack Query hooks (useQuery, useMutation) from hooks/*
- **Form submission**: React Hook Form + Zod, submit via apiClient or lib/api/* function, handle ApiResponse
- **Component props**: TypeScript interfaces, destructuring, use cn() for conditional class merging
- **Nested routes**: use layout.tsx in each directory for shared UI (e.g., app/admin/layout.tsx for AdminLayout)

## Dependencies

### Internal
- **stores/authStore**: imported by app/providers.tsx, components/layout/GNB.tsx, all protected pages
- **lib/api/***: imported by hooks/*, pages, and components; all API calls go through these
- **hooks/***: imported by pages and components; wrap TanStack Query for caching
- **components/layout/LayoutSelector**: routes between LayoutSelector, Layout, AdminLayout based on pathname
- **components/ui/***: imported by all feature components (form, products, community, etc.)

### External
- next@14.2.35: App Router, Image, Script, metadata API
- react@18.3.1, react-dom@18.3.1: core rendering
- @tanstack/react-query@5.96.2: server state, caching, mutations
- zustand@5.0.12: client state (auth, app)
- tailwindcss@4.2.2, @tailwindcss/postcss: styling
- react-hook-form@7.72.1, zod@4.3.6: form validation
- @tiptap/*@3.22.1: rich text editing
- lucide-react@1.7.0: icons
- class-variance-authority@0.7.1: component variants
- recharts@3.8.1: charts (dashboards)
- dompurify@3.3.3: HTML sanitization
- sharp@0.34.5: image processing
- heic-to@1.4.2: HEIC → JPEG conversion

<!-- MANUAL: -->
