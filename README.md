# Gatraloca

Gatraloca adalah situs angkatan dengan landing page, dokumentasi foto, buku kenangan interaktif, dan dashboard untuk mengelola data siswa serta foto. Repositori ini berisi frontend React dan backend Laravel.

## Spesifikasi teknis

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 8, Axios, Three.js |
| Backend | PHP 8.3+, Laravel 13 |
| Database bawaan | SQLite; konfigurasi MySQL juga tersedia melalui Laravel |
| Aset foto | Laravel Storage, diakses melalui endpoint foto |
| Komunikasi | REST API JSON; unggahan gambar memakai `multipart/form-data` |

### Fitur aplikasi

- Landing page berisi bagian jurusan, film, dan flashmob dengan foto yang dimuat dari API.
- Buku kenangan interaktif 3D dengan daftar, pencarian, filter jurusan, dan detail siswa.
- Dashboard admin Laravel untuk mengelola data siswa dan foto galeri.
- API publik untuk membaca data buku kenangan, daftar jurusan, dan foto landing page.
- Autentikasi admin berbasis sesi Laravel; form dashboard dilindungi CSRF.

### Struktur direktori

```text
frontend/   Aplikasi React, halaman, komponen, dan stylesheet
backend/    Aplikasi Laravel, REST API, dashboard, migrasi, dan penyimpanan
```

## Persyaratan

- Node.js dan npm yang mendukung Vite 8.
- PHP 8.3 atau lebih baru, Composer, dan ekstensi `pdo_sqlite` untuk konfigurasi SQLite bawaan.
- Ekstensi dan layanan tambahan sesuai database yang dipilih.

## Menjalankan secara lokal

### Backend

```sh
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

API tersedia di `http://localhost:8000/api`, sedangkan dashboard admin berada di `http://localhost:8000/admin`. Untuk mengaktifkan autentikasi admin, isi `ADMIN_USERNAME` dan `ADMIN_PASSWORD` di berkas `.env` lokal dengan nilai milik lingkungan Anda. Jangan masukkan kredensial atau berkas `.env` ke README maupun repository.

### Frontend

Di terminal lain:

```sh
cd frontend
npm install
npm run dev
```

Buka alamat lokal yang dicetak oleh Vite (umumnya `http://localhost:5173`). Frontend secara default mengakses API di `http://localhost:8000/api`. Atur `VITE_API_URL` di `frontend/.env` jika alamat API berbeda. Jika origin frontend berubah, sesuaikan `FRONTEND_URL` di konfigurasi backend untuk CORS.

## Ringkasan API

Semua endpoint berikut berada di bawah prefix `/api`.

| Metode | Endpoint | Akses | Kegunaan |
| --- | --- | --- | --- |
| `GET` | `/students` | Publik | Daftar siswa; mendukung filter `major`, `search`, `page`, dan `per_page` |
| `GET` | `/students/{id}` | Publik | Detail siswa |
| `GET` | `/students/{id}/photo` | Publik | Foto siswa |
| `GET` | `/majors` | Publik | Daftar jurusan |
| `GET` | `/landing-photos` | Publik | Daftar foto; mendukung filter `section` dan `group` |
| `GET` | `/landing-photos/{id}/photo` | Publik | Berkas foto landing page |
| `GET`, `POST` | `/admin/csrf`, `/admin/login` | Admin | Token CSRF dan login sesi |
| `GET`, `POST`, `PUT`, `DELETE` | `/admin/students...` | Admin | Baca dan kelola data siswa serta foto siswa |
| `GET`, `POST`, `DELETE` | `/admin/landing-photos...` | Admin | Baca dan kelola foto landing page |
| `GET`, `POST` | `/admin/session`, `/admin/logout` | Admin | Status sesi dan logout |

Endpoint admin memerlukan sesi terautentikasi. Rincian route dan perilaku backend tersedia di [backend/README.md](backend/README.md).

## Model data

- `students`: nama, NISN, jurusan, kelas opsional, kutipan opsional, path foto opsional, dan timestamp. NISN unik; indeks tersedia untuk jurusan.
- `landing_photos`: bagian, grup opsional, judul opsional, path foto, dan timestamp. Indeks tersedia untuk bagian serta kombinasi bagian-grup.

Data identitas yang digunakan aplikasi harus dikelola sesuai kebijakan privasi proyek. README ini hanya mendokumentasikan skema dan tidak memuat data siswa, kredensial, token, atau konfigurasi rahasia.

## Perintah pengembangan

Di direktori `frontend/`:

```sh
npm run dev      # server pengembangan
npm run build    # build untuk distribusi
npm run preview  # pratinjau hasil build
npm run lint     # pemeriksaan Oxlint
```
