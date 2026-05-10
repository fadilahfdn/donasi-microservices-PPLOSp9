# Platform Donasi Berbasis Microservices

## Arsitektur Sistem
<br> Proyek  ini terdiri dari beberapa layanan independen yang berkomunikasi melalui API Gateway dan Message Broker:

1. API Gateway (Port 3000): Single entry point of Entry untuk semua *request* dari klien. Dilengkapi dengan *logging* otomatis.
2. Auth Service (Port 3001): Mengelola autentikasi pengguna, registrasi, dan penerbitan JSON Web Token (JWT).
3. Campaign Service (Port 3002): Mengelola operasi CRUD untuk entitas program donasi. Mendukung *Partial Updates* dan dibatasi dengan otorisasi berbasis peran (RBAC).
4. Donation Service (Port 3003): Menangani logika transaksi masuk
5. Worker / Notifikasi: Bertindak sebagai consumer asinkron untuk memproses antrean pesan donasi dari RabbitMQ

## Teknologi yang digunakan
- Backend: Node.js Express.js
- Database: MariaDB (modul 'mysql2')
- Message Broker: RabbitMQ
- Keamanan: JWT, bcryptjs

## Panduan instalasi dan eksekusi
<br> Pastikan sistem sudah terinstal Node.js, MariaDB, dan RabbitMQ

### 1. Persiapan Environment
<br>Buat file `.env` pada masing-masing folder layanan (Gateway, Auth, Campaign, Donation) dengan variabel yang sesuai, seperti:  
```env
PORT=300x
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password_anda
DB_NAME=nama_database_layanan
JWT_SECRET=rahasia_super_kuat
RABBITMQ_URL=amqp://localhost
```

### 2. Menjalankan Layanan
<br> Karena ini adalah microservices, setiap layanan harus dijalankan di terminal yang terpisah. Buka 5 terminal dan jalankan perintah berikut secara berurutan dari root folder proyek:

- Terminal 1(API Gateway):  
node gateway/server.js
- Terminal 2(Auth Service)  
node services/auth-service/server.js
- Terminal 3(Campaign Service):  
node services/campaign-service/server.js
- Terminal 4(Donation Service):  
node services/donation-service/server.js
- Terminal 5(RabbitMQ Worker):  
node services/donation-service/worker.js

## Dokumentasi API (Endpoint)

*Catatan: Semua request wajib diarahkan ke **API Gateway** melalui `http://localhost:3000`.*

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
