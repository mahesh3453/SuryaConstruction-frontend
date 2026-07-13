import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LogOut, 
  Key, 
  Save, 
  Lock, 
  Edit3, 
  Calendar, 
  FileText, 
  Users, 
  Flame, 
  TrendingUp, 
  FileSignature,
  Settings
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getTodayString = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD in local time

  const [date, setDate] = useState(getTodayString());
  const [hotWork, setHotWork] = useState('');
  const [heightWork, setHeightWork] = useState('');
  const [generalWork, setGeneralWork] = useState('');
  const [manpower, setManpower] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPastDate, setIsPastDate] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Confirmation Modals state
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmPasswordOpen, setConfirmPasswordOpen] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Trigger toast helper
  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Fetch permit entry on date change
  useEffect(() => {
    fetchEntryForDate(date);
    // Enforce lock if date is not today
    setIsPastDate(date !== getTodayString());
  }, [date]);

  const fetchEntryForDate = async (targetDate) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/permits/by-date?date=${targetDate}`);
      if (res.data) {
        setHotWork(res.data.hotWorkActivity || '');
        setHeightWork(res.data.heightWorkActivity || '');
        setGeneralWork(res.data.generalWorkActivity || '');
        setManpower(res.data.manpowerNames || '');
      } else {
        // Clear form for new entry
        setHotWork('');
        setHeightWork('');
        setGeneralWork('');
        setManpower('');
      }
    } catch (err) {
      showToast('Error loading daily details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSubmitPre = (e) => {
    e.preventDefault();
    if (isPastDate) {
      showToast('You cannot modify entries for past dates.', 'error');
      return;
    }
    setConfirmSubmitOpen(true);
  };

  const submitEntry = async () => {
    setConfirmSubmitOpen(false);
    setLoading(true);
    try {
      const payload = {
        entryDate: date,
        hotWorkActivity: hotWork,
        heightWorkActivity: heightWork,
        generalWorkActivity: generalWork,
        manpowerNames: manpower
      };
      await axios.post('/api/permits', payload);
      showToast('Permit activity submitted successfully!');
      fetchEntryForDate(date);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting activity', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangePre = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Please fill all password fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    setConfirmPasswordOpen(true);
  };

  const submitPasswordChange = async () => {
    setConfirmPasswordOpen(false);
    setPasswordLoading(true);
    try {
      await axios.put('/api/auth/change-password', {
        oldPassword,
        newPassword
      });
      showToast('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Incorrect old password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-tight text-slate-100">SURYA CONSTRUCTION</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Permit Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition"
              title="Change Password"
            >
              <Settings className="w-5 h-5" />
            </button>
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

      {/* Main Body */}
      <main className="max-w-4xl w-full mx-auto px-4 mt-6 flex-1">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-900 border border-slate-800 rounded-3xl p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full tracking-wider uppercase">
              Supervisor Logged In
            </span>
            <h2 className="text-xl font-bold mt-2 text-slate-100">{user?.name}</h2>
            <p className="text-slate-400 text-xs mt-1">Please fill your daily activities truthfully. Once submitted, they are uploaded instantly.</p>
          </div>
          
          {/* Date Selector */}
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Tracking Date
            </label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3 py-2.5 outline-none transition text-sm cursor-pointer"
            />
          </div>
        </div>

        {/* Lock warning for past dates */}
        {isPastDate && (
          <div className="mb-6 flex items-start gap-3 bg-amber-500/10 text-amber-300 border border-amber-500/20 p-4 rounded-2xl text-xs leading-relaxed">
            <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-bold">Locked Entry View ({date})</p>
              <p className="text-amber-300/80 mt-0.5">This entry is for a past date. Supervisors are only allowed to submit or edit entries for the current date. Please contact an administrator if changes are required.</p>
            </div>
          </div>
        )}

        {/* Submit Form */}
        <form onSubmit={handleSubmitPre} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Hot Work */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700/80 transition duration-150 flex flex-col">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
                  <Flame className="w-4 h-4" />
                </div>
                Hot Work Permit Activity
              </label>
              <textarea
                value={hotWork}
                onChange={(e) => setHotWork(e.target.value)}
                placeholder={isPastDate ? 'No work logged.' : 'Detail any welding, cutting, grinding, or gas work...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:border-amber-500 focus:ring-0 text-slate-100 placeholder-slate-600 outline-none transition text-sm resize-none h-32 flex-1"
                disabled={isPastDate || loading}
              />
            </div>

            {/* Height Work */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700/80 transition duration-150 flex flex-col">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
                  <TrendingUp className="w-4 h-4" />
                </div>
                Height Work Permit Activity
              </label>
              <textarea
                value={heightWork}
                onChange={(e) => setHeightWork(e.target.value)}
                placeholder={isPastDate ? 'No work logged.' : 'Detail scaffold work, ladder work, roofs, elevated platforms...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:border-amber-500 focus:ring-0 text-slate-100 placeholder-slate-600 outline-none transition text-sm resize-none h-32 flex-1"
                disabled={isPastDate || loading}
              />
            </div>

            {/* General Work */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700/80 transition duration-150 flex flex-col">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                General Work Permit Activity
              </label>
              <textarea
                value={generalWork}
                onChange={(e) => setGeneralWork(e.target.value)}
                placeholder={isPastDate ? 'No work logged.' : 'Detail housekeeping, manual excavation, shifts, loading...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:border-amber-500 focus:ring-0 text-slate-100 placeholder-slate-600 outline-none transition text-sm resize-none h-32 flex-1"
                disabled={isPastDate || loading}
              />
            </div>

            {/* Man Power */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700/80 transition duration-150 flex flex-col">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                  <Users className="w-4 h-4" />
                </div>
                Man Power / Workers Name
              </label>
              <textarea
                value={manpower}
                onChange={(e) => setManpower(e.target.value)}
                placeholder={isPastDate ? 'No workers logged.' : 'List the names of all workers/laborers present...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:border-amber-500 focus:ring-0 text-slate-100 placeholder-slate-600 outline-none transition text-sm resize-none h-32 flex-1"
                disabled={isPastDate || loading}
              />
            </div>

          </div>

          {/* Action Footer */}
          {!isPastDate && (
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-950/20 hover:shadow-amber-950/30 transition duration-150 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save & Submit Daily Log
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Update Account Password
            </h3>
            <form onSubmit={handlePasswordChangePre} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:border-amber-500 outline-none text-slate-100 text-sm transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:border-amber-500 outline-none text-slate-100 text-sm transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:border-amber-500 outline-none text-slate-100 text-sm transition"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold rounded-xl shadow-lg transition"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmSubmitOpen}
        title="Submit Permit Activity?"
        message={`Are you sure you want to submit your daily permit tracking details for ${date}? This will overwrite any existing entries saved for this date.`}
        confirmText="Yes, Submit"
        onConfirm={submitEntry}
        onCancel={() => setConfirmSubmitOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmPasswordOpen}
        title="Confirm Password Update"
        message="Are you sure you want to change your login password? You will need to log in with this new password next time."
        confirmText="Yes, Change Password"
        onConfirm={submitPasswordChange}
        onCancel={() => setConfirmPasswordOpen(false)}
      />

      {/* Toast notifications */}
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
