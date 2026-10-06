DOKUMENTASI RESMI & SOP SERAH TERIMA
PORTAL ADMINISTRASI SANTRI — DQH AL-HUDA SUKOHARJO
BAGIAN 1 — IDENTITAS SISTEM
Nama aplikasi	:	Portal Administrasi & Pemantauan Santri DQH AL-HUDA
Alamat publik	:	https://dqhalhudasukoharjo-a11y.github.io/dqhalhuda-administrasi/

Repository	:	GitHub dqhalhudasukoharjo-a11y/dqhalhuda-administrasi (branch main)
Database	:	Supabase project dqh-alhuda (mmntvfmwiganpovdupxv.supabase.co)
Akun pemilik	:	dqhalhudasukoharjo@gmail.com (wajib diurus saat serah terima)
Sumber data resmi	:	Sistem Braja pondok (Braja = buku induk; web app = cermin wali)
Kontak pondok	:	WA 088215602211
BAGIAN 2 — CARA KERJA
1.	Admin login, input pembayaran → data otomatis dikirim (push) ke Supabase
2.	Supabase menyimpan seluruh data dalam satu blob JSON
3.	Wali login (NIS + PIN) → aplikasi menarik (pull) data terbaru dari Supabase
4.	Menulis butuh Kode Sinkronisasi; membaca publik tanpa password
BAGIAN 3 — DAFTAR FILE & ATURAN
index.html	- Inti aplikasi (JANGAN diedit sembarangan)
sync.js	- Kurir Supabase (jarang diubah)
fitur-tambahan.js	- Overlay fitur keamanan & UI (ganti utuh bila ada versi baru)
fitur-tambahan.css	- Overlay tampilan (tambah/ganti blok CSS saja)
fitur-keuangan.js	- Overlay dashboard keuangan (ganti utuh bila ada versi baru)
sw.js	- Service worker (WAJIB naikkan versi setiap edit file lain)
manifest.webmanifest	- Identitas PWA (jarang diubah)
logo.png,icon-512	- Logo & ikon (jangan ganti nama)
ATURAN EMAS: edit file → commit → naikkan versi sw.js → refresh paksa
BAGIAN 4 — AKUN & KUNCI RAHASIA
Username admin	:	admin (tetap)
Password admin	:	Per perangkat (tersimpan lokal; di server hanya __HIDDEN__)
Kode Sinkronisasi	:	DQH-SINKRON-2026-ALHUDA (kunci brankas)
PIN wali	:	6 digit terakhir NIS
Anon key Supabase	:	Tertulis di sync.js (publik by design, aman)
LUPA PASSWORD ADMIN?
Di Supabase SQL Editor, jalankan (ganti PASSWORD_BARU):
update public.app_state
set payload = jsonb_set(payload, '{users,0,password}', '"PASSWORD_BARU"')
where id = 1;
Lalu login & ganti lagi lewat tombol Ganti Password.
PERANGKAT ADMIN BARU?
Halaman login → tombol "Setel password admin di perangkat ini"
→ masukkan Kode Sinkronisasi + password baru
BAGIAN 5 — RIWAYAT PEKERJAAN
1.	Fondasi: aplikasi satu file (login, grid SPP, pembayaran, backup/restore)
2.	Import Braja: parser Excel 3 file (55 santri, snapshot, 428 transaksi)
3.	Perbaikan logika: beranda wali, tombol Hapus TA, generate TA
4.	Publikasi: GitHub Pages, PWA install, perbaikan nama file
5.	Database cloud: Supabase setup, sync.js, debug sinkronisasi
6.	Keamanan: password per-perangkat, modal Ganti Password
7.	Fitur overlay: favicon, mode gelap, tren 12 bulan, kwitansi modern
8.	Perbaikan bisnis: chip akurat, pembayaran lintas TA, label TA
9.	Dashboard keuangan: pemasukan per bulan & per TA
10.	Tampilan: responsif HP kecil-PC, animasi, perbaikan grid
BAGIAN 6 — SOP OPERASIONAL RUTIN
[HARIAN]
Input pembayaran di Braja
→ menu Pembayaran
→ pilih santri
→ pilih kewajiban
→ Simpan
→ kwitansi muncul
[MINGGUAN — Jumat]
•	Backup JSON (simpan ber-tanggal di laptop + Google Drive)
•	Mampir dashboard Supabase (agar tidak pause)
[BULANAN — setelah tgl 10]
•	Menu Laporan & WA → kirim pengingat per santri menunggak
•	Rekonsiliasi: bandingkan tabel Pemasukan per Bulan dengan Braja
Bila selisih, telusuri via console (F12):
state.pembayaran.filter(p=>(p.tanggal||"").slice(0,7)==="2026-09")
  .forEach(p=>console.log(p.tanggal,p.no,p.nama,p.nominal));
Hapus baris keliru:
state.pembayaran=state.pembayaran.filter(p=>p.no!=="NOMOR_TRX");
saveState();render();
[TAHUNAN — Juli]
1.	Naikkan kelas & luluskan kelas 3 (Data Santri)
2.	Generate TA baru (Tahun Ajaran & Tarif)
3.	Tagihkan Bulan Depan
4.	Sesuaikan tarif khusus bila ada
[IMPORT ULANG RIWAYAT BRAJA]
JANGAN import menimpa. Bersihkan dulu via console:
state.pembayaran=[];saveState();render();
Lalu Import & Backup → Slot 3
BAGIAN 7 — TROUBLESHOOTING CEPAT
Tampilan lama	→ Naikkan versi sw.js + refresh paksa
Login admin gagal (perangkat baru)	→ Tombol Setel + Kode Sinkronisasi
Tidak ada toast "Tersinkron"	→ Console: SYNC.push() lalu baca alert
Angka beda dengan Braja	→ Prosedur rekonsiliasi (Bagian 6)
Console merah data-pondok.json 404	→ Abaikan, tidak berbahaya
Situs tidak bisa dibuka	→ Login Supabase dashboard; cek GitHub Pages
Kwitansi/logo tidak muncul	→ Pastikan logo.png ada di root repo
BAGIAN 8 — ATURAN KEAMANAN
DO:
✓	Simpan Kode Sinkronisasi & password admin di tempat aman
✓	Japri NIS+PIN per wali
✓	Backup mingguan
✓	Rekonsiliasi bulanan
✓	Tambah collaborator untuk staf baru
DON'T:
✗	Menyebarkan Kode Sinkronisasi/CSV akun di grup
✗	Mengedit index.html sembarangan
✗	Import Slot 3 dua kali tanpa membersihkan
✗	Menganggap web app menggantikan Braja
BAGIAN 9 — CHECKLIST SERAH TERIMA
☐	Tambahkan pengganti sebagai Collaborator GitHub
☐	Tambahkan pengganti di Supabase (Project Settings → Members)
☐	Serahkan Kode Sinkronisasi via saluran pribadi
☐	Serahkan folder Backup JSON mingguan (Google Drive)
☐	Cetak dokumen ini + QR code link aplikasi
☐	Demo: login admin, input pembayaran, kwitansi, login wali, pengingat WA
☐	Tandatangani berita acara serah terima
BAGIAN 10 — WISHLIST PENGEMBANGAN (opsional)
1.	Pengingat WA otomatis tiap tgl 10 (gateway Fonnte + penjadwal)
2.	Kartu login wali ber-QR cetak
3.	Multi-admin berperan
4.	PIN acak untuk santri baru
5.	Domain sendiri (mis. admin.dqhalhuda.sch.id)
Disusun dengan rasa terima kasih. Semoga portal ini terus memudahkan wali santri dan menjadi amal jariyah bagi semua yang membangun dan menjaganya.
— Administrasi DQH AL-HUDA
