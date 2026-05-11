import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, UserX, FolderArchive, FileText, Settings, 
  LogOut, Plus, Search, Filter, Download, Upload, MoreVertical, 
  Edit, Trash2, Printer, ChevronDown, ChevronLeft, ChevronRight, School,
  LayoutDashboard, Database, GraduationCap, X, Check, Save, UserPlus,
  ShieldCheck, FileSpreadsheet
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Student {
  id: number;
  nama: string;
  nisn: string;
  noPeserta: string;
  kelas: string;
  sekolah: string;
  status: string;
  tahunAjaran: string;
  createdAt: string;
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard'|'data'|'arsip'|'skl'|'settings'>('dashboard');
  
  // Filtering and Settings
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState('');
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [kelasFilter, setKelasFilter] = useState('Semua');

  // App Settings
  const [appSettings, setAppSettings] = useState<{releaseDate: string, message: string, failMessage: string, admins: any[], activeYear: string}>({ releaseDate: '', message: '', failMessage: '', admins: [], activeYear: '' });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [newYearModalOpen, setNewYearModalOpen] = useState(false);
  const [newYearValue, setNewYearValue] = useState('');
  const [newAdminModalOpen, setNewAdminModalOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ username: '', password: '' });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Form state
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({
    nama: '', nisn: '', noPeserta: '', kelas: '', sekolah: 'SDN CIRACAS 01', status: 'Lulus', tahunAjaran: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initial Fetch & Auth
  useEffect(() => {
    if (token) {
      fetchStudents();
      fetchSettings();
    }
  }, [token]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppSettings({
          releaseDate: data.releaseDate || '',
          message: data.message || '',
          failMessage: data.failMessage || '',
          admins: data.admins || [],
          activeYear: data.activeYear || ''
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(appSettings)
      });
      if (res.ok) {
        showToast('Pengaturan berhasil disimpan!');
      } else {
        alert('Gagal menyimpan pengaturan');
      }
    } catch (e) {
      alert('Koneksi error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
      } else {
        setLoginError(data.error);
      }
    } catch (e) {
      setLoginError('Koneksi ke server gagal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      } else if (res.status === 401 || res.status === 403) {
        handleLogout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [customYears, setCustomYears] = useState<string[]>([]);

  // Derive unique years
  const availableYears = useMemo(() => {
    const years = new Set(students.map(s => s.tahunAjaran).filter(Boolean));
    customYears.forEach(y => years.add(y));
    if (years.size === 0) years.add('2023/2024');
    return Array.from(years).sort().reverse();
  }, [students, customYears]);

  // Initialize active year if empty
  useEffect(() => {
    if (!tahunAjaranAktif && availableYears.length > 0) {
      setTahunAjaranAktif(availableYears[0]);
    }
  }, [availableYears, tahunAjaranAktif]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, kelasFilter, tahunAjaranAktif, activeTab]);

  const handleSave = async (continueAdding: boolean = false) => {
    if (!formData.nama || !formData.nisn || !formData.noPeserta) {
      alert("Nama, NISN, dan No Peserta wajib diisi.");
      return;
    }

    const payload = {
      ...formData,
      tahunAjaran: formData.tahunAjaran || tahunAjaranAktif || '2023/2024'
    };

    const url = isEditing 
      ? `/api/admin/students/${isEditing}`
      : '/api/admin/students';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        showToast('Data berhasil disimpan');
        fetchStudents();
        if (continueAdding && !isEditing) {
          setFormData({ nama: '', nisn: '', noPeserta: '', kelas: '', sekolah: 'SDN CIRACAS 01', status: 'Lulus', tahunAjaran: tahunAjaranAktif });
          // Focus input after save
          setTimeout(() => nameInputRef.current?.focus(), 100);
        } else {
          setIsEditing(null);
          setIsAdding(false);
        }
      } else {
        const data = await res.json();
        alert('Gagal menyimpan: ' + data.error);
      }
    } catch (e) {
      alert('Koneksi error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, isLastField: boolean) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave(isAdding);
    }
  };

  const handleDeleteArchive = async (year: string) => {
    if (!window.confirm(`Yakin ingin menghapus seluruh arsip angkatan ${year}? Semua data siswa di tahun ini akan terhapus dan tidak bisa dikembalikan.`)) return;
    try {
      const res = await fetch(`/api/admin/archives?year=${encodeURIComponent(year)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert(`Arsip ${year} berhasil dihapus.`);
        setCustomYears(prev => prev.filter(y => y !== year));
        fetchStudents();
      } else {
        alert('Gagal menghapus arsip.');
      }
    } catch (e) {
      alert('Koneksi error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus data ini? Data yang dihapus tidak bisa dikembalikan.')) return;
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchStudents();
    } catch (e) {
      alert('Koneksi error');
    }
  };

  const handleExportExcel = () => {
    const dataToExport = activeStudents.map(s => ({
      'Nama Siswa': s.nama,
      'NISN': s.nisn,
      'No Peserta': s.noPeserta,
      'Kelas': s.kelas,
      'Status': s.status,
      'Tahun Ajaran': s.tahunAjaran,
      'Tanggal Dibuat': s.createdAt ? format(parseISO(s.createdAt), 'dd MMM yyyy', { locale: localeID }) : '-'
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Kelulusan");
    XLSX.writeFile(wb, `Data_Kelulusan_${tahunAjaranAktif.replace('/', '-')}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Data Kelulusan SDN Ciracas 01 - Tahun Ajaran ${tahunAjaranAktif}`, 14, 15);
    
    const tableData = activeStudents.map(s => [
      s.nama, s.nisn, s.noPeserta, s.kelas, s.status, s.tahunAjaran
    ]);

    autoTable(doc, {
      head: [['Nama Siswa', 'NISN', 'No Peserta', 'Kelas', 'Status', 'Tahun Ajaran']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Data_Kelulusan_${tahunAjaranAktif.replace('/', '-')}.pdf`);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      'Nama Siswa': 'Siswa Contoh',
      'NISN': '0012345678',
      'No Peserta': '01-001-001-2',
      'Kelas': 'VI - A',
      'Sekolah': 'SDN CIRACAS 01',
      'Status': 'Lulus',
      'Tahun Ajaran': '2023/2024'
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Kelulusan");
    XLSX.writeFile(wb, "Template_Data_Kelulusan.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (data.length === 0) return alert('File Excel kosong');

        const formattedData = data.map(row => ({
          nama: row['Nama Siswa'] || row['nama'] || '',
          nisn: String(row['NISN'] || row['nisn'] || ''),
          noPeserta: String(row['No Peserta'] || row['noPeserta'] || row['no_peserta'] || ''),
          kelas: row['Kelas'] || row['kelas'] || '',
          status: row['Status'] || row['status'] || 'Lulus',
          tahunAjaran: row['Tahun Ajaran'] || row['tahunAjaran'] || tahunAjaranAktif
        }));

        const res = await fetch('/api/admin/students/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ students: formattedData })
        });

        const result = await res.json();
        if (res.ok) {
          alert(`Import Selesai: ${result.added} data ditambahkan, ${result.skipped} data dilewati (duplikat/tidak lengkap)`);
          fetchStudents();
        } else {
          alert('Gagal import: ' + result.error);
        }
      } catch (err) {
        console.error(err);
        alert('Format Excel tidak sesuai atau terjadi kesalahan');
      }
    };
    reader.readAsBinaryString(file);
    // reset input
    if (e.target) e.target.value = '';
  };

  const startAdding = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({ nama: '', nisn: '', noPeserta: '', kelas: '', sekolah: 'SDN CIRACAS 01', status: 'Lulus', tahunAjaran: tahunAjaranAktif });
  };

  // ----- Filter & Pagination Logic -----
  const activeStudents = useMemo(() => {
    return students.filter(s => {
      const matchYear = s.tahunAjaran === tahunAjaranAktif;
      const matchClass = kelasFilter === 'Semua' || s.kelas === kelasFilter;
      const matchSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.nisn.includes(searchQuery) ||
                          s.noPeserta.includes(searchQuery);
      return matchYear && matchClass && matchSearch;
    });
  }, [students, tahunAjaranAktif, kelasFilter, searchQuery]);

  const stats = useMemo(() => {
    const allFiltered = students.filter(s => {
      const matchYear = s.tahunAjaran === tahunAjaranAktif;
      const matchClass = kelasFilter === 'Semua' || s.kelas === kelasFilter;
      return matchYear && matchClass;
    });
    return {
      total: allFiltered.length,
      lulus: allFiltered.filter(s => s.status === 'Lulus').length,
      tidakLulus: allFiltered.filter(s => s.status !== 'Lulus').length,
      angkatanTotal: availableYears.length
    };
  }, [students, tahunAjaranAktif, availableYears, kelasFilter]);

  const arsipStats = useMemo(() => {
    return availableYears.map(year => {
      const sy = students.filter(s => s.tahunAjaran === year);
      const lulus = sy.filter(s => s.status === 'Lulus').length;
      return {
        year,
        total: sy.length,
        lulus,
        tidakLulus: sy.length - lulus,
        latestDate: sy.length > 0 && sy[0].createdAt ? sy.reduce((latest, current) => {
          if (!current.createdAt) return latest;
          return new Date(current.createdAt) > new Date(latest) ? current.createdAt : latest;
        }, sy[0].createdAt) : '-'
      };
    });
  }, [students, availableYears]);

  const uniqueClasses = useMemo(() => ['Semua', ...Array.from(new Set(students.filter(s => s.tahunAjaran === tahunAjaranAktif).map(s => s.kelas))).sort()], [students, tahunAjaranAktif]);

  const totalPages = Math.max(1, Math.ceil(activeStudents.length / itemsPerPage));
  const paginatedStudents = activeStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ----- UI Renders -----

  if (!token) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-100">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin Portal</h2>
            <p className="text-sm text-slate-500">Sistem Arsip Kelulusan Multi-Tahun</p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Masukkan username"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all mt-2"
            >
              {isLoading ? 'Memeriksa...' : 'Login Sekarang'}
            </button>
            <div className="text-center mt-6">
               <button type="button" onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                 &larr; Kembali ke Beranda
               </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans flex overflow-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[200] animation-fade-in">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg font-medium flex items-center gap-3">
            <Check className="w-5 h-5" />
            {toastMessage}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-none hidden md:flex h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-sm leading-tight">SDN Ciracas 01</h1>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold text-blue-600">Sistem Arsip</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Menu Utama</p>
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('data')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${activeTab === 'data' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Database className="w-4 h-4" /> Data Kelulusan
          </button>

          <button 
            onClick={() => setActiveTab('arsip')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${activeTab === 'arsip' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <FolderArchive className="w-4 h-4" /> Arsip Angkatan
          </button>

          <button 
            onClick={() => setActiveTab('skl')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${activeTab === 'skl' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <FileText className="w-4 h-4" /> Cetak SKL
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Settings className="w-4 h-4" /> Pengaturan
          </button>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm border border-slate-200 hover:border-red-100">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-none z-20 sticky top-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab === 'dashboard' ? 'Dashboard Kelulusan' : activeTab === 'data' ? 'Manajemen Data Siswa' : activeTab === 'arsip' ? 'Arsip Multi-Tahun' : activeTab === 'settings' ? 'Pengaturan Sistem' : 'Cetak Surat Keterangan'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500">Tahun Ajaran Aktif:</span>
              
              <div className="relative inline-block" ref={dropdownRef}>
                <button 
                  onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-2.5 py-0.5 rounded-md"
                >
                  {tahunAjaranAktif || 'Pilih Tahun'} <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isYearDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                    {availableYears.map(year => (
                      <button
                        key={year}
                        onClick={() => {
                          setTahunAjaranAktif(year);
                          setIsYearDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors ${tahunAjaranAktif === year ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {(activeTab === 'data' || activeTab === 'dashboard') && (
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari siswa..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder:font-normal"
                />
              </div>
            )}
            
            {(activeTab === 'data' || activeTab === 'dashboard') && (
              <button 
                onClick={startAdding}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-[0_2px_10px_0_rgb(37,99,235,0.2)] shrink-0"
              >
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Tambah Siswa</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Content scrollable area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 relative">
          <div className="max-w-7xl mx-auto w-full space-y-8 pb-10">

            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="animation-fade-in space-y-8">
                {/* Dashboard Filter */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">Ringkasan Data</h3>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span>Kelas:</span>
                    <select 
                      value={kelasFilter} 
                      onChange={(e) => setKelasFilter(e.target.value)}
                      className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      {uniqueClasses.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-white rounded-[20px] p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col relative overflow-hidden group">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Siswa</p>
                    <h3 className="text-3xl font-bold text-slate-800">{stats.total}</h3>
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-blue-500/5 completely-transparent rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                  </div>

                  <div className="bg-white rounded-[20px] p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col relative overflow-hidden group">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Lulus</p>
                    <h3 className="text-3xl font-bold text-slate-800">{stats.lulus}</h3>
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/5 completely-transparent rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                  </div>

                  <div className="bg-white rounded-[20px] p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col relative overflow-hidden group">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4 text-red-600">
                      <UserX className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Tidak Lulus</p>
                    <h3 className="text-3xl font-bold text-slate-800">{stats.tidakLulus}</h3>
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-red-500/5 completely-transparent rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                  </div>

                  <div className="bg-white rounded-[20px] p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col relative overflow-hidden group cursor-pointer" onClick={() => setActiveTab('arsip')}>
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-purple-600">
                      <FolderArchive className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Angkatan Tersimpan</p>
                    <h3 className="text-3xl font-bold text-slate-800">{stats.angkatanTotal}</h3>
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-purple-500/5 completely-transparent rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                  </div>
                </div>

                {/* Quick actions & mini table */}
                <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                     <h3 className="font-bold text-slate-800 text-lg">Ditambahkan Terbaru</h3>
                     <button onClick={() => setActiveTab('data')} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">Lihat Semua Data &rarr;</button>
                   </div>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                       <thead>
                         <tr className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                           <th className="p-4 py-3 pl-6">Nama Siswa</th>
                           <th className="p-4 py-3">NISN</th>
                           <th className="p-4 py-3">Kelas</th>
                           <th className="p-4 py-3">Status</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {students.filter(s => s.tahunAjaran === tahunAjaranAktif).slice(0, 5).map(s => (
                           <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="p-4 pl-6 font-medium text-slate-800 text-sm">{s.nama}</td>
                             <td className="p-4 text-sm font-mono text-slate-500">{s.nisn}</td>
                             <td className="p-4 text-sm text-slate-600">{s.kelas}</td>
                             <td className="p-4">
                               <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${s.status === 'Lulus' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                 {s.status}
                               </span>
                             </td>
                           </tr>
                         ))}
                         {stats.total === 0 && (
                           <tr>
                             <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">Belum ada data untuk tahun ajaran ini.</td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                </div>
              </div>
            )}

            {/* DATA MANAGEMENT TAB */}
            {activeTab === 'data' && (
              <div className="animation-fade-in flex flex-col min-h-0 bg-white rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
                
                {/* Tools Bar */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                   <div className="flex items-center gap-3 w-full sm:w-auto">
                     <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span>Kelas:</span>
                        <select 
                          value={kelasFilter} 
                          onChange={(e) => setKelasFilter(e.target.value)}
                          className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                        >
                          {uniqueClasses.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                     </div>
                   </div>

                   <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                     <button onClick={handleDownloadTemplate} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-medium text-sm transition-colors cursor-pointer">
                       <FileSpreadsheet className="w-4 h-4" /> Download Template
                     </button>
                     <label className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-medium text-sm transition-colors cursor-pointer">
                       <Upload className="w-4 h-4" /> Import Excel
                       <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
                     </label>
                     <button onClick={handleExportExcel} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-medium text-sm transition-colors">
                       <FileSpreadsheet className="w-4 h-4" /> Export Excel
                     </button>
                     <button onClick={handleExportPDF} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-medium text-sm transition-colors">
                       <FileText className="w-4 h-4" /> Export PDF
                     </button>
                   </div>
                </div>

                {/* Adding Row Banner */}
                {isAdding && (
                  <div className="p-4 bg-blue-50/50 border-b border-blue-100">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 w-full overflow-x-auto min-w-[800px]">
                      <div className="flex gap-4 items-center">
                        <input type="text" ref={nameInputRef} autoFocus placeholder="Nama Lengkap" value={formData.nama} onChange={e=>setFormData({...formData, nama: e.target.value})} onKeyDown={(e)=>e.key==='Enter' && handleSave(true)} className="flex-2 min-w-[200px] bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-3 py-2 text-sm outline-none transition-all" />
                        <input type="text" placeholder="NISN" value={formData.nisn} onChange={e=>setFormData({...formData, nisn: e.target.value})} onKeyDown={(e)=>e.key==='Enter' && handleSave(true)} className="flex-1 min-w-[120px] bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-3 py-2 text-sm outline-none transition-all font-mono" />
                        <input type="text" placeholder="No. Peserta" value={formData.noPeserta} onChange={e=>setFormData({...formData, noPeserta: e.target.value})} onKeyDown={(e)=>e.key==='Enter' && handleSave(true)} className="flex-1 min-w-[150px] bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-3 py-2 text-sm outline-none transition-all font-mono" />
                        <input type="text" placeholder="Kelas" value={formData.kelas} onChange={e=>setFormData({...formData, kelas: e.target.value})} onKeyDown={(e)=>e.key==='Enter' && handleSave(true)} className="w-24 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-3 py-2 text-sm outline-none transition-all" />
                        <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} onKeyUp={(e)=>e.key==='Enter' && handleSave(true)} onKeyDown={(e) => {if(e.key==='Enter') e.preventDefault();}} className="w-32 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-3 py-2 text-sm outline-none transition-all font-medium text-slate-700 cursor-pointer">
                          <option value="Lulus">Lulus</option>
                          <option value="Tidak Lulus">Tidak Lulus</option>
                        </select>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleSave(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium text-sm transition-all flex items-center gap-1">Simpan</button>
                          <button onClick={() => setIsAdding(false)} className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-[10px] text-blue-600 mt-3 font-medium tracking-wide">💡 Tekan ENTER pada kolom status untuk otomatis simpan dan tambah baru.</p>
                    </div>
                  </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[900px] border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <th className="p-4 pl-6 w-1/4">Nama Siswa</th>
                        <th className="p-4">NISN</th>
                        <th className="p-4">No. Peserta</th>
                        <th className="p-4">Kelas</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right pr-6">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {activeStudents.length === 0 && !isAdding && (
                        <tr>
                          <td colSpan={6} className="p-16 text-center">
                            <div className="flex flex-col items-center justify-center text-slate-400">
                              <Users className="w-12 h-12 opacity-20 mb-4" />
                              <p className="text-base font-medium text-slate-600">Siswa tidak ditemukan.</p>
                              <p className="text-sm mt-1">Coba sesuaikan pencarian atau filter kelas.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                      {paginatedStudents.map(student => {
                        const editingThis = isEditing === student.id;
                        return (
                          <tr key={student.id} className="hover:bg-slate-50/70 transition-colors group">
                            {editingThis ? (
                              <td colSpan={6} className="p-3 bg-blue-50/30">
                                <div className="flex gap-4 items-center pl-3 pr-3">
                                  <input type="text" value={formData.nama} onChange={e=>setFormData({...formData, nama: e.target.value})} onKeyDown={(e)=>e.key==='Enter' && handleSave(false)} className="flex-2 min-w-[200px] bg-white border border-blue-300 focus:border-blue-500 focus:ring-1 rounded-md px-3 py-1.5 text-sm outline-none font-medium" autoFocus/>
                                  <input type="text" value={formData.nisn} onChange={e=>setFormData({...formData, nisn: e.target.value})} onKeyDown={(e)=>e.key==='Enter' && handleSave(false)} className="flex-1 min-w-[120px] bg-white border border-blue-300 focus:border-blue-500 focus:ring-1 rounded-md px-3 py-1.5 text-sm outline-none font-mono" />
                                  <input type="text" value={formData.noPeserta} onChange={e=>setFormData({...formData, noPeserta: e.target.value})} onKeyDown={(e)=>e.key==='Enter' && handleSave(false)} className="flex-1 min-w-[150px] bg-white border border-blue-300 focus:border-blue-500 focus:ring-1 rounded-md px-3 py-1.5 text-sm outline-none font-mono" />
                                  <input type="text" value={formData.kelas} onChange={e=>setFormData({...formData, kelas: e.target.value})} onKeyDown={(e)=>e.key==='Enter' && handleSave(false)} className="w-24 bg-white border border-blue-300 focus:border-blue-500 focus:ring-1 rounded-md px-3 py-1.5 text-sm outline-none" />
                                  <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} onKeyUp={(e)=>e.key==='Enter' && handleSave(false)} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault()}} className="w-32 bg-white border border-blue-300 focus:border-blue-500 focus:ring-1 rounded-md px-3 py-1.5 text-sm outline-none font-semibold text-slate-800">
                                    <option value="Lulus">Lulus</option>
                                    <option value="Tidak Lulus">Tidak Lulus</option>
                                  </select>
                                  <div className="flex justify-end gap-2 ml-auto w-[100px] shrink-0">
                                    <button onClick={() => handleSave(false)} className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md shadow-sm transition-colors"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => setIsEditing(null)} className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-md shadow-sm transition-colors"><X className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              </td>
                            ) : (
                              <>
                                <td className="p-4 pl-6 font-semibold text-slate-800">{student.nama}</td>
                                <td className="p-4 font-mono text-slate-500 text-sm tracking-tight">{student.nisn}</td>
                                <td className="p-4 font-mono text-slate-500 text-sm tracking-tight">{student.noPeserta}</td>
                                <td className="p-4 font-medium text-slate-600">{student.kelas}</td>
                                <td className="p-4">
                                  <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${student.status === 'Lulus' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                    {student.status || 'Lulus'}
                                  </span>
                                </td>
                                <td className="p-4 pr-6">
                                  <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => { setIsEditing(student.id); setIsAdding(false); setFormData(student); }}
                                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                      title="Edit Data"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(student.id)}
                                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                      title="Hapus Data"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <span className="text-sm text-slate-500 font-medium ml-2">
                       Menampilkan <span className="text-slate-800 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-800 font-bold">{Math.min(currentPage * itemsPerPage, activeStudents.length)}</span> dari <span className="text-slate-800 font-bold">{activeStudents.length}</span> data
                    </span>
                    <div className="flex gap-2">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(c => c - 1)}
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 font-medium text-sm transition-colors"
                      >
                         <ChevronLeft className="w-4 h-4" /> Prev
                      </button>
                      <div className="px-4 py-2 font-bold text-sm text-slate-800 bg-slate-100 rounded-lg">
                        {currentPage} / {totalPages}
                      </div>
                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(c => c + 1)}
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 font-medium text-sm transition-colors"
                      >
                         Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ARSIP TAB */}
            {activeTab === 'arsip' && (
               <div className="animation-fade-in">
                 <div className="mb-6">
                    <p className="text-slate-600 leading-relaxed font-medium">Data arsip yang tersimpan dari tahun ke tahun. Memilih tahun ajaran akan otomatis mengubah fokus filter Anda ke tahun tersebut untuk mengelola atau melihat data lebih spesifik.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {arsipStats.map((stat, idx) => (
                      <div 
                        key={stat.year} 
                        onClick={() => {
                          setTahunAjaranAktif(stat.year);
                          setActiveTab('data');
                        }}
                        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col"
                      >
                         <div className="flex justify-between items-center mb-6">
                           <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
                              <Database className="w-7 h-7 text-indigo-600" />
                           </div>
                           <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                              TA {stat.year}
                           </span>
                         </div>
                         
                         <h3 className="text-2xl font-black text-slate-800 mb-1">{stat.total} <span className="text-base font-semibold text-slate-400">Siswa Tercatat</span></h3>
                         
                         <div className="flex gap-4 mt-4 mb-6">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lulus</span>
                              <span className="text-emerald-600 font-bold text-lg">{stat.lulus}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gagal</span>
                              <span className="text-red-500 font-bold text-lg">{stat.tidakLulus}</span>
                            </div>
                         </div>
                         
                         <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                               Terakhir diupdate: <span className="text-slate-800">{stat.latestDate !== '-' ? format(new Date(stat.latestDate), 'dd MMM yyyy', {locale: localeID}) : '-'}</span>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteArchive(stat.year);
                              }}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
                              title="Hapus Arsip"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                    ))}
                    
                    {/* Add New Year placeholder */}
                    <div 
                      onClick={() => setNewYearModalOpen(true)}
                      className="bg-transparent rounded-3xl p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[260px] text-slate-500 hover:text-blue-600"
                    >
                       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-200">
                         <Plus className="w-8 h-8" />
                       </div>
                       <h3 className="font-bold text-lg">Buat Arsip Baru</h3>
                       <p className="text-sm mt-1 font-medium text-center max-w-[200px]">Mulai pendataan kelulusan untuk tahun ajaran baru.</p>
                    </div>
                 </div>
               </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="animation-fade-in bg-white rounded-[20px] p-6 md:p-8 border border-slate-100 shadow-sm max-w-3xl">
                 <div className="mb-6 flex space-x-4 items-center">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200">
                      <Settings className="w-7 h-7 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Pengaturan Tampilan Siswa</h3>
                      <p className="text-slate-500 text-sm">Sesuaikan waktu rilis pengumuman dan pesan informasi untuk halaman publik.</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Tahun Ajaran Aktif untuk Pencarian</label>
                      <select 
                        value={appSettings.activeYear || ''}
                        onChange={e => setAppSettings({...appSettings, activeYear: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer"
                      >
                        <option value="">Semua Tahun (Tampilkan Data Terbaru)</option>
                        {customYears.length === 0 && ['2023/2024'].map(y => <option key={y} value={y}>{y}</option>)}
                        {availableYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-2">Hanya siswa dari tahun ajaran ini yang dapat mengecek kelulusan. Siswa angkatan lama tidak perlu ditampilkan status lulus/tidak lulus-nya. Pilih "Semua Tahun" untuk membolehkan pencarian untuk semua angkatan.</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Tanggal & Waktu Pengumuman Rilis</label>
                      <input 
                        type="datetime-local" 
                        value={appSettings.releaseDate}
                        onChange={e => setAppSettings({...appSettings, releaseDate: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" 
                      />
                      <p className="text-xs text-slate-500 mt-2">Biarkan kosong jika hasil pengumuman dapat diakses kapan saja. Jika diset, halaman pencarian di homepage hanya bisa digunakan setelah waktu ini melalui proses hitung mundur.</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Pesan Tambahan (Opsional)</label>
                      <textarea 
                        value={appSettings.message}
                        onChange={e => setAppSettings({...appSettings, message: e.target.value})}
                        placeholder="Contoh: Harap membawa pas foto 3x4 ke tata usaha jika dinyatakan lulus."
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none mb-4" 
                      />
                      <p className="text-xs text-slate-500 mt-2">Pesan ini akan ditampilkan secara umum di halaman pengumuman siswa.</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Pesan untuk status TIDAK LULUS (Opsional)</label>
                      <textarea 
                        value={appSettings.failMessage}
                        onChange={e => setAppSettings({...appSettings, failMessage: e.target.value})}
                        placeholder="Contoh: Tetap semangat dan jangan menyerah."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium resize-none" 
                      />
                      <p className="text-xs text-slate-500 mt-2">Pesan ini khusus ditampilkan kepada siswa yang dinyatakan tidak lulus.</p>
                    </div>

                    <div className="pt-4 mt-6 border-t border-slate-100">
                      <label className="text-sm font-semibold text-slate-700 block mb-3">Daftar Admin</label>
                      <div className="space-y-3 mb-4">
                        {appSettings.admins?.map((admin, idx) => (
                          <div key={idx} className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-white">
                            <span className="font-medium text-slate-700 font-mono text-sm">{admin.username}</span>
                            <button 
                              onClick={() => setAppSettings({...appSettings, admins: appSettings.admins?.filter((_, i) => i !== idx)})} 
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={appSettings.admins?.length === 1}
                              title={appSettings.admins?.length === 1 ? "Minimal 1 admin" : "Hapus Admin"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 isolate">
                         <button 
                           onClick={() => setNewAdminModalOpen(true)}
                           className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-700 transition"
                         >
                           <UserPlus className="w-4 h-4" /> Tambah Admin Baru
                         </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex gap-4">
                      <button 
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgb(37,99,235,0.39)]"
                      >
                        <Save className="w-5 h-5" />
                        {isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
                      </button>
                    </div>
                 </div>
              </div>
            )}

            {/* SKL TAB - PLACEHOLDER */}
            {activeTab === 'skl' && (
              <div className="animation-fade-in bg-white rounded-[20px] p-8 border border-slate-100 shadow-sm text-center">
                 <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Printer className="w-10 h-10 text-blue-600" />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-800 mb-2">Cetak Surat Keterangan Lulus</h3>
                 <p className="text-slate-500 max-w-lg mx-auto mb-8 font-medium leading-relaxed">
                   Fitur cetak individu dengan format resmi masih dalam pengembangan (coming soon). Untuk saat ini Anda dapat menggunakan export PDF di menu Data Kelulusan sebagai lampiran rekap.
                 </p>
                 <button onClick={() => setActiveTab('data')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgb(37,99,235,0.39)]">
                   Kembali ke Data
                 </button>
              </div>
            )}

          </div>
        </main>
      </div>

      {newYearModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={(e) => {if(e.target===e.currentTarget) setNewYearModalOpen(false)}}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Buat Arsip Angkatan</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Contoh format: 2024/2025</p>
            <div className="space-y-4">
              <div>
                <input type="text" autoFocus placeholder="2024/2025" value={newYearValue} onChange={e=>setNewYearValue(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-lg font-bold rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all text-center" />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={()=>setNewYearModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
              <button onClick={()=>{
                if(!newYearValue.trim()) return alert('Masukkan tahun ajaran');
                const y = newYearValue.trim();
                if (!availableYears.includes(y)) {
                   setCustomYears(prev => [...prev, y]);
                }
                setTahunAjaranAktif(y);
                setActiveTab('data');
                setNewYearModalOpen(false);
                setNewYearValue('');
              }} className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-600/30">Mulai</button>
            </div>
          </div>
        </div>
      )}

      {newAdminModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={(e) => {if(e.target===e.currentTarget) setNewAdminModalOpen(false)}}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Tambah Admin Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Username</label>
                <input type="text" value={newAdminData.username} onChange={e=>setNewAdminData({...newAdminData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-medium" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Password</label>
                <input type="password" value={newAdminData.password} onChange={e=>setNewAdminData({...newAdminData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-medium" />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={()=>setNewAdminModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
              <button onClick={()=>{
                if(!newAdminData.username || !newAdminData.password) return alert('Lengkapi data');
                if(appSettings.admins?.find(a=>a.username === newAdminData.username)) return alert('Username sudah ada');
                setAppSettings({...appSettings, admins: [...(appSettings.admins||[]), newAdminData]});
                setNewAdminModalOpen(false);
                setNewAdminData({username:'', password:''});
              }} className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-600/30">Tambahkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
