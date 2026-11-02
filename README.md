# Gatraloca

Project ini terdiri dari frontend React + Vite di `frontend/` dan backend API Laravel di `backend/`.

## Menjalankan keduanya

Persiapkan Node.js/npm, PHP 8.3+, Composer, serta ekstensi PHP `pdo_sqlite`.

### 1. Siapkan backend (sekali saja)

```sh
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
```

### 2. Jalankan Laravel

Di terminal pertama:

```sh
cd backend
php artisan serve
```

API tersedia di `http://localhost:8000/api`.

### 3. Jalankan React

Di terminal kedua, dari folder project:

```sh
cd frontend
npm install
npm run dev
```

Buka alamat Vite yang ditampilkan di terminal, biasanya `http://localhost:5173`. Biarkan kedua terminal tetap berjalan. Frontend sudah menggunakan API Laravel di `http://localhost:8000/api` secara default. Untuk mengubahnya, atur `VITE_API_URL` di `frontend/.env`.

Landing page dan yearbook 3D React dapat diakses publik di `/`. Dashboard admin Laravel Blade tersedia di `http://localhost:8000/admin`; atur `ADMIN_USERNAME` dan `ADMIN_PASSWORD` di `backend/.env` sebelum login. Ikon admin pada navbar landing page membuka dashboard Laravel tersebut.

Detail endpoint dan konfigurasi backend ada di [backend/README.md](backend/README.md).
