# Shared presentation

Komponen presentasi mengikuti Atomic Design sesuai kebutuhan, tanpa memaksakan semua level.

Katalog visual tersedia di `/design-system`: token warna, tipografi, bentuk, seluruh atom/molekul, contoh state, dan potongan kode penggunaan. Jalankan `npm run dev` lalu buka halaman tersebut. Input dapat dicoba dan contoh kode dibuka lewat “View usage”; tombol demo tidak mengirim data.

- `components/atoms/`: `Icon`, `Button`, `Input`, `Badge`.
- `components/molecules/`: `FormField`, `PhoneNumberField`, `VoucherPreview`.
- `assets/`: font Material Symbols lokal yang dipakai `Icon`.
- `shared.css`: gaya dengan prefix `ui-`, memakai token dari `app/globals.css`.

Import langsung dari file komponen agar dependensi tetap jelas:

```tsx
import { Button } from '@/shared/presentation/components/atoms/button'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { PhoneNumberField } from '@/shared/presentation/components/molecules/phone-number-field'

<PhoneNumberField id="mobile" name="mobile" label="Mobile number" hint="Use your active number" />
<Button type="submit"><Icon name="arrow_forward" />Continue</Button>
```

`Button` menerima native button props dan default `type="button"`. Variant: `primary`, `secondary`, `outline`.
`Input` menerima native input props termasuk `ref`. `PhoneNumberField` meneruskan input props, menghubungkan label/hint/error, dan menampilkan prefix Indonesia +62. Nilai input tetap nomor nasional; normalisasi dan validasi ada di feature.

`Icon` dekoratif secara default; berikan `label` untuk ikon bermakna yang berdiri sendiri. Tambahkan nama ikon yang diperlukan ke `IconName` setelah memastikan tersedia dalam font.
`FormField` hanya menyusun label dan teks bantuan. Jika dipakai langsung, caller menghubungkan `aria-describedby` pada input ke `${id}-hint` / `${id}-error`.
`VoucherPreview` menerima harga yang sudah diformat; tidak menghitung diskon atau mengambil data.

Komposisi halaman, state form, API, dan aturan bisnis tetap di `features/`. Komponen tidak menambahkan client boundary; event handlers/state digunakan dari komponen client milik feature. Tidak ada library UI tambahan.

Verifikasi: `npm test`, `npm run lint`, `npm run build`. Acuan visual: screen login Stitch `49dcdf43d73e4d0a9c877d582cbbe579` pada project `14051200829858170119`; HTML dan gambar yang sudah diunduh tersedia di `features/login/design/` dan `features/login/assets/`.
