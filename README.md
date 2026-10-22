# Granpa Cats AI — panduan pasang di Vercel (bisa dari HP)

Isi paket:
- public/index.html  → situs lengkap (explorer + family tree, Ask Granpa, chat kucing, launch form)
- api/ask.js         → proxy aman ke Claude API (API key tersimpan di server, bukan di halaman)
- api/cats.js        → kucing komunitas (profil saja), disimpan di Upstash Redis
- api/config.js      → mengirim contract address dan tautan token ke halaman
- api/_lib.js        → kode bersama (prompt, rate limit). Awalan _ itu disengaja, jangan diganti
- vercel.json        → konfigurasi Vercel

## Langkah dari HP (±20 menit)
1. Ekstrak granpacats-site.zip dengan aplikasi Files atau ZArchiver.
2. Buat akun di github.com, lalu buat repository baru bernama granpacats (Private juga boleh).
3. Buat 6 file di repo itu: Add file → Create new file. Di kolom nama ketik path lengkapnya
   (mengetik `api/ask.js` otomatis membuat folder api), tempel isi file, lalu Commit changes.
   File yang dibuat: public/index.html, api/_lib.js, api/ask.js, api/cats.js, api/config.js, vercel.json.
   Tips: buka tiap file dengan aplikasi teks, Select all, Copy, lalu Paste di GitHub.
4. Buka vercel.com, Continue with GitHub, Add New → Project, pilih repo granpacats.
   Framework Preset: Other. Biarkan setelan lain (vercel.json sudah mengatur folder public). Tekan Deploy.
5. Pasang API key: di project Vercel buka Settings → Environment Variables, tambahkan
   ANTHROPIC_API_KEY = key dari console.anthropic.com. Lalu Deployments → titik tiga → Redeploy.
6. Penyimpanan kucing komunitas: di project buka Storage → Create/Connect → pilih Upstash Redis
   (ada paket gratis), sambungkan ke project ini. Variabel akses terisi otomatis. Redeploy sekali lagi.
7. Domain: Settings → Domains → Add granpacats.xyz, lalu isi record DNS yang ditampilkan Vercel
   di tempat kamu membeli domain.
8. Buka situsnya dan coba explorer, Ask Granpa, dan chat dengan kucing.

Tanpa langkah 6, semua fitur tetap jalan kecuali kucing komunitas (form launch menampilkan "tidak tersedia").
Tanpa langkah 5, chat AI menjawab error.

## Variabel lingkungan (Settings → Environment Variables)
- ANTHROPIC_API_KEY (wajib untuk chat AI)
- MODEL (opsional, default claude-haiku-5-5, hemat)
- CONTRACT dan LAUNCH_URL (diisi setelah token launch, lihat bagian bawah)

## Jaga biaya dan keamanan
- Set batas pengeluaran (spend limit) di console.anthropic.com supaya tagihan tidak membengkak.
- Fungsi sudah membatasi 20 chat per 10 menit per IP dan 3 launch kucing per jam per IP. Batas ini akurat
  kalau Upstash Redis tersambung. Tanpa Redis, batasnya hanya best effort.
- Domain *.vercel.app juga diizinkan memanggil API, jadi kamu bisa tes sebelum domain terpasang.

## Meluncurkan $GCAT di Robinhood Chain lewat Pons
Robinhood Chain adalah blockchain EVM Layer 2 (keluarga Arbitrum Orbit), chain ID 4663, gas dibayar dengan ETH. Pons adalah launchpad independen di chain itu, bukan produk Robinhood. Situs ini tidak boleh mengesankan kerja sama atau dukungan dari Robinhood Markets atau Pons (sudah ada penafian di footer), dan jangan pakai logo Robinhood.

Sebelum launch:
1. Pakai wallet EVM khusus yang baru (MetaMask, Rabby, dll). Simpan seed phrase offline dan jangan pernah dibagikan.
2. Tambahkan jaringan: nama Robinhood Chain, chain ID 4663, native asset ETH, RPC https://rpc.mainnet.chain.robinhood.com. Cek ulang detail ini di dokumentasi resmi Robinhood Chain.
3. Siapkan ETH di chain itu untuk gas dan biaya launch (Pons V2 terakhir tercatat sekitar 0,0005 ETH, tapi tarif bisa berbeda per launch). Lihat angka pasti di layar Pons sebelum konfirmasi.
4. Siapkan nama, ticker (GCAT), gambar, dan deskripsi. Siapkan juga akun X resmi dan tautkan ke granpacats.xyz.

Saat launch (kamu sendiri yang menekan tombolnya, saya tidak bisa melakukannya):
1. Buka situs resmi Pons, hubungkan wallet, pastikan jaringan Robinhood Chain, isi detail token, atur creator tax per launch bila ada, lalu konfirmasi transaksi.
2. Salin contract address (0x...) dan tautan halaman token dari Pons.
3. Di Vercel: Project → Settings → Environment Variables, tambahkan `CONTRACT` dan `LAUNCH_URL`, lalu Redeploy. Situs menampilkan kontrak, tombol Copy, dan tautan ke Pons. Market cap live memakai DexScreener bila chain ini sudah didukung. Kalau belum, kartu $GCAT menampilkan "See live on Pons".
4. Umumkan contract address HANYA dari akun resmi dan situs ini. Di Pons siapa saja bisa meluncurkan token dengan nama atau gambar apa pun, jadi tiruan $GCAT hampir pasti muncul. Tidak ada admin resmi yang meminta seed phrase atau DM duluan.

Prinsip jujur (lindungi pembeli dan dirimu):
- Kalau kamu membeli token sendiri saat launch, umumkan jumlahnya secara terbuka. Begitu juga creator fee yang kamu terima dari tiap transaksi.
- Jangan menjanjikan keuntungan atau menyebut harga akan naik. Itu juga sudah dilarang di persona AI.
- Fitur yang masih rencana (kitten, royalti, decision log on-chain) ditulis sebagai rencana, bukan fitur jalan.
- Cek aturan hukum di negaramu (aset kripto, pajak, promosi) sebelum launch. Saya bukan penasihat hukum atau keuangan.

## Catatan penting
- Kucing komunitas hanya profil (tanpa token), maksimal 3 launch per jam per IP dan 500 total.
  Karena siapa saja bisa mengirim, pantau isinya (spam, nama menyesatkan, meniru token lain).
  Pertimbangkan Cloudflare Turnstile dan moderasi sebelum dibuka luas.
- Satu-satunya token adalah $GCAT. Market cap hanya ditampilkan untuk $GCAT, dari data publik.
