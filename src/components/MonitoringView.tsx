import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  X,
  PlusCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { MonitoringRecord, UserRole } from '../types';

interface MonitoringViewProps {
  data: MonitoringRecord[];
  type: 'Indihome' | 'Telkomsel';
  userRole: UserRole;
  onAddRecord: (record: Partial<MonitoringRecord>) => void;
  onUpdateRecord: (id: string, record: Partial<MonitoringRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onBulkImport: (data: any[]) => void;
}

export default function MonitoringView({ 
  data, 
  type, 
  userRole, 
  onAddRecord, 
  onUpdateRecord, 
  onDeleteRecord,
  onBulkImport
}: MonitoringViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MonitoringRecord | null>(null);

  // Form inputs
  const [formData, setFormData] = useState<Partial<MonitoringRecord>>({
    customerName: '',
    csName: 'NAFA LAILA WAHIDAH',
    nik: 'GG-00501',
    msisdn: '',
    indihomeNumber: '',
    complaint: '',
    ticketNumber: '',
    sla: 24,
    category: 'Technical',
    status: 'Open',
    notes: ''
  });

  // Filter records based on current type (Indihome vs Telkomsel)
  const filteredByType = data.filter(item => item.type === type);

  // Search and custom dropdown filter
  const filteredData = filteredByType.filter(item => {
    const matchesSearch = 
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.msisdn.includes(searchTerm) ||
      (item.indihomeNumber && item.indihomeNumber.includes(searchTerm)) ||
      item.csName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Permissions checks
  const canCreateTicket = userRole === 'Admin' || userRole === 'Team Leader' || userRole === 'Customer Service' || userRole === 'FOS';
  const canUpdateTicket = userRole === 'Admin' || userRole === 'Team Leader' || userRole === 'FOS';
  const canDeleteTicket = userRole === 'Admin' || userRole === 'Team Leader';

  // SLA Color Helper
  const getSlaBadge = (sla: number, status: string) => {
    if (status === 'Resolved') {
      return {
        style: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/10',
        label: 'Resolved / Safe',
        icon: CheckCircle
      };
    }
    
    if (sla < 0) {
      return {
        style: 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-500/15 animate-pulse',
        label: `${Math.abs(sla)}h Overdue`,
        icon: AlertTriangle
      };
    } else if (sla <= 6) {
      return {
        style: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-500/15',
        label: `${sla}h Remaining (Warning)`,
        icon: Clock
      };
    } else {
      return {
        style: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/10',
        label: `${sla}h Left`,
        icon: Clock
      };
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-500/10';
      case 'In Progress': return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-500/10';
      case 'Resolved': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/10';
      case 'Escalated': return 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-500/10';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedTicket = formData.ticketNumber || `${type === 'Indihome' ? 'IN' : 'TS'}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    
    onAddRecord({
      ...formData,
      type,
      ticketNumber: generatedTicket,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    });

    setShowAddModal(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    onUpdateRecord(editingRecord.id, {
      ...formData,
      updatedDate: new Date().toISOString()
    });

    setShowEditModal(false);
    setEditingRecord(null);
    resetForm();
  };

  const openEditModal = (record: MonitoringRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      csName: 'Siti Rahma',
      nik: 'GG-00511',
      msisdn: '',
      indihomeNumber: '',
      complaint: '',
      ticketNumber: '',
      sla: 24,
      category: 'Technical',
      status: 'Open',
      notes: ''
    });
  };

  const exportToCSV = () => {
    const headers = ['Ticket No', 'Customer Name', 'Category', 'MSISDN', 'Indihome No', 'CS Name', 'SLA Hour', 'Status', 'Complaint', 'Notes'];
    const rows = filteredData.map(item => [
      item.ticketNumber,
      item.customerName,
      item.category,
      item.msisdn,
      item.indihomeNumber || '-',
      item.csName,
      item.sla,
      item.status,
      item.complaint.replace(/,/g, ' '),
      item.notes.replace(/,/g, ' ')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `monitoring_${type.toLowerCase()}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title & Stats Grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Monitoring Penanganan Gangguan - {type}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Pantau seluruh status tiket aduan pelanggan {type === 'Indihome' ? 'Indihome Fiber broadband' : 'kartu Halo & prabayar Telkomsel'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            id="btn-export-monitoring"
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-zinc-900 text-xs text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Laporan</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="apple-glass rounded-apple p-4 apple-shadow grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            id="input-search-monitoring"
            type="text"
            placeholder="Cari No Tiket, Nama, No HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-100 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 text-xs focus:ring-1 focus:ring-red-500 outline-none"
          />
        </div>

        <div>
          <select
            id="select-filter-status-monitoring"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs border border-gray-100 dark:border-zinc-800 rounded-xl px-3 py-2.5 bg-white/50 dark:bg-zinc-900/40 text-gray-600 dark:text-gray-300 outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="All">Semua Kategori Status Tiket</option>
            <option value="Open">Status: Open</option>
            <option value="In Progress">Status: In Progress</option>
            <option value="Resolved">Status: Resolved</option>
            <option value="Escalated">Status: Escalated</option>
          </select>
        </div>

        <div>
          <select
            id="select-filter-category-monitoring"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full text-xs border border-gray-100 dark:border-zinc-800 rounded-xl px-3 py-2.5 bg-white/50 dark:bg-zinc-900/40 text-gray-600 dark:text-gray-300 outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="All">Semua Klasifikasi Keluhan</option>
            <option value="Billing">Kategori: Billing / Finansial</option>
            <option value="Technical">Kategori: Technical / Gangguan Fisik</option>
            <option value="Product Modification">Kategori: Product Modification</option>
            <option value="New Activation">Kategori: New Activation (PSB)</option>
            <option value="Network Issue">Kategori: Network Issue (Core)</option>
          </select>
        </div>
      </div>

      {/* SLA COLOR INDICATOR SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-left">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Green Zone (SLA Aman)</div>
            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-500 mt-0.5">SLA tersisa &gt; 6 jam atau tiket selesai</p>
          </div>
        </div>
        <div className="p-4 bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 rounded-2xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <div className="text-left">
            <div className="text-xs font-bold text-amber-800 dark:text-amber-400">Yellow Zone (Warning)</div>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-500 mt-0.5">SLA mepet, tersisa 0 s/d 6 jam lagi</p>
          </div>
        </div>
        <div className="p-4 bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 rounded-2xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <div className="text-left">
            <div className="text-xs font-bold text-red-800 dark:text-red-400">Red Zone (Over SLA)</div>
            <p className="text-[10px] text-red-600/80 dark:text-red-500 mt-0.5">Waktu penanganan telah melebihi batas standard</p>
          </div>
        </div>
      </div>

      {/* SPREADSHEET TABLE GRID */}
      <div className="apple-glass rounded-apple apple-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-gray-900 text-gray-400 uppercase font-mono tracking-wider text-[9px] select-none">
                <th className="p-4">Ticket Number</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Complaint / Aduan</th>
                <th className="p-4">SLA Tracker</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">CS Representative</th>
                <th className="p-4">Dates</th>
                {canUpdateTicket && <th className="p-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {filteredData.map((item) => {
                const slaInfo = getSlaBadge(item.sla, item.status);
                const SlaIcon = slaInfo.icon;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-900/20 transition-colors">
                    
                    {/* Ticket No */}
                    <td className="p-4 font-mono font-bold text-gray-900 dark:text-white">
                      {item.ticketNumber}
                    </td>

                    {/* Customer details */}
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{item.customerName}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        HP: {item.msisdn}
                        {type === 'Indihome' && ` • IH: ${item.indihomeNumber}`}
                      </div>
                    </td>

                    {/* Complaint */}
                    <td className="p-4 max-w-[240px]">
                      <div className="font-medium text-gray-800 dark:text-gray-300 line-clamp-2">{item.complaint}</div>
                      {item.notes && (
                        <div className="text-[10px] text-gray-400 italic mt-1 truncate">Notes: {item.notes}</div>
                      )}
                    </td>

                    {/* SLA Progress */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold font-mono text-[10px] ${slaInfo.style}`}>
                        <SlaIcon className="w-3.5 h-3.5" />
                        <span>{slaInfo.label}</span>
                      </span>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="font-medium text-gray-700 dark:text-gray-400">{item.category}</span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-semibold text-[10px] ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* CS Name */}
                    <td className="p-4">
                      <div className="font-semibold">{item.csName}</div>
                      <div className="text-[9px] text-gray-400 font-mono mt-0.5">{item.nik}</div>
                    </td>

                    {/* Dates */}
                    <td className="p-4 text-gray-400 font-mono text-[10px]">
                      <div>{new Date(item.createdDate).toLocaleDateString('id-ID')}</div>
                      <div className="text-[9px] mt-0.5">{new Date(item.updatedDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>

                    {/* CRUD Actions */}
                    {canUpdateTicket && (
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            id={`btn-edit-monitoring-${item.id}`}
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {canDeleteTicket && (
                            <button 
                              id={`btn-delete-monitoring-${item.id}`}
                              onClick={() => onDeleteRecord(item.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}

                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={canUpdateTicket ? 9 : 8} className="p-8 text-center text-gray-400">
                    Tidak ada tiket keluhan aktif untuk {type}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD TICKETS MODALS */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl overflow-hidden animate-fade-in rounded-apple">
            <div className="p-5 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  {showAddModal ? `Buka Tiket Aduan ${type}` : `Modifikasi Tiket Aduan ${type}`}
                </h3>
              </div>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Nama Pelanggan</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                    placeholder="Yusuf Maulana"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Nomor MSISDN (Telkomsel)</label>
                  <input
                    type="text"
                    required
                    value={formData.msisdn}
                    onChange={(e) => setFormData({ ...formData, msisdn: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                    placeholder="0811xxxxxxxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {type === 'Indihome' && (
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Nomor Indihome</label>
                    <input
                      type="text"
                      required
                      value={formData.indihomeNumber}
                      onChange={(e) => setFormData({ ...formData, indihomeNumber: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                      placeholder="122xxxxxxxxxx"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">SLA Penanganan (Jam)</label>
                  <input
                    type="number"
                    required
                    value={formData.sla}
                    onChange={(e) => setFormData({ ...formData, sla: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Klasifikasi Keluhan</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-zinc-900"
                  >
                    <option value="Technical">Technical (Gangguan Jaringan/Modem)</option>
                    <option value="Billing">Billing (Invoicing/Biaya)</option>
                    <option value="Product Modification">Product Modification (Ubah Layanan)</option>
                    <option value="New Activation">New Activation (PSB)</option>
                    <option value="Network Issue">Network Issue (Sinyal/Core)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Status Tiket</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-zinc-900"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Escalated">Escalated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Rincian Keluhan Pelanggan</label>
                <textarea
                  required
                  value={formData.complaint}
                  onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                  rows={2}
                  className="w-full p-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  placeholder="Lampu LOS merah berkedip, tidak bisa konek internet..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Perkembangan Tiket / Catatan Petugas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full p-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent"
                  placeholder="Tiket di-assign ke teknisi FOS subzone 2..."
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
                  Simpan Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
