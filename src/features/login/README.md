# PromoRush login screen

Preview at `/login` using `npm run dev`.

Source: Stitch project `14051200829858170119`, screen `49dcdf43d73e4d0a9c877d582cbbe579`.
The original HTML and screenshot are preserved in `design/`; the downloaded hero image is in `assets/`.
The hero image is bundled locally and rendered with `next/image`; Material Symbols is shared from `src/shared/presentation/assets/` via the shared `Icon` atom. Buttons, badges, phone fields, and voucher previews reuse shared presentation components.

## Presentation structure

`src/app/login/page.tsx` is the routing shell. `presentation/pages/login-page.tsx` composes the feature components under `presentation/components/`:

- `promotion-panel.tsx`: brand, promotional copy, schedule, and social proof.
- `voucher-showcase.tsx`: hero image and promotional voucher previews.
- `login-form.tsx`: phone field and the unavailable OTP action.

Each styled feature file has its own colocated `.module.css`, using existing design tokens. The components remain Server Components because no client state or event handlers are needed. No unused domain, use-case, controller, or infrastructure layers are scaffolded for this visual-only screen.

The Turbopack Tailwind loader targets `globals.css` so that feature CSS Modules retain their scoped class exports. Existing shared styling remains unchanged; migrating shared components is a separate scope.

Verification: `npm test`, `npm run lint`, `npm run build`. The login regression test checks the labelled phone field, disabled OTP state, and promotional content. For visual QA, open `/login` at mobile and desktop widths, check icons and voucher placement, tab through the phone field, and check reduced motion. Browser visual parity is not proven by the automated checks.

This is a visual setup only. Send OTP is disabled until an authentication API contract is supplied; no OTP is sent or simulated. The existing home page is unchanged.
