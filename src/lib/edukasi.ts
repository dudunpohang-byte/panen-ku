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
  color: string; // gradient color class
  difficulty: "pemula" | "menengah" | "mahir";
  readTime: string; // e.g. "5 menit"
  summary: string;
  highlights: string[];
  steps: EduStep[];
  tips: EduTip[];
  links: EduLink[];
};

export const edukasiTopics: EduTopic[] = [
  {
    id: "cara-menanam",
    title: "Cara Menanam",
    emoji: "🌱",
    color: "from-emerald-500 to-green-600",
    difficulty: "pemula",
    readTime: "5 menit",
    summary:
      "Panduan langkah demi langkah menanam sayuran dan tanaman pangan dari awal hingga siap panen. Cocok untuk petani pemula!",
    highlights: [
      "✅ Pilih bibit unggul bersertifikat",
      "🌞 Pastikan sinar matahari cukup (4-6 jam/hari)",
      "💧 Siram secara teratur tapi jangan berlebihan",
    ],
    steps: [
      {
        title: "Pilih Bibit Berkualitas",
        description:
          "Gunakan bibit bersertifikat dari penjual terpercaya. Rendam bibit dalam air hangat selama 15 menit sebelum tanam untuk mempercepat perkecambahan.",
      },
      {
        title: "Siapkan Media Tanam",
        description:
          "Campur tanah, kompos, dan sekam bakar dengan perbandingan 2:1:1. Masukkan ke dalam polybag atau bedengan setinggi 20-30 cm.",
      },
      {
        title: "Penanaman",
        description:
          "Buat lubang sedalam 1-2 cm, masukkan 2-3 bibit per lubang, lalu tutup tipis dengan tanah. Beri jarak 20-30 cm antar lubang.",
      },
      {
        title: "Perawatan Awal",
        description:
          "Siram 2 kali sehari (pagi dan sore). Lindungi bibit dari sinar matahari langsung selama 3-5 hari pertama menggunakan naungan.",
      },
      {
        title: "Pemupukan Lanjutan",
        description:
          "Berikan pupuk organik cair setiap 7 hari sekali. Aplikasikan pada pagi hari dengan dosis sesuai petunjuk kemasan.",
      },
    ],
    tips: [
      { icon: "💡", text: "Tanam di awal musim hujan untuk mengurangi biaya penyiraman" },
      { icon: "📌", text: "Buat jadwal tanam agar panen bisa berkesinambungan" },
      { icon: "⭐", text: "Catat setiap perkembangan tanaman untuk evaluasi" },
    ],
    links: [
      {
        label: "🎬 Video: Cara Menanam Sayur di Rumah",
        url: "https://www.youtube.com/results?search_query=cara+menanam+sayur+di+rumah",
      },
      {
        label: "📖 Artikel: Panduan Pemula Menanam Tomat",
        url: "https://www.youtube.com/results?search_query=menanam+tomat+panduan+pemula",
      },
      {
        label: "📱 Kalkulator Kebutuhan Bibit",
        url: "https://www.youtube.com/results?search_query=kalkulator+jarak+tanam",
      },
    ],
  },
  {
    id: "memilih-pupuk",
    title: "Memilih & Menggunakan Pupuk",
    emoji: "🌿",
    color: "from-teal-500 to-cyan-600",
    difficulty: "pemula",
    readTime: "7 menit",
    summary:
      "Kenali jenis pupuk organik dan anorganik, dosis tepat, serta waktu aplikasi yang optimal untuk setiap jenis tanaman Anda.",
    highlights: [
      "🧪 Kenali dulu jenis tanah sebelum pilih pupuk",
      "🌿 Pupuk organik lebih ramah lingkungan",
      "📅 Jadwal pemupukan yang tepat meningkatkan hasil 2x lipat",
    ],
    steps: [
      {
        title: "Tes Jenis Tanah",
        description:
          "Gunakan alat tes tanah sederhana (pH meter) untuk mengukur keasaman. pH ideal untuk sayuran adalah 5.5–7.0.",
      },
      {
        title: "Pilih Jenis Pupuk",
        description:
          "Pupuk organik (kompos/pupuk kandang) untuk perbaikan struktur tanah. Pupuk anorganik (NPK) untuk tambahan nutrisi cepat.",
      },
      {
        title: "Hitung Dosis",
        description:
          "Dosis umum: 5-10 ton/ha pupuk kandang untuk dasar, 200-400 kg/ha NPK untuk pemeliharaan. Sesuaikan dengan jenis tanaman.",
      },
      {
        title: "Aplikasi Pupuk Dasar",
        description:
          "Taburkan pupuk kandang 1-2 minggu sebelum tanam. Campur rata dengan tanah bedengan sedalam 10-15 cm.",
      },
      {
        title: "Aplikasi Pupuk Susulan",
        description:
          "Berikan NPK pada usia 15, 30, dan 45 hari setelah tanam. Aplikasikan melingkar 5 cm dari batang tanaman.",
      },
    ],
    tips: [
      { icon: "♻️", text: "Buat kompos sendiri dari sisa panen dan limbah dapur" },
      { icon: "⚠️", text: "Jangan berlebihan! Over-fertilizer bisa membakar akar" },
      { icon: "📊", text: "Catat dosis dan hasil untuk referensi musim berikutnya" },
    ],
    links: [
      {
        label: "🎬 Video: Pupuk Organik vs Anorganik",
        url: "https://www.youtube.com/results?search_query=pupuk+organik+vs+anorganik",
      },
      {
        label: "📖 Cara Pemberian Pupuk yang Benar",
        url: "https://www.youtube.com/results?search_query=cara+pemberian+pupuk+yang+benar",
      },
    ],
  },
  {
    id: "memilih-tanah",
    title: "Tanah & Media Tanam",
    emoji: "🏔️",
    color: "from-amber-600 to-orange-600",
    difficulty: "pemula",
    readTime: "6 menit",
    summary:
      "Karakteristik tanah subur, cara menguji kesuburan sederhana, serta campuran media tanam optimal untuk polybag dan bedengan.",
    highlights: [
      "👆 Tanah subur terasa gembur dan berwarna gelap",
      "🪱 Cacing tanah = indikator tanah sehat",
      "🧪 pH tanah ideal untuk sayuran: 5.5–7.0",
    ],
    steps: [
      {
        title: "Ciri Tanah Subur",
        description:
          "Tanah gembur, mudah diolah, berwarna cokelat kehitaman, banyak mengandung mikroorganisme seperti cacing tanah.",
      },
      {
        title: "Uji Kesuburan Sederhana",
        description:
          "Ambil segenggam tanah, basahi, lalu kepal. Jika tanah menggumpal padat berarti liat. Jika mudah hancur berarti ideal.",
      },
      {
        title: "Campuran Media Tanam Polybag",
        description:
          "Campur tanah : kompos : sekam bakar dengan perbandingan 2:1:1. Tambahkan 1 genggam dolomit per polybag ukuran 40x50 cm.",
      },
      {
        title: "Pengolahan Bedengan",
        description:
          "Cangkul tanah sedalam 30-40 cm, bentuk bedengan lebar 100-120 cm, tinggi 30 cm, dan beri jarak antar bedengan 40 cm.",
      },
      {
        title: "Mulsa dan Penutup",
        description:
          "Gunakan mulsa plastik hitam perak untuk menekan gulma dan menjaga kelembaban. Potong lubang sesuai jarak tanam.",
      },
    ],
    tips: [
      { icon: "🔄", text: "Rotasi tanaman mencegah kehabisan nutrisi tanah" },
      { icon: "🌾", text: "Tanam kacang-kacangan untuk fiksasi nitrogen alami" },
      { icon: "🧪", text: "Uji tanah setiap 6 bulan untuk pantau kesuburan" },
    ],
    links: [
      {
        label: "🎬 Video: Ciri-ciri Tanah Subur",
        url: "https://www.youtube.com/results?search_query=ciri+ciri+tanah+subur",
      },
      {
        label: "📖 Cara Membuat Media Tanam Sendiri",
        url: "https://www.youtube.com/results?search_query=membuat+media+tanam+sendiri",
      },
    ],
  },
  {
    id: "perawatan",
    title: "Perawatan & Irigasi",
    emoji: "💧",
    color: "from-sky-500 to-blue-600",
    difficulty: "menengah",
    readTime: "8 menit",
    summary:
      "Teknik penyiraman efektif, pemangkasan yang benar, dan pemeliharaan rutin untuk mencegah penyakit serta meningkatkan hasil panen.",
    highlights: [
      "⏰ Siram pagi hari sebelum pukul 9 untuk hasil optimal",
      "✂️ Pangkas daun tua/bawah untuk sirkulasi udara",
      "💦 Irigasi tetes hemat air hingga 70%",
    ],
    steps: [
      {
        title: "Jadwal Penyiraman",
        description:
          "Siram 2 kali sehari (pagi jam 6-8 dan sore jam 15-17). Sesuaikan frekuensi dengan cuaca - kurangi saat hujan, tambah saat kemarau.",
      },
      {
        title: "Teknik Penyiraman",
        description:
          "Siram di area akar, bukan di daun. Gunakan gembor atau selang dengan nozzle spray halus agar tanah tidak memadat.",
      },
      {
        title: "Pemasangan Irigasi Tetes",
        description:
          "Pasang selang irigasi tetes di atas bedengan. Lubangi selang setiap 20-30 cm (sesuai jarak tanam). Alirkan air selama 15-30 menit/hari.",
      },
      {
        title: "Pemangkasan Tanaman",
        description:
          "Pangkas daun kuning/rusak dan cabang liar menggunakan gunting steril. Lakukan seminggu sekali di pagi hari.",
      },
      {
        title: "Pemeliharaan Rutin",
        description:
          "Periksa tanaman setiap hari, bersihkan gulma seminggu sekali, dan catat pertumbuhan tanaman setiap minggu.",
      },
    ],
    tips: [
      { icon: "💡", text: "Kumpulkan air hujan untuk irigasi hemat biaya" },
      { icon: "📱", text: "Pasang timer otomatis untuk penyiraman konsisten" },
      { icon: "🌿", text: "Gunakan mulsa organik untuk menjaga kelembaban" },
    ],
    links: [
      {
        label: "🎬 Teknik Irigasi Sederhana Lahan Kecil",
        url: "https://www.youtube.com/results?search_query=teknik+irigasi+lahan+kecil",
      },
      {
        label: "📖 Panduan Perawatan Tanaman Sehari-hari",
        url: "https://www.youtube.com/results?search_query=perawatan+tanaman+sehari+hari",
      },
    ],
  },
  {
    id: "pengendalian-hama",
    title: "Hama & Penyakit Tanaman",
    emoji: "🐛",
    color: "from-rose-600 to-red-700",
    difficulty: "menengah",
    readTime: "10 menit",
    summary:
      "Kenali hama utama, penyakit tanaman, dan cara pengendalian ramah lingkungan tanpa bahan kimia berbahaya.",
    highlights: [
      "🐞 Musuh alami seperti kumbang kepik membantu mengendalikan hama",
      "🌿 Pestisida nabati dari daun mimba atau bawang putih",
      "🛡️ Cegah lebih baik daripada mengobati!",
    ],
    steps: [
      {
        title: "Identifikasi Hama",
        description:
          "Kenali hama umum: ulat (daun bolong), kutu daun (daun keriting), thrips (bercak perak), dan belalang. Amati tanaman setiap pagi.",
      },
      {
        title: "Pengendalian Alami",
        description:
          "Semprotkan air sabun (1 sdm sabun cair + 1 L air) untuk kutu daun. Taburkan abu sekam di sekitar batang untuk mengusir siput.",
      },
      {
        title: "Pestisida Nabati",
        description:
          "Haluskan 100g bawang putih + 50g cabai + 1L air, diamkan 24 jam. Saring dan semprotkan setiap 3 hari sekali.",
      },
      {
        title: "Penggunaan Musuh Alami",
        description:
          "Tanam bunga matahari dan kenikir di sekitar lahan untuk menarik kumbang kepik dan lebah yang memangsa hama.",
      },
      {
        title: "Karantina Tanaman Sakit",
        description:
          "Pisahkan tanaman yang terinfeksi parah. Cabut dan bakar tanaman yang tidak bisa diselamatkan untuk mencegah penularan.",
      },
    ],
    tips: [
      { icon: "👁️", text: "Inspeksi tanaman setiap pagi sebelum aktivitas lain" },
      { icon: "🌼", text: "Tanam refugia (bunga) di pinggir lahan sebagai habitat musuh alami" },
      { icon: "📸", text: "Foto hama/penyakit dan konsultasi ke petani lain" },
    ],
    links: [
      {
        label: "🎬 Pengendalian Hama Terpadu (IPM)",
        url: "https://www.youtube.com/results?search_query=integrated+pest+management+ipm",
      },
      {
        label: "🌿 Cara Alami Mengendalikan Hama",
        url: "https://www.youtube.com/results?search_query=cara+alami+mengendalikan+hama",
      },
    ],
  },
  {
    id: "panen-pascapanen",
    title: "Panen & Pascapanen",
    emoji: "🚜",
    color: "from-yellow-500 to-amber-600",
    difficulty: "mahir",
    readTime: "8 menit",
    summary:
      "Waktu panen yang tepat, teknik pemanenan untuk menjaga kualitas, serta penanganan dan penyimpanan pascapanen yang benar.",
    highlights: [
      "📅 Panen di pagi hari saat suhu masih sejuk",
      "🔪 Gunakan pisau steril dan tajam untuk memotong",
      "📦 Sortir hasil panen sebelum dikemas/dikirim",
    ],
    steps: [
      {
        title: "Tentukan Waktu Panen",
        description:
          "Panen saat pagi hari (06.00-09.00). Ciri sayur siap panen: warna cerah, ukuran maksimal, dan tekstur optimal. Jangan panen saat hujan.",
      },
      {
        title: "Teknik Pemanenan",
        description:
          "Gunakan gunting/cutter steril. Potong batang menyisakan 1-2 ruas. Hindari memar pada produk. Tempatkan dalam wadah bersih beralas daun.",
      },
      {
        title: "Sortasi dan Grading",
        description:
          "Pisahkan produk berdasarkan ukuran (besar/sedang/kecil), kualitas (grade A/B), dan kondisi. Buang produk rusak atau terserang hama.",
      },
      {
        title: "Pembersihan dan Pengemasan",
        description:
          "Cuci bersih dengan air mengalir, tiriskan hingga kering. Kemas dalam kemasan berlubang ventilasi. Beri label: jenis, berat, dan tanggal panen.",
      },
      {
        title: "Penyimpanan",
        description:
          "Simpan di tempat sejuk (10-15°C) dengan kelembaban 85-95%. Sayuran daun tahan 3-5 hari, buah tahan 5-7 hari dalam penyimpanan baik.",
      },
    ],
    tips: [
      { icon: "❄️", text: "Cool chain (rantai dingin) menjaga kesegaran lebih lama" },
      { icon: "📊", text: "Catat berat hasil panen setiap hari untuk analisis produktivitas" },
      { icon: "💡", text: "Olah hasil panen berlebih jadi produk turunan (sayur beku, keripik)" },
    ],
    links: [
      {
        label: "🎬 Teknik Panen yang Baik",
        url: "https://www.youtube.com/results?search_query=teknik+panen+yang+baik",
      },
      {
        label: "📖 Cara Penyimpanan Hasil Panen",
        url: "https://www.youtube.com/results?search_query=penyimpanan+hasil+panen",
      },
    ],
  },
];

export default edukasiTopics;
