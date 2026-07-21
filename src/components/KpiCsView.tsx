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
    const headers = ['Name', 'NIK', 'Sales', 'Productivity', 'Attendance', 'Roleplay', 'Achievement', 'Target', 'Status', 'Notes'];
    const rows = sortedData.map(item => [
      item.name,
      item.nik,
      item.sales,
      item.productivity,
      item.attendance,
      item.roleplay,
      item.achievement,
      item.target,
      item.status,
      item.notes.replace(/,/g, ' ')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kpi_cs_report_${Date.now()}.csv`);
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
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-gray-900 text-gray-400 uppercase font-mono tracking-wider text-[9px] select-none">
                <th className="p-4 text-center">Rank</th>
                <th className="p-4">Agen CS Details</th>
                <th className="p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50" onClick={() => handleSort('sales')}>Sales (Unit)</th>
                <th className="p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50" onClick={() => handleSort('productivity')}>Productivity</th>
                <th className="p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50" onClick={() => handleSort('attendance')}>Attendance</th>
                <th className="p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50" onClick={() => handleSort('roleplay')}>Roleplay</th>
                <th className="p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50" onClick={() => handleSort('achievement')}>Pencapaian (%)</th>
                <th className="p-4">Progress Target</th>
                <th className="p-4">Status</th>
                {hasCrudPermission && <th className="p-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-900/20 transition-colors">
                  {/* Rank */}
                  <td className="p-4 text-center font-mono font-bold">
                    {item.ranking === 1 ? (
                      <span className="inline-flex w-5 h-5 items-center justify-center bg-amber-500 text-white rounded-full text-[10px]">1</span>
                    ) : item.ranking === 2 ? (
                      <span className="inline-flex w-5 h-5 items-center justify-center bg-slate-300 text-slate-800 rounded-full text-[10px]">2</span>
                    ) : item.ranking === 3 ? (
                      <span className="inline-flex w-5 h-5 items-center justify-center bg-amber-700/80 text-white rounded-full text-[10px]">3</span>
                    ) : (
                      <span>{item.ranking}</span>
                    )}
                  </td>
                  
                  {/* Avatar and Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={item.photo} alt={item.name} className="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-800 object-cover" />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{item.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.nik}</div>
                      </div>
                    </div>
                  </td>

                  {/* Quantitative Data */}
                  <td className="p-4 font-semibold text-gray-950 dark:text-white font-mono">{item.sales} / {item.target}</td>
                  <td className="p-4 font-mono">{item.productivity} Laporan</td>
                  <td className="p-4 font-mono">{item.attendance}%</td>
                  <td className="p-4 font-mono">{item.roleplay} / 100</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                      <span className="font-bold text-gray-900 dark:text-white font-mono">{item.achievement}%</span>
                    </div>
                  </td>

                  {/* Progress Bar */}
                  <td className="p-4">
                    <div className="w-28 space-y-1">
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span>{item.progress}% Reached</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-red-500 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(item.progress, 100)}%` }} 
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status Indicator */}
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                      item.status === 'Excellent' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' :
                      item.status === 'Good' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' :
                      item.status === 'Needs Improvement' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' :
                      'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  {/* CRUD Operations */}
                  {hasCrudPermission && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          id={`btn-edit-kpi-cs-${item.id}`}
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          id={`btn-delete-kpi-cs-${item.id}`}
                          onClick={() => onDeleteRecord(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/10 cursor-pointer"
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
                  <td colSpan={hasCrudPermission ? 10 : 9} className="p-8 text-center text-gray-400">
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

            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Nama Agen</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                    placeholder="Siti Rahma"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">NIK Agen</label>
                  <input
                    type="text"
                    required
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                    placeholder="GG-00511"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Sales (Unit)</label>
                  <input
                    type="number"
                    value={formData.sales}
                    onChange={(e) => setFormData({ ...formData, sales: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Target Sales</label>
                  <input
                    type="number"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Productivity</label>
                  <input
                    type="number"
                    value={formData.productivity}
                    onChange={(e) => setFormData({ ...formData, productivity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Attendance (%)</label>
                  <input
                    type="number"
                    max="100"
                    value={formData.attendance}
                    onChange={(e) => setFormData({ ...formData, attendance: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Roleplay Audit Score</label>
                  <input
                    type="number"
                    max="100"
                    value={formData.roleplay}
                    onChange={(e) => setFormData({ ...formData, roleplay: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Catatan Auditor / Supervisor</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full p-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  placeholder="Komentar kepatuhan standard, inisiatif coaching..."
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
                  placeholder={`Name\tNIK\tSales\tProductivity\tAttendance\tRoleplay\tTarget\tNotes&#10;Siti Rahma\tGG-00511\t145\t98\t100\t92\t150\tLuar biasa`}
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
