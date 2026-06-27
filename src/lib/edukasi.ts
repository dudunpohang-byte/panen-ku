export type EduLink = { label: string; url: string };

export type EduStep = {
  title: string;
  description: string;
};

export type EduTip = {
  icon: string;
  text: string;
};

export type EduTopic = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  difficulty: "pemula" | "menengah" | "mahir";
  readTime: string;
  summary: string;
  highlights: string[];
  /** Tahapan menanam dari awal sampai panen */
  steps: EduStep[];
  tips: EduTip[];
  links: EduLink[];
};

export const edukasiTopics: EduTopic[] = [
  // ===== CABAI =====
  {
    id: "menanam-cabai",
    title: "Panduan Lengkap Menanam Cabai",
    emoji: "🌶️",
    color: "from-red-500 to-rose-600",
    difficulty: "menengah",
    readTime: "10 menit",
    summary:
      "Panduan menanam cabai merah keriting & rawit dari semai hingga panen. Cocok untuk lahan 1 hektar dengan hasil optimal 10-15 ton.",
    highlights: [
      "🌱 Semai benih 21-28 hari sebelum pindah tanam",
      "🌞 Butuh sinar matahari penuh 6-8 jam/hari",
      "💧 Irigasi tetes 2-3 hari sekali, hindari genangan",
      "🧪 pH tanah ideal 5.5-6.5",
    ],
    steps: [
      {
        title: "Persiapan Benih & Persemaian",
        description:
          "Rendam benih dalam air hangat (50°C) selama 15 menit. Semai di tray 72 lubang dengan media campuran arang sekam + kompos (1:1). Letakkan di tempat teduh. Semprot air 2x sehari. Benih mulai berkecambah hari ke-7 hingga 14.",
      },
      {
        title: "Persiapan Lahan",
        description:
          "Olah tanah sedalam 30-40 cm, taburi dolomit 1-2 ton/ha untuk menaikkan pH. Buat bedengan lebar 100 cm, tinggi 30 cm, jarak antar bedengan 50 cm. Aplikasikan pupuk kandang 10-15 ton/ha, campur rata 7 hari sebelum tanam. Pasang mulsa plastik hitam perak.",
      },
      {
        title: "Pindah Tanam (21-28 HSS)",
        description:
          "Bibit siap pindah jika sudah memiliki 4-5 daun sejati (usia 21-28 hari). Pindahkan ke bedengan dengan jarak tanam 60x60 cm (populasi ~20.000 tanaman/ha). Tanam sore hari. Segera siram air secukupnya dan pasang ajir/bamboo penyangga.",
      },
      {
        title: "Pemupukan & Perawatan",
        description:
          "Umur 7 HST: NPK 16-16-16 dosis 5 gram/tanaman. Umur 30 HST: NPK 12-12-17-2 dosis 10 gram + KNO3 3 gram. Umur 45 & 60 HST: ulangi. Bersihkan gulma rutin. Pangkas daun bawah (40 cm dari tanah) setelah tanaman tinggi 50 cm.",
      },
      {
        title: "Pengendalian Hama & Penyakit",
        description:
          "Hama utama: kutu daun (semprot insektisida nabati), thrips (perangkap kuning), ulat buah (Bacillus thuringiensis). Penyakit: layu fusarium (cabut & bakar tanaman), antraknosa (semprot fungisida berbahan aktif mankozeb). Lakukan rotasi tanaman setiap musim.",
      },
      {
        title: "Panen & Pascapanen",
        description:
          "Panen pertama umur 75-90 HST. Ciri siap panen: buah berwarna merah 70-80%, tekstur keras. Panen setiap 3-5 hari sekali selama 3-4 bulan. Simpan di suhu 8-10°C, tahan 10-14 hari. Potensi hasil: 10-15 ton/ha untuk cabai merah, 8-10 ton untuk rawit.",
      },
    ],
    tips: [
      { icon: "🌱", text: "Gunakan benih bersertifikat varietas hibrida seperti PM999 atau Kencana" },
      { icon: "💧", text: "Pasang irigasi tetes untuk efisiensi air hingga 60%" },
      { icon: "🛡️", text: "Tanam refugia (bunga kenikir) di pinggir bedengan sebagai habitat musuh alami" },
      { icon: "📅", text: "Catat jadwal panen untuk antisipasi permintaan pasar" },
    ],
    links: [
      { label: "🎬 Cara Semai Cabai yang Benar", url: "https://www.youtube.com/results?search_query=cara+semai+cabai+yang+benar" },
      { label: "🌿 Pupuk & Perawatan Cabai", url: "https://www.youtube.com/results?search_query=pupuk+tanaman+cabai+agar+berbuah+lebat" },
      { label: "💊 Atasi Hama & Penyakit Cabai", url: "https://www.youtube.com/results?search_query=hama+penyakit+tanaman+cabai+dan+cara+mengatasinya" },
    ],
  },

  // ===== WORTEL =====
  {
    id: "menanam-wortel",
    title: "Panduan Menanam Wortel",
    emoji: "🥕",
    color: "from-orange-500 to-amber-600",
    difficulty: "menengah",
    readTime: "8 menit",
    summary:
      "Cara budidaya wortel di dataran tinggi (800-1200 mdpl) hasil maksimal 20-30 ton/ha. Cocok untuk lahan terbuka dengan tanah gembur.",
    highlights: [
      "🏔️ Tanam di dataran tinggi 800-1200 mdpl",
      "🪨 Butuh tanah gembur, dalam, dan bebas batu",
      "🌱 Semai langsung di bedengan, tidak perlu pindah tanam",
      "⏳ Panen umur 90-120 hari tergantung varietas",
    ],
    steps: [
      {
        title: "Persiapan Lahan",
        description:
          "Olah tanah sedalam 40-50 cm karena wortel membutuhkan tanah dalam untuk pertumbuhan umbi maksimal. Gemburkan tanah dengan cangkul atau traktor. Buat bedengan lebar 100 cm, tinggi 30 cm. Aplikasikan pupuk kandang 15-20 ton/ha + NPK 16-16-16 200 kg/ha sebagai pupuk dasar. Pastikan pH tanah 5.8-6.8. Taburi dolomit 1 ton/ha 2 minggu sebelum tanam jika pH terlalu asam.",
      },
      {
        title: "Penanaman Benih",
        description:
          "Tanam benih langsung di bedengan (tidak perlu semai). Buat alur sedalam 1 cm dengan jarak antar baris 20 cm. Campur benih dengan pasir halus (1:10) agar sebar merata. Tabur tipis di alur, tutup dengan tanah halus setebal 0.5 cm. Siram dengan spray halus agar benih tidak hanyut.",
      },
      {
        title: "Penjarangan & Perawatan",
        description:
          "Setelah bibit berumur 2-3 minggu (3-4 daun), lakukan penjarangan dengan menyisakan jarak 5-10 cm antar tanaman. Bersihkan gulma setiap 2 minggu. Beri pupuk susulan NPK 16-16-16 150 kg/ha pada umur 30 dan 60 HST. Siram 2x sehari jika tidak hujan.",
      },
      {
        title: "Pengendalian OPT",
        description:
          "Hama utama: ulat tanah (semprot insektisida nabati daun mimba), nematoda (rotasi tanaman, gunakan pupuk hijau). Penyakit: bercak daun cercospora (semprot fungisida mankozeb), busuk umbi (perbaiki drainase). Hindari tanah becek yang menyebabkan cacat umbi.",
      },
      {
        title: "Panen & Penyimpanan",
        description:
          "Wortel siap panen umur 90-120 hari. Ciri: daun mulai menguning, pangkal umbi berdiameter 3-5 cm. Panen pagi atau sore hari dengan cara dicabut perlahan. Potong daun menyisakan 2-3 cm. Sortir ukuran, cuci bersih, simpan di suhu 0-2°C dengan kelembaban 95% (tahan 4-6 bulan).",
      },
    ],
    tips: [
      { icon: "🪨", text: "Pastikan tanah bebas dari batu kerikil agar umbi tidak bercabang" },
      { icon: "🌾", text: "Taburkan mulsa jerami untuk menjaga kelembaban dan menekan gulma" },
      { icon: "⏰", text: "Jangan terlambat panen! Wortel yang terlalu tua akan berserat dan keras" },
      { icon: "🔄", text: "Rotasi tanaman dengan kacang-kacangan untuk memulihkan nitrogen" },
    ],
    links: [
      { label: "🎬 Cara Menanam Wortel dari Awal", url: "https://www.youtube.com/results?search_query=cara+menanam+wortel+dari+awal" },
      { label: "🌿 Pupuk Agar Wortel Besar", url: "https://www.youtube.com/results?search_query=pupuk+wortel+agar+besar" },
    ],
  },

  // ===== STROBERI =====
  {
    id: "menanam-stroberi",
    title: "Budidaya Stroberi Dataran Tinggi",
    emoji: "🍓",
    color: "from-red-400 to-pink-500",
    difficulty: "mahir",
    readTime: "12 menit",
    summary:
      "Panduan lengkap menanam stroberi premium di dataran tinggi (1000-1500 mdpl) menggunakan sistem mulsa plastik hasil 30-40 ton/ha/tahun.",
    highlights: [
      "🏔️ Optimal di ketinggian 1000-1500 mdpl",
      "🌱 Perbanyak dengan stolon (anakan), bukan biji",
      "🍓 Panen 3-4 bulan setelah tanam, terus hingga 2 tahun",
      "🧪 Pemupukan setiap 7-10 hari dengan pupuk cair",
    ],
    steps: [
      {
        title: "Pembibitan Stroberi",
        description:
          "Stroberi diperbanyak secara vegetatif menggunakan stolon (sulur). Pilih stolon dari indukan sehat usia 4-8 bulan. Potong stolon yang sudah berakar (3-4 daun) lalu pindahkan ke polybag 10x15 cm. Media bibit: campuran cocopeat + kompos + arang sekam (2:1:1). Siram 2x sehari, beri naungan 50%.",
      },
      {
        title: "Persiapan Lahan & Bedengan",
        description:
          "Olah tanah sedalam 30 cm, taburi dolomit 1.5 ton/ha. Buat bedengan lebar 80 cm, tinggi 40 cm, jarak antar bedengan 60 cm. Aplikasi pupuk kandang 20 ton/ha + NPK 15-15-15 300 kg/ha + KNO3 100 kg/ha. Pasang mulsa plastik hitam perak. Buat lubang tanam jarak 30x30 cm (zigzag).",
      },
      {
        title: "Penanaman",
        description:
          "Pindahkan bibit stoberi ke lubang tanam pada sore hari. Jangan tanam terlalu dalam (akar tertimbun) atau terlalu dangkal (akar kering). Kedalaman ideal: mahkota batang tepat di permukaan tanah. Siram segera. Pasang ajir atau bambu untuk mencegah buah menyentuh tanah. Populasi: ~50.000 tanaman/ha.",
      },
      {
        title: "Pemupukan & Irigasi",
        description:
          "Pemupukan setiap 7-10 hari melalui irigasi (fertigasi) atau kocor. Dosis per tanaman: 2 gram NPK 15-15-15 + 1 gram KNO3 + 0.5 gram MgSO4. Setelah mulai berbunga tambahkan 2 gram NPK 12-12-17-2. Irigasi tetes 15-30 menit/hari tergantung cuaca. Jaga kelembaban tanah 70-80%.",
      },
      {
        title: "Perawatan & Pemangkasan",
        description:
          "Pangkas daun tua/kuning setiap minggu untuk sirkulasi udara. Buang stolon yang tidak diperlukan agar nutrisi fokus ke buah. Lakukan penjarangan bunga jika terlalu banyak. Beri naungan paranet 30-50% untuk melindungi dari hujan deras dan sinar berlebih. Pasang perangkap kuning untuk hama.",
      },
      {
        title: "Panen & Pemasaran",
        description:
          "Panen dimulai umur 3-4 bulan setelah tanam. Ciri siap panen: buah merah 80-100%, buah keras. Panen setiap 2-3 hari sekali, lakukan pagi hari. Petik dengan tangkai. Sortir grade A (besar >15g), B (10-15g), C (kecil/reject). Simpan di suhu 0-2°C, tahan 5-7 hari. Potensi hasil 30-40 ton/ha/tahun.",
      },
    ],
    tips: [
      { icon: "🍓", text: "Gunakan varietas unggul seperti Earlibrite, Florida, atau Sweet Charlie" },
      { icon: "🧪", text: "pH tanah ideal 5.5-6.5 — lakukan tes tanah setiap 3 bulan" },
      { icon: "💧", text: "Hindari penyiraman di daun untuk cegah penyakit jamur" },
      { icon: "♻️", text: "Ganti bibit setiap 2 tahun untuk menjaga produktivitas" },
    ],
    links: [
      { label: "🎬 Cara Menanam Stroberi di Polybag", url: "https://www.youtube.com/results?search_query=cara+menanam+stroberi+di+polybag" },
      { label: "🌿 Pupuk Stroberi Agar Berbuah Besar", url: "https://www.youtube.com/results?search_query=pupuk+stroberi+agar+manis+dan+besar" },
      { label: "🛡️ Hama & Penyakit Stroberi", url: "https://www.youtube.com/results?search_query=hama+penyakit+tanaman+stroberi" },
    ],
  },

  // ===== SURAUNG / PARE =====
  {
    id: "menanam-suraung",
    title: "Budidaya Suraung (Pare)",
    emoji: "🥒",
    color: "from-green-600 to-emerald-700",
    difficulty: "pemula",
    readTime: "8 menit",
    summary:
      "Panduan menanam pare/suraung menggunakan lanjaran (rambatan) hasil 15-20 ton/ha. Tanaman ini mudah tumbuh di dataran rendah hingga sedang.",
    highlights: [
      "🌿 Tanaman rambat, butuh lanjaran/para-para",
      "☀️ Tumbuh baik di dataran rendah 0-500 mdpl",
      "🌸 Bunga jantan & betina terpisah (dibantu penyerbukan)",
      "⏳ Panen umur 60-75 hari setelah tanam",
    ],
    steps: [
      {
        title: "Persiapan Benih",
        description:
          "Rendam benih pare dalam air hangat (40°C) selama 6-12 jam untuk memecah dormansi. Keringkan angin-angin. Semai dalam polybag kecil (5x10 cm) berisi media tanah + kompos (1:1). Letakkan di tempat teduh. Benih berkecambah dalam 3-7 hari. Bibit siap pindah umur 14-21 hari dengan 2-3 daun.",
      },
      {
        title: "Persiapan Lahan & Lanjaran",
        description:
          "Olah tanah sedalam 30 cm. Buat bedengan lebar 100 cm, tinggi 30 cm. Aplikasi pupuk kandang 10 ton/ha + NPK 16-16-16 200 kg/ha. Buat lanjaran/para-para setinggi 200 cm dari bambu. Jarak tanam 100x100 cm (populasi ~10.000 tanaman/ha). Pasang ajir di setiap lubang tanam.",
      },
      {
        title: "Penanaman & Pelatihan Rambat",
        description:
          "Pindahkan bibit ke lubang tanam. Segera arahkan batang tanaman ke lanjaran dengan tali rafia. Tanaman akan merambat sendiri setelah terarah. Pangkas cabang lateral hingga ketinggian 50 cm untuk merangsang pertumbuhan utama. Siram 2x sehari.",
      },
      {
        title: "Pemupukan & Penyerbukan",
        description:
          "Pupuk susulan NPK 16-16-16 150 kg/ha pada umur 15 dan 30 HST. Tambahkan KNO3 100 kg/ha saat mulai berbunga. Bantu penyerbukan dengan mengambil serbuk sari bunga jantan (pukul 6-9 pagi) lalu oleskan ke putik bunga betina. Lakukan setiap hari untuk hasil maksimal.",
      },
      {
        title: "Pengendalian Hama",
        description:
          "Hama utama: ulat daun (semprot Bt atau pestisida nabati), lalat buah (perangkap metil eugenol, bungkus buah dengan plastik/kertas), kutu kebul (semprot air sabun). Penyakit: embun tepung (semprot fungisida sulfur), layu bakteri (cabut tanaman, rotasi). Jaga kebersihan lahan.",
      },
      {
        title: "Panen & Sortasi",
        description:
          "Panen umur 60-75 HST. Ciri siap panen: buah berwarna hijau merata, ukuran penuh, bila ditekan masih keras. Panen setiap 2-3 hari sekali. Gunakan gunting untuk memotong tangkai. Sortir grade A (panjang >30 cm, lurus), B (20-30 cm), C (kecil/bengkok). Simpan di suhu 10-12°C.",
      },
    ],
    tips: [
      { icon: "🌸", text: "Bantu penyerbukan setiap pagi agar buah tidak busuk/keriting" },
      { icon: "🌿", text: "Tanam di awal musim hujan untuk pengairan alami" },
      { icon: "🪴", text: "Pare termasuk tanaman toleran kekeringan, tapi butuh air saat pembentukan buah" },
      { icon: "📦", text: "Kemas pare dalam kardus berlubang dengan bantalan kertas" },
    ],
    links: [
      { label: "🎬 Cara Menanam Pare dari Semai Hingga Panen", url: "https://www.youtube.com/results?search_query=cara+menanam+pare+suraung" },
      { label: "🌿 Pupuk Agar Pare Berbuah Lebat", url: "https://www.youtube.com/results?search_query=pupuk+pare+berbuah+lebat" },
    ],
  },

  // ===== TOMAT =====
  {
    id: "menanam-tomat",
    title: "Budidaya Tomat Premium",
    emoji: "🍅",
    color: "from-red-600 to-red-700",
    difficulty: "menengah",
    readTime: "10 menit",
    summary:
      "Teknik menanam tomat cherry dan tomat konsumsi hasil tinggi 30-50 ton/ha menggunakan sistem ajir dan irigasi tetes.",
    highlights: [
      "🌱 Semai 4-5 minggu sebelum pindah tanam",
      "🔧 Wajib pasang ajir/trellis untuk tanaman indeterminate",
      "✂️ Pangkas tunas air (suckers) secara rutin",
      "⏳ Panen tomat dimulai 70-90 HST",
    ],
    steps: [
      {
        title: "Pembibitan & Persemaian",
        description:
          "Gunakan benih tomat hibrida bersertifikat. Semai di tray 128 lubang menggunakan media arang sekam + kompos (2:1). Letakkan di greenhouse atau naungan plastik. Siram 2x sehari dengan spray halus. Beri pupuk daun NPK 20-20-20 dosis 1 gram/liter seminggu sekali. Bibit siap pindah umur 28-35 hari dengan 4-5 daun.",
      },
      {
        title: "Persiapan Lahan & Mulsa",
        description:
          "Olah tanah sedalam 35-40 cm, taburi dolomit 1 ton/ha. Buat bedengan lebar 100 cm, tinggi 35 cm, jarak antar bedengan 60 cm. Aplikasi pupuk kandang 15 ton/ha + NPK 16-16-16 250 kg/ha. Pasang mulsa plastik hitam perak. Buat lubang tanam jarak 50x60 cm (populasi ~25.000 tanaman/ha). Pasang ajir bambu setinggi 150-200 cm.",
      },
      {
        title: "Penanaman & Pemangkasan",
        description:
          "Pindahkan bibit sore hari. Ikat batang ke ajir dengan tali rafia longgar (jangan terlalu kencang). Pangkas tunas air (suckers) yang tumbuh di ketiak daun setiap 5-7 hari. Sisakan 1-2 batang utama saja. Buang daun bawah setinggi 30 cm setelah tanaman tinggi 50 cm untuk sirkulasi udara.",
      },
      {
        title: "Pemupukan & Irigasi",
        description:
          "Pupuk susulan setiap 10-14 hari: NPK 16-16-16 5 gram/tanaman pada 15 HST, NPK 12-12-17-2 7 gram + KNO3 3 gram pada 30, 50, 70 HST. Irigasi tetes 1-2 liter/tanaman/hari. Pastikan tidak ada genangan. Mulsa akan menjaga kelembaban tanah.",
      },
      {
        title: "Perlindungan Hama & Penyakit",
        description:
          "Hama: ulat grayak (semprot Bt), kutu daun (insektisida nabati), trips (perangkap biru). Penyakit: layu bakteri (cabut & bakar, rotasi tanaman), antraknosa (semprot fungisida), busuk buah (jaga kelembaban, panen tepat waktu). Semprot preventif fungisida tembaga setiap 2 minggu.",
      },
      {
        title: "Panen & Grading",
        description:
          "Tomat siap panen umur 70-90 HST untuk konsumsi dan 100-120 HST untuk cherry. Ciri: buah berwarna merah 70-90% untuk pasar lokal, merah 100% untuk langsung konsumsi. Panen setiap 3-5 hari sekali. Sortir grade A (besar, mulus, >80g), B (60-80g), C (reject).",
      },
    ],
    tips: [
      { icon: "🌱", text: "Varietas unggul: Servo, Timoty, F1 Tymoti untuk dataran rendah" },
      { icon: "✂️", text: "Rutin pangkas tunas air agar buah besar dan merata" },
      { icon: "🧪", text: "Kocorkan pupuk KNO3 saat buah mulai menguning untuk rasa manis" },
      { icon: "📦", text: "Kemas tomat dalam tray/kardus satu lapis agar tidak memar" },
    ],
    links: [
      { label: "🎬 Cara Menanam Tomat Dari Awal", url: "https://www.youtube.com/results?search_query=cara+menanam+tomat+dari+awal" },
      { label: "🌿 Pupuk Tomat Agar Berbuah Lebat", url: "https://www.youtube.com/results?search_query=pupuk+tomat+agar+berbuah+lebat" },
      { label: "🛡️ Hama Tomat & Solusinya", url: "https://www.youtube.com/results?search_query=hama+tomat+dan+cara+mengatasinya" },
    ],
  },

  // ===== BAWANG MERAH =====
  {
    id: "menanam-bawang",
    title: "Budidaya Bawang Merah",
    emoji: "🧅",
    color: "from-purple-500 to-purple-700",
    difficulty: "menengah",
    readTime: "9 menit",
    summary:
      "Cara menanam bawang merah dari umbi bibit hingga panen. Hasil optimal 10-15 ton/ha untuk dataran rendah hingga sedang.",
    highlights: [
      "🧅 Gunakan umbi bibit ukuran 5-10 gram/umbi",
      "☀️ Butuh sinar matahari penuh minimal 8 jam/hari",
      "💧 Hentikan penyiraman 7-10 hari sebelum panen",
      "⏳ Panen umur 60-75 HST tergantung varietas",
    ],
    steps: [
      {
        title: "Persiapan Umbi Bibit",
        description:
          "Pilih umbi bibit berkualitas, ukuran 5-10 gram, tidak cacat, sudah disimpan 2-3 bulan setelah panen. Belah umbi menjadi 2-4 bagian (tergantung ukuran) pastikan setiap bagian memiliki mata tunas. Rendam dalam fungisida alami (larutan bawang putih) selama 15 menit. Jemur angin 1-2 hari sebelum tanam.",
      },
      {
        title: "Pengolahan Lahan",
        description:
          "Olah tanah sedalam 25-30 cm. Taburi dolomit 500 kg/ha + pupuk kandang 10 ton/ha. Buat bedengan lebar 100-120 cm, tinggi 25 cm, jarak antar bedengan 40 cm. Buka mulsa plastik atau biarkan tanpa mulsa jika tanah gembur. Buat alur tanam dengan jarak 20-25 cm antar baris.",
      },
      {
        title: "Penanaman",
        description:
          "Tanam umbi dengan jarak 15x15 cm atau 20x15 cm (populasi ~350.000-400.000 umbi/ha). Tanam umbi sedalam 3-5 cm, bagian ujung menghadap ke atas. Tutup tipis dengan tanah. Siram secukupnya. Waktu tanam optimal awal musim kemarau agar bawang tidak busuk.",
      },
      {
        title: "Pemupukan & Perawatan",
        description:
          "Umur 7 HST: NPK 16-16-16 150 kg/ha + ZA 50 kg/ha. Umur 20 HST: NPK 16-16-16 100 kg/ha. Umur 35 HST: KNO3 100 kg/ha (agar umbi besar). Siram 2x sehari, sesuaikan dengan cuaca. Gulma dibersihkan manual setiap 2 minggu. Jika cuaca ekstrem, pasang paranet 50%.",
      },
      {
        title: "Panen & Pengeringan",
        description:
          "Panen umur 60-75 HST. Ciri: 60-70% daun mulai rebah, leher batang lembek. Panen dengan cara dicabut saat tanah tidak terlalu basah. Jemur di lahan 3-7 hari (balik setiap hari) sampai benar-benar kering. Potong daun menyisakan 5-7 cm. Potensi hasil 10-15 ton/ha.",
      },
    ],
    tips: [
      { icon: "🧅", text: "Gunakan varietas Bima Brebes atau Tajuk untuk adaptasi luas" },
      { icon: "💧", text: "Hentikan penyiraman 10 hari sebelum panen agar umbi tidak busuk" },
      { icon: "🌾", text: "Tumpangsari dengan cabai atau jagung untuk efisiensi lahan" },
      { icon: "📦", text: "Simpan bawang di rak bambu berventilasi, tahan 2-3 bulan" },
    ],
    links: [
      { label: "🎬 Cara Menanam Bawang Merah", url: "https://www.youtube.com/results?search_query=cara+menanam+bawang+merah" },
      { label: "🌿 Pupuk Bawang Merah Agar Besar", url: "https://www.youtube.com/results?search_query=pupuk+bawang+merah" },
    ],
  },

  // ===== KENTANG =====
  {
    id: "menanam-kentang",
    title: "Budidaya Kentang Dataran Tinggi",
    emoji: "🥔",
    color: "from-yellow-600 to-amber-700",
    difficulty: "mahir",
    readTime: "10 menit",
    summary:
      "Teknik menanam kentang granola dan varietas unggul lainnya di dataran tinggi (1000-2000 mdpl) dengan hasil 20-30 ton/ha.",
    highlights: [
      "🏔️ Wajib ditanam di dataran tinggi >1000 mdpl",
      "🌱 Gunakan umbi bibit G0/G1/G2 (bersertifikat)",
      "⛰️ Butuh tanah dalam, gembur, dan subur",
      "⏳ Panen umur 90-120 hari tergantung varietas",
    ],
    steps: [
      {
        title: "Persiapan Umbi Bibit",
        description:
          "Gunakan umbi bibit kentang bersertifikat (kelas G0, G1, atau G2). Potong umbi besar menjadi 2-4 bagian, masing-masing minimal 30 gram dengan 2-3 mata tunas. Rendam dalam fungisida nabati (ekstrak daun mimba) 15 menit. Angin-anginkan 1 hari di tempat teduh hingga permukaan potongan kering.",
      },
      {
        title: "Persiapan Lahan",
        description:
          "Olah tanah sedalam 40 cm. Buat bedengan/guludan tinggi 30-40 cm, lebar 60-80 cm dengan jarak antar guludan 70 cm. Aplikasi pupuk kandang 20 ton/ha + dolomit 1 ton/ha + NPK 16-16-16 300 kg/ha. Biarkan lahan 1 minggu sebelum tanam. pH tanah ideal 5.5-6.5.",
      },
      {
        title: "Penanaman & Pembumbunan",
        description:
          "Buat lubang tanam sedalam 10 cm di puncak guludan. Jarak tanam 30x70 cm (populasi ~23.000 tanaman/ha). Letakkan umbi dengan mata tunas menghadap ke atas. Tutup dengan tanah tipis. Lakukan pembumbunan kedua saat tanaman tinggi 20 cm (25-30 HST) untuk menutup umbi yang mulai terbentuk.",
      },
      {
        title: "Pemupukan & Irigasi",
        description:
          "Umur 15 HST: NPK 16-16-16 100 kg/ha. Umur 30 HST: NPK 12-12-17-2 150 kg/ha. Umur 50 HST: KNO3 100 kg/ha. Irigasi tetes atau alur dengan frekuensi 2-3 hari sekali. Jangan biarkan tanah tergenang karena umbi mudah busuk. Beri mulsa jerami untuk menekan suhu tanah.",
      },
      {
        title: "Panen & Sortasi",
        description:
          "Panen umur 90-120 HST. Ciri: daun batang mulai menguning dan mati 80%. Panen dengan garpu/cangkul hati-hati agar umbi tidak terluka. Kumpulkan dan sortir grade A (>150g), B (70-150g), C (kecil). Simpan di tempat gelap suhu 5-10°C. Hindari sinar matahari langsung yang bikin hijau (solanin).",
      },
    ],
    tips: [
      { icon: "🥔", text: "Gunakan varietas Granola L, Medians, atau Atlantik untuk hasil tinggi" },
      { icon: "⛰️", text: "Jangan tanam kentang di lahan bekas tomat/tembakau (risiko penyakit) lama" },
      { icon: "🧪", text: "Uji tanah setiap musim untuk jaga pH dan kesuburan" },
      { icon: "♻️", text: "Lakukan rotasi dengan kubis/kol untuk cegah hama nematoda" },
    ],
    links: [
      { label: "🎬 Cara Menanam Kentang Hasil Melimpah", url: "https://www.youtube.com/results?search_query=cara+menanam+kentang+hasil+melimpah" },
      { label: "🌿 Pupuk Kentang Agar Umbi Besar", url: "https://www.youtube.com/results?search_query=pupuk+kentang+agar+umbi+besar" },
    ],
  },

  // ===== SAYUR DAUN (Bayam, Kangkung, Sawi) =====
  {
    id: "menanam-sayur-daun",
    title: "Sayur Daun Cepat Panen",
    emoji: "🥬",
    color: "from-green-500 to-emerald-600",
    difficulty: "pemula",
    readTime: "6 menit",
    summary:
      "Panduan menanam bayam, kangkung, dan sawi hijau. Panen cepat 20-35 hari. Cocok untuk pemula dan rotasi tanam cepat.",
    highlights: [
      "🌱 Bayam panen 20-25 hari, kangkung 25-30 hari, sawi 30-35 hari",
      "💧 Tanaman sayur daun butuh air cukup setiap hari",
      "🌿 Bisa ditanam di polybag atau bedengan sempit",
      "💰 Modal kecil, untung cepat",
    ],
    steps: [
      {
        title: "Persiapan Lahan / Media",
        description:
          "Campur tanah + kompos + arang sekam (1:1:1) untuk media polybag. Untuk bedengan: olah sedalam 20 cm, buat bedengan lebar 100 cm. Aplikasi pupuk kandang 5 ton/ha. Jarak tanam untuk bedengan langsung: 10x10 cm (kangkung), 15x15 cm (bayam), 15x20 cm (sawi).",
      },
      {
        title: "Penanaman Benih",
        description:
          "Semai langsung di lahan (tidak perlu pindah tanam). Tabur benih merata di bedengan atau 3-5 biji per lubang polybag. Tutup tipis dengan tanah halus (0.5 cm). Siram dengan spray halus. Untuk bedengan lebar, buat alur sedalam 1 cm dengan jarak antar alur 15-20 cm.",
      },
      {
        title: "Perawatan Harian",
        description:
          "Siram 2x sehari (pagi & sore) dengan gembor. Setelah 7-10 hari, lakukan penjarangan untuk sayur yang terlalu rapat. Cabang/petik gulma yang tumbuh. Beri pupuk cair (NPK 20-20-20 1 gram/L) seminggu sekali mulai umur 10 hari. Untuk hasil organik, gunakan pupuk kandang cair.",
      },
      {
        title: "Panen Sayur Daun",
        description:
          "Bayam: cabut seluruh tanaman umur 20-25 hari. Kangkung: potong batang menyisakan 5 cm dari tanah (bisa panen 3-4 kali). Sawi: cabut/potong umur 30-35 hari. Panen pagi hari. Segera cuci bersih dan kemas dalam plastik berlubang. Simpan di kulkas tahan 2-3 hari.",
      },
    ],
    tips: [
      { icon: "🌱", text: "Tanam secara bertahap setiap minggu agar panen berkelanjutan" },
      { icon: "💧", text: "Sayur daun butuh air banyak — jangan sampai tanah kering" },
      { icon: "🔄", text: "Rotasi jenis sayur daun setiap musim untuk cegah hama tanah" },
    ],
    links: [
      { label: "🎬 Cara Menanam Bayam Hidroponik", url: "https://www.youtube.com/results?search_query=cara+menanam+bayam+hidroponik" },
      { label: "🌿 Cara Menanam Kangkung", url: "https://www.youtube.com/results?search_query=cara+menanam+kangkung+di+polybag" },
      { label: "📖 Panduan Lengkap Sawi Hijau", url: "https://www.youtube.com/results?search_query=cara+menanam+sawi+hijau+organik" },
    ],
  },
];

export default edukasiTopics;