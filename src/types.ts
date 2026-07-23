export type UserRole = 'Admin' | 'Team Leader' | 'Customer Service' | 'FOS';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  nik: string;
  photo?: string;
}

export interface KpiCsRecord {
  id: string;
  photo: string;
  name: string;
  nik: string;
  sales: number; // e.g. Telkomsel Orbit, Halo, Add-on
  productivity: number; // e.g. serving count, interactive sessions
  attendance: number; // percentage %
  roleplay: number; // compliance score e.g. 0-100
  achievement: number; // aggregate achievement %
  notes: string;
  ranking: number;
  progress: number; // e.g. % of monthly target reached
  target: number; // numeric target
  status: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical';
  // Detailed CSR performance fields from Performance CSR Grapari Surabaya Garuda Juni 2026 spreadsheet:
  haloSales?: number;
  indihomeSales?: number;
  orbitSales?: number;
  fivasSales?: number;
  promotor?: number;
  passiver?: number;
  detractor?: number;
  tnpsScore?: number;
  doIh?: number;
  retensiIh?: number;
  rrFix?: number;
  mobileChurnPrev?: number;
}

export interface KpiFosRecord {
  id: string;
  photo: string;
  name: string;
  nik: string;
  monitoringTicket: number;
  inSla: number;
  outSla: number;
  achievement: number; // aggregate SLA achievement %
  notes: string;
  ranking: number;
  status: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical';
}

export interface MonitoringRecord {
  id: string;
  type: 'Indihome' | 'Telkomsel';
  customerName: string;
  csName: string;
  nik: string;
  msisdn: string;
  indihomeNumber: string;
  complaint: string;
  ticketNumber: string;
  sla: number; // hours remaining or spent
  category: 'Billing' | 'Technical' | 'Product Modification' | 'New Activation' | 'Network Issue';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  notes: string;
  createdDate: string;
  updatedDate: string;
}

export interface TemplateRecord {
  id: string;
  title: string;
  category: string;
  content: string;
  isFavorite: boolean;
  usageCount: number;
}

export interface KnowledgeRecord {
  id: string;
  title: string;
  category: 'Indihome' | 'Telkomsel' | 'General';
  type: 'FAQ' | 'Procedure' | 'SOP' | 'Flow' | 'Script' | 'Solution';
  tags: string[];
  content: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
}

export interface SystemSettings {
  theme: 'light' | 'dark' | 'system';
  googleSheetUrl: string;
  appsScriptUrl: string;
  logoUrl: string;
  companyName: string;
}

export interface DashboardMetrics {
  achievementToday: number;
  achievementMonth: number;
  achievementYear: number;
  totalSales: number;
  activeTickets: number;
  overallSla: number;
}

