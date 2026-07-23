import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Printer, 
  Edit, 
  Trash2, 
  TrendingUp, 
  X, 
  Award,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users
} from 'lucide-react';
import { KpiCsRecord, UserRole } from '../types';

interface KpiCsViewProps {
  data: KpiCsRecord[];
  userRole: UserRole;
  onAddRecord: (record: Partial<KpiCsRecord>) => void;
  onUpdateRecord: (id: string, record: Partial<KpiCsRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onBulkImport: (data: any[]) => void;
}

export default function KpiCsView({ 
  data, 
  userRole, 
  onAddRecord, 
  onUpdateRecord, 
  onDeleteRecord,
  onBulkImport
}: KpiCsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState<keyof KpiCsRecord>('ranking');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<KpiCsRecord | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<KpiCsRecord>>({
    name: '',
    nik: '',
    sales: 0,
    productivity: 90,
    attendance: 100,
    roleplay: 90,
    achievement: 90,
    notes: '',
    target: 150,
    status: 'Good'
  });

  // Excel paste text state
  const [pasteData, setPasteData] = useState('');

  // Check CRUD permission
  const hasCrudPermission = userRole === 'Admin' || userRole === 'Team Leader';

  // Filter and sort logic
  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.nik.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      aVal = (aVal as string).toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: keyof KpiCsRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const computedAch = Math.round(((Number(formData.sales || 0) / Number(formData.target || 150)) * 40 + 
                        Number(formData.productivity || 0) * 0.3 + 
                        Number(formData.attendance || 100) * 0.15 + 
                        Number(formData.roleplay || 80) * 0.15) * 10) / 10;
    
    let computedStatus: KpiCsRecord['status'] = 'Good';
    if (computedAch >= 95) computedStatus = 'Excellent';
    else if (computedAch >= 85) computedStatus = 'Good';
    else if (computedAch >= 70) computedStatus = 'Needs Improvement';
    else computedStatus = 'Critical';

    onAddRecord({
      ...formData,
      sales: Number(formData.sales),
      productivity: Number(formData.productivity),
      attendance: Number(formData.attendance),
      roleplay: Number(formData.roleplay),
      achievement: computedAch,
      progress: Math.round((Number(formData.sales || 0) / Number(formData.target || 150)) * 100),
      status: computedStatus
    });

    setShowAddModal(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const computedAch = Math.round(((Number(formData.sales || 0) / Number(formData.target || 150)) * 40 + 
                        Number(formData.productivity || 0) * 0.3 + 
                        Number(formData.attendance || 100) * 0.15 + 
                        Number(formData.roleplay || 80) * 0.15) * 10) / 10;

    let computedStatus: KpiCsRecord['status'] = 'Good';
    if (computedAch >= 95) computedStatus = 'Excellent';
    else if (computedAch >= 85) computedStatus = 'Good';
    else if (computedAch >= 70) computedStatus = 'Needs Improvement';
    else computedStatus = 'Critical';

    onUpdateRecord(editingRecord.id, {
      ...formData,
      sales: Number(formData.sales),
      productivity: Number(formData.productivity),
      attendance: Number(formData.attendance),
      roleplay: Number(formData.roleplay),
      achievement: computedAch,
      progress: Math.round((Number(formData.sales || 0) / Number(formData.target || 150)) * 100),
      status: computedStatus
    });

    setShowEditModal(false);
    setEditingRecord(null);
    resetForm();
  };

  const openEditModal = (record: KpiCsRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nik: '',
      sales: 0,
      productivity: 90,
      attendance: 100,
      roleplay: 90,
      achievement: 90,
      notes: '',
      target: 150,
      status: 'Good'
    });
  };

  // Raw file import parsing CSV / TSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      parseExcelPasteData(text);
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    if (!pasteData.trim()) return;
    parseExcelPasteData(pasteData);
  };

  // Smart grid spreadsheet parser
  const parseExcelPasteData = (text: string) => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        alert('Data tidak valid atau kurang lengkap. Mohon sertakan baris header.');
        return;
      }

      // Detect delimiters
      const delimiter = text.includes('\t') ? '\t' : ',';
      const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
      
      const parsedRecords: any[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
        if (columns.length < 3) continue;

        const rowObj: any = {};
        headers.forEach((header, index) => {
          rowObj[header] = columns[index];
        });

        // Map header properties safely
        parsedRecords.push({
          name: rowObj.name || rowObj.nama || 'CS Agent',
          nik: rowObj.nik || `GG-00${Math.floor(100 + Math.random() * 899)}`,
          sales: Number(rowObj.sales || rowObj.penjualan) || 0,
          productivity: Number(rowObj.productivity || rowObj.produktivitas) || 90,
          attendance: Number(rowObj.attendance || rowObj.kehadiran) || 100,
          roleplay: Number(rowObj.roleplay) || 85,
          achievement: Number(rowObj.achievement || rowObj.pencapaian) || 85,
          notes: rowObj.notes || rowObj.catatan || 'Imported.',
          target: Number(rowObj.target) || 150
        });
      }

      if (parsedRecords.length > 0) {
        onBulkImport(parsedRecords);
        setShowImportModal(false);
        setPasteData('');
        alert(`Berhasil mengimpor ${parsedRecords.length} agen CS dari spreadsheet!`);
      } else {
        alert('Gagal mendeteksi kolom. Harap sesuaikan header.');
      }
    } catch (err) {
      alert('Terjadi kesalahan format saat memparsing data.');
    }
  };

  // Export to standard CSV that Excel/Sheets loads natively
  const exportToCSV = () => {
    const headers = [
      'Rank', 'Nama CSR', 'NIK', 'Halo (26)', 'IndiHome (20)', 'Orbit (2)', 'FIVAS (Rp)', 
      'Productivity', 'Promotor', 'Passiver', 'Detractor', 'TNPS (%)', 
      'DO IH (6)', 'Retensi IH', 'RR Fix (%)', 'Mobile Churn (%)', 'Catatan'
    ];
    const rows = sortedData.map(item => [
      item.ranking,
      `"${item.name}"`,
      item.nik,
      item.haloSales ?? 0,
      item.indihomeSales ?? 0,
      item.orbitSales ?? 0,
      item.fivasSales ?? 0,
      item.productivity,
      item.promotor ?? 0,
      item.passiver ?? 0,
      item.detractor ?? 0,
      `${item.tnpsScore ?? 100}%`,
      item.doIh ?? 0,
      item.retensiIh ?? 0,
      `${item.rrFix ?? 0}%`,
      `${item.mobileChurnPrev ?? 0}%`,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Performance_CSR_Grapari_Surabaya_Garuda_Juni_2026_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Table Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">KPI Customer Service (CS)</h2>
          <p className="text-xs text-gray-500 mt-1">Kelola data produktivitas harian, kehadiran, kepatuhan roleplay, dan target penjualan.</p>
        </div>
        
        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-3">
          {hasCrudPermission && (
            <button 
              id="btn-import-kpi-cs"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-zinc-900 text-xs text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer transition-all shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Excel</span>
            </button>
          )}

          <button 
            id="btn-export-kpi-cs"
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-zinc-900 text-xs text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button 
            id="btn-print-kpi-cs"
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-zinc-900 text-xs text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>

          {hasCrudPermission && (
            <button 
              id="btn-add-kpi-cs"
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-xs text-white rounded-xl font-medium cursor-pointer transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Agen CS</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="apple-glass rounded-apple p-4 apple-shadow flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            id="input-search-kpi-cs"
            type="text"
            placeholder="Cari agen berdasarkan nama atau NIK..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-100 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 text-xs focus:ring-1 focus:ring-red-500 outline-none"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto items-center self-end md:self-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <select
            id="select-filter-status-cs"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs border border-gray-100 dark:border-zinc-800 rounded-xl px-3 py-2 bg-white/50 dark:bg-zinc-900/40 text-gray-600 dark:text-gray-300 outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="All">Semua Kategori Status</option>
            <option value="Excellent">Status: Excellent</option>
            <option value="Good">Status: Good</option>
            <option value="Needs Improvement">Status: Needs Improvement</option>
            <option value="Critical">Status: Critical</option>
          </select>
        </div>
      </div>

      {/* SPREADSHEET TABLE CARD */}
      <div className="apple-glass rounded-apple apple-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs border-b border-gray-200 dark:border-zinc-800">
            <thead>
              {/* Banner Title Header matching the uploaded Excel sheet */}
              <tr className="bg-gradient-to-r from-blue-700 via-sky-700 to-indigo-800 text-white font-black text-center tracking-wider">
                <th colSpan={hasCrudPermission ? 16 : 15} className="py-3 px-4 text-xs uppercase shadow-xs">
                  PERFORMANCE CSR GRAPARI SURABAYA GARUDA JUNI 2026
                </th>
              </tr>

              {/* Grouped Header Row */}
              <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 text-[10px] uppercase tracking-wider font-extrabold border-b border-gray-200 dark:border-zinc-800 text-center select-none">
                <th rowSpan={2} className="p-2.5 border-r border-gray-200 dark:border-zinc-800 min-w-[200px] text-left">NAMA CSR</th>
                <th colSpan={4} className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-sky-100/80 dark:bg-sky-950/40 text-sky-900 dark:text-sky-300">
                  TARGET SALES CUT OFF TGL 01-30
                </th>
                <th rowSpan={2} className="p-2.5 border-r border-gray-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">PRODUCTIVITY</th>
                <th colSpan={4} className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300">
                  TNPS MOBILE CUT OFF TGL 01-30
                </th>
                <th colSpan={4} className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">
                  CHURN PREVENTION CUT OFF TGL 01-30
                </th>
                <th rowSpan={2} className="p-2.5 border-r border-gray-200 dark:border-zinc-800 min-w-[60px]">RANK</th>
                {hasCrudPermission && <th rowSpan={2} className="p-2.5 min-w-[70px]">AKSI</th>}
              </tr>

              {/* Sub Column Headers */}
              <tr className="bg-slate-50 dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-300 text-[9px] uppercase font-black tracking-tight border-b border-gray-200 dark:border-zinc-800 text-center select-none">
                {/* Target Sales columns */}
                <th className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-sky-50 dark:bg-sky-950/20">HALO (26)</th>
                <th className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-sky-50 dark:bg-sky-950/20">INDIHOME (20)</th>
                <th className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-sky-50 dark:bg-sky-950/20">ORBIT (2)</th>
                <th className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-sky-50 dark:bg-sky-950/20">FIVAS</th>
                {/* TNPS Mobile columns */}
                <th className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400">PROMOTOR</th>
                <th className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-950/20 text-amber-700 dark:text-amber-400">PASSIVER</th>
                <th className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-950/20 text-rose-700 dark:text-rose-400">DETRACTOR</th>
                <th className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-950/20 font-extrabold text-slate-900 dark:text-white">97%</th>
                {/* Churn Prevention columns */}
                <th className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-amber-50 dark:bg-amber-950/20">DO IH (6)</th>
                <th className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-amber-50 dark:bg-amber-950/20">RETENSI IH</th>
                <th className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-amber-50 dark:bg-amber-950/20">RR FIX (75%)</th>
                <th className="p-2 border-r border-gray-200 dark:border-zinc-800 bg-amber-50 dark:bg-amber-950/20">MOBILE (80%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 font-mono text-[11px]">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-sky-50/20 dark:hover:bg-zinc-900/40 transition-colors">
                  {/* CSR Info */}
                  <td className="p-3 border-r border-gray-200 dark:border-zinc-800 font-sans">
                    <div className="flex items-center gap-2.5">
                      <img src={item.photo} alt={item.name} className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-800 object-cover shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{item.name}</div>
                        <div className="text-[9px] text-slate-400 font-mono">{item.nik}</div>
                      </div>
                    </div>
                  </td>

                  {/* Target Sales: Halo */}
                  <td className={`p-2.5 text-center font-bold border-r border-gray-200 dark:border-zinc-800 ${
                    (item.haloSales ?? 0) < 26 ? 'text-red-600 dark:text-red-400 font-black' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {item.haloSales ?? '-'}
                  </td>

                  {/* Target Sales: IndiHome */}
                  <td className={`p-2.5 text-center font-bold border-r border-gray-200 dark:border-zinc-800 ${
                    (item.indihomeSales ?? 0) < 20 ? 'text-red-600 dark:text-red-400 font-black' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {item.indihomeSales ?? '-'}
                  </td>

                  {/* Target Sales: Orbit */}
                  <td className={`p-2.5 text-center font-bold border-r border-gray-200 dark:border-zinc-800 ${
                    (item.orbitSales ?? 0) < 2 ? 'text-red-600 dark:text-red-400 font-black' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {item.orbitSales ?? '-'}
                  </td>

                  {/* FIVAS */}
                  <td className="p-2.5 text-right font-medium text-slate-800 dark:text-slate-200 border-r border-gray-200 dark:border-zinc-800 whitespace-nowrap">
                    {item.fivasSales !== undefined ? `Rp ${item.fivasSales.toLocaleString('id-ID')}` : '-'}
                  </td>

                  {/* Productivity */}
                  <td className={`p-2.5 text-center font-bold border-r border-gray-200 dark:border-zinc-800 ${
                    item.productivity < 300 ? 'text-red-600 dark:text-red-400 font-black' : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {item.productivity}
                  </td>

                  {/* TNPS Mobile: Promotor */}
                  <td className="p-2.5 text-center font-bold text-emerald-700 dark:text-emerald-400 border-r border-gray-200 dark:border-zinc-800">
                    {item.promotor ?? '-'}
                  </td>

                  {/* TNPS Mobile: Passiver */}
                  <td className="p-2.5 text-center font-medium text-amber-700 dark:text-amber-400 border-r border-gray-200 dark:border-zinc-800">
                    {item.passiver ?? '-'}
                  </td>

                  {/* TNPS Mobile: Detractor */}
                  <td className="p-2.5 text-center font-medium text-rose-700 dark:text-rose-400 border-r border-gray-200 dark:border-zinc-800">
                    {item.detractor ?? '-'}
                  </td>

                  {/* TNPS % */}
                  <td className={`p-2.5 text-center font-black border-r border-gray-200 dark:border-zinc-800 ${
                    (item.tnpsScore ?? 100) >= 97 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.tnpsScore !== undefined ? `${item.tnpsScore}%` : '-'}
                  </td>

                  {/* Churn Prevention: DO IH */}
                  <td className="p-2.5 text-center font-bold border-r border-gray-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200">
                    {item.doIh ?? '-'}
                  </td>

                  {/* Churn Prevention: Retensi IH */}
                  <td className="p-2.5 text-center font-bold border-r border-gray-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200">
                    {item.retensiIh ?? '-'}
                  </td>

                  {/* Churn Prevention: RR FIX (75%) */}
                  <td className={`p-2.5 text-center font-black border-r border-gray-200 dark:border-zinc-800 ${
                    (item.rrFix ?? 100) >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.rrFix !== undefined ? `${item.rrFix}%` : '-'}
                  </td>

                  {/* Churn Prevention: Mobile (80%) */}
                  <td className={`p-2.5 text-center font-black border-r border-gray-200 dark:border-zinc-800 ${
                    (item.mobileChurnPrev ?? 100) >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.mobileChurnPrev !== undefined ? `${item.mobileChurnPrev}%` : '-'}
                  </td>

                  {/* Rank */}
                  <td className="p-2.5 text-center font-black border-r border-gray-200 dark:border-zinc-800">
                    {item.ranking === 1 ? (
                      <span className="inline-flex w-6 h-6 items-center justify-center bg-amber-500 text-white rounded-md text-xs font-black shadow-xs">1</span>
                    ) : item.ranking === 2 ? (
                      <span className="inline-flex w-6 h-6 items-center justify-center bg-slate-300 text-slate-900 rounded-md text-xs font-black shadow-xs">2</span>
                    ) : item.ranking === 3 ? (
                      <span className="inline-flex w-6 h-6 items-center justify-center bg-amber-700 text-white rounded-md text-xs font-black shadow-xs">3</span>
                    ) : (
                      <span className="text-slate-700 dark:text-slate-300 font-bold">{item.ranking}</span>
                    )}
                  </td>

                  {/* CRUD Operations */}
                  {hasCrudPermission && (
                    <td className="p-2.5 text-center font-sans">
                      <div className="flex justify-center gap-1">
                        <button 
                          id={`btn-edit-kpi-cs-${item.id}`}
                          onClick={() => openEditModal(item)}
                          className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          id={`btn-delete-kpi-cs-${item.id}`}
                          onClick={() => onDeleteRecord(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}

                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={hasCrudPermission ? 16 : 15} className="p-8 text-center text-gray-400 font-sans">
                    Tidak ada data agen Customer Service.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-50/50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-gray-900 flex justify-between items-center text-xs">
            <span className="text-gray-400">Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedData.length)} dari {sortedData.length} records</span>
            <div className="flex gap-1.5">
              <button
                id="btn-prev-page-cs"
                onClick={() => setCurrentPage(c => Math.max(c - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-next-page-cs"
                onClick={() => setCurrentPage(c => Math.min(c + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* CRUD MODALS */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl overflow-hidden animate-fade-in rounded-apple">
            <div className="p-5 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  {showAddModal ? 'Tambah Penilaian CS Baru' : 'Modifikasi Penilaian CS'}
                </h3>
              </div>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Nama Agen CSR</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                    placeholder="NAFA LAILA WAHIDAH"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">NIK Agen</label>
                  <input
                    type="text"
                    required
                    value={formData.nik || ''}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                    placeholder="GG-00501"
                  />
                </div>
              </div>

              {/* TARGET SALES CUT OFF */}
              <div className="p-3 bg-sky-50/50 dark:bg-sky-950/20 rounded-xl space-y-2 border border-sky-100 dark:border-sky-900/30">
                <span className="text-[10px] font-bold uppercase text-sky-700 dark:text-sky-300">Target Sales Cut Off Tgl 01-30</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[9px] text-gray-500">Halo (Target 26)</label>
                    <input
                      type="number"
                      value={formData.haloSales ?? 0}
                      onChange={(e) => setFormData({ ...formData, haloSales: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500">IndiHome (20)</label>
                    <input
                      type="number"
                      value={formData.indihomeSales ?? 0}
                      onChange={(e) => setFormData({ ...formData, indihomeSales: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500">Orbit (2)</label>
                    <input
                      type="number"
                      value={formData.orbitSales ?? 0}
                      onChange={(e) => setFormData({ ...formData, orbitSales: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500">FIVAS (Rp)</label>
                    <input
                      type="number"
                      value={formData.fivasSales ?? 0}
                      onChange={(e) => setFormData({ ...formData, fivasSales: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* PRODUCTIVITY & TNPS */}
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl space-y-2 border border-emerald-100 dark:border-emerald-900/30">
                <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Productivity & TNPS Mobile</span>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[9px] text-gray-500">Productivity</label>
                    <input
                      type="number"
                      value={formData.productivity ?? 300}
                      onChange={(e) => setFormData({ ...formData, productivity: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500">Promotor</label>
                    <input
                      type="number"
                      value={formData.promotor ?? 0}
                      onChange={(e) => setFormData({ ...formData, promotor: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500">Passiver</label>
                    <input
                      type="number"
                      value={formData.passiver ?? 0}
                      onChange={(e) => setFormData({ ...formData, passiver: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500">Detractor</label>
                    <input
                      type="number"
                      value={formData.detractor ?? 0}
                      onChange={(e) => setFormData({ ...formData, detractor: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500">TNPS (%)</label>
                    <input
                      type="number"
                      value={formData.tnpsScore ?? 100}
                      onChange={(e) => setFormData({ ...formData, tnpsScore: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* CHURN PREVENTION */}
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl space-y-2 border border-amber-100 dark:border-amber-900/30">
                <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">Churn Prevention Cut Off</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[9px] text-gray-500">DO IH (6)</label>
                    <input
                      type="number"
                      value={formData.doIh ?? 0}
                      onChange={(e) => setFormData({ ...formData, doIh: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500">Retensi IH</label>
                    <input
                      type="number"
                      value={formData.retensiIh ?? 0}
                      onChange={(e) => setFormData({ ...formData, retensiIh: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500">RR FIX (75%)</label>
                    <input
                      type="number"
                      value={formData.rrFix ?? 100}
                      onChange={(e) => setFormData({ ...formData, rrFix: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500">Mobile (80%)</label>
                    <input
                      type="number"
                      value={formData.mobileChurnPrev ?? 100}
                      onChange={(e) => setFormData({ ...formData, mobileChurnPrev: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Rank CSR</label>
                <input
                  type="number"
                  value={formData.ranking ?? 1}
                  onChange={(e) => setFormData({ ...formData, ranking: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Catatan Auditor / Supervisor</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full p-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  placeholder="Komentar pencapaian, kualifikasi coaching..."
                />
              </div>

              <div className="p-3 bg-gray-50 dark:bg-zinc-900 text-[10px] text-gray-400 rounded-xl leading-relaxed font-mono">
                Formula Bobot: (Sales/Target)*40% + Productivity*30% + Attendance*15% + Roleplay*15%
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                  className="px-4 py-2 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-xs text-white rounded-xl font-medium cursor-pointer shadow-md"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SPREADSHEET BULK IMPORTER MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl overflow-hidden animate-fade-in rounded-apple">
            <div className="p-5 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Import KPI CS dari Spreadsheet (Excel/CSV)</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Method A: Drag and Drop CSV file */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-2">Metode A: Upload File .csv/.txt</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl p-6 text-center hover:bg-gray-50/30 dark:hover:bg-zinc-900/10 cursor-pointer relative transition-all">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold">Tarik & Lepas File CSV Anda ke Sini</p>
                  <p className="text-[10px] text-gray-400 mt-1">Sistem mendukung parse otomatis dipisahkan koma atau tab.</p>
                </div>
              </div>

              {/* Method B: Copy Paste Excel Blocks */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300">Metode B: Copy-Paste Baris dari Excel/Sheets</label>
                  <span className="text-[9px] font-mono text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Sangat Cepat & Praktis</span>
                </div>
                <textarea
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                  rows={4}
                  className="w-full p-3 font-mono border border-gray-200 dark:border-zinc-800 rounded-xl text-[10px] bg-transparent"
                  placeholder={`Name\tNIK\tSales\tProductivity\tAttendance\tRoleplay\tTarget\tNotes&#10;NAFA LAILA WAHIDAH\tGG-00501\t35\t358\t100\t95\t48\tLuar biasa`}
                />
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-zinc-900 text-[10px] text-gray-400 rounded-xl leading-relaxed">
                <span className="font-bold text-gray-600 dark:text-gray-300">Struktur Header Wajib:</span>
                <p className="font-mono text-[9px] mt-1 text-gray-500">Name, NIK, Sales, Productivity, Attendance, Roleplay, Target, Notes</p>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-900 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="button" 
                  onClick={handlePasteImport}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-xs text-white rounded-xl font-medium cursor-pointer shadow-md"
                >
                  Proses & Impor
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
