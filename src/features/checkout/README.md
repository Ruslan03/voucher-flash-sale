# Checkout and payment preview

Routes:

- `/payment-method/zara`: method selection and order summary, then payment instructions.
- `/payment-status/demo-order`: pending screen matching the Stitch screenshot; check resolves to demo success.
- `/payment-status/demo-failed`: pending screen whose check resolves to failure; retry retains the original deadline.
- `/payment-status/demo-pending`: remains pending on checks, useful for expiry testing.

Stitch project `14051200829858170119`, screen `04c391d0da3b459db796d640b18e537f`. Original code is retained in `design/stitch.html` through the authenticated Stitch download tool; `design/stitch.jpg` was downloaded with `curl -L --fail`. The export contains no standalone product images. Icons use the existing local Material Symbols font.

## Layout and slicing

The screenshot shows **pending**, while the HTML also includes a hidden checkout form, failed state and expired state. The form uses two columns (payment methods and sticky summary), collapsing to one on small screens. Pending is a centered 620px card. Header/announcement/footer and QA switcher are only comments in the export; no imitation server clock or gateway SDK was added.

| Section | File | Interaction |
| --- | --- | --- |
| Breadcrumb, title, reservation ID | CheckoutHeading + shared Breadcrumbs | Dashboard navigation |
| Gateway selection | PaymentMethodPicker / PaymentMethodOption | Native controlled radio group; selected styling and instructions change |
| Voucher summary and prices | CheckoutSummary | Start mock payment with a click; disabled while restoring/processing |
| Reservation countdown | ReservationCountdown | Absolute deadline, urgent styling under one minute, no misleading WIB suffix on a duration |
| Pending composition | PendingCheckout | Spinner, order badge, countdown, instructions, receipt, storage notice, manual status check |
| Virtual account | PaymentInstructions | Selected gateway and sample VA, shared copy action |
| Transaction receipt | CheckoutReceipt | WIB date, selected method, totals, copy Order ID; distinct pending/settled labels |
| Success / failure / expiry | CheckoutOutcome | Demo result, eligible retry or Dashboard link |
| Method orchestration | CheckoutView | Restore, method selection, start payment, navigation to status |
| Request-time read | CheckoutPage | Async params and not-found mapping |
| Route shell | `src/app/payment-method/[id]/page.tsx` | Metadata and Suspense fallback |

Every styled slice has its own CSS Module. Existing design tokens, Button, Icon, Breadcrumbs and Rupiah formatting are reused. New shared `CopyButton` owns clipboard feedback without feature imports. The payment date formatter moved to shared presentation with the old payment-status path retained as a re-export. Feature compositions and checkout rules remain in this feature.

## Integration boundary

`domain/checkout.ts` defines a frontend preview model, runtime validation, total calculation and deadline/status rules. `CheckoutRepository` is a port for `load`, `start`, and `check`; it is not an agreed REST API response or endpoint contract. Use cases validate input and returned records before the UI can display a payment state.

The server controller resolves the initial fixture through `createCheckoutRepository()` in the main registry. Browser actions resolve an explicitly client-safe registry (`src/composition/checkout-preview-registry.ts`) and the local adapter through preview controllers. Presentation never imports infrastructure. Keeping the browser registry separate prevents server/API/auth imports from entering the client bundle. Real integration must replace the preview action boundary and adapter with authenticated backend order, gateway initiation and status contracts; no endpoints, Snap credentials or redirects are fabricated.

`PreviewCheckoutRepository` stores only fictional order data under `promorush:checkout:v1:<id>` in localStorage. It restores method, status, VA and the original expiry; refresh/retry never extends the stored deadline. If storage cannot be read or written, the same repository instance retains a memory fallback. Corrupt stored records are rejected rather than silently renewing reservations. Clear only the corresponding preview key in browser storage to restart that scenario; clearing all site data is unnecessary.

First-time form reservations last five minutes. Direct pending scenarios start with 03:45 remaining. Transaction timestamps use the current demo creation time, rather than presenting the Stitch example's future transaction date as current. Polling runs every 20 seconds only while pending, shares the manual action's in-flight guard and stops on terminal/expired state or unmount. Manual status check and Pay clicks cannot enqueue duplicate calls within the same view. The success fixtures settle on the first check; failure stays retryable only within the original deadline; the pending fixture eventually expires.

These are UI previews: there is no gateway charge, QR issuance, real VA, server reservation, authentication proof, backend quota release, persisted user ownership, payment verification or concurrency guarantee. Browser storage and time are not payment authority. The sample VA is explicitly labelled as an example; do not transfer money. A settled mock result remains settled when its former reservation deadline passes. Existing Dashboard, voucher-details and standalone payment-status previews remain independent until an agreed order contract connects them; checkout renders its own method-consistent result instead of redirecting Xendit to a fixed Midtrans example receipt.

## Test mapping and demo

Tests were written against stubs and observed failing before implementation: seven domain/adapter/use-case tests, four controller/DI tests, ten component/copy tests, and nine orchestration/page/route tests. A further regression first reproduced storage-write denial reverting the state, then passed after fallback handling was corrected. Runtime files have adjacent tests; type-only repository signatures are exercised by adapters/use cases. CSS is verified through visual checks rather than style snapshots.

Domain tests cover totals, malformed values and exact expiry. Adapter tests cover isolated fixtures, start/check outcomes, deadline persistence, missing data, corrupt storage, full/partial storage denial, and DI binding. Controllers test error mapping and sanitization. Component files test content/state separately; view tests cover gateway selection, positive flow, polling cleanup, retry without extension, expiry, duplicate-click prevention, restoration and failure handling. Shared copy tests cover exact values and denied/unavailable Clipboard; formatter tests cover explicit WIB/calendar rollover.

Demo: open `/payment-method/zara`, choose Midtrans or Xendit, click **Bayar Rp50.000**, inspect/copy the sample VA, refresh to restore the preview, then click **Cek Status Pembayaran** (or wait 20 seconds). Check `/payment-status/demo-failed` for failure/retry and `/payment-status/demo-pending` for expiry. Unknown IDs render Next.js not-found UI; streamed responses may retain HTTP 200/noindex, so this route is not a status API.

Run `npm test`, `npm run lint`, `./node_modules/.bin/tsc --noEmit`, and `npm run build`. Desktop browser verification covered form layout, native Xendit selection, pending layout/local icons, method-specific VA, and automatic success with the selected method retained. Physical mobile browser, real backend/gateway and remote CI are unverified. Production build remains blocked by the existing Turbopack CSS worker port restriction (`Operation not permitted`), including an escalated run.

Final local evidence: all **139 tests** pass across 48 test files (33 tests added with checkout/shared utilities/composition), ESLint passes without warnings, `tsc --noEmit` passes, and `git diff --check` passes. Browser refresh retained the settled demo outcome and selected Xendit method. The final build attempt remains blocked as described above; no remote pipeline or production build success is claimed.

## Route ownership revision

`/payment-method/:id` now owns only method selection and initiating payment. A successful Pay action navigates to `/payment-status/:id`. Restoring a pending/settled/expired order also navigates there. Failed orders may return to payment-method to choose a gateway and retry within the original deadline. No pending view, settlement outcome or polling is rendered on payment-method.

`OrderPaymentStatusView` in the payment-status feature owns restore, countdown, manual checks, polling, pending and outcomes. It consumes the explicit checkout public boundary (`features/checkout/public.ts`) to reuse the same order port/controller and presentation slices, preserving method/VA/deadline and avoiding a second mock order. The legacy `/payment-status/demo-success` fixture remains accessible. `/payment-status/demo-failed` now follows the shared order flow and can begin pending before the simulated failure.

Route-flow revision verified: 159 repository tests, ESLint, TypeScript and diff check pass. Browser validation of this latest route transition was not performed; regression tests cover navigation, pending polling, settled output, failed retry and expiry.
