# Gatraloca Laravel API

Backend Laravel 13 untuk frontend React yang berada di `../frontend`. Memerlukan PHP 8.3+, Composer, dan ekstensi PHP `pdo_sqlite` (atau konfigurasi database MySQL).

## Setup lokal

```sh
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

API berjalan di `http://localhost:8000/api`. Endpoint publik mencakup `GET /students` (filter `major`, `search`, pagination `page`/`per_page`), `GET /students/{id}`, `GET /students/{id}/photo`, `GET /landing-photos?section=major|film|flashmob` (opsional filter `group`), dan `GET /majors`. Endpoint pengelolaan ada di `/api/admin`: login/session, membuat, mengubah, mengganti foto, dan menghapus siswa, serta menambah dan menghapus foto galeri landing page. Pengiriman gambar menggunakan field multipart `photo`.

Untuk frontend yang tidak berjalan di `http://localhost:5173`, ubah `FRONTEND_URL` pada `.env` backend. Default database adalah SQLite di `database/database.sqlite`.

Atur `ADMIN_USERNAME` dan `ADMIN_PASSWORD` di `.env` dengan kredensial khusus sebelum memakai dashboard Blade di `/admin`. Password contoh sengaja tidak disediakan; login admin dinonaktifkan sampai kedua nilai diisi. Dashboard Blade memakai sesi Laravel; semua form pengelolaan siswa dan foto galeri (maksimum 5 MB per file) dilindungi CSRF dan middleware admin. Endpoint baca yearbook dan foto landing page tetap publik; NISN hanya dikirim ke dashboard admin.
