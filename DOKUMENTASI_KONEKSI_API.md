# 📡 Panduan Koneksi Frontend-Backend FaCare

## 🔗 Alur Koneksi Lengkap

### 1. **Login → Simpan User ID**

```
Frontend (Login.tsx)
  ↓
POST /api/auth/login
  ↓
Backend (auth.py)
  ↓
Simpan di localStorage:
- token
- user_id ✅ (sudah diperbaiki)
- role
- nama_lengkap
```

**Backend mengembalikan:**

```json
{
  "pesan": "Login berhasil!",
  "token": "eyJ0eXA...",
  "user_id": "uuid-user-123",
  "role": "masyarakat",
  "nama_lengkap": "Nama User"
}
```

### 2. **Ambil Kategori untuk Dropdown**

```
Frontend (CreateReport.tsx)
  ↓
GET /api/categories/
  ↓
Backend (categories.py)
  ↓
Tampilkan di select dropdown
```

**Backend mengembalikan:**

```json
{
  "data": [
    { "id": "uuid-cat-1", "nama_kategori": "Jalan Rusak" },
    { "id": "uuid-cat-2", "nama_kategori": "Lampu Mati" }
  ]
}
```

### 3. **Upload Foto Laporan**

```
Frontend (CreateReport.tsx)
  ↓
POST /api/reports/upload-foto (FormData)
  ↓
Backend (report.py)
  ↓
Simpan ke Supabase Storage
  ↓
Kembalikan URL publik
```

**Mengirim:**

```javascript
FormData {
  file: File (image)
}
```

**Backend mengembalikan:**

```json
{
  "pesan": "Foto berhasil diunggah!",
  "foto_url": "https://supabase.co/storage/v1/object/public/laporan/uuid-123.jpg"
}
```

### 4. **Buat Laporan Baru**

```
Frontend (CreateReport.tsx)
  ↓
POST /api/reports/
  ↓
Backend (report.py)
  ↓
Simpan ke Supabase (tabel: reports)
  ↓
Redirect ke Home
```

**Mengirim:**

```json
{
  "user_id": "uuid-user-123", // ← dari localStorage
  "category_id": "uuid-cat-1", // ← dari select dropdown
  "deskripsi": "Jalan berlubang besar",
  "latitude": 0.5071,
  "longitude": 101.4478,
  "foto_url": "https://supabase.co/storage/v1/object/public/laporan/uuid.jpg"
}
```

**Backend mengembalikan:**

```json
{
  "pesan": "Laporan berhasil dikirim!",
  "data": { "id": 1, "status": "Menunggu", ... }
}
```

---

## ✅ Checklist Koneksi

- [x] **Backend CORS** - Sudah dikonfigurasi di `main.py`
- [x] **Auth endpoint** - Mengembalikan `token` + `user_id` ✅
- [x] **Categories endpoint** - Sudah ada di `categories.py`
- [x] **Reports endpoint** - Bisa upload foto + buat laporan
- [x] **API client** - Sudah lengkap di `lib/api.ts`
- [x] **Frontend Login** - Simpan user_id ke localStorage ✅
- [x] **Frontend CreateReport** - Ambil user_id dari localStorage ✅
- [x] **Schema validation** - category_id diterima sebagai string ✅

---

## 🚀 Cara Menjalankan

### Terminal 1: Backend

```bash
cd backend-facare
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Server akan berjalan di: `http://127.0.0.1:8000`

### Terminal 2: Frontend

```bash
cd frontend-facare
npm install
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

---

## 🔍 Testing API dengan Postman

### 1. Login

```
POST http://127.0.0.1:8000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 2. Ambil Kategori

```
GET http://127.0.0.1:8000/api/categories/
```

### 3. Upload Foto

```
POST http://127.0.0.1:8000/api/reports/upload-foto
Headers: Authorization: Bearer {token}
Body: form-data
  - file: (pilih gambar)
```

### 4. Buat Laporan

```
POST http://127.0.0.1:8000/api/reports/
Content-Type: application/json
Authorization: Bearer {token}

{
  "user_id": "uuid-dari-login",
  "category_id": "uuid-dari-categories",
  "deskripsi": "Jalan berlubang",
  "latitude": 0.5071,
  "longitude": 101.4478,
  "foto_url": "url-dari-upload"
}
```

---

## 🐛 Troubleshooting

### Error: "CORS error" atau "Cross-Origin Request Blocked"

**Solusi:** Backend CORS sudah diatur untuk menerima semua origin (`allow_origins=["*"]`)

### Error: "user_id is required"

**Solusi:** Pastikan sudah login terlebih dahulu (user_id disimpan di localStorage)

### Error: "Failed to fetch reports"

**Solusi:**

- Backend sudah running di port 8000?
- Frontend mencoba akses `http://127.0.0.1:8000`?

### Kategori tidak muncul di dropdown

**Solusi:**

- Pastikan ada data di tabel `categories` di Supabase
- Check console browser untuk melihat API response

### Foto tidak terupload

**Solusi:**

- Pastikan bucket `laporan` ada di Supabase Storage
- Check di Supabase console: Storage → Buckets

---

## 📝 File yang Sudah Diperbaiki

✅ `backend-facare/routers/auth.py` - Mengembalikan user_id pada login
✅ `backend-facare/schemas/schema.py` - category_id sebagai string
✅ `frontend-facare/src/pages/CreateReport.tsx` - Menggunakan user_id dari localStorage

---

## 📚 Struktur Folder Project

```
FaCare/
├── backend-facare/
│   ├── main.py                    # FastAPI setup + CORS
│   ├── database.py                # Supabase client
│   ├── routers/
│   │   ├── auth.py               # Login/Register
│   │   ├── categories.py         # Ambil kategori
│   │   └── report.py             # CRUD laporan
│   └── schemas/
│       └── schema.py             # Validasi data
│
└── frontend-facare/
    ├── src/
    │   ├── lib/
    │   │   └── api.ts            # API client config
    │   └── pages/
    │       ├── Login.tsx          # Login page
    │       └── CreateReport.tsx   # Form laporan
    └── ...
```

---

## 🎯 Next Steps

1. ✅ Backend mengembalikan user_id
2. ✅ Frontend menggunakan user_id dari localStorage
3. ✅ API endpoints sudah terhubung
4. ⏳ Setup database Supabase dengan tabel yang tepat
5. ⏳ Upload storage bucket untuk foto

Semua sudah siap untuk dijalankan! 🚀
