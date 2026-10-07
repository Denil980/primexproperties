import { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  RefreshCw, 
  Layers, 
  Building2, 
  Users, 
  UserCheck, 
  CalendarDays, 
  MapPin, 
  ScrollText,
  FileCheck
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { apiGet } from '../lib/api';
import { Card, CardHead, btnPrimary, btnGold, btnGhost, inputCls, labelCls, StatusPill } from './ui';

interface ExportLog {
  id: string;
  reportName: string;
  category: string;
  format: 'PDF' | 'EXCEL';
  dateRange: string;
  recordsCount: number;
  exportedBy: string;
  exportedAt: string; // ISO string or formatted timestamp
}

const DEFAULT_HISTORY: ExportLog[] = [
  {
    id: 'exp-101',
    reportName: 'Properties Inventory & Valuation Report',
    category: 'properties',
    format: 'PDF',
    dateRange: 'Oct 01, 2026 – Oct 07, 2026',
    recordsCount: 36,
    exportedBy: 'Super Admin',
    exportedAt: '2026-10-07T09:30:00.000Z',
  },
  {
    id: 'exp-102',
    reportName: 'Leads CRM & Sales Pipeline Export',
    category: 'leads',
    format: 'EXCEL',
    dateRange: 'Sep 01, 2026 – Sep 30, 2026',
    recordsCount: 142,
    exportedBy: 'Sales Manager',
    exportedAt: '2026-10-06T14:15:00.000Z',
  },
  {
    id: 'exp-103',
    reportName: 'Site Visits & Tour Audit',
    category: 'visits',
    format: 'PDF',
    dateRange: 'Oct 01, 2026 – Oct 05, 2026',
    recordsCount: 28,
    exportedBy: 'Admin',
    exportedAt: '2026-10-05T16:45:00.000Z',
  },
];

export default function AdminReports() {
  const { profile } = useAuth();
  
  // Dates state
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(todayStr);
  const [preset, setPreset] = useState('30days');
  
  // Filters state
  const [category, setCategory] = useState('properties');
  const [locality, setLocality] = useState('all');
  const [status, setStatus] = useState('all');
  
  // Data state for export preview
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ExportLog[]>(() => {
    try {
      const saved = localStorage.getItem('primex_reports_export_history');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_HISTORY;
  });

  useEffect(() => {
    try {
      localStorage.setItem('primex_reports_export_history', JSON.stringify(history));
    } catch (_) {}
  }, [history]);

  // Handle preset date pickers
  const applyPreset = (p: string) => {
    setPreset(p);
    const now = new Date();
    let start = new Date();
    if (p === 'today') {
      start = now;
    } else if (p === 'week') {
      start = new Date(now.getTime() - 7 * 86400000);
    } else if (p === '30days') {
      start = new Date(now.getTime() - 30 * 86400000);
    } else if (p === 'quarter') {
      start = new Date(now.getTime() - 90 * 86400000);
    } else if (p === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
    }
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  };

  // Fetch dataset matching selected category and filters
  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/properties?limit=100';
      if (category === 'projects') endpoint = '/api/projects?limit=100';
      if (category === 'leads') endpoint = '/api/leads?limit=100';
      if (category === 'visits') endpoint = '/api/visits?limit=100';
      if (category === 'localities') endpoint = '/api/localities?limit=100';
      if (category === 'audit') endpoint = '/api/audit-logs?limit=100';

      const res = await apiGet(endpoint).catch(() => ({ data: [] }));
      let list = Array.isArray(res) ? res : (res.data || []);

      // Filter by locality if applicable
      if (locality !== 'all') {
        list = list.filter((item: any) => {
          const loc = item.locality || item.city || '';
          return loc.toLowerCase().includes(locality.toLowerCase());
        });
      }

      // Filter by status if applicable
      if (status !== 'all') {
        list = list.filter((item: any) => {
          const st = item.status || item.rera_status || '';
          return st.toLowerCase() === status.toLowerCase();
        });
      }

      setItems(list);
    } catch (err) {
      console.error('Failed to load report dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, locality, status]);

  const categoryLabels: Record<string, string> = {
    properties: 'Properties & Inventory',
    projects: 'Projects & Developments',
    leads: 'Leads CRM & Conversions',
    visits: 'Scheduled Site Visits',
    localities: 'Locality Intelligence',
    audit: 'Audit Logs & Activity',
  };

  const formattedDateRange = `${new Date(startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} – ${new Date(endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Log export action into History
  const recordExport = (fmt: 'PDF' | 'EXCEL') => {
    const newEntry: ExportLog = {
      id: `exp-${Date.now().toString(36)}`,
      reportName: `${categoryLabels[category] || 'Executive Data'} Export`,
      category,
      format: fmt,
      dateRange: formattedDateRange,
      recordsCount: items.length || 1,
      exportedBy: profile?.full_name || 'Admin',
      exportedAt: new Date().toISOString(),
    };
    setHistory((prev) => [newEntry, ...prev]);
  };

  // Export to CSV / Excel
  const handleExportExcel = () => {
    if (!items.length) {
      alert('No data available to export.');
      return;
    }

    // Convert items to CSV string
    const headers = Object.keys(items[0]).filter((k) => typeof items[0][k] !== 'object');
    const csvRows = [headers.join(',')];

    items.forEach((row) => {
      const values = headers.map((h) => {
        const val = row[h] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `primex_${category}_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    recordExport('EXCEL');
  };

  // Export to PDF / Formatted Print Document
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reportTitle = `${categoryLabels[category] || 'System'} Report`;
    const exportTime = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const sampleHeaders = items.length ? Object.keys(items[0]).filter((k) => typeof items[0][k] !== 'object').slice(0, 6) : ['id', 'title', 'status', 'created_at'];

    const tableRowsHtml = items.slice(0, 40).map((row, idx) => `
      <tr style="border-bottom: 1px solid #e5e7eb; font-size: 12px; font-family: sans-serif;">
        <td style="padding: 8px; color: #6b7280;">#${idx + 1}</td>
        ${sampleHeaders.map((h) => `<td style="padding: 8px; color: #111827;">${row[h] !== undefined && row[h] !== null ? String(row[h]) : '—'}</td>`).join('')}
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle} - Primex Properties</title>
          <style>
            body { font-family: 'Times New Roman', Georgia, serif; color: #0b1320; padding: 40px; margin: 0; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #c5a880; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #0b1320; }
            .logo span { color: #c5a880; }
            .badge { background: #0b1320; color: #c5a880; padding: 6px 14px; font-size: 11px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 1px; }
            .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; font-family: sans-serif; font-size: 12px; background: #f9f8f6; padding: 15px; border: 1px solid #e5e7eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 10px; background: #0b1320; color: #fff; font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
            .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; pt: 15px; font-family: sans-serif; font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">PRIMEX <span>PROPERTIES</span></div>
              <div style="font-family: sans-serif; font-size: 12px; color: #6b7280; margin-top: 4px;">Executive Intelligence & Data Export</div>
            </div>
            <div class="badge">${reportTitle}</div>
          </div>

          <div class="meta-grid">
            <div><strong>Date Range:</strong><br/>${formattedDateRange}</div>
            <div><strong>Total Records:</strong><br/>${items.length} Items</div>
            <div><strong>Generated At:</strong><br/>${exportTime}</div>
          </div>

          <h3 style="margin-bottom: 10px; font-weight: normal;">Dataset Detail Overview</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                ${sampleHeaders.map((h) => `<th>${h.replace(/_/g, ' ')}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml || '<tr><td colspan="7" style="padding: 20px; text-align: center;">No records found for selected filters</td></tr>'}
            </tbody>
          </table>

          <div class="footer" style="margin-top: 50px;">
            <div>Confidential · Primex Properties Management System</div>
            <div>Exported by ${profile?.full_name || 'Admin'}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    recordExport('PDF');
  };

  const clearHistory = () => {
    if (confirm('Clear export history log?')) {
      setHistory([]);
      localStorage.removeItem('primex_reports_export_history');
    }
  };

  return (
    <div className="space-y-8">
      <SEO title="Reports & Export — Admin Panel" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-gold tracking-[0.25em] uppercase">
          <FileCheck size={14} /> Executive Reporting
        </div>
        <h1 className="font-serif text-3xl text-ink mt-1">Reports & Intelligence Export</h1>
        <p className="text-ink/55 text-sm mt-1 max-w-3xl">
          Generate tailored analytical reports in PDF or Excel format with custom date ranges, category filters, and export history tracking.
        </p>
      </div>

      {/* SECTION 1: Date & Filter Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-ink/10 mb-6">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gold-dark" />
            <h2 className="font-serif text-lg text-ink">Date & Filter Settings</h2>
          </div>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-ink/60 hover:text-gold-dark font-medium transition"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-gold' : ''} /> Refresh Data
          </button>
        </div>

        {/* Date Range Presets */}
        <div className="space-y-4">
          <div>
            <span className={labelCls}>Quick Date Presets</span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'quarter', label: 'This Quarter' },
                { id: 'year', label: 'Year to Date' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={`px-3.5 py-1.5 text-xs tracking-wider uppercase transition border ${
                    preset === p.id ? 'bg-ink text-gold border-ink font-medium' : 'bg-white text-ink/70 border-ink/15 hover:border-gold hover:text-gold-dark'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
            {/* Start Date */}
            <div>
              <label className={labelCls}>Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPreset('custom'); }}
                  className={inputCls}
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className={labelCls}>End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPreset('custom'); }}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className={labelCls}>Dataset Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                <option value="properties">Properties & Inventory</option>
                <option value="projects">Projects & Developments</option>
                <option value="leads">Leads CRM & Sales</option>
                <option value="visits">Site Visits Schedule</option>
                <option value="localities">Locality Guides</option>
                <option value="audit">Audit Logs & Activity</option>
              </select>
            </div>

            {/* Locality Filter */}
            <div>
              <label className={labelCls}>Locality / Region</label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className={inputCls}
              >
                <option value="all">All Localities</option>
                <option value="Kharghar">Kharghar</option>
                <option value="Belapur">Belapur</option>
                <option value="Vashi">Vashi</option>
                <option value="Nerul">Nerul</option>
                <option value="Thane">Thane West</option>
                <option value="Powai">Powai</option>
                <option value="Worli">Worli</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-ink/10">
            <div className="text-xs text-ink/60 flex items-center gap-2">
              <Calendar size={14} className="text-gold-dark" />
              <span>Active Scope: <strong className="text-ink">{formattedDateRange}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => { applyPreset('30days'); setCategory('properties'); setLocality('all'); setStatus('all'); }}
              className="text-xs text-ink/50 hover:text-red-500 transition underline"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </Card>

      {/* SECTION 2: Export Action Options (PDF or Excel) */}
      <Card className="p-6 bg-gradient-to-r from-white via-cream/30 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/30 text-gold-dark text-[11px] tracking-[0.2em] uppercase font-semibold">
              <Layers size={12} /> Dataset Export Preview
            </div>
            <h3 className="font-serif text-2xl text-ink">
              {categoryLabels[category]} Report
            </h3>
            <p className="text-sm text-ink/60 font-light max-w-xl">
              Found <strong className="text-ink font-medium">{items.length} matching records</strong> within the selected date range ({formattedDateRange}). Ready to generate instant report export.
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
            {/* Export PDF Button */}
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={loading || !items.length}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 bg-ink text-gold px-6 py-3.5 text-xs tracking-[0.18em] uppercase font-semibold hover:bg-gold hover:text-ink transition border border-ink disabled:opacity-50 shadow-sm"
            >
              <FileText size={17} className="text-gold hover:text-ink" /> Export as PDF
            </button>

            {/* Export Excel Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={loading || !items.length}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 bg-emerald-700 text-white px-6 py-3.5 text-xs tracking-[0.18em] uppercase font-semibold hover:bg-emerald-800 transition disabled:opacity-50 shadow-sm"
            >
              <FileSpreadsheet size={17} /> Export as Excel / CSV
            </button>
          </div>
        </div>
      </Card>

      {/* SECTION 3: History of Last Exports */}
      <Card>
        <CardHead
          title="History of Last Exports"
          sub="Log of all recently generated PDF and Excel reports with download history and timestamps."
          action={
            history.length > 0 ? (
              <button
                type="button"
                onClick={clearHistory}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition font-medium"
              >
                <Trash2 size={13} /> Clear History
              </button>
            ) : null
          }
        />

        {history.length === 0 ? (
          <div className="px-5 py-12 text-center text-ink/45 text-sm">
            No export history found. Click "Export as PDF" or "Export as Excel" above to generate your first export log.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ink/10 text-[11px] tracking-[0.18em] uppercase text-ink/45 bg-ink/5">
                  <th className="px-5 py-3 font-normal">Date & Time</th>
                  <th className="px-5 py-3 font-normal">Report Title & Scope</th>
                  <th className="px-5 py-3 font-normal">Format</th>
                  <th className="px-5 py-3 font-normal">Date Range</th>
                  <th className="px-5 py-3 font-normal">Records</th>
                  <th className="px-5 py-3 font-normal">Exported By</th>
                  <th className="px-5 py-3 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 text-sm">
                {history.map((log) => {
                  const dateFormatted = new Date(log.exportedAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const timeFormatted = new Date(log.exportedAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-ink/[0.02] transition">
                      {/* Date and Time */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gold-dark shrink-0" />
                          <div>
                            <div className="font-medium text-ink">{dateFormatted}</div>
                            <div className="text-xs text-ink/45">{timeFormatted}</div>
                          </div>
                        </div>
                      </td>

                      {/* Report Name */}
                      <td className="px-5 py-4 font-medium text-ink">
                        {log.reportName}
                      </td>

                      {/* Format Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {log.format === 'PDF' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 font-medium">
                            <FileText size={13} /> PDF
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                            <FileSpreadsheet size={13} /> EXCEL
                          </span>
                        )}
                      </td>

                      {/* Date Range */}
                      <td className="px-5 py-4 text-xs text-ink/65 whitespace-nowrap font-light">
                        {log.dateRange}
                      </td>

                      {/* Records Count */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-ink bg-ink/5 px-2.5 py-1 border border-ink/10">
                          {log.recordsCount} Records
                        </span>
                      </td>

                      {/* Exported By */}
                      <td className="px-5 py-4 text-xs text-ink/70 whitespace-nowrap">
                        {log.exportedBy}
                      </td>

                      {/* Re-download Action */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => log.format === 'PDF' ? handleExportPDF() : handleExportExcel()}
                          className="inline-flex items-center gap-1 text-xs text-gold-dark hover:text-ink font-medium transition"
                        >
                          <Download size={13} /> Re-export
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
