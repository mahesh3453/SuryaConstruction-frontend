import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LogOut, 
  Calendar, 
  Download, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Key, 
  Search, 
  Users, 
  FileText, 
  Clock, 
  ArrowUpDown, 
  Check, 
  HardHat, 
  X,
  Plus
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getTodayString = () => new Date().toLocaleDateString('sv');

  // Page level states
  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'employees', 'history'
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ------------------------------------------------------------
  // TAB 1: DAILY VIEW STATES & ACTIONS
  // ------------------------------------------------------------
  const [dailyDate, setDailyDate] = useState(getTodayString());
  const [dailyEntries, setDailyEntries] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  // Edit permit entry modal states
  const [editPermitModalOpen, setEditPermitModalOpen] = useState(false);
  const [editingPermit, setEditingPermit] = useState(null);
  const [editHotWork, setEditHotWork] = useState('');
  const [editHeightWork, setEditHeightWork] = useState('');
  const [editGeneralWork, setEditGeneralWork] = useState('');
  const [editManpower, setEditManpower] = useState('');
  
  // Confirmations
  const [confirmExportOpen, setConfirmExportOpen] = useState(false);
  const [confirmSavePermitOpen, setConfirmSavePermitOpen] = useState(false);
  const [confirmDeletePermitOpen, setConfirmDeletePermitOpen] = useState(false);
  const [permitToDelete, setPermitToDelete] = useState(null);
  
  // Excel Success popup modal
  const [showExcelSuccessModal, setShowExcelSuccessModal] = useState(false);

  const fetchDailyEntries = async (targetDate) => {
    setDailyLoading(true);
    try {
      const res = await axios.get(`/api/admin/permits?date=${targetDate}`);
      setDailyEntries(res.data);
    } catch (err) {
      showToast('Error loading daily tracking sheet.', 'error');
    } finally {
      setDailyLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyEntries(dailyDate);
    }
  }, [dailyDate, activeTab]);

  const handleSort = () => {
    const sorted = [...dailyEntries].sort((a, b) => {
      const nameA = a.employeeName.toLowerCase();
      const nameB = b.employeeName.toLowerCase();
      return sortAsc ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
    });
    setDailyEntries(sorted);
    setSortAsc(!sortAsc);
  };

  const downloadExcel = async () => {
    setConfirmExportOpen(false);
    try {
      const response = await axios.get(`/api/admin/permits/export?date=${dailyDate}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `permit_details_${dailyDate}.xlsx`;
      link.click();
      
      // Show WhatsApp share message popup
      setShowExcelSuccessModal(true);
    } catch (err) {
      showToast('Error generating Excel file.', 'error');
    }
  };

  const openEditPermitModal = (entry) => {
    setEditingPermit(entry);
    setEditHotWork(entry.hotWorkActivity || '');
    setEditHeightWork(entry.heightWorkActivity || '');
    setEditGeneralWork(entry.generalWorkActivity || '');
    setEditManpower(entry.manpowerNames || '');
    setEditPermitModalOpen(true);
  };

  const triggerSavePermit = (e) => {
    e.preventDefault();
    setConfirmSavePermitOpen(true);
  };

  const savePermit = async () => {
    setConfirmSavePermitOpen(false);
    try {
      const payload = {
        hotWorkActivity: editHotWork,
        heightWorkActivity: editHeightWork,
        generalWorkActivity: editGeneralWork,
        manpowerNames: editManpower,
        entryDate: editingPermit.entryDate
      };
      await axios.put(`/api/admin/permits/${editingPermit.id}`, payload);
      showToast('Permit entry updated successfully!');
      setEditPermitModalOpen(false);
      fetchDailyEntries(dailyDate);
    } catch (err) {
      showToast('Failed to update entry.', 'error');
    }
  };

  const triggerDeletePermit = (id) => {
    setPermitToDelete(id);
    setConfirmDeletePermitOpen(true);
  };

  const deletePermit = async () => {
    setConfirmDeletePermitOpen(false);
    try {
      await axios.delete(`/api/admin/permits/${permitToDelete}`);
      showToast('Permit entry deleted.');
      fetchDailyEntries(dailyDate);
    } catch (err) {
      showToast('Failed to delete permit entry.', 'error');
    }
  };

  // ------------------------------------------------------------
  // TAB 2: EMPLOYEE MANAGEMENT STATES & ACTIONS
  // ------------------------------------------------------------
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  
  // Modals for CRUD
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null); // Null means Add, otherwise Edit
  const [empName, setEmpName] = useState('');
  const [empUsername, setEmpUsername] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empRole, setEmpRole] = useState('EMPLOYEE');

  // Reset password modal
  const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
  const [resetPassEmp, setResetPassEmp] = useState(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');

  // Confirmations
  const [confirmSaveEmpOpen, setConfirmSaveEmpOpen] = useState(false);
  const [confirmDeleteEmpOpen, setConfirmDeleteEmpOpen] = useState(false);
  const [confirmResetPassOpen, setConfirmResetPassOpen] = useState(false);
  const [empToDelete, setEmpToDelete] = useState(null);

  const fetchEmployees = async () => {
    setEmpLoading(true);
    try {
      const res = await axios.get('/api/admin/employees');
      setEmployees(res.data);
    } catch (err) {
      showToast('Error loading employees.', 'error');
    } finally {
      setEmpLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees();
    }
  }, [activeTab]);

  const openAddEmpModal = () => {
    setEditingEmp(null);
    setEmpName('');
    setEmpUsername('');
    setEmpPassword('');
    setEmpRole('EMPLOYEE');
    setEmpModalOpen(true);
  };

  const openEditEmpModal = (emp) => {
    setEditingEmp(emp);
    setEmpName(emp.name);
    setEmpUsername(emp.username);
    setEmpPassword(''); // Clear for edit
    setEmpRole(emp.role);
    setEmpModalOpen(true);
  };

  const triggerSaveEmployee = (e) => {
    e.preventDefault();
    if (!empName || !empUsername || (!editingEmp && !empPassword)) {
      showToast('Please fill all required employee details.', 'error');
      return;
    }
    setConfirmSaveEmpOpen(true);
  };

  const saveEmployee = async () => {
    setConfirmSaveEmpOpen(false);
    try {
      const payload = {
        name: empName,
        username: empUsername,
        role: empRole,
        password: empPassword
      };

      if (editingEmp) {
        await axios.put(`/api/admin/employees/${editingEmp.id}`, payload);
        showToast('Employee updated successfully!');
      } else {
        await axios.post('/api/admin/employees', payload);
        showToast('Employee added successfully!');
      }
      setEmpModalOpen(false);
      fetchEmployees();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving employee details.', 'error');
    }
  };

  const triggerDeleteEmployee = (id) => {
    setEmpToDelete(id);
    setConfirmDeleteEmpOpen(true);
  };

  const deleteEmployee = async () => {
    setConfirmDeleteEmpOpen(false);
    try {
      await axios.delete(`/api/admin/employees/${empToDelete}`);
      showToast('Employee deleted successfully.');
      fetchEmployees();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete employee.', 'error');
    }
  };

  const openResetPassModal = (emp) => {
    setResetPassEmp(emp);
    setResetPasswordVal('');
    setResetPassModalOpen(true);
  };

  const triggerResetPassword = (e) => {
    e.preventDefault();
    if (!resetPasswordVal) {
      showToast('Please input a new password.', 'error');
      return;
    }
    setConfirmResetPassOpen(true);
  };

  const resetPassword = async () => {
    setConfirmResetPassOpen(false);
    try {
      await axios.put(`/api/admin/employees/${resetPassEmp.id}/reset-password`, {
        password: resetPasswordVal
      });
      showToast(`Password reset successfully for ${resetPassEmp.name}!`);
      setResetPassModalOpen(false);
    } catch (err) {
      showToast('Failed to reset password.', 'error');
    }
  };

  // ------------------------------------------------------------
  // TAB 3: EMPLOYEE HISTORY VIEWER STATES & ACTIONS
  // ------------------------------------------------------------
  const [historyEmpId, setHistoryEmpId] = useState('');
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const [historyEntries, setHistoryEntries] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Auto load employees list for dropdown in history tab
  useEffect(() => {
    if (activeTab === 'history') {
      fetchEmployees();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    if (!historyEmpId) {
      showToast('Please select a supervisor.', 'error');
      return;
    }
    setHistoryLoading(true);
    try {
      let url = `/api/admin/permits/history?employeeId=${historyEmpId}`;
      if (historyStartDate) url += `&startDate=${historyStartDate}`;
      if (historyEndDate) url += `&endDate=${historyEndDate}`;

      const res = await axios.get(url);
      setHistoryEntries(res.data);
      if (res.data.length === 0) {
        showToast('No tracking entries found for selected filters.', 'info');
      }
    } catch (err) {
      showToast('Error loading history.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-100 uppercase">SURYA CONSTRUCTION</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Admin Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-xs font-semibold text-slate-400 bg-slate-850 px-3 py-1.5 rounded-full border border-slate-800">
              Welcome, {user?.name}
            </span>
            <button 
              onClick={handleLogout}
              className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl transition"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="max-w-7xl w-full mx-auto px-4 mt-6">
        <div className="flex border-b border-slate-800 bg-slate-900/40 p-1 rounded-2xl border">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition duration-150 flex items-center justify-center gap-2 ${
              activeTab === 'daily' 
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Daily Tracking Sheet
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition duration-150 flex items-center justify-center gap-2 ${
              activeTab === 'employees' 
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Manage Employees
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition duration-150 flex items-center justify-center gap-2 ${
              activeTab === 'history' 
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Employee History
          </button>
        </div>
      </nav>

      {/* Main Body */}
      <main className="max-w-7xl w-full mx-auto px-4 mt-6 flex-1">
        
        {/* ------------------------------------------------------------ */}
        {/* TAB 1: DAILY VIEW */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'daily' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Select Log Date</span>
                <input 
                  type="date"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3 py-2 outline-none transition cursor-pointer text-sm font-medium"
                />
              </div>

              <button
                onClick={() => setConfirmExportOpen(true)}
                className="w-full md:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download as Excel
              </button>
            </div>

            {/* Tracking Table Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-850">
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[200px]">
                        <button onClick={handleSort} className="flex items-center gap-1.5 hover:text-slate-200 transition">
                          Supervisor / Engineer
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                      </th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[220px]">Hot Work permit activity</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[220px]">Height Work permit activity</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[220px]">General Work permit activity</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[220px]">Man Power / Workers Name</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {dailyLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">Fetching logs...</span>
                          </div>
                        </td>
                      </tr>
                    ) : dailyEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">📭</span>
                            <span className="text-sm font-semibold text-slate-400">No permit activities filed for this date yet.</span>
                            <span className="text-xs text-slate-600">Supervisors will fill logs via their portals.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      dailyEntries.map((entry) => (
                        <tr 
                          key={entry.id} 
                          className="hover:bg-slate-850/30 group transition duration-100 cursor-pointer"
                          onClick={() => openEditPermitModal(entry)}
                        >
                          <td className="p-4 font-bold text-slate-200">{entry.employeeName}</td>
                          <td className="p-4 text-sm text-slate-400 whitespace-pre-wrap">{entry.hotWorkActivity || '-'}</td>
                          <td className="p-4 text-sm text-slate-400 whitespace-pre-wrap">{entry.heightWorkActivity || '-'}</td>
                          <td className="p-4 text-sm text-slate-400 whitespace-pre-wrap">{entry.generalWorkActivity || '-'}</td>
                          <td className="p-4 text-sm text-slate-400 whitespace-pre-wrap">{entry.manpowerNames || '-'}</td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditPermitModal(entry)}
                                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/50 rounded-lg transition"
                                title="Edit Entry"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => triggerDeletePermit(entry.id)}
                                className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition"
                                title="Delete Entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* TAB 2: MANAGE EMPLOYEES */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Employee Database</span>
              </div>
              <button
                onClick={openAddEmpModal}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Employee
              </button>
            </div>

            {/* Employees Grid list */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-850">
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Username</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {empLoading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">Fetching profiles...</span>
                          </div>
                        </td>
                      </tr>
                    ) : employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-850/30 transition">
                        <td className="p-4 font-bold text-slate-200">{emp.name}</td>
                        <td className="p-4 text-slate-400">{emp.username}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider uppercase ${
                            emp.role === 'ADMIN' 
                              ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' 
                              : 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20'
                          }`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openResetPassModal(emp)}
                              className="p-2 text-slate-400 hover:text-white bg-slate-800 border border-slate-700/50 rounded-lg transition"
                              title="Reset Password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditEmpModal(emp)}
                              className="p-2 text-slate-400 hover:text-white bg-slate-800 border border-slate-700/50 rounded-lg transition"
                              title="Edit Employee"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {emp.username !== 'admin' && (
                              <button
                                onClick={() => triggerDeleteEmployee(emp.id)}
                                className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition"
                                title="Delete Employee"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* TAB 3: EMPLOYEE HISTORY */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Filter controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-md font-bold uppercase tracking-wider text-slate-300 mb-4">Historical Query Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Supervisor Name</label>
                  <select
                    value={historyEmpId}
                    onChange={(e) => setHistoryEmpId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer focus:border-amber-500 transition"
                  >
                    <option value="">-- Choose Supervisor --</option>
                    {employees.filter(e => e.role === 'EMPLOYEE').map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">From Date (Optional)</label>
                  <input
                    type="date"
                    value={historyStartDate}
                    onChange={(e) => setHistoryStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">To Date (Optional)</label>
                  <input
                    type="date"
                    value={historyEndDate}
                    onChange={(e) => setHistoryEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer focus:border-amber-500 transition"
                  />
                </div>
                <button
                  onClick={fetchHistory}
                  className="w-full px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Fetch History Logs
                </button>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-850">
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[220px]">Hot Work permit activity</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[220px]">Height Work permit activity</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[220px]">General Work permit activity</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[220px]">Man Power / Workers Name</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {historyLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">Fetching history sheets...</span>
                          </div>
                        </td>
                      </tr>
                    ) : historyEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500">
                          Search for a supervisor above to display history sheets.
                        </td>
                      </tr>
                    ) : (
                      historyEntries.map((entry) => (
                        <tr 
                          key={entry.id} 
                          className="hover:bg-slate-850/30 group transition cursor-pointer"
                          onClick={() => openEditPermitModal(entry)}
                        >
                          <td className="p-4 font-bold text-slate-200">{entry.entryDate}</td>
                          <td className="p-4 text-sm text-slate-400 whitespace-pre-wrap">{entry.hotWorkActivity || '-'}</td>
                          <td className="p-4 text-sm text-slate-400 whitespace-pre-wrap">{entry.heightWorkActivity || '-'}</td>
                          <td className="p-4 text-sm text-slate-400 whitespace-pre-wrap">{entry.generalWorkActivity || '-'}</td>
                          <td className="p-4 text-sm text-slate-400 whitespace-pre-wrap">{entry.manpowerNames || '-'}</td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditPermitModal(entry)}
                                className="p-2 text-slate-400 hover:text-white bg-slate-800 border border-slate-700/50 rounded-lg transition"
                                title="Edit Entry"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------ */}
      {/* MODAL: EDIT PERMIT ENTRY */}
      {/* ------------------------------------------------------------ */}
      {editPermitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditPermitModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-lg font-bold text-slate-100">
                Edit Permit Record: {editingPermit?.employeeName} ({editingPermit?.entryDate})
              </h3>
              <button 
                onClick={() => setEditPermitModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={triggerSavePermit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Hot Work Activity</label>
                  <textarea
                    value={editHotWork}
                    onChange={(e) => setEditHotWork(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none text-slate-200 text-sm h-32 focus:border-amber-500 transition resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Height Work Activity</label>
                  <textarea
                    value={editHeightWork}
                    onChange={(e) => setEditHeightWork(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none text-slate-200 text-sm h-32 focus:border-amber-500 transition resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">General Work Activity</label>
                  <textarea
                    value={editGeneralWork}
                    onChange={(e) => setEditGeneralWork(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none text-slate-200 text-sm h-32 focus:border-amber-500 transition resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Man Power / Workers</label>
                  <textarea
                    value={editManpower}
                    onChange={(e) => setEditManpower(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none text-slate-200 text-sm h-32 focus:border-amber-500 transition resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setEditPermitModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold rounded-xl shadow-lg transition"
                >
                  Save Entry Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* MODAL: ADD / EDIT EMPLOYEE */}
      {/* ------------------------------------------------------------ */}
      {empModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEmpModalOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              {editingEmp ? 'Edit Employee Details' : 'Add New Employee'}
            </h3>
            <form onSubmit={triggerSaveEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-bold">Full Name</label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="Kushal Pawar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:border-amber-500 outline-none text-slate-100 text-sm transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-bold">Username</label>
                <input
                  type="text"
                  value={empUsername}
                  onChange={(e) => setEmpUsername(e.target.value)}
                  placeholder="kushal.pawar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:border-amber-500 outline-none text-slate-100 text-sm transition"
                  required
                />
              </div>

              {!editingEmp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-bold">Login Password</label>
                  <input
                    type="text"
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    placeholder="Surya@123"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:border-amber-500 outline-none text-slate-100 text-sm transition"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-bold">System Role</label>
                <select
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:border-amber-500 outline-none text-slate-100 text-sm transition cursor-pointer"
                >
                  <option value="EMPLOYEE">EMPLOYEE (Supervisor/Engineer)</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEmpModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold rounded-xl shadow-lg transition"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* MODAL: RESET PASSWORD (ADMIN ACTION) */}
      {/* ------------------------------------------------------------ */}
      {resetPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setResetPassModalOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Reset password: {resetPassEmp?.name}
            </h3>
            <form onSubmit={triggerResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password (Plain Text)</label>
                <input
                  type="text"
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  placeholder="Enter new plain text password..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:border-amber-500 outline-none text-slate-100 text-sm transition"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setResetPassModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold rounded-xl shadow-lg transition"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* WHATSAPP EXCEL SUCCESS POPUP */}
      {/* ------------------------------------------------------------ */}
      {showExcelSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowExcelSuccessModal(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">File Generated Successfully</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              File downloaded. You can now share it in the WhatsApp group.
            </p>
            <button
              onClick={() => setShowExcelSuccessModal(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition duration-150"
            >
              Okay, Understood
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmExportOpen}
        title="Download Report?"
        message={`Download report for ${dailyDate}? This will generate an Excel file matching the SURYA CONSTRUCTION spreadsheet layout.`}
        confirmText="Yes, Download"
        onConfirm={downloadExcel}
        onCancel={() => setConfirmExportOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmSavePermitOpen}
        title="Save Changes to Permit?"
        message={`Are you sure you want to save the modifications for supervisor ${editingPermit?.employeeName} on ${editingPermit?.entryDate}?`}
        confirmText="Save Permit"
        onConfirm={savePermit}
        onCancel={() => setConfirmSavePermitOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmDeletePermitOpen}
        title="Delete Permit Entry?"
        message="Are you sure you want to delete this permit entry? This action is permanent and cannot be undone."
        confirmText="Delete Permit"
        isDanger={true}
        onConfirm={deletePermit}
        onCancel={() => setConfirmDeletePermitOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmSaveEmpOpen}
        title={editingEmp ? "Save Employee Changes?" : "Confirm Add Employee?"}
        message={
          editingEmp
            ? `Are you sure you want to update the details of employee "${editingEmp.name}"?`
            : `Are you sure you want to add the employee "${empName}" to the database?`
        }
        confirmText="Save Employee"
        onConfirm={saveEmployee}
        onCancel={() => setConfirmSaveEmpOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmDeleteEmpOpen}
        title="Delete Employee Account?"
        message="Are you sure you want to delete this employee? All historical logs associated with this employee will still exist in the database, but they will no longer be able to log in."
        confirmText="Delete Account"
        isDanger={true}
        onConfirm={deleteEmployee}
        onCancel={() => setConfirmDeleteEmpOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmResetPassOpen}
        title="Reset Password?"
        message={`Are you sure you want to reset the login password for "${resetPassEmp?.name}" to the entered plain text value?`}
        confirmText="Reset Password"
        onConfirm={resetPassword}
        onCancel={() => setConfirmResetPassOpen(false)}
      />

      {/* Global Toast notifications */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage('')} 
        />
      )}
    </div>
  );
}
