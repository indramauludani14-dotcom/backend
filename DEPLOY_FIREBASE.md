# Deploy Backend ke Firebase

## Persiapan

1. **Install Firebase CLI** (jika belum):
```bash
npm install -g firebase-tools
```

2. **Login ke Firebase**:
```bash
firebase login
```

3. **Inisialisasi Firebase Project**:
```bash
firebase init functions
```
- Pilih project existing atau buat baru
- Pilih Python sebagai runtime
- Jangan overwrite file yang sudah ada

## Deploy

### Deploy Full (Functions + Hosting):
```bash
firebase deploy
```

### Deploy Functions Only:
```bash
firebase deploy --only functions
```

### Deploy Hosting Only:
```bash
firebase deploy --only hosting
```

## Testing Lokal

Jalankan emulator Firebase:
```bash
firebase emulators:start
```

Backend akan jalan di: http://localhost:5001/[project-id]/us-central1/backend

## Struktur File

```
backend/
├── main.py                    # Firebase entry point
├── firebase.json              # Firebase config
├── .firebaseignore           # Files to ignore
├── requirements.txt          # Python dependencies
├── api/
│   └── index.py              # Flask app
├── app/                      # Controllers, models, services
├── database/                 # Database connection
└── routes/                   # API routes
```

## Environment Variables

Set di Firebase Functions:
```bash
firebase functions:config:set \
  db.host="virtualign.my.id" \
  db.user="virtuali_virtualuser" \
  db.password="indra140603" \
  db.name="virtuali_virtualign"
```

Atau gunakan `.env` file untuk development lokal.

## Troubleshooting

### Error: Size limit exceeded
Firebase Functions memiliki limit 100MB untuk deployment package.
- Pastikan file besar sudah ada di `.firebaseignore`
- Hapus `*.pkl`, `*.xlsx`, uploads dari deployment

### Error: Database connection timeout
- Set timeout lebih besar di `database/connection.py`
- Atau gunakan Cloud SQL Proxy untuk koneksi lebih stabil

### Error: Module not found
- Pastikan semua dependencies ada di `requirements.txt`
- Jalankan `pip install -r requirements.txt` untuk test lokal

## URL Deployment

Setelah deploy, backend akan tersedia di:
```
https://[project-id].web.app/api/status
https://[project-id].cloudfunctions.net/backend/api/status
```

## Rollback

Jika ada masalah, rollback ke versi sebelumnya:
```bash
firebase functions:delete backend
firebase deploy --only functions
```
