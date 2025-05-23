# Stock Market Monitor

Aplikasi pemantau pasar saham real-time yang dibangun dengan Next.js dan Socket.IO. Aplikasi ini menyediakan pembaruan harga saham secara langsung dan grafik interaktif untuk simbol saham Indonesia.

## Fitur

- Pembaruan harga saham real-time menggunakan WebSocket
- Grafik harga saham interaktif menggunakan Recharts
- Dukungan untuk beberapa simbol saham (BBRI, BBCA, TLKM, ANTM)
- Pemilihan simbol yang dinamis
- Indikator perubahan harga dengan kode warna
- Desain responsif untuk semua ukuran layar
- Dukungan mode gelap

## Teknologi yang Digunakan

- **Framework Frontend**: Next.js 14
- **Komunikasi Real-time**: Socket.IO Client
- **Visualisasi Data**: Recharts
- **Styling**: Tailwind CSS
- **Keamanan Tipe**: TypeScript

## Persyaratan

- Node.js (v14 atau lebih tinggi)
- npm, yarn, pnpm, atau bun

## Memulai

1. Clone repository
2. Install dependensi:
```bash
npm install
# atau
yarn install
# atau
pnpm install
# atau
bun install
```

3. Jalankan server pengembangan:
```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
# atau
bun dev
```

4. Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi.

## Struktur Proyek

- `src/app/page.tsx` - Komponen aplikasi utama
- `src/app/layout.tsx` - Komponen layout utama
- `src/app/globals.css` - Gaya global

## Detail Fitur

### Pembaruan Real-time
Aplikasi terhubung ke server WebSocket untuk menerima pembaruan harga saham secara real-time. Status koneksi ditunjukkan oleh titik berwarna di pojok kanan atas.

### Pemilihan Saham
Pengguna dapat beralih antara berbagai simbol saham (BBRI, BBCA, TLKM, ANTM) menggunakan tombol di bagian atas halaman. Aplikasi akan secara otomatis memperbarui untuk menampilkan data untuk simbol yang dipilih.

### Grafik Harga
Setiap kartu saham menampilkan:
- Harga terkini
- Perubahan harga (absolut dan persentase)
- Grafik harga interaktif yang menunjukkan data historis
- Indikator dengan kode warna (hijau untuk perubahan positif, merah untuk negatif)

### Desain Responsif
Aplikasi sepenuhnya responsif:
- Tata letak satu kolom pada perangkat mobile
- Tata letak grid dua kolom pada layar yang lebih besar
- Ukuran grafik yang adaptif
- Kontrol yang ramah sentuhan

## Pengembangan

Aplikasi menggunakan TypeScript untuk keamanan tipe. Interface utama meliputi:

```typescript
interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface ChartData {
  timestamp: number;
  price: number;
}
```

## Kontribusi

Silakan kirimkan masalah dan permintaan peningkatan!

## Lisensi

Proyek ini bersifat open source dan tersedia di bawah Lisensi MIT.
