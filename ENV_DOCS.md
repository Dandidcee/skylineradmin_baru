# Dokumentasi Variabel Lingkungan (Environment Variables)

Dokumen ini berisi daftar lengkap variabel lingkungan yang dibutuhkan untuk menjalankan aplikasi SkyFlow Admin secara lokal maupun di server _production_.

## 1. Backend (`backend/.env`)

| Variabel | Deskripsi | Nilai Default / Contoh |
| --- | --- | --- |
| `PORT` | Port untuk menjalankan server Express backend. | `3000` |
| `DATABASE_URL` | URL koneksi ke database SQLite lokal via Prisma. | `"file:./dev.db"` |
| `JWT_SECRET` | Kunci rahasia untuk _enkripsi_ dan _verifikasi_ token sesi otentikasi. Harus diganti di _production_ demi keamanan. | `supersecretkey_change_me` |

## 2. Frontend (`skyflow_templates/.env`)

*Catatan: Semua variabel frontend (Vite) harus diawali dengan awalan `VITE_` agar bisa dibaca oleh aplikasi React.*

| Variabel | Deskripsi | Nilai Default / Contoh |
| --- | --- | --- |
| `VITE_API_URL` | URL tempat server backend berjalan. Digunakan oleh seluruh _service_ (misal `project-service.ts`) untuk mengambil data API. | `http://localhost:3000` |

---

### Cara Menggunakan:
1. Buat _file_ baru bernama `.env` di dalam folder `backend/` dan isi dengan konfigurasi backend.
2. (Opsional) Buat _file_ baru bernama `.env` di dalam folder `skyflow_templates/` jika ingin mengubah URL _backend_ secara kustom.
3. _Restart_ server Node (`npm run dev`) jika Anda mengubah isi file `.env`.
