
export type TravelGuide = {
  highlights: string[];
  activities: string[];
  access: string[];
  facilities: string[];
  tips: string[];
};

export const travelGuides: Record<string, TravelGuide> = {
  Nature: {
    highlights: [
      "Pemandangan alam dan lanskap sekitar.",
      "Keunikan lingkungan dan ekosistem setempat.",
      "Spot menarik untuk menikmati suasana alam.",
    ],
    activities: [
      "Menikmati pemandangan alam.",
      "Fotografi dan eksplorasi lingkungan.",
      "Mengamati keunikan alam sekitar.",
    ],
    access: [
      "Periksa rute perjalanan dan kondisi jalan melalui peta.",
      "Cari informasi transportasi menuju lokasi sebelum berangkat.",
      "Pastikan jalur kunjungan dapat diakses saat tanggal perjalanan.",
    ],
    facilities: [
      "Periksa ketersediaan toilet dan tempat istirahat.",
      "Cari informasi area parkir dan pusat informasi.",
      "Pastikan fasilitas yang dibutuhkan tersedia sebelum berkunjung.",
    ],
    tips: [
      "Periksa prakiraan cuaca sebelum berangkat.",
      "Gunakan pakaian dan alas kaki yang sesuai.",
      "Jangan membuang sampah sembarangan.",
    ],
  },

  Culture: {
    highlights: [
      "Nilai sejarah dan budaya lokal.",
      "Arsitektur atau tradisi khas daerah.",
      "Cerita dan keunikan masyarakat setempat.",
    ],
    activities: [
      "Mengenal sejarah dan budaya setempat.",
      "Mengamati arsitektur dan karya budaya.",
      "Mengikuti kegiatan budaya jika tersedia.",
    ],
    access: [
      "Periksa lokasi dan rute melalui peta.",
      "Cari informasi transportasi dan jam kunjungan.",
      "Perhatikan aturan masuk dari pengelola.",
    ],
    facilities: [
      "Periksa ketersediaan toilet dan area istirahat.",
      "Cari informasi pusat informasi pengunjung.",
      "Periksa fasilitas yang tersedia dari pengelola.",
    ],
    tips: [
      "Pelajari aturan dan kebiasaan setempat.",
      "Kenakan pakaian yang sesuai dengan aturan lokasi.",
      "Hormati masyarakat dan nilai budaya setempat.",
    ],
  },

  Culinary: {
    highlights: [
      "Makanan dan minuman khas daerah.",
      "Cita rasa dan bahan lokal.",
      "Pengalaman kuliner khas setempat.",
    ],
    activities: [
      "Mencoba makanan khas daerah.",
      "Mengenal bahan dan cara penyajian makanan lokal.",
      "Menjelajahi pilihan kuliner di sekitar lokasi.",
    ],
    access: [
      "Cari lokasi tempat kuliner melalui peta.",
      "Periksa jam operasional sebelum datang.",
      "Pastikan pilihan transportasi menuju lokasi.",
    ],
    facilities: [
      "Periksa ketersediaan tempat duduk.",
      "Cari informasi area parkir jika diperlukan.",
      "Periksa metode pembayaran yang diterima.",
    ],
    tips: [
      "Periksa harga sebelum memesan.",
      "Perhatikan informasi bahan makanan jika memiliki alergi.",
      "Jaga kebersihan selama menikmati kuliner.",
    ],
  },

  Entertainment: {
    highlights: [
      "Pilihan hiburan dan aktivitas rekreasi.",
      "Suasana dan pengalaman yang ditawarkan.",
      "Atraksi yang tersedia di lokasi.",
    ],
    activities: [
      "Menikmati atraksi yang tersedia.",
      "Mengikuti aktivitas rekreasi.",
      "Mengabadikan momen selama kunjungan.",
    ],
    access: [
      "Periksa rute dan pilihan transportasi.",
      "Cari informasi jam operasional.",
      "Periksa ketentuan tiket dan reservasi jika diperlukan.",
    ],
    facilities: [
      "Periksa ketersediaan toilet dan tempat istirahat.",
      "Cari informasi tempat makan.",
      "Periksa fasilitas pendukung yang tersedia.",
    ],
    tips: [
      "Periksa harga dan ketentuan tiket.",
      "Datang sesuai jam operasional.",
      "Ikuti petunjuk dan aturan pengelola.",
    ],
  },

  Adventure: {
    highlights: [
      "Pengalaman eksplorasi dan tantangan alam.",
      "Karakteristik medan dan lingkungan.",
      "Pemandangan selama perjalanan.",
    ],
    activities: [
      "Eksplorasi sesuai jalur yang diizinkan.",
      "Menikmati aktivitas luar ruangan yang tersedia.",
      "Mengabadikan pemandangan perjalanan.",
    ],
    access: [
      "Pelajari kondisi jalur dan medan perjalanan.",
      "Periksa kebutuhan izin atau pemandu.",
      "Pastikan akses dan kondisi lokasi sebelum berangkat.",
    ],
    facilities: [
      "Periksa ketersediaan pos informasi.",
      "Cari informasi toilet dan tempat istirahat.",
      "Pastikan fasilitas keselamatan yang diperlukan tersedia.",
    ],
    tips: [
      "Sesuaikan aktivitas dengan kemampuan dan kondisi diri.",
      "Periksa cuaca dan ketentuan keselamatan.",
      "Ikuti arahan petugas dan jangan melewati jalur resmi.",
    ],
  },
};

export const defaultTravelGuide: TravelGuide = {
  highlights: [
    "Kenali karakteristik dan daya tarik destinasi.",
    "Cari informasi mengenai keunikan lokasi.",
    "Periksa informasi terbaru dari pengelola.",
  ],
  activities: [
    "Jelajahi area yang diizinkan untuk pengunjung.",
    "Nikmati pengalaman yang tersedia di lokasi.",
    "Dokumentasikan perjalananmu.",
  ],
  access: [
    "Periksa rute perjalanan melalui peta.",
    "Cari informasi transportasi menuju lokasi.",
    "Pastikan akses kunjungan masih tersedia.",
  ],
  facilities: [
    "Periksa fasilitas yang tersedia dari pengelola.",
    "Cari informasi toilet dan tempat istirahat.",
    "Siapkan kebutuhan pribadi sebelum berangkat.",
  ],
  tips: [
    "Periksa informasi terbaru sebelum berkunjung.",
    "Sesuaikan anggaran perjalanan.",
    "Jaga kebersihan dan hormati lingkungan sekitar.",
  ],
};
