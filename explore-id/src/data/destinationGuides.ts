
export type DestinationGuide = {
  highlights: string[];
  activities: string[];
  access: string;
  facilities: string;
  tips: string[];
};

export const destinationGuides: Record<number, DestinationGuide> = {
  1: {
    highlights: ["Kawah berwarna putih kehijauan", "Pemandangan hutan pegunungan", "Suasana alam yang sejuk"],
    activities: ["Menikmati pemandangan kawah", "Berfoto di area wisata", "Mengunjungi kawasan hutan sekitar"],
    access: "Dapat dijangkau melalui perjalanan darat dari pusat Kota Bandung menuju kawasan Ciwidey. Periksa kondisi jalan dan transportasi sebelum berangkat.",
    facilities: "Kawasan wisata memiliki area parkir, toilet, tempat makan, dan fasilitas pengunjung. Ketersediaan fasilitas dapat berubah.",
    tips: ["Periksa kondisi cuaca sebelum berangkat", "Gunakan alas kaki yang nyaman", "Ikuti batas aman di sekitar kawah", "Bawa pakaian hangat"]
  },
  2: {
    highlights: ["Candi Buddha bersejarah", "Relief yang memiliki nilai sejarah", "Pemandangan kawasan sekitar candi"],
    activities: ["Mengamati relief candi", "Mengikuti tur edukasi", "Mempelajari sejarah Borobudur"],
    access: "Berada di Magelang, Jawa Tengah. Pengunjung dapat menggunakan kendaraan pribadi atau transportasi umum menuju kawasan Borobudur.",
    facilities: "Tersedia area parkir, toilet, pusat informasi, area makan, dan fasilitas wisata lainnya.",
    tips: ["Cari tahu aturan kunjungan terbaru", "Gunakan alas kaki nyaman", "Jaga ketenangan kawasan", "Hormati situs bersejarah"]
  },
  3: {
    highlights: ["Kawasan belanja ikonik Yogyakarta", "Suasana kota yang ramai", "Dekat dengan berbagai tempat bersejarah"],
    activities: ["Berjalan menyusuri Malioboro", "Berbelanja oleh-oleh", "Mencoba kuliner lokal"],
    access: "Terletak di pusat Kota Yogyakarta dan dapat dijangkau dengan kendaraan umum, transportasi daring, atau berjalan kaki dari beberapa titik pusat kota.",
    facilities: "Tersedia area pedestrian, tempat makan, pusat belanja, toilet umum, dan akses transportasi.",
    tips: ["Perhatikan barang bawaan", "Siapkan uang untuk belanja", "Coba kuliner lokal", "Perhatikan aturan parkir dan lalu lintas"]
  },
  4: {
    highlights: ["Pantai dan panorama alam", "Budaya dan tradisi lokal", "Beragam pilihan wisata"],
    activities: ["Menjelajahi pantai", "Mengunjungi tempat budaya", "Mencoba kuliner Bali", "Menikmati pemandangan alam"],
    access: "Pulau Bali dapat dijangkau melalui jalur udara maupun laut. Transportasi darat tersedia untuk menjelajahi berbagai wilayah.",
    facilities: "Fasilitas wisata beragam, mulai dari penginapan, restoran, pusat informasi, hingga transportasi. Ketersediaannya bergantung pada lokasi.",
    tips: ["Rencanakan rute perjalanan", "Hormati adat dan aturan setempat", "Gunakan perlengkapan sesuai aktivitas", "Periksa kondisi lalu lintas"]
  },
  5: {
    highlights: ["Pemandangan gunung dan lautan pasir", "Matahari terbit", "Panorama pegunungan"],
    activities: ["Menikmati panorama dari titik pengamatan", "Mengikuti tur resmi kawasan", "Mengunjungi kawasan wisata sekitar"],
    access: "Kawasan Bromo dapat dijangkau melalui beberapa pintu masuk, antara lain dari Probolinggo, Pasuruan, dan Malang. Perjalanan dapat melibatkan kendaraan khusus kawasan.",
    facilities: "Terdapat area parkir, penyewaan kendaraan wisata, penginapan, dan warung di sejumlah titik sekitar kawasan.",
    tips: ["Periksa status aktivitas gunung dan penutupan kawasan", "Gunakan pakaian hangat", "Ikuti arahan petugas", "Jangan memasuki zona terlarang"]
  },
  6: {
    highlights: ["Kawasan perkotaan metropolitan", "Museum dan bangunan bersejarah", "Pusat kuliner dan hiburan"],
    activities: ["Mengunjungi museum", "Menjelajahi kawasan bersejarah", "Mencoba berbagai kuliner", "Mengunjungi taman kota"],
    access: "Jakarta memiliki jaringan transportasi umum seperti MRT, LRT, KRL, TransJakarta, serta akses kendaraan pribadi.",
    facilities: "Fasilitas perkotaan tersedia luas, termasuk pusat informasi, rumah sakit, tempat makan, dan transportasi umum.",
    tips: ["Perhatikan kondisi lalu lintas", "Manfaatkan transportasi umum", "Periksa jam operasional tempat wisata", "Jaga barang pribadi"]
  },
  7: {
    highlights: ["Danau vulkanik yang luas", "Pulau Samosir", "Pemandangan perbukitan"],
    activities: ["Menikmati pemandangan danau", "Mengunjungi Pulau Samosir", "Mengenal budaya Batak", "Mencoba kuliner lokal"],
    access: "Danau Toba dapat dijangkau melalui perjalanan darat dari Medan menuju kawasan sekitar danau. Penyeberangan menuju Samosir tersedia dari beberapa pelabuhan.",
    facilities: "Di kawasan wisata utama tersedia penginapan, restoran, transportasi, dan fasilitas penyeberangan.",
    tips: ["Periksa jadwal kapal", "Siapkan waktu perjalanan", "Hormati budaya masyarakat setempat", "Jaga kebersihan danau"]
  },
  8: {
    highlights: ["Kawasan kota dengan udara sejuk", "Wisata sejarah dan budaya", "Pemandangan alam Sumatera Barat"],
    activities: ["Menjelajahi pusat kota", "Mencoba kuliner Minangkabau", "Mengunjungi tempat bersejarah"],
    access: "Bukittinggi dapat dijangkau melalui perjalanan darat dari Kota Padang maupun wilayah lain di Sumatera Barat.",
    facilities: "Tersedia penginapan, restoran, pusat belanja, dan transportasi lokal.",
    tips: ["Siapkan waktu untuk perjalanan darat", "Coba kuliner khas setempat", "Perhatikan cuaca", "Hormati adat lokal"]
  },
  9: {
    highlights: ["Pantai dan laut yang jernih", "Keindahan bawah laut", "Suasana pulau yang tenang"],
    activities: ["Menikmati pantai", "Snorkeling melalui operator resmi", "Menjelajahi kawasan pesisir"],
    access: "Pulau Weh dapat dijangkau melalui perjalanan menuju Banda Aceh, kemudian dilanjutkan dengan kapal menuju Sabang.",
    facilities: "Terdapat penginapan, restoran, transportasi lokal, dan operator wisata di sejumlah kawasan.",
    tips: ["Periksa jadwal kapal", "Gunakan operator wisata tepercaya", "Ikuti arahan keselamatan laut", "Jangan merusak terumbu karang"]
  },
  10: {
    highlights: ["Tebing batu yang menjulang", "Lembah hijau", "Pemandangan alam Sumatera Barat"],
    activities: ["Menikmati panorama lembah", "Fotografi alam", "Mengunjungi kawasan wisata sekitar"],
    access: "Lembah Harau berada di Kabupaten Lima Puluh Kota, Sumatera Barat, dan dapat dijangkau melalui perjalanan darat.",
    facilities: "Terdapat area wisata, tempat makan, dan penginapan di sekitar kawasan. Fasilitas berbeda di setiap titik.",
    tips: ["Gunakan alas kaki nyaman", "Perhatikan kondisi cuaca", "Jaga kebersihan kawasan", "Ikuti arahan pengelola"]
  }
};

export const defaultDestinationGuide: DestinationGuide = {
  highlights: [
    "Pemandangan dan karakter alam setempat",
    "Keunikan budaya dan lingkungan sekitar",
    "Pengalaman wisata khas daerah"
  ],
  activities: [
    "Menjelajahi area wisata",
    "Menikmati pemandangan sekitar",
    "Mencoba pengalaman dan kuliner lokal"
  ],
  access: "Periksa rute perjalanan dan pilihan transportasi menuju lokasi. Kondisi akses dapat berbeda tergantung titik keberangkatan dan keadaan jalan.",
  facilities: "Fasilitas dapat berbeda di setiap destinasi. Sebaiknya cari informasi terbaru dari pengelola sebelum berkunjung.",
  tips: [
    "Periksa informasi dan aturan kunjungan terbaru",
    "Siapkan anggaran dan kebutuhan perjalanan",
    "Perhatikan kondisi cuaca",
    "Jaga kebersihan dan hormati lingkungan setempat"
  ]
};
