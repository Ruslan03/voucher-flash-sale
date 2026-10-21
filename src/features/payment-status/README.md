# Payment status screens

Preview routes:

- `/payments/demo-success`
- `/payments/demo-failed`

Source: Stitch project `14051200829858170119`, success screen `65d4914aa58048e58beacc6cf801563b`, failed screen `8f94972eafde4d738d5bd708344cafd1`. Original HTML is retained in `design/success.html` and `design/failed.html`; screenshots were downloaded with `curl -L --fail` to the adjacent JPG files. HTML was retrieved through the authenticated Stitch file tool. Neither screen contains separate product image assets.

## Layout and slicing

Both screens use a centered white transaction card on a pale canvas. Success has a green confirmation indicator and redemption guidance; failure has a red indicator, failure reason and billed amount. Desktop widths follow the export (672px success, 620px failure); smaller viewports use fluid widths and smaller padding. Decorative pulse respects reduced-motion preferences.

| Section | File | Responsibility / interaction |
| --- | --- | --- |
| Route shell | `src/app/payments/[orderId]/page.tsx` | Metadata, Suspense fallback, forward async params |
| Server read | `presentation/pages/payment-status-page.tsx` | Read status; unknown/invalid ID returns not-found |
| Page composition | `presentation/pages/payment-status-view.tsx` | Render result, preview label, retry a failed read |
| Status header | `presentation/components/payment-status-heading.tsx` | Decorative icon, one h1, status-specific explanation |
| Receipt | `presentation/components/payment-receipt.tsx` | Order ID, WIB time, method, amounts, copy with accurate feedback |
| Redemption information | `presentation/components/voucher-redemption-notice.tsx` | Successful payment only; expiry from the record |
| Dashboard navigation | `presentation/components/payment-status-actions.tsx` | Accessible link to `/dashboard` |

Each styled slice owns its CSS Module. Shared `Button`, local-font `Icon`, Rupiah formatting and existing design tokens are reused. Receipt and redemption text are payment-specific and stay in the feature. No new generic component framework is introduced. Original header/footer, ticket preview, payment retry buttons, quota hold banner and help snippets are absent/commented out in the export; no placeholder links or speculative payment actions were added.

## Integration preparation

`domain/payment-status.ts` defines the frontend read model, discriminated success/failed states and runtime validation. This is not a backend response contract. `use-cases/payment-status-repository.ts` defines the read port; `get-payment-status.ts` validates the ID, presence, record shape and matching order lookup. Amounts are integer Rupiah; invalid records never become a successful payment view.

`DemoPaymentStatusRepository` returns independent preview fixtures. `createPaymentStatusRepository()` in the composition root binds that adapter. The server controller maps domain errors and sanitizes unexpected transport errors. The presentation imports the controller; it never imports a concrete adapter or registry. Replace the adapter binding once the agreed authenticated backend status endpoint and mapping are available. Do not trust URL/query status values or a browser gateway redirect as payment verification.

The demo preserves Stitch's Order ID, 25 Oct 2026 transaction dates, 1 Nov expiry, Midtrans method text and Rp50.000 amount (Rp200.000 face value). These are design fixtures, not current transactions or a Midtrans integration. The two lookup IDs demonstrate alternative outcomes for the same example receipt. They do not create, charge, settle, refund, reserve quota, issue a QR/code, update Dashboard ownership or persist anything. Existing voucher-details confirmation remains a separate local preview; no order ID or gateway contract currently connects it to these records.

Only **Coba lagi** for a failed status read performs another read; it never retries charging. Copy Order ID reports success only after Clipboard resolves; denial/unavailability leaves the visible selectable ID and a manual-copy message. Dashboard navigation uses a real route. Unknown order IDs render Next.js not-found UI rather than a fallback success receipt. With streaming already started, Next.js can retain HTTP 200 and add noindex; this is not a status API.

## TDD and file coverage

Before implementation, nine domain/use-case/adapter/controller/date tests failed against stubs. Eleven presentation tests then failed against component/page stubs. The route-shell test also failed before its implementation. After implementation, these and the composition binding check pass (22 tests total).

Each runtime `.ts`/`.tsx` feature file has a colocated test, except the type-only repository port whose contract is exercised by the use-case and adapter tests. Every styled component is rendered in its component test; CSS is also verified visually rather than with tautological style snapshots. The thin app route has its own test. Existing shared Icon behavior remains covered by shared tests and new component rendering.

Coverage includes success/failed records, malformed data, invalid/missing/mismatched IDs, transport sanitization, isolated fixtures, DI binding, WIB date rollover, success/failure receipts, savings, exact clipboard value and denial, conditional redemption instructions, Dashboard link, retry/loading/action failure, server-page 404 behavior and route delegation.

Demo: open each preview route, compare the receipt/status, click **Salin Order ID**, then **Kembali ke Dashboard Flash Sale**. Open `/payments/unknown` to confirm not-found UI. Run `npm test`, `npm run lint`, `./node_modules/.bin/tsc --noEmit`, and `npm run build` for repository checks. Remote CI, real gateway/backend and a physical mobile browser are not verified.

Final local verification: 106 repository tests pass, including 22 new payment-status/route tests; ESLint, TypeScript (`tsc --noEmit`) and `git diff --check` pass. Both desktop screens were visually checked in Brave with local Material Symbols rendering. The full production build is blocked by the existing Turbopack CSS worker port restriction (`Operation not permitted`), including an escalated run. Dependencies were synchronized using the existing lockfile (`npm ci`) after an already-declared login dependency was missing; manifests and login code were not changed. Preview server was restarted after the install and is available on port 3000.
