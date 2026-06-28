# SkyflowAdmin

SkyflowAdmin adalah aplikasi manajemen dengan Backend berbasis Express.js dan Frontend berbasis React (Vite).

## Persyaratan (Prerequisites)
Pastikan komputer Anda sudah terinstal:
- [Node.js](https://nodejs.org/) (Disarankan versi 18 ke atas)
- [Git](https://git-scm.com/)

---

## 🚀 Cara Menjalankan Project (Local Development)

Berikut adalah panduan lengkap dari awal (clone repository) sampai aplikasi berjalan.

### 1. Clone Repository
Pertama, buka terminal di komputer Anda, lalu clone repository ini:
```bash
git clone https://github.com/Dandidcee/skylineradmin_baru.git
```
Masuk ke dalam folder project yang baru saja di-clone:
```bash
cd skylineradmin_baru
```

### 2. Setup dan Jalankan Backend (Server)
Aplikasi backend berada di dalam folder `backend`. Buka tab terminal baru (atau lanjutkan di terminal yang sama), lalu jalankan perintah berikut:

```bash
cd backend
npm install
```

**Konfigurasi Environment Backend:**
Pastikan di dalam folder `backend` terdapat file `.env` dengan isi minimal seperti ini:
```env
DATABASE_URL="file:./dev.db"
PORT=5080
```

Jalankan server backend:
```bash
npm run dev
```
*(Server backend akan berjalan dan siap menerima request API di `http://localhost:5080`)*

### 3. Setup dan Jalankan Frontend (UI/Web)
Aplikasi frontend berada di dalam folder `skyflow_templates`. Buka **tab terminal baru**, lalu jalankan perintah berikut (pastikan posisi Anda mulai dari root folder `skylineradmin_baru`):

```bash
cd skyflow_templates
npm install
```

Jalankan server frontend Vite:
```bash
npm run dev
```
*(Aplikasi web frontend akan berjalan di `http://localhost:5081`)*

### 4. Buka Aplikasi di Browser
Setelah frontend berjalan, Anda bisa langsung membuka browser dan menuju ke alamat:
👉 **[http://localhost:5081](http://localhost:5081)**

---

## 🛠️ Ringkasan Port yang Digunakan
- **Backend (API):** Berjalan di port `5080`.
- **Frontend (Web):** Berjalan di port `5081`. 

> Jika sewaktu-waktu terjadi bentrok port (port is already in use), Anda dapat mengganti port di file `backend/.env` untuk Backend dan `skyflow_templates/vite.config.ts` untuk Frontend. (Pastikan juga mengupdate URL API di `skyflow_templates/src/services/api.ts` jika backend port diganti).
