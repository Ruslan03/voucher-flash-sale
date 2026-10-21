# PromoRush Dashboard

Run `npm run dev`, then open `http://localhost:3000/dashboard`. The current development configuration allows localhost. No dashboard backend or extra environment variables are needed for the preview.

## Stitch source and layout

Project `14051200829858170119`, screen `df7d18fef6f4477dacd875223585e0fd`. Original HTML/screenshot are preserved in `design/`; the avatar is downloaded to `assets/`. No hosted scripts from the export are executed.

| Section | Component | Interaction |
| --- | --- | --- |
| Announcement / header | `dashboard-header` | Device clock in WIB; native account menu; links to catalog, owned coupons, login |
| Hero | `session-hero` | Upcoming/live/ended variants, countdown, catalog anchor, local demo scenario selector |
| Owned coupons | `owned-vouchers`, `owned-coupon-card`, `empty-category-slot` | Three category slots; detail dialog; empty-slot link selects a category |
| Catalog | `voucher-catalog`, `offer-card`, `merchant-heading` | Category filters, availability states, native quota progress, purchase preview |
| Detail / confirmation | `coupon-dialog` | Native modal dialog, focus containment, Escape/close, demo confirmation |
| Footer / mobile quick bar | `dashboard-footer` | Responsive catalog shortcut and session label |

Each styled presentation slice has its own CSS Module. The route is a thin shell; `DashboardPage` loads request-time data through the server controller, then `DashboardView` owns the client interactions. Existing home/login routes are unchanged.

## Architecture and integration functions

```text
app/dashboard/page.tsx
  -> presentation/pages/dashboard-page.tsx
  -> controllers/dashboard-controller.ts
  -> use-cases/load-dashboard.ts
  -> DashboardRepository.load()
     injected by composition/registry.ts
     implemented by infrastructure/demo-dashboard-repository.ts

DashboardView -> dashboard-preview-controller.ts
  -> use-cases/preview-purchase.ts
  -> domain eligibility rules -> immutable local snapshot
```

| Function | Responsibility / tested cases |
| --- | --- |
| `getSessionStatus` | Exact opening/closing boundaries |
| `getOfferState` | Upcoming, live stock, sold out, owned, category used, session ended |
| `filterDashboardOffers` | All/category filtering and empty catalogs without mutating input |
| `loadDashboard` | Injected read port, empty results, invalid dates/quotas, transport rejection |
| `DemoDashboardRepository.load` | Deterministic clock injection, five offers, isolated snapshots |
| `getDashboardController` | Successful data and sanitized `ActionResult` failure mapping |
| `previewPurchase` / controller | Successful demo coupon, decrement selected stock once, immutable input; reject missing offer, unavailable state, repeat category and non-preview mode |
| Formatting functions | Rupiah, clamped countdown, explicit WIB dates/clock |
| Clock / UI handlers | Timer updates, scenario changes, filters, details/close, confirmation, quota/category refresh, empty/error/retry |

The repository port and types describe a frontend model, not an agreed backend schema. The existing voucher feature model lacks merchant pricing, food categories and owned-coupon data, so this dashboard uses a separate read model rather than modifying or guessing the voucher API contract.

For real integration: implement the read port against the agreed contract, validate/map external DTOs in that adapter, and switch DI. Replace the explicitly named preview purchase controller with an authenticated server action/use case backed by the agreed purchase/reservation port. Obtain server session timing, ownership, expiry, atomic stock changes, category enforcement, and idempotency from BE. Never trust the client snapshot or browser time for real purchases. No endpoint, payment provider, auth/session, or API response is invented here.

## Preview behavior and demo steps

1. Open `/dashboard`: hero starts 23 minutes before the local fixture session. One Uniqlo fashion coupon is already owned. Copy and timing are demo data.
2. Choose **Live** in **Skenario demo**. Tokopedia/Samsung purchase actions become available; Kopi starts five minutes into the fixture session, McDonald's is sold out, and Zara is blocked because the fashion slot is already used.
3. Click **Beli Voucher Rp350.000**, then **Konfirmasi demo**. The owned count becomes two, Tokopedia remaining stock decreases from 1,450 to 1,449, and the other electronics purchase is blocked by category quota.
4. Open the owned coupon details. Its `DEMO-` code is not redeemable. Close or press Escape.
5. Filter categories or use an empty slot's shortcut. Choose **Selesai** to preview the closed session. Refresh resets all local purchases.

The Stitch export mixes an upcoming hero with live offer examples; this implementation uses coherent availability rules for the selected demo scenario. The unverified OJK registration claim in the source footer is replaced with demo copy. Device time is labelled accurately, not presented as a backend-synchronized clock.

No real requests, payment, reservation, redemption, or persistent ownership occur during demo confirmation. The FE preview does not prove backend integration, atomicity, concurrency safety, or rate limiting.

## Validation / handoff

Use `npm test`, `npm run lint`, and `npm run build`. Domain/use-case, adapter/controller and jsdom interaction tests were written red-first before their corresponding implementations. Tests are colocated within the feature. Remote pipeline status requires separate evidence.

Responsive breakpoints collapse owned slots, catalog columns, hero and account details; a mobile quick bar appears on small screens. Verify desktop/mobile rendering, keyboard focus, modal Escape, and category shortcuts during visual QA.
