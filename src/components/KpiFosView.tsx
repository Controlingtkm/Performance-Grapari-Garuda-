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
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { KpiFosRecord, UserRole } from '../types';

interface KpiFosViewProps {
  data: KpiFosRecord[];
  userRole: UserRole;
  onAddRecord: (record: Partial<KpiFosRecord>) => void;
  onUpdateRecord: (id: string, record: Partial<KpiFosRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onBulkImport: (data: any[]) => void;
}

export default function KpiFosView({ 
  data, 
  userRole, 
  onAddRecord, 
  onUpdateRecord, 
  onDeleteRecord,
  onBulkImport
}: KpiFosViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState<keyof KpiFosRecord>('ranking');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<KpiFosRecord | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<KpiFosRecord>>({
    name: '',
    nik: '',
    monitoringTicket: 0,
    inSla: 0,
    outSla: 0,
    notes: '',
    status: 'Good'
  });

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

  const handleSort = (field: keyof KpiFosRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tickets = Number(formData.monitoringTicket || 0);
    const inSlaCount = Number(formData.inSla || 0);
    const computedAch = tickets > 0 ? Math.round((inSlaCount / tickets) * 1000) / 10 : 100;
    
    let computedStatus: KpiFosRecord['status'] = 'Good';
    if (computedAch >= 95) computedStatus = 'Excellent';
    else if (computedAch >= 88) computedStatus = 'Good';
    else if (computedAch >= 75) computedStatus = 'Needs Improvement';
    else computedStatus = 'Critical';

    onAddRecord({
      ...formData,
      monitoringTicket: tickets,
      inSla: inSlaCount,
      outSla: tickets - inSlaCount,
      achievement: computedAch,
      status: computedStatus
    });

    setShowAddModal(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const tickets = Number(formData.monitoringTicket || 0);
    const inSlaCount = Number(formData.inSla || 0);
    const computedAch = tickets > 0 ? Math.round((inSlaCount / tickets) * 1000) / 10 : 100;

    let computedStatus: KpiFosRecord['status'] = 'Good';
    if (computedAch >= 95) computedStatus = 'Excellent';
    else if (computedAch >= 88) computedStatus = 'Good';
    else if (computedAch >= 75) computedStatus = 'Needs Improvement';
    else computedStatus = 'Critical';

    onUpdateRecord(editingRecord.id, {
      ...formData,
      monitoringTicket: tickets,
      inSla: inSlaCount,
      outSla: tickets - inSlaCount,
      achievement: computedAch,
      status: computedStatus
    });

    setShowEditModal(false);
    setEditingRecord(null);
    resetForm();
  };

  const openEditModal = (record: KpiFosRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nik: '',
      monitoringTicket: 0,
      inSla: 0,
      outSla: 0,
      notes: '',
      status: 'Good'
    });
  };

  // Raw file parser CSV
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

  const parseExcelPasteData = (text: string) => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        alert('Data tidak valid. Mohon sertakan baris header.');
        return;
      }

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

        const tickets = Number(rowObj.ticket || rowObj.monitoringticket || 0);
        const inside = Number(rowObj.insla || 0);

        parsedRecords.push({
          name: rowObj.name || rowObj.nama || 'FOS Engineer',
          nik: rowObj.nik || `GG-00${Math.floor(100 + Math.random() * 899)}`,
          monitoringTicket: tickets,
          inSla: inside,
          outSla: tickets - inside,
          achievement: tickets > 0 ? Math.round((inside / tickets) * 1000) / 10 : 100,
          notes: rowObj.notes || rowObj.catatan || 'Imported via Excel.'
        });
      }

      if (parsedRecords.length > 0) {
        onBulkImport(parsedRecords);
        setShowImportModal(false);
        setPasteData('');
        alert(`Berhasil mengimpor ${parsedRecords.length} engineer FOS dari spreadsheet!`);
      } else {
        alert('Gagal mendeteksi kolom. Harap sesuaikan header.');
      }
    } catch (err) {
      alert('Terjadi kesalahan format saat memparsing data.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'NIK', 'Monitoring Ticket', 'In SLA', 'Out SLA', 'SLA Achievement (%)', 'Status', 'Notes'];
    const rows = sortedData.map(item => [
      item.name,
      item.nik,
      item.monitoringTicket,
      item.inSla,
      item.outSla,
      item.achievement,
      item.status,
      item.notes.replace(/,/g, ' ')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kpi_fos_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Table Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">KPI Field Operations (FOS)</h2>
          <p className="text-xs text-gray-500 mt-1">Kelola data pemenuhan SLA pemasangan baru, penanganan gangguan fiber, dan tiket lapangan.</p>
        </div>
        
        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-3">
          {hasCrudPermission && (
            <button 
              id="btn-import-kpi-fos"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-zinc-900 text-xs text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer transition-all shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Excel</span>
            </button>
          )}

          <button 
            id="btn-export-kpi-fos"
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-zinc-900 text-xs text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {hasCrudPermission && (
            <button 
              id="btn-add-kpi-fos"
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-xs text-white rounded-xl font-medium cursor-pointer transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Teknisi FOS</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="apple-glass rounded-apple p-4 apple-shadow flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            id="input-search-kpi-fos"
            type="text"
            placeholder="Cari teknisi berdasarkan nama atau NIK..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-100 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 text-xs focus:ring-1 focus:ring-red-500 outline-none"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto items-center self-end md:self-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <select
            id="select-filter-status-fos"
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
                <th className="p-4">Teknisi FOS Details</th>
                <th className="p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50" onClick={() => handleSort('monitoringTicket')}>Total Tiket</th>
                <th className="p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50" onClick={() => handleSort('inSla')}>Selesai Sesuai SLA</th>
                <th className="p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50" onClick={() => handleSort('outSla')}>Melebihi SLA</th>
                <th className="p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-800/50" onClick={() => handleSort('achievement')}>Pencapaian SLA (%)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Catatan Operasional</th>
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

                  {/* Ticket performance */}
                  <td className="p-4 font-semibold text-gray-950 dark:text-white font-mono">{item.monitoringTicket} Tiket</td>
                  <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{item.inSla}</td>
                  <td className="p-4 font-mono text-red-500 font-bold">{item.outSla}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-bold text-gray-900 dark:text-white font-mono">{item.achievement}%</span>
                    </div>
                  </td>

                  {/* Status */}
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

                  {/* Notes */}
                  <td className="p-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{item.notes}</td>

                  {/* CRUD Operations */}
                  {hasCrudPermission && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          id={`btn-edit-kpi-fos-${item.id}`}
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          id={`btn-delete-kpi-fos-${item.id}`}
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
                  <td colSpan={hasCrudPermission ? 9 : 8} className="p-8 text-center text-gray-400">
                    Tidak ada data engineer FOS.
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
                id="btn-prev-page-fos"
                onClick={() => setCurrentPage(c => Math.max(c - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-next-page-fos"
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
                <Layers className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  {showAddModal ? 'Tambah Teknisi FOS Baru' : 'Modifikasi Teknisi FOS'}
                </h3>
              </div>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Nama Lengkap Teknisi</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                    placeholder="Eko Wijaya"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">NIK Teknisi</label>
                  <input
                    type="text"
                    required
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                    placeholder="GG-00788"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Total Tiket Keluhan</label>
                  <input
                    type="number"
                    value={formData.monitoringTicket}
                    onChange={(e) => setFormData({ ...formData, monitoringTicket: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Selesai Dalam SLA</label>
                  <input
                    type="number"
                    value={formData.inSla}
                    onChange={(e) => setFormData({ ...formData, inSla: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  />
                </div>
                <div className="opacity-60">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Melebihi SLA (Auto)</label>
                  <input
                    type="number"
                    disabled
                    value={Number(formData.monitoringTicket || 0) - Number(formData.inSla || 0)}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-gray-50 dark:bg-zinc-900 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Komentar Lapangan / Catatan Zona</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full p-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  placeholder="Komentar kepatuhan penanganan, ODP, atau dropcore..."
                />
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
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Import KPI FOS dari Spreadsheet (Excel/CSV)</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
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

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300">Metode B: Copy-Paste Baris dari Excel/Sheets</label>
                </div>
                <textarea
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                  rows={4}
                  className="w-full p-3 font-mono border border-gray-200 dark:border-zinc-800 rounded-xl text-[10px] bg-transparent"
                  placeholder={`Name\tNIK\tTicket\tInSLA\tNotes&#10;Eko Wijaya\tGG-00788\t164\t159\tSangat teliti`}
                />
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-zinc-900 text-[10px] text-gray-400 rounded-xl leading-relaxed">
                <span className="font-bold text-gray-600 dark:text-gray-300">Struktur Header Wajib:</span>
                <p className="font-mono text-[9px] mt-1 text-gray-500">Name, NIK, Ticket, InSLA, Notes</p>
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
