# PromoRush login screen

Preview at `/login` using `npm run dev`.

Source: Stitch project `14051200829858170119`, screen `49dcdf43d73e4d0a9c877d582cbbe579`.
The original HTML and screenshot are preserved in `design/`; the downloaded hero image is in `assets/`.
The hero image is bundled locally and rendered with `next/image`; Material Symbols is shared from `src/shared/presentation/assets/` via the shared `Icon` atom. Buttons, badges, phone fields, and voucher previews reuse shared presentation components.

## Presentation structure

`src/app/login/page.tsx` is the routing shell. `presentation/pages/login-page.tsx` composes the feature components under `presentation/components/`:

- `promotion-panel.tsx`: brand, promotional copy, schedule, and social proof.
- `voucher-showcase.tsx`: hero image and promotional voucher previews.
- `login-form.tsx`: interactive phone number input, OTP verification step, cooldown timer, resend OTP, and redirect to flash sale.

Each styled feature file has its own colocated `.module.css`, using existing design tokens.

## API Integration & Clean Architecture

Integrated with the API contract (`docs/api-contract-v1.md`):
- `POST /auth/v1/otp/request`: Request OTP with phone normalization (`08...`), rate-limit handling (`RATE_LIMITED`), and cooldown response.
- `POST /auth/v1/otp/verify`: Validate 6-digit OTP code, error handling (`INVALID_OTP` with `attemptsRemaining`), and token persistence (`accessToken`, `refreshToken`, session cookie).

Layers:
- `src/features/auth/domain/`: Phone & OTP normalization, validations, and domain errors (`RateLimitedError`, `InvalidOtpError`, `AuthValidationError`).
- `src/features/auth/use-cases/`: `requestOtpUseCase`, `verifyOtpUseCase`, `AuthRepository` port interface.
- `src/features/auth/infrastructure/`: `ApiAuthRepository` (production HTTP adapter adhering strictly to backend contract using `NEXT_PUBLIC_API_URL`).
- `src/features/auth/controllers/`: Server Actions `requestOtpAction` and `verifyOtpAction` returning `ActionResult<T>`.

Verification: `npm test`, `npm run lint`, `npm run build`. Automated regression tests cover domain validation, use cases, repository adapters, Server Actions, and UI presentation.
