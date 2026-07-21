import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Copy, 
  Printer, 
  FileDown, 
  Star, 
  Share2, 
  Check, 
  X,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { TemplateRecord, UserRole } from '../types';

interface TemplateCenterViewProps {
  data: TemplateRecord[];
  userRole: UserRole;
  user?: { name: string; nik: string; role: UserRole } | null;
  onAddTemplate: (record: Partial<TemplateRecord>) => void;
  onUpdateTemplate: (id: string, record: Partial<TemplateRecord>) => void;
  onDeleteTemplate: (id: string) => void;
  onAddMonitoring?: (record: any) => void;
}

export default function TemplateCenterView({ 
  data, 
  userRole, 
  user,
  onAddTemplate, 
  onUpdateTemplate, 
  onDeleteTemplate,
  onAddMonitoring
}: TemplateCenterViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedWaid, setCopiedWaid] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateRecord | null>(null);

  // Form Generator Tab
  const [activeFormTab, setActiveFormTab] = useState<'keluhan' | 'ganti_paket' | 'ganti_kartu' | 'halo' | 'indihome' | 'terminasi'>('ganti_paket');

  // Unified Copy feedback
  const [formCopied, setFormCopied] = useState(false);
  const [monitoringSuccess, setMonitoringSuccess] = useState<'Indihome' | 'Telkomsel' | null>(null);

  // 1. Complaint / Keluhan Form States
  const [csInfo, setCsInfo] = useState(user ? `${user.name} (${user.nik})` : '');
  const [customerName, setCustomerName] = useState('');
  const [msisdn, setMsisdn] = useState('');
  const [indihomeNumber, setIndihomeNumber] = useState('');
  const [complaint, setComplaint] = useState('');

  // 2. Ganti Paket States
  const [gpType, setGpType] = useState<'halo' | 'indihome'>('halo');
  const [gpLayanan, setGpLayanan] = useState('');
  const [gpNama, setGpNama] = useState('');
  const [gpTtl, setGpTtl] = useState('');
  const [gpPaketLama, setGpPaketLama] = useState('');
  const [gpPaketBaru, setGpPaketBaru] = useState('');
  const [gpAlasan, setGpAlasan] = useState('');

  // 3. Ganti Kartu States
  const [gkNama, setGkNama] = useState('');
  const [gkNik, setGkNik] = useState('');
  const [gkMsisdn, setGkMsisdn] = useState('');
  const [gkAlasan, setGkAlasan] = useState('');

  // 4. Telkomsel Halo States
  const [haloNama, setHaloNama] = useState('');
  const [haloNik, setHaloNik] = useState('');
  const [haloPaket, setHaloPaket] = useState('');
  const [haloMsisdn, setHaloMsisdn] = useState('');

  // 5. IndiHome States
  const [ihLayanan, setIhLayanan] = useState('');
  const [ihNama, setIhNama] = useState('');
  const [ihTtl, setIhTtl] = useState('');
  const [ihPaket, setIhPaket] = useState('');
  const [ihAlasan, setIhAlasan] = useState('');

  // 6. Terminasi States
  const [termLayanan, setTermLayanan] = useState('');
  const [termNama, setTermNama] = useState('');
  const [termNik, setTermNik] = useState('');
  const [termAlasan, setTermAlasan] = useState('');
  const [termTanggal, setTermTanggal] = useState('');
  const [termSisaTagihan, setTermSisaTagihan] = useState('');

  React.useEffect(() => {
    if (user) {
      setCsInfo(`${user.name} (${user.nik})`);
    }
  }, [user]);

  const compiledStandard = `LAPORAN TIKET ADUAN GRAPARI GARUDA
----------------------------------
Nama & NIK CS   : ${csInfo || '-'}
Nama Pelanggan  : ${customerName || '-'}
MSISDN / Kontak : ${msisdn || '-'}
Nomor IndiHome  : ${indihomeNumber || '-'}
Keluhan         : ${complaint || '-'}
----------------------------------
Tanggal Laporan : ${new Date().toLocaleDateString('id-ID')}
Status Laporan  : OPEN / DRAFT`;

  const compiledGantiPaket = `SURAT PERNYATAAN PERUBAHAN PAKET
--------------------------------
Saya yang bertanda tangan di bawah ini:
Nama Lengkap    : ${gpNama.toUpperCase() || '___________'}
Tempat/Tgl Lahir: ${gpTtl || '___________'}
Nomor Layanan   : ${gpLayanan || '___________'}

Menyatakan bahwa memahami syarat ketentuan dan bertanggung jawab penuh terkait proses Perubahan paket ${gpType === 'halo' ? 'PSB Halo' : 'PSB IndiHome'} nomor layanan ${gpLayanan || '_______'} dari paket sebelumnya [ ${gpPaketLama || '________'} ] menjadi [ ${gpPaketBaru || '________'} ] dengan alasan: ${gpAlasan || '________'}.

Saya membebaskan PT. Telkomsel dari segala tuntutan atas nomor layanan ini jika terdapat ketidaksesuaian atas proses ini di kemudian hari.

Dibuat di Grapari Garuda pada tanggal ${new Date().toLocaleDateString('id-ID')}`;

  const compiledGantiKartu = `SURAT PERNYATAAN KEPEMILIKAN & GANTI KARTU
-----------------------------------------
Saya yang bertanda tangan di bawah ini:
Nama Lengkap    : ${gkNama.toUpperCase() || '___________'}
Nomor NIK       : ${gkNik || '___________'}
Nomor MSISDN    : ${gkMsisdn || '___________'}

Menyatakan selaku pemilik sah dari nomor handphone (MSISDN) tersebut di atas, memohon untuk melakukan proses Ganti Kartu fisik Telkomsel dengan alasan: ${gkAlasan || '___________'}.

Saya menjamin seluruh data identitas yang diberikan adalah sah dan benar, serta bersedia bertanggung jawab penuh secara hukum apabila terdapat penyalahgunaan identitas di kemudian hari.

Dibuat di Grapari Garuda pada tanggal ${new Date().toLocaleDateString('id-ID')}`;

  const compiledTelkomselHalo = `SURAT PERNYATAAN REGISTRASI/MIGRASI PSB HALO
--------------------------------------------------
Saya yang bertanda tangan di bawah ini:
Nama Lengkap    : ${haloNama.toUpperCase() || '___________'}
Nomor NIK       : ${haloNik || '___________'}
Nomor MSISDN    : ${haloMsisdn || '___________'}

Menyatakan setuju untuk melakukan migrasi / pendaftaran baru layanan pascabayar PSB Halo dengan paket yang dipilih yaitu: ${haloPaket || '___________'}.

Saya memahami skema penagihan berkala dan berkomitmen untuk melunasi seluruh kewajiban pembayaran tagihan bulanan sesuai dengan ketentuan tarif yang berlaku.

Dibuat di Grapari Garuda pada tanggal ${new Date().toLocaleDateString('id-ID')}`;

  const compiledIndiHome = `SURAT PERNYATAAN LAYANAN BARU/PENYESUAIAN PSB INDIHOME
--------------------------------------------------
Saya yang bertanda tangan di bawah ini:
Nama Lengkap    : ${ihNama.toUpperCase() || '___________'}
Tempat/Tgl Lahir: ${ihTtl || '___________'}
Nomor Layanan   : ${ihLayanan || '___________'}

Mengajukan permohonan penyesuaian atau aktivasi baru layanan PSB IndiHome dengan paket pilihan yaitu: ${ihPaket || '___________'} karena alasan: ${ihAlasan || '___________'}.

Saya menyatakan tunduk pada kontrak berlangganan PSB IndiHome dan bersedia mematuhi semua regulasi yang berlaku.

Dibuat di Grapari Garuda pada tanggal ${new Date().toLocaleDateString('id-ID')}`;

  const compiledTerminasi = `SURAT PERNYATAAN TERMINASI (BERHENTI BERLANGGANAN)
--------------------------------------------------
Saya yang bertanda tangan di bawah ini:
Nama Lengkap    : ${termNama.toUpperCase() || '___________'}
Nomor NIK       : ${termNik || '___________'}
Nomor Layanan   : ${termLayanan || '___________'}

Mengajukan permohonan untuk melakukan pemutusan hubungan / terminasi permanen atas layanan Telkomsel / IndiHome tersebut efektif per tanggal ${termTanggal || '___________'} dengan alasan: ${termAlasan || '___________'}.

Saya memahami dan setuju untuk melunasi sisa tagihan berjalan / kewajiban kontrak sebesar Rp ${termSisaTagihan || '0'} serta bersedia mengembalikan seluruh perangkat modem/STB hak sewa kepada Telkomsel/IndiHome dalam kondisi lengkap dan baik.

Dibuat di Grapari Garuda pada tanggal ${new Date().toLocaleDateString('id-ID')}`;

  const getActiveCompiledText = () => {
    switch (activeFormTab) {
      case 'keluhan': return compiledStandard;
      case 'ganti_paket': return compiledGantiPaket;
      case 'ganti_kartu': return compiledGantiKartu;
      case 'halo': return compiledTelkomselHalo;
      case 'indihome': return compiledIndiHome;
      case 'terminasi': return compiledTerminasi;
      default: return '';
    }
  };

  const copyActiveForm = () => {
    navigator.clipboard.writeText(getActiveCompiledText());
    setFormCopied(true);
    setTimeout(() => setFormCopied(false), 2000);
  };

  const handleAddToMonitoring = (monitoringType: 'Indihome' | 'Telkomsel') => {
    if (!onAddMonitoring) return;

    let customerNameVal = '';
    let msisdnVal = '';
    let indihomeNumberVal = '';
    let complaintVal = getActiveCompiledText();
    let categoryVal = 'Product Modification';

    switch (activeFormTab) {
      case 'keluhan':
        customerNameVal = customerName || 'Pelanggan';
        msisdnVal = msisdn || '';
        indihomeNumberVal = indihomeNumber || '';
        categoryVal = 'Technical';
        break;
      case 'ganti_paket':
        customerNameVal = gpNama || 'Pelanggan';
        indihomeNumberVal = gpLayanan || '';
        categoryVal = 'Product Modification';
        break;
      case 'ganti_kartu':
        customerNameVal = gkNama || 'Pelanggan';
        msisdnVal = gkMsisdn || '';
        categoryVal = 'Product Modification';
        break;
      case 'halo':
        customerNameVal = haloNama || 'Pelanggan';
        msisdnVal = haloMsisdn || '';
        categoryVal = 'New Activation';
        break;
      case 'indihome':
        customerNameVal = ihNama || 'Pelanggan';
        indihomeNumberVal = ihLayanan || '';
        categoryVal = 'New Activation';
        break;
      case 'terminasi':
        customerNameVal = termNama || 'Pelanggan';
        if (termLayanan.startsWith('1')) {
          indihomeNumberVal = termLayanan;
        } else {
          msisdnVal = termLayanan;
        }
        categoryVal = 'Product Modification';
        break;
    }

    onAddMonitoring({
      type: monitoringType,
      customerName: customerNameVal,
      msisdn: msisdnVal,
      indihomeNumber: indihomeNumberVal,
      complaint: complaintVal,
      category: categoryVal,
      status: 'Open',
      notes: `Dibuat dari E-Form (${activeFormTab})`
    });

    setMonitoringSuccess(monitoringType);
    setTimeout(() => setMonitoringSuccess(null), 3000);
  };

  const resetActiveForm = () => {
    switch (activeFormTab) {
      case 'keluhan':
        setCustomerName('');
        setMsisdn('');
        setIndihomeNumber('');
        setComplaint('');
        break;
      case 'ganti_paket':
        setGpType('halo');
        setGpLayanan('');
        setGpNama('');
        setGpTtl('');
        setGpPaketLama('');
        setGpPaketBaru('');
        setGpAlasan('');
        break;
      case 'ganti_kartu':
        setGkNama('');
        setGkNik('');
        setGkMsisdn('');
        setGkAlasan('');
        break;
      case 'halo':
        setHaloNama('');
        setHaloNik('');
        setHaloPaket('');
        setHaloMsisdn('');
        break;
      case 'indihome':
        setIhLayanan('');
        setIhNama('');
        setIhTtl('');
        setIhPaket('');
        setIhAlasan('');
        break;
      case 'terminasi':
        setTermLayanan('');
        setTermNama('');
        setTermNik('');
        setTermAlasan('');
        setTermTanggal('');
        setTermSisaTagihan('');
        break;
    }
  };
  
  // Create / Edit states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Partial<TemplateRecord>>({
    title: '',
    category: 'Customer Service',
    content: ''
  });

  const hasCrudPermission = userRole === 'Admin' || userRole === 'Team Leader';

  // Search filter
  const filteredData = data.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Copy standard text
  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Convert content structure to WhatsApp format (*bold*, emojis)
  const copyForWhatsApp = (id: string, text: string) => {
    let waText = text;
    // Simple conversions for WhatsApp rich formatting
    waText = waText.replace(/Yth\./g, '🟢 *Yth.*');
    waText = waText.replace(/Nama Pelanggan:/g, '👤 *Nama Pelanggan:*');
    waText = waText.replace(/Nomor MSISDN:/g, '📱 *Nomor MSISDN:*');
    waText = waText.replace(/Nomor Layanan:/g, '🔌 *Nomor Layanan:*');
    waText = waText.replace(/Nomor Tiket:/g, '🎫 *Nomor Tiket:*');
    waText = waText.replace(/Alasan:/g, 'ℹ️ *Alasan:*');
    waText = waText.replace(/Proses/g, '🚀 Proses');
    waText = waText.replace(/Terimakasih/g, '🙏 Terimakasih');

    navigator.clipboard.writeText(waText);
    setCopiedWaid(id);
    setTimeout(() => setCopiedWaid(null), 2000);
  };

  const handleFavoriteToggle = (tpl: TemplateRecord) => {
    onUpdateTemplate(tpl.id, { isFavorite: !tpl.isFavorite });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTemplate({
      ...formData,
      isFavorite: false,
      usageCount: 0
    });
    setShowAddModal(false);
    setFormData({ title: '', category: 'Customer Service', content: '' });
  };

  const downloadTextFile = (tpl: TemplateRecord) => {
    const element = document.createElement("a");
    const file = new Blob([tpl.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${tpl.title.replace(/\s+/g, '_')}_template.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const printTemplate = (tpl: TemplateRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${tpl.title}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
            h2 { color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px; }
            pre { background: #f3f4f6; padding: 20px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; }
          </style>
        </head>
        <body>
          <h2>Template: ${tpl.title}</h2>
          <p><strong>Divisi:</strong> ${tpl.category}</p>
          <pre>${tpl.content}</pre>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Template Center</h2>
          <p className="text-xs text-gray-500 mt-1">Salin template percakapan, notifikasi WhatsApp, atau cetak berita acara layanan secara instan.</p>
        </div>

        {hasCrudPermission && (
          <button 
            id="btn-add-template"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-xs text-white rounded-xl font-medium cursor-pointer transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Template</span>
          </button>
        )}
      </div>

      {/* E-FORM SYSTEM INTEGRATION */}
      <div className="apple-glass rounded-apple p-6 border border-gray-200/50 dark:border-zinc-800/80 shadow-lg relative overflow-hidden">
        {/* Background visual elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Header Title & Subtitle with Reset Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 border-b border-gray-100 dark:border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              📄
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                {activeFormTab === 'ganti_paket' && 'Eform Ganti Paket'}
                {activeFormTab === 'ganti_kartu' && 'Eform Ganti Kartu Telkomsel'}
                {activeFormTab === 'halo' && 'Eform Registrasi/Migrasi PSB Halo'}
                {activeFormTab === 'indihome' && 'Eform Aktivasi/Penyesuaian PSB IndiHome'}
                {activeFormTab === 'terminasi' && 'Eform Terminasi Layanan (Berhenti)'}
                {activeFormTab === 'keluhan' && 'Generator Laporan Keluhan Pelanggan'}
              </h3>
              <p className="text-[11px] text-gray-400">
                {activeFormTab === 'ganti_paket' && 'Generator pernyataan perubahan paket · otomatis update saat mengetik'}
                {activeFormTab === 'ganti_kartu' && 'Generator pernyataan kepemilikan & ganti kartu fisik · otomatis update saat mengetik'}
                {activeFormTab === 'halo' && 'Generator pernyataan migrasi/registrasi PSB Halo · otomatis update saat mengetik'}
                {activeFormTab === 'indihome' && 'Generator syarat kontrak penyesuaian/aktivasi layanan PSB IndiHome · otomatis update saat mengetik'}
                {activeFormTab === 'terminasi' && 'Generator permohonan pemutusan/terminasi permanen layanan · otomatis update saat mengetik'}
                {activeFormTab === 'keluhan' && 'Generator draf aduan gangguan pelanggan terstruktur · otomatis update saat mengetik'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetActiveForm}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-red-500 rounded-xl transition-all cursor-pointer bg-white/20 dark:bg-zinc-900/20 shadow-sm shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Tab Selection Row */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'ganti_paket', label: 'Ganti Paket' },
            { id: 'ganti_kartu', label: 'Ganti Kartu' },
            { id: 'halo', label: 'PSB Halo' },
            { id: 'indihome', label: 'PSB IndiHome' },
            { id: 'terminasi', label: 'Terminasi' },
            { id: 'keluhan', label: 'Laporan Keluhan' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveFormTab(tab.id as any);
                setFormCopied(false);
              }}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                activeFormTab === tab.id
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Data Pelanggan Input Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-900">
              <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest">
                Data Pelanggan
              </span>
            </div>

            {/* Render fields dynamically based on activeFormTab */}
            {activeFormTab === 'keluhan' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nama & NIK CS</label>
                    <input 
                      type="text"
                      value={csInfo}
                      onChange={(e) => setCsInfo(e.target.value)}
                      placeholder="Contoh: Siti Rahma (GG-00511)"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nama Pelanggan</label>
                    <input 
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Contoh: Ahmad Fauzi"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nomor MSISDN (Handphone)</label>
                    <input 
                      type="text"
                      value={msisdn}
                      onChange={(e) => setMsisdn(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nomor IndiHome (Optional)</label>
                    <input 
                      type="text"
                      value={indihomeNumber}
                      onChange={(e) => setIndihomeNumber(e.target.value)}
                      placeholder="Contoh: 122345678901"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Keluhan / Masalah</label>
                  <textarea 
                    rows={3}
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Tulis keluhan pelanggan di sini..."
                    className="w-full p-3 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                  {/* Quick Preset Buttons for Keluhan */}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase flex items-center mr-1">Rekomendasi Cepat:</span>
                    {[
                      { label: "LOS Lampu Merah", value: "Lampu indikator internet menyala merah (LOS) di modem, koneksi terputus total." },
                      { label: "Internet Lambat", value: "Koneksi internet lambat / speeddrop, tidak sesuai paket langganan." },
                      { label: "Ganti Kartu", value: "Request ganti kartu fisik Telkomsel karena hilang / rusak." },
                      { label: "Signal Drop", value: "Signal bar Telkomsel drop di dalam rumah pelanggan, blank spot." }
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setComplaint(item.value)}
                        className="px-2 py-0.5 text-[9px] font-medium bg-gray-100 dark:bg-zinc-900 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 text-gray-500 rounded border border-gray-200/50 dark:border-zinc-800/40 transition-colors cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeFormTab === 'ganti_paket' && (
              <div className="space-y-4">
                <div className="flex gap-4 p-3 bg-gray-50/50 dark:bg-zinc-900/30 rounded-xl border border-gray-100 dark:border-zinc-900">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center">Opsi Ganti Paket:</span>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gpType" 
                      checked={gpType === 'halo'} 
                      onChange={() => setGpType('halo')}
                      className="text-red-500 focus:ring-red-500 h-3.5 w-3.5"
                    />
                    <span>Halo</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gpType" 
                      checked={gpType === 'indihome'} 
                      onChange={() => setGpType('indihome')}
                      className="text-red-500 focus:ring-red-500 h-3.5 w-3.5"
                    />
                    <span>IndiHome</span>
                  </label>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    {gpType === 'halo' ? 'Nomor MSISDN / Layanan Halo' : 'Nomor Layanan IndiHome'}
                  </label>
                  <input 
                    type="text"
                    value={gpLayanan}
                    onChange={(e) => setGpLayanan(e.target.value)}
                    placeholder={gpType === 'halo' ? 'Contoh: 08112345678' : 'Contoh: 122345678901'}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                  <input 
                    type="text"
                    value={gpNama}
                    onChange={(e) => setGpNama(e.target.value)}
                    placeholder="Nama sesuai identitas"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tempat dan Tanggal Lahir</label>
                  <input 
                    type="text"
                    value={gpTtl}
                    onChange={(e) => setGpTtl(e.target.value)}
                    placeholder="Contoh: Surabaya, 01 Januari 1990"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {gpType === 'halo' ? 'Paket Lama Halo' : 'Paket Lama IndiHome'}
                    </label>
                    <input 
                      type="text"
                      value={gpPaketLama}
                      onChange={(e) => setGpPaketLama(e.target.value)}
                      placeholder={gpType === 'halo' ? 'Contoh: Halo Kick 100K' : 'Contoh: IndiHome 2P 30 Mbps'}
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {gpType === 'halo' ? 'Paket Baru Halo' : 'Paket Baru IndiHome'}
                    </label>
                    <input 
                      type="text"
                      value={gpPaketBaru}
                      onChange={(e) => setGpPaketBaru(e.target.value)}
                      placeholder={gpType === 'halo' ? 'Contoh: Halo Unlimited 150K' : 'Contoh: IndiHome 3P 50 Mbps'}
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Alasan Perubahan Paket</label>
                  <input 
                    type="text"
                    value={gpAlasan}
                    onChange={(e) => setGpAlasan(e.target.value)}
                    placeholder="Contoh: menyesuaikan kebutuhan keluarga"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>
            )}

            {activeFormTab === 'ganti_kartu' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                  <input 
                    type="text"
                    value={gkNama}
                    onChange={(e) => setGkNama(e.target.value)}
                    placeholder="Nama sesuai KTP"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nomor NIK (KTP)</label>
                  <input 
                    type="text"
                    value={gkNik}
                    onChange={(e) => setGkNik(e.target.value)}
                    placeholder="16 digit NIK"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nomor Handphone (MSISDN)</label>
                  <input 
                    type="text"
                    value={gkMsisdn}
                    onChange={(e) => setGkMsisdn(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Alasan Ganti Kartu</label>
                  <input 
                    type="text"
                    value={gkAlasan}
                    onChange={(e) => setGkAlasan(e.target.value)}
                    placeholder="Contoh: Kartu rusak / hilang / upgrade 4G"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>
            )}

            {activeFormTab === 'halo' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                  <input 
                    type="text"
                    value={haloNama}
                    onChange={(e) => setHaloNama(e.target.value)}
                    placeholder="Nama sesuai KTP"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nomor NIK (KTP)</label>
                  <input 
                    type="text"
                    value={haloNik}
                    onChange={(e) => setHaloNik(e.target.value)}
                    placeholder="16 digit NIK"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nomor MSISDN</label>
                  <input 
                    type="text"
                    value={haloMsisdn}
                    onChange={(e) => setHaloMsisdn(e.target.value)}
                    placeholder="Contoh: 08112345678"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Paket PSB Halo yang Dipilih</label>
                  <input 
                    type="text"
                    value={haloPaket}
                    onChange={(e) => setHaloPaket(e.target.value)}
                    placeholder="Contoh: PSB Halo Unlimited 100K"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>
            )}

            {activeFormTab === 'indihome' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nomor Layanan PSB IndiHome</label>
                  <input 
                    type="text"
                    value={ihLayanan}
                    onChange={(e) => setIhLayanan(e.target.value)}
                    placeholder="Contoh: 122345678901"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                  <input 
                    type="text"
                    value={ihNama}
                    onChange={(e) => setIhNama(e.target.value)}
                    placeholder="Nama sesuai identitas"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tempat dan Tanggal Lahir</label>
                  <input 
                    type="text"
                    value={ihTtl}
                    onChange={(e) => setIhTtl(e.target.value)}
                    placeholder="Contoh: Jakarta, 12 Desember 1988"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Paket PSB IndiHome Pilihan</label>
                  <input 
                    type="text"
                    value={ihPaket}
                    onChange={(e) => setIhPaket(e.target.value)}
                    placeholder="Contoh: PSB IndiHome 3P 100 Mbps"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Alasan Aktivasi/Penyesuaian</label>
                  <input 
                    type="text"
                    value={ihAlasan}
                    onChange={(e) => setIhAlasan(e.target.value)}
                    placeholder="Contoh: kebutuhan internet kantor baru"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>
            )}

            {activeFormTab === 'terminasi' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nomor Layanan (IndiHome/MSISDN)</label>
                    <input 
                      type="text"
                      value={termLayanan}
                      onChange={(e) => setTermLayanan(e.target.value)}
                      placeholder="Contoh: 122345678901 / 081234567"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tanggal Efektif Berhenti</label>
                    <input 
                      type="text"
                      value={termTanggal}
                      onChange={(e) => setTermTanggal(e.target.value)}
                      placeholder="Contoh: 31 Juli 2026"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nama Lengkap Pemilik</label>
                    <input 
                      type="text"
                      value={termNama}
                      onChange={(e) => setTermNama(e.target.value)}
                      placeholder="Nama sesuai identitas pemilik"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nomor NIK Pemilik</label>
                    <input 
                      type="text"
                      value={termNik}
                      onChange={(e) => setTermNik(e.target.value)}
                      placeholder="16 digit NIK"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sisa Tagihan / Kewajiban (Rp)</label>
                    <input 
                      type="text"
                      value={termSisaTagihan}
                      onChange={(e) => setTermSisaTagihan(e.target.value)}
                      placeholder="Contoh: 250.000 (0 jika lunas)"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Alasan Berhenti / Terminasi</label>
                    <input 
                      type="text"
                      value={termAlasan}
                      onChange={(e) => setTermAlasan(e.target.value)}
                      placeholder="Contoh: Pindah rumah ke area luar jaringan"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100/60 dark:border-red-900/30 flex gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-[10px] text-red-600 dark:text-red-400 leading-relaxed">
                    <strong>Penting untuk Terminasi:</strong> Pastikan perangkat sewa (Modem ONT, STB TV, kabel adaptor) dikembalikan oleh pelanggan ke kantor Grapari atau dijadwalkan penarikan oleh teknisi demi menghindari tagihan berjalan berkelanjutan.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: E-Form Live Preview & Actions */}
          <div className="flex flex-col justify-between p-4 bg-gray-50/70 dark:bg-zinc-900/20 border border-gray-100 dark:border-zinc-900 rounded-2xl relative min-h-[350px]">
            <div>
              <div className="flex justify-between items-center mb-2.5 border-b border-gray-100 dark:border-zinc-900 pb-2">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Eform Preview
                </span>
                <span className="text-[9px] font-mono text-gray-400">Pernyataan Resmi</span>
              </div>
              
              <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-gray-100/60 dark:border-zinc-900 font-mono text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap select-all min-h-[220px]">
                {getActiveCompiledText()}
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={copyActiveForm}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  formCopied 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                }`}
              >
                {formCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{formCopied ? 'Eform Berhashil Disalin!' : 'Copy Eform'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleAddToMonitoring('Indihome')}
                  className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                    monitoringSuccess === 'Indihome'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-950/50'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{monitoringSuccess === 'Indihome' ? 'Tersimpan IH' : 'Monitoring IndiHome'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddToMonitoring('Telkomsel')}
                  className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                    monitoringSuccess === 'Telkomsel'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-900 dark:text-gray-300 border border-gray-200/50 dark:border-zinc-800'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{monitoringSuccess === 'Telkomsel' ? 'Tersimpan Tsel' : 'Monitoring Telkomsel'}</span>
                </button>
              </div>
              
              <div className="mt-2.5 text-center">
                <p className="text-[10px] text-gray-400">
                  Teks otomatis diperbarui saat Anda mengisi form. Nama akan otomatis diubah menjadi HURUF KAPITAL.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SEARCH BOX */}
      <div className="apple-glass rounded-apple p-4 apple-shadow">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            id="input-search-templates"
            type="text"
            placeholder="Ketik kata kunci untuk mencari template (misal: 'Reaktivasi', 'Kartu', 'Indihome')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-100 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 text-xs focus:ring-1 focus:ring-red-500 outline-none"
          />
        </div>
      </div>

      {/* BENTO GRID OF TEMPLATES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {filteredData.map((tpl) => (
          <div 
            key={tpl.id} 
            className="apple-glass rounded-apple p-5 apple-shadow flex flex-col justify-between hover:-translate-y-1 transition-all duration-200 border-l-4 border-l-red-500"
          >
            <div>
              {/* Card Title */}
              <div className="flex justify-between items-start mb-3">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 font-bold uppercase">
                  {tpl.category}
                </span>
                
                <div className="flex items-center gap-1">
                  <button 
                    id={`btn-fav-template-${tpl.id}`}
                    onClick={() => handleFavoriteToggle(tpl)}
                    className="p-1 text-gray-300 hover:text-amber-500 rounded-full transition-colors"
                  >
                    <Star className={`w-4 h-4 ${tpl.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                  {hasCrudPermission && (
                    <button 
                      id={`btn-delete-template-${tpl.id}`}
                      onClick={() => onDeleteTemplate(tpl.id)}
                      className="p-1 text-gray-300 hover:text-red-500 rounded-full transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{tpl.title}</h3>
              
              {/* Content Preview Block */}
              <div className="mt-3 p-3.5 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-100/50 dark:border-zinc-900 font-mono text-[10px] leading-relaxed text-gray-500 dark:text-gray-400 h-32 overflow-hidden relative">
                <div className="whitespace-pre-wrap select-all">{tpl.content}</div>
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-50 to-transparent dark:from-zinc-950 pointer-events-none" />
              </div>
            </div>

            {/* Actions Footer */}
            <div className="grid grid-cols-2 gap-2 mt-4 border-t border-gray-100 dark:border-gray-900/60 pt-3.5">
              
              {/* Action: Copy WhatsApp */}
              <button
                id={`btn-copy-wa-${tpl.id}`}
                onClick={() => {
                  onUpdateTemplate(tpl.id, { usageCount: tpl.usageCount + 1 });
                  copyForWhatsApp(tpl.id, tpl.content);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                  copiedWaid === tpl.id 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                }`}
              >
                {copiedWaid === tpl.id ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedWaid === tpl.id ? 'Tersalin WA' : 'Salin WhatsApp'}</span>
              </button>

              {/* Action: Copy Text */}
              <button
                id={`btn-copy-text-${tpl.id}`}
                onClick={() => {
                  onUpdateTemplate(tpl.id, { usageCount: tpl.usageCount + 1 });
                  copyToClipboard(tpl.id, tpl.content);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                  copiedId === tpl.id 
                    ? 'bg-red-500 text-white' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400'
                }`}
              >
                {copiedId === tpl.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === tpl.id ? 'Tersalin' : 'Salin Standard'}</span>
              </button>

              {/* Individual Print and Download */}
              <button
                id={`btn-print-tpl-${tpl.id}`}
                onClick={() => printTemplate(tpl)}
                className="col-span-1 flex items-center justify-center gap-1 py-1.5 border border-gray-100 dark:border-zinc-900 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg text-[9px] cursor-pointer"
              >
                <Printer className="w-3 h-3" />
                <span>Cetak</span>
              </button>

              <button
                id={`btn-download-tpl-${tpl.id}`}
                onClick={() => downloadTextFile(tpl)}
                className="col-span-1 flex items-center justify-center gap-1 border border-gray-100 dark:border-zinc-900 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg text-[9px] cursor-pointer"
              >
                <FileDown className="w-3 h-3" />
                <span>Unduh File</span>
              </button>

            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <p className="text-center text-xs text-gray-400 col-span-3 py-12">Tidak menemukan template percakapan.</p>
        )}

      </div>

      {/* ADD TEMPLATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl overflow-hidden animate-fade-in rounded-apple">
            <div className="p-5 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Tambah Template Percakapan Baru</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Judul Template</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent animate-pulse-none"
                  placeholder="Ganti Kartu Telkomsel (Lost/Upgrade)"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Divisi / Klasifikasi</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-zinc-900"
                >
                  <option value="Customer Service">Customer Service</option>
                  <option value="Indihome">Indihome</option>
                  <option value="FOS">FOS Field Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Isi Template Percakapan</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full p-3 font-mono border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  placeholder="Format data pelanggan:&#10;Nama: {customerName}&#10;MSISDN: {msisdn}"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-xs text-white rounded-xl font-medium cursor-pointer shadow-md"
                >
                  Simpan Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
