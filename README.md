# Platform Donasi Berbasis Microservices

## Arsitektur Sistem
<br> Proyek  ini terdiri dari beberapa layanan independen yang berkomunikasi melalui API Gateway dan Message Broker:

1. API Gateway (Port 3330): Single entry point of Entry untuk semua *request* dari klien. Dilengkapi dengan *logging* otomatis.
2. Auth Service: Mengelola autentikasi pengguna, registrasi, dan penerbitan JSON Web Token (JWT).
3. Campaign Service: Mengelola operasi CRUD untuk entitas program donasi. Mendukung *Partial Updates* dan dibatasi dengan otorisasi berbasis peran (RBAC).
4. Donation Service: Menangani logika transaksi masuk
5. Worker / Notifikasi: Bertindak sebagai consumer asinkron untuk memproses antrean pesan donasi dari RabbitMQ
6. Database MariaDB (Port 3336): Pangkalan data terisolasi di dalam *container*.

## Teknologi yang digunakan
- Backend: Node.js Express.js
- Database: MariaDB (modul 'mysql2')
- Message Broker: RabbitMQ
- Keamanan: JWT, bcryptjs
- Deployment & Infrastruktur: Docker, Docker Compose

## Panduan instalasi dan eksekusi
<br> Pastikan sistem sudah terinstal Docker dan Docker Compose

### 1. Persiapan Environment
<br>Semua konfigurasi environment (seperti koneksi database dan port) sudah diatur secara otomatis di dalam file `docker-compose.yml`. Pangkalan data juga akan diinisialisasi secara otomatis melalui file SQL di dalam folder `init-db`.

### 2. Menjalankan Layanan
<br> Karena sistem ini sudah menggunakan arsitektur kontainer, tidak perlu lagi membuka 5 terminal terpisah. Buka terminal di *root* folder proyek dan jalankan perintah berikut:

```bash
# Menjalankan semua layanan di latar belakang
docker-compose up -d --build
```

Untuk menghentikan semua layanan, jalankan perintah:
```bash
docker-compose down
```

## Dokumentasi API (Endpoint)

| Layanan | Method | Endpoint | Otorisasi | Body / Payload | Deskripsi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Publik | `nama`, `email`,<br>`password`, `role` | Mendaftarkan akun baru.<br>*(Secara default menjadi donatur jika role kosong)*. |
| **Auth** | `POST` | `/auth/login` | Publik | `email`, `password` | Login untuk mendapatkan Token JWT. |
| **Campaign** | `GET` | `/campaigns` | Publik | - | Melihat daftar semua kampanye (diurutkan dari yang terbaru). |
| **Campaign** | `POST` | `/campaigns` | Admin | `judul`, `deskripsi`,<br>`target_dana` | Membuat kampanye baru. |
| **Campaign** | `PUT` | `/campaigns/:id` | Admin | `status`, `target_dana`,<br>`judul`, `deskripsi` | Memperbarui data kampanye.<br>*(Mendukung Partial Update / hanya mengirim data yang diubah)*. |
| **Campaign** | `DELETE`| `/campaigns/:id` | Admin | - | Menghapus kampanye berdasarkan ID. |
| **Donation** | `POST` | `/donations` | Memerlukan<br>Token JWT | `campaign_id`, `nominal`,<br>`pesan_dukungan` | Membuat donasi baru. Transaksi akan memicu notifikasi antrean (RabbitMQ). |

## Contoh Request dan Response

#### 1. Mendaftarkan akun
* Endpoint: `POST /auth/register`

Request Body:
  ```json
  {
    "nama": "Budi Dermawan",
    "email": "budi.dermawan@contoh.com",
    "password": "rahasia_budi_123",
    "role": "donatur"
  }
```

Response (201 Created):
```json
{
  "message": "Registrasi berhasil!",
  "userId": 2
}
```
#### 2. Login dan Mendapatkaan token
* Endpoint: POST /auth/login

Request Body:
```json
{
  "email": "budi.dermawan@contoh.com",
  "password": "rahasia_budi_123"
}
```

Response (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "nama": "Budi Dermawan",
    "role": "donatur"
  }
}
```
#### 3. Menampilkan Semua Program Donasi
* Endpoint: GET /campaigns

Response (200 OK):
```json
[
  {
    "id": 2,
    "judul": "Bantuan Pembangunan Sekolah Terpencil",
    "deskripsi": "Sekolah di desa X butuh renovasi atap segera.",
    "target_dana": "150000000.00",
    "dana_terkumpul": "0.00",
    "status": "aktif",
    "created_at": "2026-05-09T07:43:42.000Z"
  },
  {
    "id": 1,
    "judul": "Bantuan Pembangunan Jembatan Desa",
    "deskripsi": "Jembatan ini sangat penting untuk akses sekolah anak-anak.",
    "target_dana": "85000000.00",
    "dana_terkumpul": "1750000.00",
    "status": "aktif",
    "created_at": "2026-05-09T03:25:38.000Z"
  }
]
```

#### 4. Membuat program baru (Admin)
* Endpoint: POST /campaigns
* Headers: Authorization: Bearer <token_jwt_admin>

Request:
```json
{
  "judul": "Bantuan Pembangunan Sekolah Terpencil",
  "deskripsi": "Sekolah di desa X butuh renovasi atap segera.",
  "target_dana": 150000000
}
```

Response (201 Created):
```json
{
  "message": "Kampanye berhasil dibuat",
  "id": 3
}
```

#### 5. Memperbarui Program (Admin / Partial Update)
* Endpoint: PUT /campaigns/:id (contoh: /campaigns/1)
* Headers: Authorization: Bearer <token_jwt_admin>

Request Body:
```json
{
  "target_dana": 200000000,
  "status": "selesai"
}
```

Response (200 OK):
```json
{
  "message": "Program berhasil diperbarui"
}
```

#### 6. Menghapus Program (Admin)
* Endpoint: DELETE /campaigns/:id (contoh: /campaigns/1)
* Headers: Authorization: Bearer <token_jwt_admin>

Response (200 OK):
```json
{
  "message": "Program berhasil dihapus"
}
```

#### 7. Melakukan Donasi
* Endpoint: POST /donations
* Headers: Authorization: Bearer <token_jwt_donatur>

Request Body:
```json
{
  "campaign_id": 1,
  "nominal": 500000,
  "pesan_dukungan": "Semoga bermanfaat untuk penerima ya"
}
```

Response (201 Created):
```json
{
  "message": "Donasi berhasil! Notifikasi sedang diproses.",
  "donationId": 15
}
