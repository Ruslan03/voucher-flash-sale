# Voucher details preview

Route: `/vouchers/zara`; Dashboard cards link to `/vouchers/[id]`. Known fixture IDs: `zara`, `kopi`, `tokopedia`, `samsung`, `mcd`. Unknown IDs return Next.js not-found.

## Design analysis

Source: Stitch project `14051200829858170119`, screen `4d2cd0394c1a409d98ed2d28f4c01d61`. Downloaded HTML and screenshot are retained in `design/`. The export contains no separate product images. Header/footer appear only as comments, so they were not invented.

| Section | Component | Interaction |
| --- | --- | --- |
| Back navigation | Shared Breadcrumbs | Return to Dashboard |
| Category, name, description | VoucherHeading | Read only |
| Minimum spend, validity, participating merchants | VoucherSpecifications | Read only |
| Numbered conditions | VoucherTerms | Read only |
| Sticky price, countdown, quota | PurchaseCard | Buy / share; unavailable status disables buy |
| Confirmation | PurchaseConfirmation + shared Modal | Local purchase preview, recheck eligibility |
| Share dialog | VoucherShareModal + shared Modal | Actual page URL, clipboard, WhatsApp/Telegram/X links |

Desktop uses two columns, mobile a single column. Every styled slice has a colocated CSS Module. Shared Button, Icon and Progress are reused. Formatting helpers moved into shared presentation and Dashboard retains a compatibility re-export.

## Integration boundary

`domain/sale-voucher.ts` owns status and pricing; `use-cases/get-voucher-details.ts` validates the repository response; `VoucherDetailsRepository` is the read port. The server controller resolves the mock adapter through `src/composition/registry.ts`. Replace that binding after the backend contract is available. Transport failures are sanitized; missing IDs are explicit.

The client-safe purchase controller runs `previewBuyVoucher`; this is deliberately not a checkout API or server transaction. It checks time, stock, category eligibility and repeat purchase, returns immutable updated stock and a `DEMO-*` confirmation. Future backend purchasing must supply authoritative authentication, atomic quota/category enforcement and payment behavior.

Fixtures are independent of Dashboard preview state. Zara follows this screen's Rp50.000 price; Dashboard's separate Stitch fixture currently displays Rp75.000 and an already-owned fashion category. Ownership, session and stock are not synchronized across routes or reloads. Both previews must be replaced by an agreed shared backend source before integration. Reload resets the local preview and starts a new five-minute demo session. No real payment, persistence, concurrency guarantee or API integration is claimed.

Clipboard success appears only after writeText resolves. If unavailable/denied, the selectable URL remains for manual copying. Social shortcuts open only when the user chooses a link; automated checks do not publish messages.

## Validation and demo

TDD evidence: domain/use-case stubs first failed six tests; adapter/controller/share stubs then failed five tests; UI stub failed four interaction tests before implementation. Tests cover states, calculations, validation, error mapping, immutable purchase and duplicate prevention, clipboard outcomes, modal cancellation, expired confirmation and retry.

Run `npm test`, `npm run lint`, `npm run build`. Open `/vouchers/zara`, inspect merchant specifications and conditions, share/copy the current URL, then buy and confirm the demo: stock changes 1.204 → 1.203 and purchasing is disabled. Open `/vouchers/mcd` for sold-out state. Backend contract and SALT coding standards source are not available; no compliance or backend claim is made.

Verification completed: all 84 repository tests pass (16 voucher-details tests), ESLint and `tsc --noEmit` pass. An initial production build passed; the final rebuild is blocked by Turbopack CSS worker port binding (`Operation not permitted`), including an escalated retry. Final production build therefore remains unverified. Desktop browser check verified the two-column layout, native modal focus, DEMO-ZARA confirmation and stock decrement, and actual-URL share shortcuts. Responsive CSS is included; a physical mobile browser has not been checked. A development hydration warning was traced to Grammarly-injected body attributes, not the feature snapshot. Remote CI and backend are unverified.
