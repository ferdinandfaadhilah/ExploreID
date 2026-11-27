export type Destination = {
  id: number;
  name: string;
  location: string;
  category: string;
  description: string;
  price: string;
  budget: number;
image: string;
gallery?: string[];
position: [number, number];

  // Ticket information
  ticketPrice?: string;
  ticketUrl?: string;
  ticketNote?: string;
};

// Batch pertama: 30 destinasi dari berbagai wilayah Indonesia.
// Nilai budget merupakan perkiraan untuk membantu filter, bukan harga tiket resmi.
export const destinations: Destination[] = [
  {
    id: 1,
    name: "Kawah Putih",
    location: "Bandung, Jawa Barat",
    category: "Nature",
    description: "Danau kawah dengan pemandangan alam yang unik dan menawan.",
    price: "Mulai Rp28.000",
    budget: 28000,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Kawah_Putih.jpg",
    position: [-7.166, 107.402],
  },
  {
    id: 2,
    name: "Candi Borobudur",
    location: "Magelang, Jawa Tengah",
    category: "Culture",
    description: "Destinasi bersejarah dengan arsitektur dan nilai budaya yang luar biasa.",
    price: "Mulai Rp50.000",
    budget: 50000,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/CANDI_BOROBUDUR.jpg",
    position: [-7.6079, 110.2038],
  },
  {
    id: 3,
    name: "Malioboro",
    location: "Yogyakarta, DI Yogyakarta",
    category: "Culinary",
    description: "Kawasan populer untuk menikmati kuliner, belanja, dan suasana khas Yogyakarta.",
    price: "Gratis",
    budget: 0,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Malioboro_Street.jpg",
    position: [-7.7925, 110.3656],
  },
  {
    id: 4,
    name: "Bali",
    location: "Denpasar, Bali",
    category: "Nature",
    description: "Pulau dengan pantai, alam, budaya, dan pengalaman wisata yang beragam.",
    price: "Bervariasi",
    budget: 500000,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Bali%2C_Indonesia.jpg",
    position: [-8.4095, 115.1889],
  },
  {
    id: 5,
    name: "Gunung Bromo",
    location: "Probolinggo, Jawa Timur",
    category: "Adventure",
    description: "Nikmati panorama pegunungan dan pemandangan matahari terbit.",
    price: "Bervariasi",
    budget: 150000,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mt._Bromo.jpg",
    position: [-7.9425, 112.953],
  },
  {
    id: 6,
    name: "Jakarta",
    location: "Jakarta, DKI Jakarta",
    category: "Entertainment",
    description: "Jelajahi berbagai tempat hiburan, ruang publik, dan aktivitas menarik di ibu kota.",
    price: "Bervariasi",
    budget: 100000,
    image: "https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=1000",
    position: [-6.2088, 106.8456],
  },
  {
    id: 7,
    name: "Danau Toba",
    location: "Toba, Sumatera Utara",
    category: "Nature",
    description: "Danau vulkanik luas dengan panorama perbukitan dan Pulau Samosir.",
    price: "Bervariasi",
    budget: 150000,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Foto_Danau_Toba.jpg",
    position: [2.6845, 98.8756],
  },
  {
    id: 8,
    name: "Bukittinggi",
    location: "Bukittinggi, Sumatera Barat",
    category: "Culture",
    description: "Kota di dataran tinggi yang dikenal dengan Jam Gadang dan suasana Minangkabau.",
    price: "Bervariasi",
    budget: 100000,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000",
    position: [-0.305, 100.369],
  },
  {
    id: 9,
    name: "Pulau Weh",
    location: "Sabang, Aceh",
    category: "Nature",
    description: "Pulau di ujung barat Indonesia dengan pantai dan kehidupan bawah laut.",
    price: "Bervariasi",
    budget: 250000,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [5.8217, 95.2802],
  },
  {
    id: 10,
    name: "Lembah Harau",
    location: "Lima Puluh Kota, Sumatera Barat",
    category: "Adventure",
    description: "Lembah dengan tebing-tebing tinggi, air terjun, dan pemandangan hijau.",
    price: "Bervariasi",
    budget: 50000,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    position: [-0.1105, 100.666],
  },
  {
    id: 11,
    name: "Jam Gadang",
    location: "Bukittinggi, Sumatera Barat",
    category: "Culture",
    description: "Ikon kota Bukittinggi dengan bangunan jam bersejarah di pusat kota.",
    price: "Gratis",
    budget: 0,
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000",
    position: [-0.3051, 100.3692],
  },
  {
    id: 12,
    name: "Taman Nasional Ujung Kulon",
    location: "Pandeglang, Banten",
    category: "Nature",
    description: "Kawasan konservasi dengan hutan, pantai, dan keanekaragaman satwa.",
    price: "Bervariasi",
    budget: 150000,
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000",
    position: [-6.75, 105.35],
  },
  {
    id: 13,
    name: "Kepulauan Karimunjawa",
    location: "Jepara, Jawa Tengah",
    category: "Nature",
    description: "Gugusan pulau dengan pantai, laut jernih, dan aktivitas bahari.",
    price: "Bervariasi",
    budget: 300000,
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1000",
    position: [-5.85, 110.45],
  },
  {
    id: 14,
    name: "Dataran Tinggi Dieng",
    location: "Wonosobo, Jawa Tengah",
    category: "Nature",
    description: "Kawasan pegunungan dengan telaga, kawah, dan pemandangan dataran tinggi.",
    price: "Bervariasi",
    budget: 100000,
    image: "https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=1000",
    position: [-7.209, 109.909],
  },
  {
    id: 15,
    name: "Taman Nasional Tanjung Puting",
    location: "Kotawaringin Barat, Kalimantan Tengah",
    category: "Nature",
    description: "Kawasan hutan tropis yang dikenal sebagai habitat orangutan.",
    price: "Bervariasi",
    budget: 350000,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000",
    position: [-2.75, 111.75],
  },
  {
    id: 16,
    name: "Kepulauan Derawan",
    location: "Berau, Kalimantan Timur",
    category: "Nature",
    description: "Kepulauan dengan pantai tropis dan kehidupan laut yang beragam.",
    price: "Bervariasi",
    budget: 400000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [2.28, 118.24],
  },
  {
    id: 17,
    name: "Bukit Kelam",
    location: "Sintang, Kalimantan Barat",
    category: "Adventure",
    description: "Formasi batu besar yang menjulang dan menjadi landmark alam Sintang.",
    price: "Bervariasi",
    budget: 50000,
    image: "https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=1000",
    position: [0.07, 111.65],
  },
  {
    id: 18,
    name: "Taman Laut Bunaken",
    location: "Manado, Sulawesi Utara",
    category: "Adventure",
    description: "Taman laut yang terkenal dengan terumbu karang dan keanekaragaman hayati laut.",
    price: "Bervariasi",
    budget: 250000,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000",
    position: [1.616, 124.76],
  },
  {
    id: 19,
    name: "Tana Toraja",
    location: "Tana Toraja, Sulawesi Selatan",
    category: "Culture",
    description: "Wilayah dengan tradisi, rumah adat Tongkonan, dan lanskap pegunungan.",
    price: "Bervariasi",
    budget: 150000,
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1000",
    position: [-3.075, 119.85],
  },
  {
    id: 20,
    name: "Taman Nasional Wakatobi",
    location: "Wakatobi, Sulawesi Tenggara",
    category: "Nature",
    description: "Kawasan kepulauan yang memiliki ekosistem terumbu karang yang kaya.",
    price: "Bervariasi",
    budget: 350000,
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1000",
    position: [-5.32, 123.59],
  },
  {
    id: 21,
    name: "Danau Poso",
    location: "Poso, Sulawesi Tengah",
    category: "Nature",
    description: "Danau luas dengan air jernih dan pemandangan alam di sekitarnya.",
    price: "Bervariasi",
    budget: 75000,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    position: [-1.75, 120.65],
  },
  {
    id: 22,
    name: "Nusa Penida",
    location: "Klungkung, Bali",
    category: "Nature",
    description: "Pulau dengan tebing pantai, teluk, dan panorama laut yang khas.",
    price: "Bervariasi",
    budget: 250000,
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1000",
    position: [-8.727, 115.544],
  },
  {
    id: 23,
    name: "Mandalika",
    location: "Lombok Tengah, Nusa Tenggara Barat",
    category: "Entertainment",
    description: "Kawasan wisata pesisir dengan pantai dan area sirkuit internasional.",
    price: "Bervariasi",
    budget: 150000,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [-8.895, 116.29],
  },
  {
    id: 24,
    name: "Gunung Rinjani",
    location: "Lombok Timur, Nusa Tenggara Barat",
    category: "Adventure",
    description: "Gunung berapi dengan jalur pendakian dan panorama Danau Segara Anak.",
    price: "Bervariasi",
    budget: 500000,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000",
    position: [-8.411, 116.457],
  },
  {
    id: 25,
    name: "Labuan Bajo",
    location: "Manggarai Barat, Nusa Tenggara Timur",
    category: "Nature",
    description: "Kota pelabuhan yang menjadi gerbang menuju pulau-pulau dan Taman Nasional Komodo.",
    price: "Bervariasi",
    budget: 500000,
    image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1000",
    position: [-8.496, 119.887],
  },
  {
    id: 26,
    name: "Raja Ampat",
    location: "Raja Ampat, Papua Barat Daya",
    category: "Nature",
    description: "Kepulauan dengan gugusan karst dan keanekaragaman hayati laut.",
    price: "Bervariasi",
    budget: 750000,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000",
    position: [-0.23, 130.52],
  },
  {
    id: 27,
    name: "Banda Neira",
    location: "Kepulauan Banda, Maluku",
    category: "Culture",
    description: "Pulau bersejarah dengan jejak perdagangan rempah dan panorama laut.",
    price: "Bervariasi",
    budget: 400000,
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1000",
    position: [-4.523, 129.896],
  },
  {
    id: 28,
    name: "Pulau Morotai",
    location: "Morotai, Maluku Utara",
    category: "Nature",
    description: "Pulau dengan pantai tropis dan sejumlah lokasi bersejarah.",
    price: "Bervariasi",
    budget: 350000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [2.33, 128.4],
  },
  {
    id: 29,
    name: "Danau Sentani",
    location: "Jayapura, Papua",
    category: "Nature",
    description: "Danau luas di kaki Pegunungan Cyclops dengan pulau-pulau kecil.",
    price: "Bervariasi",
    budget: 100000,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    position: [-2.61, 140.52],
  },
  {
    id: 30,
    name: "Pantai Ora",
    location: "Seram Utara, Maluku",
    category: "Nature",
    description: "Pantai dengan perairan jernih dan panorama pegunungan di Pulau Seram.",
    price: "Bervariasi",
    budget: 350000,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [-2.87, 129.14],
  },
];


const additionalDestinations: Destination[] = [
  // JAWA
  {
    id: 31, name: "Kawah Ijen", location: "Banyuwangi, Jawa Timur",
    category: "Nature", description: "Kawah vulkanik dengan danau asam berwarna turquoise dan fenomena api biru.",
    price: "Bervariasi", budget: 100000,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000",
    position: [-8.058, 114.242]
  },
  {
    id: 32, name: "Pantai Parangtritis", location: "Bantul, DI Yogyakarta",
    category: "Nature", description: "Pantai dengan hamparan pasir luas dan panorama matahari terbenam.",
    price: "Mulai Rp10.000", budget: 10000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-8.025, 110.329]
  },
  {
    id: 33, name: "Gunung Merapi", location: "Sleman, DI Yogyakarta",
    category: "Adventure", description: "Gunung berapi aktif dengan panorama alam dan kawasan wisata sekitarnya.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=1000",
    position: [-7.54, 110.446]
  },
  {
    id: 34, name: "Pantai Timang", location: "Gunungkidul, DI Yogyakarta",
    category: "Adventure", description: "Pantai dengan tebing karang dan panorama laut selatan.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [-8.176, 110.663]
  },
  {
    id: 35, name: "Candi Prambanan", location: "Sleman, DI Yogyakarta",
    category: "Culture", description: "Kompleks candi Hindu bersejarah dengan arsitektur yang megah.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1000",
    position: [-7.752, 110.491]
  },
  {
    id: 36, name: "Taman Nasional Baluran", location: "Situbondo, Jawa Timur",
    category: "Nature", description: "Kawasan konservasi dengan savana luas yang dikenal sebagai Africa van Java.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000",
    position: [-7.847, 114.387]
  },
  {
    id: 37, name: "Pantai Tanjung Papuma", location: "Jember, Jawa Timur",
    category: "Nature", description: "Pantai dengan pasir putih, batu karang, dan pemandangan laut.",
    price: "Bervariasi", budget: 25000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-8.431, 113.554]
  },
  {
    id: 38, name: "Telaga Sarangan", location: "Magetan, Jawa Timur",
    category: "Nature", description: "Telaga alami di kawasan pegunungan dengan udara sejuk.",
    price: "Mulai Rp20.000", budget: 20000,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    position: [-7.679, 111.215]
  },
  {
    id: 39, name: "Kota Lama Semarang", location: "Semarang, Jawa Tengah",
    category: "Culture", description: "Kawasan bersejarah dengan bangunan kolonial dan suasana klasik.",
    price: "Gratis", budget: 0,
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000",
    position: [-6.968, 110.428]
  },
  {
    id: 40, name: "Pantai Menganti", location: "Kebumen, Jawa Tengah",
    category: "Nature", description: "Pantai dengan perbukitan hijau dan pemandangan Samudra Hindia.",
    price: "Bervariasi", budget: 20000,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [-7.771, 109.404]
  },
  {
    id: 41, name: "Taman Nasional Bromo Tengger Semeru", location: "Jawa Timur",
    category: "Adventure", description: "Kawasan pegunungan dengan lautan pasir dan panorama gunung.",
    price: "Bervariasi", budget: 150000,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mt._Bromo.jpg",
    position: [-8.016, 112.95]
  },
  {
    id: 42, name: "Pantai Sawarna", location: "Lebak, Banten",
    category: "Nature", description: "Kawasan pantai dengan pasir putih, ombak, dan formasi batu karang.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-6.982, 106.302]
  },
  {
    id: 43, name: "Taman Mini Indonesia Indah", location: "Jakarta Timur, DKI Jakarta",
    category: "Culture", description: "Taman wisata yang memperkenalkan keragaman budaya Indonesia.",
    price: "Bervariasi", budget: 35000,
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000",
    position: [-6.302, 106.895]
  },
  {
    id: 44, name: "Kepulauan Seribu", location: "Jakarta, DKI Jakarta",
    category: "Nature", description: "Gugusan pulau dengan pantai dan berbagai aktivitas wisata bahari.",
    price: "Bervariasi", budget: 200000,
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1000",
    position: [-5.62, 106.58]
  },

  // SUMATERA
  {
    id: 45, name: "Pantai Tanjung Tinggi", location: "Belitung, Kepulauan Bangka Belitung",
    category: "Nature", description: "Pantai dengan batu granit besar dan air laut yang jernih.",
    price: "Gratis", budget: 0,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-2.572, 107.666]
  },
  {
    id: 46, name: "Pulau Lengkuas", location: "Belitung, Kepulauan Bangka Belitung",
    category: "Nature", description: "Pulau kecil dengan mercusuar bersejarah dan panorama laut.",
    price: "Bervariasi", budget: 150000,
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1000",
    position: [-2.536, 107.625]
  },
  {
    id: 47, name: "Jam Gadang Bukittinggi", location: "Bukittinggi, Sumatera Barat",
    category: "Culture", description: "Landmark bersejarah yang menjadi ikon Kota Bukittinggi.",
    price: "Gratis", budget: 0,
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000",
    position: [-0.305, 100.369]
  },
  {
    id: 48, name: "Ngarai Sianok", location: "Bukittinggi, Sumatera Barat",
    category: "Nature", description: "Lembah dengan tebing curam dan pemandangan alam yang indah.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    position: [-0.305, 100.36]
  },
  {
    id: 49, name: "Istana Pagaruyung", location: "Tanah Datar, Sumatera Barat",
    category: "Culture", description: "Bangunan replika istana kerajaan Minangkabau dengan arsitektur tradisional.",
    price: "Bervariasi", budget: 25000,
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1000",
    position: [-0.461, 100.62]
  },
  {
    id: 50, name: "Pantai Air Manis", location: "Padang, Sumatera Barat",
    category: "Nature", description: "Pantai yang dikenal dengan legenda Malin Kundang.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [-0.999, 100.357]
  },
  {
    id: 51, name: "Pulau Samosir", location: "Samosir, Sumatera Utara",
    category: "Culture", description: "Pulau di tengah Danau Toba dengan budaya Batak dan panorama perbukitan.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000",
    position: [2.68, 98.85]
  },
  {
    id: 52, name: "Air Terjun Sipiso-piso", location: "Karo, Sumatera Utara",
    category: "Nature", description: "Air terjun tinggi dengan pemandangan kawasan Danau Toba.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1000",
    position: [2.916, 98.522]
  },
  {
    id: 53, name: "Istana Maimun", location: "Medan, Sumatera Utara",
    category: "Culture", description: "Bangunan bersejarah dengan perpaduan arsitektur Melayu dan Eropa.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1000",
    position: [3.575, 98.684]
  },
  {
    id: 54, name: "Pantai Lampuuk", location: "Aceh Besar, Aceh",
    category: "Nature", description: "Pantai berpasir putih dengan pemandangan laut dan perbukitan.",
    price: "Bervariasi", budget: 10000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [5.498, 95.235]
  },
  {
    id: 55, name: "Taman Nasional Gunung Leuser", location: "Aceh dan Sumatera Utara",
    category: "Nature", description: "Kawasan hutan hujan tropis yang menjadi habitat berbagai satwa liar.",
    price: "Bervariasi", budget: 100000,
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000",
    position: [3.5, 97.5]
  },
  {
    id: 56, name: "Danau Maninjau", location: "Agam, Sumatera Barat",
    category: "Nature", description: "Danau vulkanik yang dikelilingi perbukitan hijau.",
    price: "Gratis", budget: 0,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    position: [-0.305, 100.2]
  },

  // KALIMANTAN
  {
    id: 57, name: "Pasar Terapung Lok Baintan", location: "Banjar, Kalimantan Selatan",
    category: "Culinary", description: "Pasar tradisional di atas sungai dengan aktivitas jual beli menggunakan perahu.",
    price: "Gratis", budget: 0,
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000",
    position: [-3.278, 114.679]
  },
  {
    id: 58, name: "Pulau Kakaban", location: "Berau, Kalimantan Timur",
    category: "Nature", description: "Pulau yang memiliki danau air payau dengan ubur-ubur tidak menyengat.",
    price: "Bervariasi", budget: 250000,
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1000",
    position: [2.148, 118.514]
  },
  {
    id: 59, name: "Pulau Maratua", location: "Berau, Kalimantan Timur",
    category: "Nature", description: "Pulau tropis dengan pantai, laguna, dan keindahan bawah laut.",
    price: "Bervariasi", budget: 350000,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [2.25, 118.63]
  },
  {
    id: 60, name: "Taman Nasional Kutai", location: "Kutai Timur, Kalimantan Timur",
    category: "Nature", description: "Kawasan hutan tropis dengan keanekaragaman flora dan fauna.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000",
    position: [0.45, 117.5]
  },
  {
    id: 61, name: "Bukit Bangkirai", location: "Kutai Kartanegara, Kalimantan Timur",
    category: "Adventure", description: "Hutan konservasi dengan jembatan tajuk untuk menikmati pemandangan hutan.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000",
    position: [-1.05, 116.87]
  },
  {
    id: 62, name: "Tugu Khatulistiwa", location: "Pontianak, Kalimantan Barat",
    category: "Culture", description: "Monumen yang menandai lokasi garis khatulistiwa.",
    price: "Gratis", budget: 0,
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000",
    position: [-0.001, 109.322]
  },
  {
    id: 63, name: "Danau Sentarum", location: "Kapuas Hulu, Kalimantan Barat",
    category: "Nature", description: "Kawasan danau musiman dengan ekosistem rawa dan hutan tropis.",
    price: "Bervariasi", budget: 100000,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000",
    position: [0.85, 112.1]
  },
  {
    id: 64, name: "Pantai Lamaru", location: "Balikpapan, Kalimantan Timur",
    category: "Nature", description: "Pantai dengan pepohonan pinus dan suasana rekreasi keluarga.",
    price: "Bervariasi", budget: 20000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-1.21, 116.99]
  },

  // SULAWESI
  {
    id: 65, name: "Pantai Losari", location: "Makassar, Sulawesi Selatan",
    category: "Culinary", description: "Ikon wisata pesisir Makassar yang terkenal dengan pemandangan senja dan kuliner.",
    price: "Gratis", budget: 0,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [-5.144, 119.407]
  },
  {
    id: 66, name: "Benteng Rotterdam", location: "Makassar, Sulawesi Selatan",
    category: "Culture", description: "Benteng peninggalan sejarah dengan museum dan bangunan berarsitektur kolonial.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1000",
    position: [-5.134, 119.405]
  },
  {
    id: 67, name: "Pantai Tanjung Bira", location: "Bulukumba, Sulawesi Selatan",
    category: "Nature", description: "Pantai berpasir putih dengan air laut jernih di ujung selatan Sulawesi.",
    price: "Bervariasi", budget: 25000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-5.613, 120.451]
  },
  {
    id: 68, name: "Kete Kesu", location: "Toraja Utara, Sulawesi Selatan",
    category: "Culture", description: "Desa adat dengan rumah Tongkonan dan tradisi budaya Toraja.",
    price: "Bervariasi", budget: 25000,
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1000",
    position: [-2.97, 119.9]
  },
  {
    id: 69, name: "Danau Linow", location: "Tomohon, Sulawesi Utara",
    category: "Nature", description: "Danau vulkanik yang dikenal dengan perubahan warna airnya.",
    price: "Bervariasi", budget: 30000,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    position: [1.256, 124.84]
  },
  {
    id: 70, name: "Gunung Lokon", location: "Tomohon, Sulawesi Utara",
    category: "Adventure", description: "Gunung berapi dengan panorama pegunungan di sekitar Tomohon.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000",
    position: [1.358, 124.792]
  },
  {
    id: 71, name: "Pantai Tanjung Karang", location: "Donggala, Sulawesi Tengah",
    category: "Nature", description: "Pantai dengan air jernih dan pemandangan bawah laut.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [-0.68, 119.83]
  },
  {
    id: 72, name: "Pulau Kadidiri", location: "Tojo Una-Una, Sulawesi Tengah",
    category: "Nature", description: "Pulau tropis di kawasan Kepulauan Togean dengan panorama laut.",
    price: "Bervariasi", budget: 250000,
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1000",
    position: [-0.39, 121.88]
  },

  // BALI DAN NUSA TENGGARA
  {
    id: 73, name: "Tanah Lot", location: "Tabanan, Bali",
    category: "Culture", description: "Pura di atas batu karang yang menjadi salah satu ikon wisata Bali.",
    price: "Bervariasi", budget: 30000,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000",
    position: [-8.621, 115.086]
  },
  {
    id: 74, name: "Ubud", location: "Gianyar, Bali",
    category: "Culture", description: "Kawasan seni dan budaya Bali dengan sawah, galeri, dan suasana pedesaan.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000",
    position: [-8.506, 115.262]
  },
  {
    id: 75, name: "Pantai Kelingking", location: "Nusa Penida, Bali",
    category: "Nature", description: "Pantai dengan tebing berbentuk unik yang menghadap laut biru.",
    price: "Bervariasi", budget: 10000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-8.75, 115.472]
  },
  {
    id: 76, name: "Pantai Pandawa", location: "Badung, Bali",
    category: "Nature", description: "Pantai dengan pasir putih dan tebing kapur di sekitarnya.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [-8.845, 115.188]
  },
  {
    id: 77, name: "Desa Penglipuran", location: "Bangli, Bali",
    category: "Culture", description: "Desa adat Bali yang dikenal dengan tata ruang dan arsitektur tradisional.",
    price: "Bervariasi", budget: 30000,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000",
    position: [-8.423, 115.354]
  },
  {
    id: 78, name: "Pink Beach", location: "Taman Nasional Komodo, Nusa Tenggara Timur",
    category: "Nature", description: "Pantai dengan pasir berwarna merah muda dan panorama laut.",
    price: "Bervariasi", budget: 250000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-8.62, 119.55]
  },
  {
    id: 79, name: "Pulau Padar", location: "Manggarai Barat, Nusa Tenggara Timur",
    category: "Adventure", description: "Pulau dengan jalur trekking dan panorama teluk dari atas bukit.",
    price: "Bervariasi", budget: 250000,
    image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1000",
    position: [-8.65, 119.57]
  },
  {
    id: 80, name: "Desa Wae Rebo", location: "Manggarai, Nusa Tenggara Timur",
    category: "Culture", description: "Desa adat di pegunungan dengan rumah tradisional berbentuk kerucut.",
    price: "Bervariasi", budget: 250000,
    image: "https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=1000",
    position: [-8.77, 120.29]
  },
  {
    id: 81, name: "Pantai Selong Belanak", location: "Lombok Tengah, Nusa Tenggara Barat",
    category: "Nature", description: "Pantai dengan garis pasir melengkung dan ombak yang populer untuk belajar berselancar.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-8.875, 116.16]
  },
  {
    id: 82, name: "Air Terjun Tiu Kelep", location: "Lombok Utara, Nusa Tenggara Barat",
    category: "Nature", description: "Air terjun di kawasan kaki Gunung Rinjani yang dikelilingi hutan.",
    price: "Bervariasi", budget: 20000,
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1000",
    position: [-8.305, 116.405]
  },

  // MALUKU DAN PAPUA
  {
    id: 83, name: "Pantai Natsepa", location: "Maluku Tengah, Maluku",
    category: "Nature", description: "Pantai dengan pemandangan Teluk Baguala dan kuliner rujak khas.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-3.62, 128.29]
  },
  {
    id: 84, name: "Benteng Belgica", location: "Banda Neira, Maluku",
    category: "Culture", description: "Benteng peninggalan kolonial yang menyimpan sejarah perdagangan rempah.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1000",
    position: [-4.523, 129.896]
  },
  {
    id: 85, name: "Pantai Ngurbloat", location: "Maluku Tenggara, Maluku",
    category: "Nature", description: "Pantai dengan hamparan pasir putih yang sangat halus.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-5.65, 132.72]
  },
  {
    id: 86, name: "Pulau Dodola", location: "Morotai, Maluku Utara",
    category: "Nature", description: "Pulau dengan pasir putih dan hamparan laut jernih di Maluku Utara.",
    price: "Bervariasi", budget: 150000,
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1000",
    position: [2.05, 128.32]
  },
  {
    id: 87, name: "Pantai Bosnik", location: "Biak, Papua",
    category: "Nature", description: "Pantai dengan air laut jernih dan pemandangan pulau-pulau kecil.",
    price: "Bervariasi", budget: 25000,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [-1.17, 136.1]
  },
  {
    id: 88, name: "Lembah Baliem", location: "Jayawijaya, Papua Pegunungan",
    category: "Culture", description: "Lembah pegunungan yang dikenal dengan budaya masyarakat Dani.",
    price: "Bervariasi", budget: 150000,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000",
    position: [-4.08, 138.95]
  },
  {
    id: 89, name: "Pantai Base-G", location: "Jayapura, Papua",
    category: "Nature", description: "Pantai dengan pasir cerah dan panorama Teluk Youtefa.",
    price: "Bervariasi", budget: 20000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-2.51, 140.72]
  },
  {
    id: 90, name: "Pegunungan Arfak", location: "Manokwari, Papua Barat",
    category: "Adventure", description: "Kawasan pegunungan dengan danau, hutan, dan keanekaragaman burung.",
    price: "Bervariasi", budget: 150000,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000",
    position: [-1.15, 133.9]
  },

  // DESTINASI TAMBAHAN DARI BERBAGAI DAERAH
  {
    id: 91, name: "Pantai Jikomalamo", location: "Ternate, Maluku Utara",
    category: "Nature", description: "Pantai kecil dengan air laut jernih dan pemandangan Pulau Hiri.",
    price: "Gratis", budget: 0,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [0.82, 127.35]
  },
  {
    id: 92, name: "Danau Kelimutu", location: "Ende, Nusa Tenggara Timur",
    category: "Nature", description: "Danau kawah dengan tiga kolam yang dikenal memiliki warna berbeda.",
    price: "Bervariasi", budget: 150000,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    position: [-8.77, 121.82]
  },
  {
    id: 93, name: "Pantai Oetune", location: "Timor Tengah Selatan, Nusa Tenggara Timur",
    category: "Nature", description: "Pantai dengan hamparan pasir luas dan bukit pasir yang unik.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-10.03, 124.38]
  },
  {
    id: 94, name: "Air Terjun Moramo", location: "Konawe Selatan, Sulawesi Tenggara",
    category: "Nature", description: "Air terjun bertingkat yang mengalir di antara bebatuan alam.",
    price: "Bervariasi", budget: 20000,
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1000",
    position: [-4.13, 122.59]
  },
  {
    id: 95, name: "Pulau Hoga", location: "Wakatobi, Sulawesi Tenggara",
    category: "Nature", description: "Pulau dengan pantai tropis dan kawasan terumbu karang.",
    price: "Bervariasi", budget: 200000,
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1000",
    position: [-5.48, 123.75]
  },
  {
    id: 96, name: "Pantai Akkarena", location: "Makassar, Sulawesi Selatan",
    category: "Entertainment", description: "Kawasan rekreasi pantai dengan pemandangan matahari terbenam.",
    price: "Bervariasi", budget: 25000,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [-5.173, 119.39]
  },
  {
    id: 97, name: "Kebun Raya Bogor", location: "Bogor, Jawa Barat",
    category: "Nature", description: "Kebun botani luas dengan koleksi tumbuhan dan kawasan hijau.",
    price: "Bervariasi", budget: 25000,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000",
    position: [-6.597, 106.799]
  },
  {
    id: 98, name: "Taman Safari Indonesia", location: "Bogor, Jawa Barat",
    category: "Entertainment", description: "Tempat wisata edukasi satwa dengan pengalaman melihat berbagai hewan.",
    price: "Bervariasi", budget: 200000,
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000",
    position: [-6.72, 106.95]
  },
  {
    id: 99, name: "Pantai Pangandaran", location: "Pangandaran, Jawa Barat",
    category: "Nature", description: "Pantai populer dengan kawasan rekreasi, pasir, dan pemandangan laut.",
    price: "Bervariasi", budget: 30000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-7.702, 108.65]
  },
  {
    id: 100, name: "Green Canyon", location: "Pangandaran, Jawa Barat",
    category: "Adventure", description: "Aliran sungai di antara tebing batu dengan panorama alam yang menarik.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1000",
    position: [-7.738, 108.46]
  },


  // CIREBON DAN SEKITARNYA
  {
    id: 101, name: "Keraton Kasepuhan", location: "Kota Cirebon, Jawa Barat",
    category: "Culture", description: "Kompleks keraton bersejarah yang menyimpan peninggalan Kesultanan Cirebon.",
    price: "Bervariasi", budget: 20000,
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1000",
    position: [-6.725, 108.571]
  },
  {
    id: 102, name: "Gua Sunyaragi", location: "Kota Cirebon, Jawa Barat",
    category: "Culture", description: "Kompleks gua dan taman bersejarah dengan susunan batu karang yang unik.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1000",
    position: [-6.733, 108.553]
  },
  {
    id: 103, name: "Keraton Kanoman", location: "Kota Cirebon, Jawa Barat",
    category: "Culture", description: "Keraton peninggalan Kesultanan Cirebon dengan koleksi benda bersejarah.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1000",
    position: [-6.723, 108.571]
  },
  {
    id: 104, name: "Pantai Kejawanan", location: "Kota Cirebon, Jawa Barat",
    category: "Nature", description: "Kawasan pantai yang menawarkan pemandangan laut dan aktivitas wisata pesisir.",
    price: "Bervariasi", budget: 10000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-6.718, 108.579]
  },
  {
    id: 105, name: "Batik Trusmi", location: "Kabupaten Cirebon, Jawa Barat",
    category: "Culture", description: "Sentra batik khas Cirebon yang dikenal dengan motif Mega Mendung.",
    price: "Gratis", budget: 0,
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=1000",
    position: [-6.702, 108.493]
  },
  {
    id: 106, name: "Setu Patok", location: "Kabupaten Cirebon, Jawa Barat",
    category: "Nature", description: "Danau buatan dengan panorama perairan dan pemandangan Gunung Ciremai.",
    price: "Bervariasi", budget: 10000,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    position: [-6.774, 108.554]
  },
  {
    id: 107, name: "Telaga Remis", location: "Kuningan, Jawa Barat",
    category: "Nature", description: "Telaga alami yang dikelilingi pepohonan dan suasana sejuk pegunungan.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    position: [-6.789, 108.414]
  },
  {
    id: 108, name: "Waduk Darma", location: "Kuningan, Jawa Barat",
    category: "Nature", description: "Waduk luas dengan panorama perbukitan dan pemandangan matahari terbenam.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000",
    position: [-7.002, 108.409]
  },
  {
    id: 109, name: "Terasering Panyaweuyan", location: "Majalengka, Jawa Barat",
    category: "Nature", description: "Hamparan perkebunan berundak di kawasan perbukitan dengan panorama hijau.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    position: [-6.858, 108.317]
  },
  {
    id: 110, name: "Situ Cipanten", location: "Majalengka, Jawa Barat",
    category: "Nature", description: "Danau dengan air jernih yang dikelilingi pepohonan dan kawasan hijau.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000",
    position: [-6.838, 108.332]
  },
  {
    id: 111, name: "Pantai Tirtamaya", location: "Indramayu, Jawa Barat",
    category: "Nature", description: "Pantai wisata yang menjadi salah satu tujuan rekreasi pesisir di Indramayu.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-6.318, 108.396]
  },
  {
    id: 112, name: "Pulau Biawak", location: "Indramayu, Jawa Barat",
    category: "Nature", description: "Pulau kecil dengan ekosistem pesisir, mercusuar bersejarah, dan kawasan laut.",
    price: "Bervariasi", budget: 250000,
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1000",
    position: [-5.929, 108.378]
  },

  // JAWA BARAT LAINNYA
  {
    id: 113, name: "Kawah Putih Tinggi Raja", location: "Simalungun, Sumatera Utara",
    category: "Nature", description: "Kawasan mata air panas dengan formasi batuan putih yang unik.",
    price: "Bervariasi", budget: 20000,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    position: [3.105, 98.85]
  },
  {
    id: 114, name: "Pantai Ujung Genteng", location: "Sukabumi, Jawa Barat",
    category: "Nature", description: "Kawasan pantai dengan pasir putih dan panorama pesisir selatan Jawa.",
    price: "Bervariasi", budget: 20000,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [-7.366, 106.403]
  },
  {
    id: 115, name: "Curug Cikaso", location: "Sukabumi, Jawa Barat",
    category: "Nature", description: "Air terjun dengan beberapa aliran yang jatuh di antara tebing hijau.",
    price: "Bervariasi", budget: 25000,
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1000",
    position: [-7.326, 106.629]
  },
  {
    id: 116, name: "Situ Gunung", location: "Sukabumi, Jawa Barat",
    category: "Adventure", description: "Kawasan wisata alam dengan danau, hutan, dan jembatan gantung.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000",
    position: [-6.842, 106.925]
  },
  {
    id: 117, name: "Kampung Naga", location: "Tasikmalaya, Jawa Barat",
    category: "Culture", description: "Kampung adat yang mempertahankan tata ruang dan tradisi masyarakat Sunda.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1000",
    position: [-7.359, 107.993]
  },
  {
    id: 118, name: "Pantai Santolo", location: "Garut, Jawa Barat",
    category: "Nature", description: "Pantai selatan dengan panorama laut, pasir, dan kawasan perikanan.",
    price: "Bervariasi", budget: 20000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-7.668, 107.688]
  },
  {
    id: 119, name: "Gunung Papandayan", location: "Garut, Jawa Barat",
    category: "Adventure", description: "Gunung dengan kawah, hutan mati, dan kawasan padang edelweiss.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000",
    position: [-7.319, 107.731]
  },
  {
    id: 120, name: "Pantai Batu Karas", location: "Pangandaran, Jawa Barat",
    category: "Nature", description: "Pantai yang dikenal sebagai salah satu lokasi rekreasi dan selancar.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1000",
    position: [-7.747, 108.496]
  },

  // JAWA TENGAH DAN YOGYAKARTA
  {
    id: 121, name: "Lawang Sewu", location: "Semarang, Jawa Tengah",
    category: "Culture", description: "Bangunan bersejarah dengan arsitektur kolonial yang menjadi ikon Semarang.",
    price: "Bervariasi", budget: 20000,
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1000",
    position: [-6.984, 110.41]
  },
  {
    id: 122, name: "Sam Poo Kong", location: "Semarang, Jawa Tengah",
    category: "Culture", description: "Kompleks klenteng bersejarah yang berkaitan dengan perjalanan Laksamana Cheng Ho.",
    price: "Bervariasi", budget: 25000,
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1000",
    position: [-6.996, 110.398]
  },
  {
    id: 123, name: "Dataran Tinggi Kopeng", location: "Semarang, Jawa Tengah",
    category: "Nature", description: "Kawasan dataran tinggi dengan udara sejuk dan pemandangan pegunungan.",
    price: "Bervariasi", budget: 20000,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000",
    position: [-7.39, 110.42]
  },
  {
    id: 124, name: "Candi Gedong Songo", location: "Semarang, Jawa Tengah",
    category: "Culture", description: "Kompleks candi Hindu yang berada di kawasan perbukitan Bandungan.",
    price: "Bervariasi", budget: 30000,
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1000",
    position: [-7.21, 110.343]
  },
  {
    id: 125, name: "Pantai Wediombo", location: "Gunungkidul, DI Yogyakarta",
    category: "Nature", description: "Pantai dengan batuan karang dan kolam alami di kawasan pesisir.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-8.187, 110.707]
  },
  {
    id: 126, name: "Goa Pindul", location: "Gunungkidul, DI Yogyakarta",
    category: "Adventure", description: "Gua dengan aliran sungai bawah tanah yang menjadi lokasi wisata susur gua.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1000",
    position: [-7.931, 110.65]
  },
  {
    id: 127, name: "Pantai Jogan", location: "Gunungkidul, DI Yogyakarta",
    category: "Nature", description: "Pantai unik dengan aliran air terjun yang mengarah ke kawasan pesisir.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1000",
    position: [-8.181, 110.679]
  },

  // DAERAH LAIN DI INDONESIA
  {
    id: 128, name: "Taman Nasional Way Kambas", location: "Lampung Timur, Lampung",
    category: "Nature", description: "Kawasan konservasi yang dikenal dengan perlindungan gajah Sumatra.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000",
    position: [-4.93, 105.76]
  },
  {
    id: 129, name: "Pantai Tanjung Lesung", location: "Pandeglang, Banten",
    category: "Nature", description: "Kawasan wisata pantai dengan pasir putih dan pemandangan Selat Sunda.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-6.478, 105.655]
  },
  {
    id: 130, name: "Danau Ranau", location: "Ogan Komering Ulu Selatan, Sumatera Selatan",
    category: "Nature", description: "Danau vulkanik yang dikelilingi perbukitan dengan panorama Gunung Seminung.",
    price: "Bervariasi", budget: 25000,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000",
    position: [-4.85, 103.93]
  },


  {
    id: 131, name: "Pulau Weh", location: "Sabang, Aceh",
    category: "Beach", description: "Pulau dengan panorama laut jernih dan suasana alam tropis.",
    price: "Bervariasi", budget: 100000,
    image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1000",
    position: [5.82, 95.28]
  },
  {
    id: 132, name: "Danau Toba", location: "Samosir, Sumatera Utara",
    category: "Nature", description: "Danau vulkanik luas dengan pemandangan perbukitan dan Pulau Samosir.",
    price: "Bervariasi", budget: 50000,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Foto_Danau_Toba.jpg",
    position: [2.68, 98.87]
  },
  {
    id: 133, name: "Istana Maimun", location: "Medan, Sumatera Utara",
    category: "Culture", description: "Bangunan bersejarah dengan arsitektur khas Kesultanan Deli.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1000",
    position: [3.575, 98.683]
  },
  {
    id: 134, name: "Jam Gadang", location: "Bukittinggi, Sumatera Barat",
    category: "Culture", description: "Menara jam ikonik yang menjadi landmark Kota Bukittinggi.",
    price: "Gratis", budget: 0,
    image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1000",
    position: [-0.305, 100.369]
  },
  {
    id: 135, name: "Lembah Harau", location: "Lima Puluh Kota, Sumatera Barat",
    category: "Nature", description: "Lembah dengan tebing-tebing tinggi dan hamparan alam hijau.",
    price: "Bervariasi", budget: 20000,
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1000",
    position: [-0.11, 100.67]
  },
  {
    id: 136, name: "Candi Muaro Jambi", location: "Muaro Jambi, Jambi",
    category: "History", description: "Kompleks peninggalan candi bersejarah dari masa kerajaan kuno.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=1000",
    position: [-1.47, 103.67]
  },
  {
    id: 137, name: "Jembatan Ampera", location: "Palembang, Sumatera Selatan",
    category: "Landmark", description: "Jembatan ikonik yang membentang di atas Sungai Musi.",
    price: "Gratis", budget: 0,
    image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1000",
    position: [-2.99, 104.76]
  },
  {
    id: 138, name: "Pantai Parai Tenggiri", location: "Bangka, Kepulauan Bangka Belitung",
    category: "Beach", description: "Pantai dengan pasir putih dan formasi batu granit yang khas.",
    price: "Bervariasi", budget: 30000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-1.85, 106.12]
  },
  {
    id: 139, name: "Taman Nasional Way Kambas", location: "Lampung Timur, Lampung",
    category: "Nature", description: "Kawasan konservasi alam yang menjadi habitat berbagai satwa liar.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1000",
    position: [-4.93, 105.75]
  },
  {
    id: 140, name: "Kota Tua Jakarta", location: "Jakarta Barat, DKI Jakarta",
    category: "History", description: "Kawasan bersejarah dengan bangunan peninggalan masa kolonial.",
    price: "Bervariasi", budget: 20000,
    image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1000",
    position: [-6.135, 106.813]
  },
  {
    id: 141, name: "Taman Mini Indonesia Indah", location: "Jakarta Timur, DKI Jakarta",
    category: "Culture", description: "Kawasan wisata edukasi yang memperkenalkan keragaman budaya Indonesia.",
    price: "Bervariasi", budget: 35000,
    image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1000",
    position: [-6.302, 106.895]
  },
  {
    id: 142, name: "Kawah Rengganis", location: "Ciwidey, Bandung, Jawa Barat",
    category: "Nature", description: "Kawasan kawah dengan suasana alam pegunungan dan sumber air panas.",
    price: "Bervariasi", budget: 30000,
    image: "https://images.unsplash.com/photo-1511497584788-876760111969?w=1000",
    position: [-7.166, 107.397]
  },
  {
    id: 143, name: "Candi Borobudur", location: "Magelang, Jawa Tengah",
    category: "History", description: "Candi Buddha bersejarah dengan relief dan struktur bangunan yang megah.",
    price: "Bervariasi", budget: 50000,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/CANDI_BOROBUDUR.jpg",
    position: [-7.607, 110.204]
  },
  {
    id: 144, name: "Kepulauan Karimunjawa", location: "Jepara, Jawa Tengah",
    category: "Beach", description: "Kepulauan dengan pantai berpasir putih dan perairan tropis.",
    price: "Bervariasi", budget: 150000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-5.87, 110.43]
  },
  {
    id: 145, name: "Pantai Parangtritis", location: "Bantul, DI Yogyakarta",
    category: "Beach", description: "Pantai luas dengan hamparan pasir dan pemandangan laut selatan.",
    price: "Bervariasi", budget: 15000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-8.02, 110.33]
  },
  {
    id: 146, name: "Gunung Bromo", location: "Probolinggo, Jawa Timur",
    category: "Adventure", description: "Gunung berapi dengan panorama lautan pasir dan pegunungan.",
    price: "Bervariasi", budget: 100000,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mt._Bromo.jpg",
    position: [-7.94, 112.95]
  },
  {
    id: 147, name: "Air Terjun Tumpak Sewu", location: "Lumajang, Jawa Timur",
    category: "Nature", description: "Air terjun megah yang mengalir dari tebing melingkar.",
    price: "Bervariasi", budget: 30000,
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1000",
    position: [-8.23, 112.92]
  },
  {
    id: 148, name: "Kawah Ijen", location: "Banyuwangi, Jawa Timur",
    category: "Adventure", description: "Kawasan gunung berapi dengan danau kawah berwarna toska.",
    price: "Bervariasi", budget: 100000,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000",
    position: [-8.058, 114.242]
  },
  {
    id: 149, name: "Tanah Lot", location: "Tabanan, Bali",
    category: "Culture", description: "Pura di atas batu karang yang menjadi salah satu ikon wisata Bali.",
    price: "Bervariasi", budget: 30000,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000",
    position: [-8.621, 115.086]
  },
  {
    id: 150, name: "Taman Nasional Bali Barat", location: "Buleleng, Bali",
    category: "Nature", description: "Kawasan konservasi dengan hutan, pesisir, dan keanekaragaman satwa.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1000",
    position: [-8.13, 114.52]
  },
  {
    id: 151, name: "Gili Trawangan", location: "Lombok Utara, Nusa Tenggara Barat",
    category: "Beach", description: "Pulau wisata dengan pantai tropis dan suasana pesisir yang santai.",
    price: "Bervariasi", budget: 100000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-8.35, 116.04]
  },
  {
    id: 152, name: "Gunung Rinjani", location: "Lombok, Nusa Tenggara Barat",
    category: "Adventure", description: "Gunung dengan panorama alam pegunungan dan Danau Segara Anak.",
    price: "Bervariasi", budget: 150000,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000",
    position: [-8.41, 116.46]
  },
  {
    id: 153, name: "Labuan Bajo", location: "Manggarai Barat, Nusa Tenggara Timur",
    category: "Beach", description: "Kota pesisir yang menjadi gerbang menuju kawasan Taman Nasional Komodo.",
    price: "Bervariasi", budget: 100000,
    image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1000",
    position: [-8.49, 119.88]
  },
  {
    id: 154, name: "Danau Kelimutu", location: "Ende, Nusa Tenggara Timur",
    category: "Nature", description: "Danau kawah dengan tiga danau yang dikenal memiliki warna berbeda.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    position: [-8.77, 121.82]
  },
  {
    id: 155, name: "Taman Nasional Tanjung Puting", location: "Kotawaringin Barat, Kalimantan Tengah",
    category: "Nature", description: "Kawasan hutan tropis yang dikenal sebagai habitat orangutan.",
    price: "Bervariasi", budget: 100000,
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1000",
    position: [-2.75, 111.72]
  },
  {
    id: 156, name: "Kepulauan Derawan", location: "Berau, Kalimantan Timur",
    category: "Beach", description: "Kepulauan dengan perairan jernih dan kehidupan bawah laut yang beragam.",
    price: "Bervariasi", budget: 150000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-2.28, 118.24]
  },
  {
    id: 157, name: "Taman Nasional Wakatobi", location: "Wakatobi, Sulawesi Tenggara",
    category: "Nature", description: "Kawasan laut yang terkenal dengan terumbu karang dan keanekaragaman bawah laut.",
    price: "Bervariasi", budget: 100000,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000",
    position: [-5.32, 123.59]
  },
  {
    id: 158, name: "Tana Toraja", location: "Toraja, Sulawesi Selatan",
    category: "Culture", description: "Wilayah dengan rumah adat Tongkonan dan tradisi budaya yang khas.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1000",
    position: [-3.0, 119.8]
  },
  {
    id: 159, name: "Taman Laut Bunaken", location: "Manado, Sulawesi Utara",
    category: "Nature", description: "Taman laut dengan terumbu karang dan beragam kehidupan bawah laut.",
    price: "Bervariasi", budget: 50000,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000",
    position: [-1.62, 124.76]
  },
  {
    id: 160, name: "Raja Ampat", location: "Raja Ampat, Papua Barat Daya",
    category: "Beach", description: "Kepulauan dengan gugusan pulau karst dan keindahan laut tropis.",
    price: "Bervariasi", budget: 250000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
    position: [-0.23, 130.52]
  }


];

destinations.push(...additionalDestinations);
