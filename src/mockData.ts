import { KpiCsRecord, KpiFosRecord, MonitoringRecord, TemplateRecord, KnowledgeRecord, ActivityLog, User } from './types';

export const mockUsers: (User & { passwordHash: string })[] = [
  {
    id: 'user-admin',
    username: 'admin',
    passwordHash: 'admin123', // Clean, clear matching password
    role: 'Admin',
    name: 'Haris Muhammad',
    nik: 'GG-00199',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'user-tl',
    username: 'leader',
    passwordHash: 'leader123',
    role: 'Team Leader',
    name: 'Yunisel Rachmil',
    nik: 'GG-00244',
    photo: '/src/assets/images/yunisel_avatar_1784641085038.jpg'
  },
  {
    id: 'user-cs',
    username: 'cs',
    passwordHash: 'cs123',
    role: 'Customer Service',
    name: 'NAFA LAILA WAHIDAH',
    nik: 'GG-00501',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'user-fos',
    username: 'fos',
    passwordHash: 'fos123',
    role: 'FOS',
    name: 'Eko Wijaya',
    nik: 'GG-00788',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  }
];

export const initialKpiCs: KpiCsRecord[] = [
  {
    id: 'cs-1',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    name: 'NAFA LAILA WAHIDAH',
    nik: 'GG-00501',
    sales: 35,
    productivity: 358,
    attendance: 100,
    roleplay: 95,
    achievement: 98.5,
    notes: 'Performa CSR Terbaik #1 Juni 2026. Penjualan IndiHome (13) & Orbit (3) tertinggi, TNPS 100% & Mobile Retensi 100%.',
    ranking: 1,
    progress: 73,
    target: 48,
    status: 'Excellent',
    haloSales: 19,
    indihomeSales: 13,
    orbitSales: 3,
    fivasSales: 1362000,
    promotor: 2,
    passiver: 0,
    detractor: 0,
    tnpsScore: 100,
    doIh: 5,
    retensiIh: 71,
    rrFix: 93,
    mobileChurnPrev: 100
  },
  {
    id: 'cs-2',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    name: 'RANI PUSPITA',
    nik: 'GG-00502',
    sales: 23,
    productivity: 364,
    attendance: 98,
    roleplay: 92,
    achievement: 94.2,
    notes: 'Rank #2 CSR. Produktivitas tertinggi (364 pelanggan dilayani). Churn prevention Mobile 100% & DO IH 9.',
    ranking: 2,
    progress: 48,
    target: 48,
    status: 'Excellent',
    haloSales: 15,
    indihomeSales: 6,
    orbitSales: 2,
    fivasSales: 1223500,
    promotor: 3,
    passiver: 1,
    detractor: 0,
    tnpsScore: 75,
    doIh: 9,
    retensiIh: 48,
    rrFix: 84,
    mobileChurnPrev: 100
  },
  {
    id: 'cs-3',
    photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=150',
    name: 'ADELIA DEVI LUTFIANA SARI',
    nik: 'GG-00503',
    sales: 17,
    productivity: 271,
    attendance: 100,
    roleplay: 90,
    achievement: 91.8,
    notes: 'Rank #3 CSR. Revenue FIVAS tertinggi Rp 1.539.000. TNPS 100% sempurna & RR FIX 91%.',
    ranking: 3,
    progress: 35,
    target: 48,
    status: 'Good',
    haloSales: 12,
    indihomeSales: 5,
    orbitSales: 0,
    fivasSales: 1539000,
    promotor: 4,
    passiver: 0,
    detractor: 0,
    tnpsScore: 100,
    doIh: 4,
    retensiIh: 42,
    rrFix: 91,
    mobileChurnPrev: 91
  },
  {
    id: 'cs-4',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    name: 'RAHADIAN ADITYA PUTRA',
    nik: 'GG-00504',
    sales: 14,
    productivity: 352,
    attendance: 96,
    roleplay: 88,
    achievement: 88.4,
    notes: 'Rank #4 CSR. Retensi IndiHome tertinggi (88) & RR Fix 95%. Memerlukan peningkatan penjualan Halo (5/26).',
    ranking: 4,
    progress: 29,
    target: 48,
    status: 'Good',
    haloSales: 5,
    indihomeSales: 8,
    orbitSales: 1,
    fivasSales: 50000,
    promotor: 3,
    passiver: 0,
    detractor: 0,
    tnpsScore: 100,
    doIh: 4,
    retensiIh: 88,
    rrFix: 95,
    mobileChurnPrev: 70
  },
  {
    id: 'cs-5',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    name: 'SYAFIRA KARTIKA CAHYANINGRUM',
    nik: 'GG-00505',
    sales: 15,
    productivity: 246,
    attendance: 95,
    roleplay: 85,
    achievement: 82.0,
    notes: 'Rank #5 CSR. Promotor TNPS terbanyak (6) & DO IH 11. Perlu coaching penawaran IndiHome (1/20).',
    ranking: 5,
    progress: 31,
    target: 48,
    status: 'Needs Improvement',
    haloSales: 14,
    indihomeSales: 1,
    orbitSales: 0,
    fivasSales: 947475,
    promotor: 6,
    passiver: 1,
    detractor: 0,
    tnpsScore: 86,
    doIh: 11,
    retensiIh: 49,
    rrFix: 81,
    mobileChurnPrev: 100
  }
];

export const initialKpiFos: KpiFosRecord[] = [
  {
    id: 'fos-1',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    name: 'Eko Wijaya',
    nik: 'GG-00788',
    monitoringTicket: 164,
    inSla: 159,
    outSla: 5,
    achievement: 96.9,
    notes: 'Outstanding technical diagnostic capability. Very low escalations rate.',
    ranking: 1,
    status: 'Excellent'
  },
  {
    id: 'fos-2',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    name: 'Yudi Hartono',
    nik: 'GG-00789',
    monitoringTicket: 152,
    inSla: 145,
    outSla: 7,
    achievement: 95.3,
    notes: 'Excellent team communication. Resolves complex optical line issues swiftly.',
    ranking: 2,
    status: 'Excellent'
  },
  {
    id: 'fos-3',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
    name: 'Heri Kusuma',
    nik: 'GG-00790',
    monitoringTicket: 140,
    inSla: 130,
    outSla: 10,
    achievement: 92.8,
    notes: 'Consistently completes outdoor client installations on target time.',
    ranking: 3,
    status: 'Good'
  },
  {
    id: 'fos-4',
    photo: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=150',
    name: 'Andi Wijaya',
    nik: 'GG-00791',
    monitoringTicket: 125,
    inSla: 112,
    outSla: 13,
    achievement: 89.6,
    notes: 'Solid effort on ticket diagnostic reporting. Needs improvement on paperwork turnaround.',
    ranking: 4,
    status: 'Good'
  },
  {
    id: 'fos-5',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    name: 'Budi Utomo',
    nik: 'GG-00792',
    monitoringTicket: 110,
    inSla: 95,
    outSla: 15,
    achievement: 86.3,
    notes: 'A bit behind SLA on fiber line activations in regional sub-zones.',
    ranking: 5,
    status: 'Needs Improvement'
  }
];

export const initialMonitoring: MonitoringRecord[] = [
  {
    id: 'mon-1',
    type: 'Indihome',
    customerName: 'Yusuf Maulana',
    csName: 'NAFA LAILA WAHIDAH',
    nik: 'GG-00501',
    msisdn: '081122334455',
    indihomeNumber: '122345678901',
    complaint: 'LOS Red Light blinking on ONT Router. Customer unable to access the internet.',
    ticketNumber: 'IN-2026-0711',
    sla: 4, // 4 hours remaining
    category: 'Technical',
    status: 'In Progress',
    notes: 'FOS technician dispatch assigned to main distribution cabinet subzone-2.',
    createdDate: '2026-07-19T06:00:00Z',
    updatedDate: '2026-07-19T07:30:00Z'
  },
  {
    id: 'mon-2',
    type: 'Indihome',
    customerName: 'Siti Handayani',
    csName: 'RANI PUSPITA',
    nik: 'GG-00502',
    msisdn: '081298765432',
    indihomeNumber: '122345678902',
    complaint: 'Billing mismatch. Promotional package speed-boost of 100Mbps not reflected in active invoice.',
    ticketNumber: 'IN-2026-0712',
    sla: 22,
    category: 'Billing',
    status: 'Open',
    notes: 'Requires Finance escalation for manual adjustment adjustment of credit note.',
    createdDate: '2026-07-19T07:15:00Z',
    updatedDate: '2026-07-19T07:15:00Z'
  },
  {
    id: 'mon-3',
    type: 'Indihome',
    customerName: 'Agus Salim',
    csName: 'ADELIA DEVI LUTFIANA SARI',
    nik: 'GG-00503',
    msisdn: '082155667788',
    indihomeNumber: '122345678903',
    complaint: 'Request for New Activation (PSB) Indihome Fiber 50Mbps at Griya Asri block D/12.',
    ticketNumber: 'IN-2026-0713',
    sla: 12,
    category: 'New Activation',
    status: 'Resolved',
    notes: 'Successfully installed, tested ping and speed, customer signed digital activation form.',
    createdDate: '2026-07-18T09:00:00Z',
    updatedDate: '2026-07-19T04:30:00Z'
  },
  {
    id: 'mon-4',
    type: 'Telkomsel',
    customerName: 'Rina Wijaya',
    csName: 'NAFA LAILA WAHIDAH',
    nik: 'GG-00501',
    msisdn: '081199001122',
    indihomeNumber: '-',
    complaint: 'Prepaid SIM Card recovery required. Lost physical phone, requesting upgrade to eSIM eSIM profile.',
    ticketNumber: 'TS-2026-101',
    sla: 1, // 1 hour remaining - Yellow Warning
    category: 'Product Modification',
    status: 'In Progress',
    notes: 'ID card validated. QR profile generation running in Telkomsel Provisioning portal.',
    createdDate: '2026-07-19T07:00:00Z',
    updatedDate: '2026-07-19T07:45:00Z'
  },
  {
    id: 'mon-5',
    type: 'Telkomsel',
    customerName: 'Devi Puspita',
    csName: 'RAHADIAN ADITYA PUTRA',
    nik: 'GG-00504',
    msisdn: '081344556677',
    indihomeNumber: '-',
    complaint: 'Telkomsel Halo postpaid registration stuck on pending status due to old credit history check.',
    ticketNumber: 'TS-2026-102',
    sla: -2, // Over SLA - Red Warning
    category: 'Billing',
    status: 'Escalated',
    notes: 'Risk management system review required. Forwarded to Head Office Credit scoring desk.',
    createdDate: '2026-07-18T10:00:00Z',
    updatedDate: '2026-07-19T02:00:00Z'
  },
  {
    id: 'mon-6',
    type: 'Telkomsel',
    customerName: 'Rudi Hermawan',
    csName: 'NAFA LAILA WAHIDAH',
    nik: 'GG-00501',
    msisdn: '081288990011',
    indihomeNumber: '-',
    complaint: 'Poor signal reception (3G/4G/5G dropping) at Office Complex Central Jakarta area.',
    ticketNumber: 'TS-2026-103',
    sla: 48,
    category: 'Network Issue',
    status: 'Open',
    notes: 'Referred to RF Engineering department for regional cell site verification.',
    createdDate: '2026-07-19T08:00:00Z',
    updatedDate: '2026-07-19T08:00:00Z'
  }
];

export const initialTemplates: TemplateRecord[] = [
  {
    id: 'tpl-1',
    title: 'Ganti Kartu Telkomsel (Lost/Upgrade)',
    category: 'Customer Service',
    usageCount: 452,
    isFavorite: true,
    content: `Yth. Pelanggan Telkomsel,

Berikut adalah data penggantian kartu baru Anda di Grapari Garuda:
Nama Pelanggan: {customerName}
Nomor MSISDN: {msisdn}
Nomor Serial Card Baru: {serialNumber}
Alasan: {reason} (Ganti Kartu / Upgrade 4G ke 5G)

Proses verifikasi biometrik dan kelengkapan identitas (E-KTP) telah dinyatakan valid. Kartu baru akan aktif secara otomatis dalam waktu maksimal 15-30 menit. Silakan restart perangkat Anda secara berkala.

Jika terdapat kendala lebih lanjut, silakan hubungi asisten virtual Veronika atau kunjungi Grapari terdekat. Terimakasih telah menggunakan layanan Telkomsel.`
  },
  {
    id: 'tpl-2',
    title: 'Reaktivasi Kartu Hangus',
    category: 'Customer Service',
    usageCount: 389,
    isFavorite: true,
    content: `Yth. Pelanggan Telkomsel,

Pengajuan REAKTIVASI kartu hangus Anda telah kami terima dan sukses diproses:
Nomor Pelanggan: {msisdn}
Nama Registrasi: {customerName}
Tipe Kartu: Prabayar (Re-Activated)

Kartu Anda telah diaktifkan kembali secara langsung. Silakan isi ulang pulsa atau paket internet minimal Rp 10.000 dalam waktu 1x24 jam untuk memperpanjang masa aktif baru dan mencegah kartu hangus kembali.

Terimakasih atas kepercayaan Anda terhadap layanan Telkomsel Grapari Garuda.`
  },
  {
    id: 'tpl-3',
    title: 'PSB (Pasang Baru) Indihome Fiber',
    category: 'Indihome',
    usageCount: 298,
    isFavorite: false,
    content: `Kepada Yth. {customerName},

Konfirmasi Registrasi Pasang Baru (PSB) Indihome Fiber:
Nomor Registrasi: REG-{ticketNumber}
Paket Pilihan: Indihome Dual Play {packageSpeed} Mbps
Alamat Instalasi: {customerAddress}
Nomor Kontak: {msisdn}

Petugas FOS Grapari Garuda akan menjadwalkan kunjungan instalasi ke lokasi Anda pada tanggal {installationDate}. Mohon pastikan ada perwakilan dewasa di lokasi saat penarikan kabel fiber optik dan pemasangan ONT modem router.

Terimakasih telah memilih Indihome - Aktivitas Tanpa Batas!`
  },
  {
    id: 'tpl-4',
    title: 'Penerimaan Keluhan Teknis Indihome',
    category: 'Indihome',
    usageCount: 612,
    isFavorite: true,
    content: `Yth. Pelanggan Indihome,

Kami sampaikan laporan penanganan kendala teknis jaringan internet Anda:
Nomor Tiket: {ticketNumber}
Nomor Layanan: {indihomeNumber}
Nama Pelanggan: {customerName}
Jenis Keluhan: {complaint}

Laporan Anda telah diteruskan ke tim teknis lapangan (FOS) Grapari Garuda dengan SLA penanganan maksimal 3x24 jam. Anda dapat memantau status perbaikan ini melalui aplikasi MyIndihome. Mohon maaf atas ketidaknyamanan Anda.

Terimakasih atas pengertian dan kerjasamanya.`
  },
  {
    id: 'tpl-5',
    title: 'Ganti Paket (Upgrade Speed) Indihome',
    category: 'Indihome',
    usageCount: 215,
    isFavorite: false,
    content: `Yth. Pelanggan Indihome,

Konfirmasi perubahan paket / upgrade kecepatan layanan Indihome Anda:
Nomor Layanan: {indihomeNumber}
Nama Pelanggan: {customerName}
Paket Awal: {oldSpeed} Mbps
Paket Baru: {newSpeed} Mbps
Tarif Bulanan Baru: Rp {newPrice} (belum termasuk PPN 11%)

Perubahan profil kecepatan internet Anda telah dilakukan dari pusat dan langsung aktif hari ini. Tagihan baru akan dihitung secara proporsional (prorata) pada siklus penagihan berikutnya.

Terimakasih telah mempercayakan hiburan keluarga Anda bersama Indihome.`
  },
  {
    id: 'tpl-6',
    title: 'BA Reaktivasi Prepaid Post Aging Quarantine',
    category: 'Customer Service',
    usageCount: 512,
    isFavorite: true,
    content: `BERITA ACARA REAKTIVASI PREPAID POST AGING QUARANTINE
==================================================
Lokasi            : GraPARI Telkomsel Surabaya Garuda
Nomor BA          : BA-TSEL/GR-GARUDA/2026/BA-9012

DATA NOMOR & PELANGGAN:
--------------------------------------------------
MSISDN / Nomor Tsel : {msisdn}
Status MSISDN       : {statusMsisdn}
Nama Pelanggan      : {customerName}
Nomor NIK           : {nik}
Nomor ID Tiket      : {ticketId}

DOKUMEN PENDUKUNG (VERIFIKASI):
--------------------------------------------------
1. KTP Fisik              : Attached / Valid
2. Scan KTP Reader        : Attached / Valid
3. Aplikasi OTT 1         : Attached / Valid
4. SIMcard / QR Code      : Attached / Valid
5. Form Layanan (PDF)     : Attached / Valid

Dengan ini menyatakan bahwa permohonan Reaktivasi Prepaid Post Aging Quarantine telah melalui serangkaian verifikasi identitas dan validasi sistem yang sah di GraPARI Garuda.`
  }
];

export const initialKnowledge: KnowledgeRecord[] = [
  {
    id: 'kn-1',
    title: 'SOP Penanganan Gangguan LOS Merah Indihome',
    category: 'Indihome',
    type: 'SOP',
    tags: ['LOS', 'Red Light', 'ONT', 'Router', 'FOS'],
    content: `### SOP Penanganan Gangguan LOS Merah Kedip di Modem ONT Indihome

Indikator lampu LOS berkedip merah menandakan hilangnya pasokan sinyal cahaya fiber optik dari ODP (Optical Distribution Point) ke ONT (Optical Network Terminal) pelanggan.

#### Langkah 1: Diagnostik Awal CS (Customer Service)
1. Tanyakan status lampu indikator di modem pelanggan. Konfirmasi apakah lampu **LOS** berkedip merah dan lampu **PON** mati total.
2. Lakukan pengecekan redaman sinyal secara remote melalui portal **U-See** / **Net-Care**. Jika status \`Unreachable\` atau redaman melebihi \`-28 dBm\`, teruskan tiket ke lapangan.
3. Konfirmasi apakah ada konstruksi jalan, galian pipa, atau pohon tumbang di sekitar rumah pelanggan.

#### Langkah 2: Panduan Tindakan FOS (Field Operations)
1. Periksa kabel dropcore (kabel hitam) dari rumah pelanggan hingga ke tiang ODP terdekat. Cari tekukan tajam (macro-bending) atau kabel putus.
2. Lakukan pembersihan konektor SC/UPC atau SC/APC di ONT dan ODP menggunakan alkohol 99% dan tisu fiber.
3. Ukur redaman sinyal menggunakan **OPM (Optical Power Meter)**. Target standard redaman adalah **-18 dBm s/d -24 dBm**.
4. Jika redaman tetap nihil, cari slot port alternatif pada ODP. Laporkan penugasan ke tim Core Network untuk penarikan ulang kabel jika port rusak.`
  },
  {
    id: 'kn-2',
    title: 'Flow Proses Reaktivasi Kartu Telkomsel Hangus (Prabayar)',
    category: 'Telkomsel',
    type: 'Flow',
    tags: ['Reaktivasi', 'Hangus', 'Prabayar', 'E-KTP', 'Validasi'],
    content: `### Alur Kerja (Flow) Reaktivasi Kartu Prabayar Hangus di Grapari

Reaktivasi kartu yang melewati masa tenggang (hangus/expired) wajib mengikuti aturan regulasi BRTI terbaru untuk perlindungan data pelanggan.

#### Flow Penanganan di Counter CS:
1. **Penerimaan & Verifikasi**: Pelanggan datang membawa fisik E-KTP asli dan kartu SIM fisik yang hangus.
2. **Pengecekan Database**: Masukkan nomor MSISDN ke portal **Grapari Point (GP)**. Pastikan status nomor berada dalam siklus "Masa Hangus / Grace Period 2" (maksimal 60 hari sejak masa tenggang berakhir). Jika lewat dari 60 hari, nomor tidak dapat direaktivasi secara mandiri dan masuk ke pool recycle nasional.
3. **Validasi Biometrik**: Pelanggan melakukan pemindaian sidik jari menggunakan E-KTP reader untuk pencocokan data Dukcapil.
4. **Pengisian Formulir Digital**: Pelanggan mengisi kesediaan mengaktifkan kembali nomor dengan melampirkan foto selfie memegang E-KTP.
5. **Provisioning Sistem**: CS menekan tombol \`Re-Activate\` di sistem internal. Sistem mengirim perintah provisi baru ke HLR (Home Location Register).
6. **Edukasi Masa Aktif**: Jelaskan kepada pelanggan bahwa kartu wajib diisi pulsa minimal Rp 10.000 atau paket dalam 1x24 jam pertama agar tidak hangus permanen.`
  },
  {
    id: 'kn-3',
    title: 'Script Edukasi Migrasi Prabayar ke Postpaid (Telkomsel Halo)',
    category: 'Telkomsel',
    type: 'Script',
    tags: ['Postpaid', 'Halo', 'Migrasi', 'Sales', 'CS'],
    content: `### Script Edukasi & Penawaran Migrasi Prabayar ke Pascabayar (Telkomsel Halo)

Gunakan script ini saat pelanggan prabayar datang melakukan pengaduan pulsa tersedot, kuota habis cepat, atau upgrade kartu 4G/5G.

#### Bagian 1: Pembuka & Identifikasi Kebutuhan
* "Selamat pagi/siang Bapak/Ibu [Nama Pelanggan]. Selagi saya memproses permintaan upgrade kartu Anda, bolehkah saya tahu rata-rata pengisian pulsa dan kuota internet Bapak/Ibu setiap bulannya?"
* *(Dengarkan jawaban pelanggan. Jika pengeluaran rata-rata > Rp 80.000/bulan, lanjutkan ke penawaran).*

#### Bagian 2: Memaparkan Benefit Utama (Value Proposition)
* "Melihat pola penggunaan Bapak/Ibu yang sangat aktif, sebenarnya layanan **Telkomsel Halo** akan jauh lebih hemat dan praktis. Dengan pengeluaran yang sama, Bapak/Ibu sudah mendapatkan kuota yang 2x lipat lebih besar, bebas nelepon ke semua operator, dan tidak perlu repot isi pulsa setiap minggu."
* "Ditambah lagi, nomor Bapak/Ibu yang sekarang **tetap sama**, sisa pulsa saat ini akan langsung memotong tagihan bulan pertama, dan seluruh kontak serta riwayat WhatsApp tidak ada yang berubah."

#### Bagian 3: Penawaran Paket Unggulan
* "Saat ini kami sedang ada promo spesial paket **Halo+ 100GB** seharga Rp 100.000 nett per bulan. Sudah termasuk langganan Disney+ Hotstar dan Prime Video gratis selama 3 bulan pertama. Proses migrasinya hanya membutuhkan waktu 5 menit saja tanpa ganti kartu baru."

#### Bagian 4: Menangani Keberatan (Handling Objection)
* *Keberatan: "Takut tagihannya jebol/melebihi budget."*
* *Jawaban*: "Bapak/Ibu tidak perlu khawatir, karena kami memiliki fitur **Limit Control**. Kami bisa pasang batas pengeluaran maksimal tepat di angka Rp 100.000. Jadi tagihan dijamin tidak akan pernah melebihi limit tersebut secara otomatis."`
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-19T07:55:00Z',
    user: 'Haris Muhammad',
    role: 'Admin',
    action: 'USER_LOGIN',
    details: 'Admin logged in from IP 192.168.1.51'
  },
  {
    id: 'log-2',
    timestamp: '2026-07-19T07:45:00Z',
    user: 'NAFA LAILA WAHIDAH',
    role: 'Customer Service',
    action: 'UPDATE_MONITORING',
    details: 'Updated ticket TS-2026-101 status to "In Progress" for customer Rina Wijaya'
  },
  {
    id: 'log-3',
    timestamp: '2026-07-19T06:30:00Z',
    user: 'Yunisel Rachmil',
    role: 'Team Leader',
    action: 'IMPORT_KPI_CS',
    details: 'Imported monthly KPI Excel file with 6 active records'
  },
  {
    id: 'log-4',
    timestamp: '2026-07-19T05:12:00Z',
    user: 'Eko Wijaya',
    role: 'FOS',
    action: 'RESOLVE_MONITORING',
    details: 'Resolved Indihome ticket IN-2026-0713 for customer Agus Salim'
  }
];
