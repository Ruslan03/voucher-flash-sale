# Shared presentation

Komponen presentasi mengikuti Atomic Design sesuai kebutuhan, tanpa memaksakan semua level.

Katalog visual tersedia di `/design-system`: token warna, tipografi, bentuk, atom/molekul awal, contoh state, dan potongan kode penggunaan. Jalankan `npm run dev` lalu buka halaman tersebut. Input dapat dicoba dan contoh kode dibuka lewat “View usage”; tombol demo tidak mengirim data.

- `components/atoms/`: `Icon`, `Button`, `Input`, `Badge`, `Progress`.
- `components/molecules/`: `FormField`, `PhoneNumberField`, `VoucherPreview`, `OtpInput`, `CategoryFilter`, `Breadcrumbs`, `Modal`.
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
`Input` menerima native input props termasuk `ref`. `PhoneNumberField` meneruskan input props, menghubungkan label/hint/error, dan menampilkan prefix Indonesia +62. Komponen memvalidasi angka saja dan menampilkan error di bawah input untuk huruf/simbol; nilai yang salah tetap terlihat agar bisa diperbaiki. Error format dibersihkan setelah nilainya valid. Prop `error` dapat menambahkan validasi feature. Normalisasi prefix dan aturan panjang nomor tetap di feature. Helper `getPhoneNumberInputError` dapat digunakan caller untuk validasi required/angka saat tombol diklik.

`Icon` dekoratif secara default; berikan `label` untuk ikon bermakna yang berdiri sendiri. Tambahkan nama ikon yang diperlukan ke `IconName` setelah memastikan tersedia dalam font.
`FormField` hanya menyusun label dan teks bantuan. Jika dipakai langsung, caller menghubungkan `aria-describedby` pada input ke `${id}-hint` / `${id}-error`.
`VoucherPreview` menerima harga yang sudah diformat; tidak menghitung diskon atau mengambil data.

`Progress` membungkus native `<progress>` dan menerima `value`, `max`, serta `aria-label`; nilai dinamis memakai atribut native, tanpa inline style. `CategoryFilter` adalah Client Component generik dengan `options`, `value`, `onChange`, dan label grup. Tombol menggunakan `aria-pressed`, bukan tablist, karena aksinya memfilter data. Keduanya memiliki CSS Module sendiri dan tidak mengimpor domain feature.

`OtpInput` adalah Client Component terkontrol (`value: string[]`, `onChange`) dengan enam digit secara default. Array mempertahankan posisi digit kosong saat diedit. Mendukung paste, autofill `one-time-code`, perpindahan fokus, Backspace, dan panah kiri/kanan. Berikan `label`, ID unik, dan `describedBy` untuk teks bantuan. Gunakan di dalam Client Component; verifikasi, expiry, dan cooldown tetap di feature. Styling komponen ini memakai `otp-input.module.css`.

Komposisi halaman, state form, API, dan aturan bisnis tetap di `features/`. `PhoneNumberField` dan `OtpInput` adalah client boundary untuk interaksi input; orchestration tetap di komponen client milik feature. Tidak ada library UI tambahan.

Verifikasi: `npm test`, `npm run lint`, `npm run build`. Acuan visual: screen login Stitch `49dcdf43d73e4d0a9c877d582cbbe579` pada project `14051200829858170119`; HTML dan gambar yang sudah diunduh tersedia di `features/login/design/` dan `features/login/assets/`.

`Breadcrumbs` menerima `items: { label, href? }[]`, menggunakan Next Link dan `aria-current` untuk halaman aktif. `Modal` menerima `open`, `title`, `onClose`, dan `children`; native dialog menyediakan focus containment, sementara Escape diteruskan ke `onClose`. Keduanya memakai CSS Module dan tidak mengimpor feature. Contoh pemakaian ada di halaman voucher details. `lib/commerce-format.ts` menyediakan formatter Rupiah, countdown, dan tanggal/WIB untuk presentation.
