import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Building2,
  Users,
  PlusCircle,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Briefcase,
  Award,
  Trash2,
  Edit3,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Database,
  ArrowUpRight,
  TrendingUp,
  X,
  Lock,
  Shield,
  Key,
  Bot,
  Camera,
  ImagePlus,
  UserCheck,
  GraduationCap,
} from 'lucide-react';
import {
  getPlacementDrives,
  createPlacementDrive,
  updatePlacementDrive,
  deletePlacementDrive,
  getAllStudents,
  updateStudentStatus,
  getAllDriveApplications,
  updateApplicationStatus
} from '../firebase/firestore';
import InterviewRobot from '../components/InterviewRobot';
import studentCredentials from '../data/studentCredentials.json';
import adminCredentials from '../data/adminCredentials.json';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loginAdmin, exitAdminMode } = useAuth();
  const { addToast } = useTheme();

  // Admin Login Challenge State for unauthenticated users
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [activeTab, setActiveTab] = useState('drives'); // 'drives' | 'students' | 'applications' | 'robot' | 'registered'
  const [drives, setDrives] = useState([]);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // JSON-based registered students (from studentCredentials.json)
  const jsonStudents = studentCredentials;
  const registeredStudents = jsonStudents.filter(s => s.registeredForPlacement);

  // Admin profile photo editing
  const [adminPhoto, setAdminPhoto] = useState(
    () => localStorage.getItem('arena_admin_photo') || adminCredentials.admin.profilePhoto
  );
  const [adminPhotoUrlInput, setAdminPhotoUrlInput] = useState('');
  const adminPhotoInputRef = useRef(null);

  const handleAdminPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image must be under 5 MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setAdminPhoto(base64);
      localStorage.setItem('arena_admin_photo', base64);
      addToast('Admin profile photo updated!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleAdminPhotoUrl = () => {
    const url = adminPhotoUrlInput.trim();
    if (!url) return;
    setAdminPhoto(url);
    localStorage.setItem('arena_admin_photo', url);
    setAdminPhotoUrlInput('');
    addToast('Admin profile photo updated from URL!', 'success');
  };

  const handleAdminAuthSubmit = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAdminAuthError('');
    try {
      await loginAdmin(adminUsername, adminPassword);
      addToast('Administrator authenticated! Welcome to Placement Portal.', 'success');
      loadData();
    } catch (err) {
      setAdminAuthError(err.message || 'Access Denied: Invalid administrator credentials.');
      addToast('Access Denied: Invalid Credentials', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };


  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');

  // Modal State for Hosting New Placement Drive
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [editingDriveId, setEditingDriveId] = useState(null);
  const [driveForm, setDriveForm] = useState({
    company: '',
    role: '',
    logo: 'https://cdn-icons-png.flaticon.com/512/3281/3281289.png',
    ctc: '',
    location: 'Bangalore / Hyderabad',
    eligibleBranches: 'Computer Science, Information Technology',
    minCgpa: '7.5',
    minReadinessScore: '75',
    driveDate: '',
    applicationDeadline: '',
    status: 'Active',
    workMode: 'Hybrid',
    jobType: 'Full Time',
    rounds: 'Online Coding OA, Technical Round 1, Technical Round 2, HR Interview',
    description: '',
    skillsRequired: 'Data Structures, Python, Java, SQL',
    openPositions: '25',
  });

  // Selected student for quick view
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [drivesData, studentsData, appsData] = await Promise.all([
        getPlacementDrives(),
        getAllStudents(),
        getAllDriveApplications(),
      ]);
      setDrives(drivesData || []);
      setStudents(studentsData || []);
      setApplications(appsData || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Drive form submission
  const handleDriveSubmit = async (e) => {
    e.preventDefault();
    if (!driveForm.company || !driveForm.role || !driveForm.ctc) {
      addToast('Please fill in Company Name, Role, and CTC Package', 'error');
      return;
    }

    const payload = {
      ...driveForm,
      eligibleBranches: typeof driveForm.eligibleBranches === 'string'
        ? driveForm.eligibleBranches.split(',').map((s) => s.trim())
        : driveForm.eligibleBranches,
      rounds: typeof driveForm.rounds === 'string'
        ? driveForm.rounds.split(',').map((s) => s.trim())
        : driveForm.rounds,
      skillsRequired: typeof driveForm.skillsRequired === 'string'
        ? driveForm.skillsRequired.split(',').map((s) => s.trim())
        : driveForm.skillsRequired,
      minCgpa: parseFloat(driveForm.minCgpa) || 7.0,
      minReadinessScore: parseInt(driveForm.minReadinessScore, 10) || 70,
      openPositions: parseInt(driveForm.openPositions, 10) || 10,
      // Extract numeric CTC from the CTC text (e.g. "₹24 - ₹32 LPA" => 24)
      ctcNum: (() => {
        const nums = (driveForm.ctc || '').match(/\d+(\.\d+)?/g);
        return nums && nums.length > 0 ? parseFloat(nums[0]) : 0;
      })(),
      hiringBatch: driveForm.hiringBatch || '2026 Graduates',
    };

    if (editingDriveId) {
      await updatePlacementDrive(editingDriveId, payload);
      addToast(`Placement drive for ${payload.company} updated!`, 'success');
    } else {
      await createPlacementDrive(payload);
      addToast(`New placement drive for ${payload.company} hosted successfully!`, 'success');
    }

    setIsDriveModalOpen(false);
    setEditingDriveId(null);
    setDriveForm({
      company: '',
      role: '',
      logo: 'https://cdn-icons-png.flaticon.com/512/3281/3281289.png',
      ctc: '',
      location: 'Bangalore / Hyderabad',
      eligibleBranches: 'Computer Science, Information Technology',
      minCgpa: '7.5',
      minReadinessScore: '75',
      driveDate: '',
      applicationDeadline: '',
      status: 'Active',
      workMode: 'Hybrid',
      jobType: 'Full Time',
      rounds: 'Online Coding OA, Technical Round 1, Technical Round 2, HR Interview',
      description: '',
      skillsRequired: 'Data Structures, Python, Java, SQL',
      openPositions: '25',
    });
    loadData();
  };

  const handleEditDrive = (drive) => {
    setEditingDriveId(drive.id);
    setDriveForm({
      company: drive.company,
      role: drive.role,
      logo: drive.logo || 'https://cdn-icons-png.flaticon.com/512/3281/3281289.png',
      ctc: drive.ctc || '',
      location: drive.location || '',
      eligibleBranches: Array.isArray(drive.eligibleBranches) ? drive.eligibleBranches.join(', ') : drive.eligibleBranches,
      minCgpa: String(drive.minCgpa || '7.5'),
      minReadinessScore: String(drive.minReadinessScore || '75'),
      driveDate: drive.driveDate || '',
      applicationDeadline: drive.applicationDeadline || '',
      status: drive.status || 'Active',
      workMode: drive.workMode || 'Hybrid',
      jobType: drive.jobType || 'Full Time',
      rounds: Array.isArray(drive.rounds) ? drive.rounds.join(', ') : drive.rounds,
      description: drive.description || '',
      skillsRequired: Array.isArray(drive.skillsRequired) ? drive.skillsRequired.join(', ') : drive.skillsRequired,
      openPositions: String(drive.openPositions || '25'),
    });
    setIsDriveModalOpen(true);
  };

  const handleDeleteDrive = async (id, company) => {
    if (window.confirm(`Are you sure you want to remove the placement drive for ${company}?`)) {
      await deletePlacementDrive(id);
      addToast(`Drive for ${company} removed`, 'info');
      loadData();
    }
  };

  const handleStatusChangeStudent = async (studentUid, newStatus) => {
    await updateStudentStatus(studentUid, newStatus);
    addToast('Student placement status updated!', 'success');
    loadData();
  };

  const handleApplicationStatus = async (appId, newStatus) => {
    await updateApplicationStatus(appId, newStatus);
    addToast(`Candidate application updated to: ${newStatus}`, 'success');
    loadData();
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.targetRole || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = selectedBranch === 'All' || (s.branch || '').includes(selectedBranch);
    return matchesSearch && matchesBranch;
  });

  // If current user is not logged in with administrator credentials, display professional restricted message
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl glass-panel relative text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-purple-400 flex items-center justify-center mx-auto mb-4 border border-purple-500/20 shadow-lg shadow-purple-900/20">
            <Lock className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-full">
            Restricted Officer Portal
          </span>

          <h2 className="text-xl font-black text-white mt-3">
            Placement Administrator Portal
          </h2>
          <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
            This module is reserved for authorized Placement Cell Officers to host company drives, verify student eligibility, and review applications. Candidate profiles cannot access administrative controls.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 cursor-pointer"
            >
              Return to Candidate Dashboard
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              Sign In with Officer Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Admin Profile Photo */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/60 via-indigo-950/70 to-slate-900 border border-purple-800/40 relative overflow-hidden backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Admin Profile Photo with edit overlay */}
            <div className="relative group shrink-0">
              <img
                src={adminPhoto}
                alt="Admin"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/60 shadow-lg shadow-purple-600/30"
              />
              <label
                htmlFor="admin-photo-upload"
                className="absolute inset-0 rounded-2xl bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change Admin Photo"
              >
                <Camera className="w-5 h-5 text-white" />
              </label>
              <input
                id="admin-photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAdminPhotoUpload}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Placement Cell Officer & Host
                </span>
                <span className="text-xs text-emerald-400 font-semibold">● Authenticated as admin</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Placement Administration & Drive Host
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl mt-1">
                Host upcoming company recruitment drives, review visiting enterprise requirements, shortlist students by readiness score, and manage applicant progression.
              </p>
              {/* Admin photo URL input */}
              <div className="flex gap-1.5 mt-2 max-w-xs">
                <input
                  type="url"
                  value={adminPhotoUrlInput}
                  onChange={e => setAdminPhotoUrlInput(e.target.value)}
                  placeholder="Paste photo URL to update..."
                  className="flex-1 px-2.5 py-1 text-[11px] rounded-lg bg-slate-950/80 border border-slate-700 text-slate-200 focus:outline-none focus:border-purple-500"
                  onKeyDown={e => e.key === 'Enter' && handleAdminPhotoUrl()}
                />
                <button
                  onClick={handleAdminPhotoUrl}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold cursor-pointer"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                exitAdminMode();
                addToast('Exited Admin Mode. Returned to Student view.', 'info');
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              Exit Admin Mode
            </button>
            <button
              onClick={() => {
                setEditingDriveId(null);
                setIsDriveModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Host New Placement Drive
            </button>
          </div>
        </div>
      </div>


      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Total Drives Hosted</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{drives.length}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> {drives.filter((d) => d.status === 'Active').length} currently active
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Registered Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{students.length}</div>
          <div className="text-[11px] text-blue-400 font-semibold mt-1">
            Avg Readiness: 81%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Drive Applications</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{applications.length}</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            {applications.filter((a) => a.status.includes('Interview') || a.status.includes('Shortlist')).length} Shortlisted
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Top CTC Offered</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">₹45 LPA</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Google SDE-1
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-800 gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('drives')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'drives'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Hosted Placement Drives ({drives.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'students'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> Student Roster & Readiness ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'applications'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Drive Applicants & Shortlisting ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab('registered')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'registered'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Registered for Placement ({registeredStudents.length})
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">JSON</span>
        </button>

        <button
          onClick={() => setActiveTab('robot')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'robot'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" /> Interview Robot Simulator
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">AI</span>
        </button>
      </div>


      {/* TAB 1: PLACEMENT DRIVES */}
      {activeTab === 'drives' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200">
              Active & Scheduled Recruitment Drives
            </h3>
            <button
              onClick={() => {
                setEditingDriveId(null);
                setIsDriveModalOpen(true);
              }}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Host Another Company
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drives.map((drive) => (
              <div
                key={drive.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 glass-card flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={drive.logo || 'https://cdn-icons-png.flaticon.com/512/3281/3281289.png'}
                        alt={drive.company}
                        className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1.5 border border-slate-700"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{drive.company}</h4>
                        <span className="text-[11px] text-slate-400">{drive.role}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        drive.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {drive.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Package (CTC)</span>
                      <span className="font-bold text-amber-400">{drive.ctc}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Min CGPA</span>
                      <span className="font-bold text-slate-200">{drive.minCgpa} CGPA</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Min Readiness</span>
                      <span className="font-bold text-blue-400">{drive.minReadinessScore}% Score</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Drive Date</span>
                      <span className="font-bold text-slate-300">{drive.driveDate || 'TBD'}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <p className="line-clamp-2 text-[11px]">{drive.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(Array.isArray(drive.skillsRequired)
                        ? drive.skillsRequired
                        : (drive.skillsRequired || '').split(',')
                      )
                        .slice(0, 3)
                        .map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium"
                          >
                            {typeof s === 'string' ? s.trim() : s}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    👥 <strong>{drive.appliedCount || 0}</strong> applicants
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditDrive(drive)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Drive"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDrive(drive.id, drive.company)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Drive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS ROSTER */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student by name, role, skills..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Branch:</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none"
              >
                <option value="All">All Branches</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden glass-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Branch & College</th>
                    <th className="p-4">CGPA</th>
                    <th className="p-4">Placement Readiness</th>
                    <th className="p-4">Target Role</th>
                    <th className="p-4">Placement Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.map((std) => (
                    <tr key={std.uid} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                            {std.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{std.name}</span>
                            <span className="text-[11px] text-slate-400">{std.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-slate-200 block">{std.branch}</span>
                        <span className="text-[10px] text-slate-400">{std.college}</span>
                      </td>

                      <td className="p-4 font-bold text-slate-200">
                        {std.cgpa ? `${std.cgpa} / 10` : '8.5 / 10'}
                      </td>

                      <td className="p-4">
                        <div className="w-32">
                          <div className="flex justify-between text-[11px] font-bold text-blue-400 mb-1">
                            <span>Score</span>
                            <span>{std.placementReadinessScore || 75}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${std.placementReadinessScore || 75}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-medium text-slate-300">
                        {std.targetRole || 'Software Engineer'}
                      </td>

                      <td className="p-4">
                        <select
                          value={std.status || 'Eligible'}
                          onChange={(e) => handleStatusChangeStudent(std.uid, e.target.value)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="Eligible">Eligible</option>
                          <option value="Eligible & Shortlisted">Eligible & Shortlisted</option>
                          <option value="In Interview Loop">In Interview Loop</option>
                          <option value="Offered (Placed)">Offered (Placed)</option>
                          <option value="Requires Upskilling">Requires Upskilling</option>
                        </select>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedStudent(std)}
                          className="px-3 py-1 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 font-semibold transition-colors cursor-pointer"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200">
              Candidate Applications for Hosted Drives
            </h3>
            <span className="text-xs text-slate-400">{applications.length} applications logged</span>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden glass-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Company & Target Role</th>
                    <th className="p-4">Readiness & CGPA</th>
                    <th className="p-4">Application Date</th>
                    <th className="p-4">Current Stage</th>
                    <th className="p-4 text-right">Update Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-white block">{app.studentName}</span>
                        <span className="text-[11px] text-slate-400">{app.studentEmail}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-purple-300 block">{app.company}</span>
                        <span className="text-[11px] text-slate-400">{app.role}</span>
                      </td>

                      <td className="p-4">
                        <div className="text-xs">
                          <span className="font-bold text-blue-400">{app.readinessScore || 78}% Score</span>
                          <span className="text-slate-400 block text-[11px]">CGPA: {app.cgpa || 8.5}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            app.status.includes('Interview')
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : app.status.includes('Shortlist')
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : app.status.includes('Offer')
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <select
                          value={app.status}
                          onChange={(e) => handleApplicationStatus(app.id, e.target.value)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="Application Submitted">Application Submitted</option>
                          <option value="Shortlisted for OA">Shortlisted for OA</option>
                          <option value="Interview Scheduled">Interview Scheduled</option>
                          <option value="Offer Extended">Offer Extended</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REGISTERED FOR PLACEMENT (from JSON) */}
      {activeTab === 'registered' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Placement-Registered Students (from studentCredentials.json)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              These students have registered for placement drives. Data sourced directly from the platform's student JSON database ({registeredStudents.length} of {jsonStudents.length} total students).
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden glass-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">College & Branch</th>
                    <th className="p-4">CGPA</th>
                    <th className="p-4">Readiness</th>
                    <th className="p-4">Applied Drives</th>
                    <th className="p-4">Robot Sessions</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {registeredStudents.map((std) => (
                    <tr key={std.uid} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={std.profilePhoto}
                            alt={std.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <span className="font-bold text-white block">{std.name}</span>
                            <span className="text-[11px] text-slate-400">{std.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-200 block">{std.college}</span>
                        <span className="text-[10px] text-slate-400">{std.branch} • {std.graduationYear}</span>
                      </td>
                      <td className="p-4 font-bold text-emerald-400">{std.cgpa} / 10</td>
                      <td className="p-4">
                        <div className="w-24">
                          <div className="flex justify-between text-[11px] font-bold text-blue-400 mb-1">
                            <span>{std.placementReadinessScore}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${std.placementReadinessScore}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {(std.appliedDrives || []).map((d, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">{d}</span>
                          ))}
                          {(!std.appliedDrives || std.appliedDrives.length === 0) && (
                            <span className="text-[10px] text-slate-500">No drives applied</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          std.interviewRobotSessions > 3
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : std.interviewRobotSessions > 0
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {std.interviewRobotSessions} session{std.interviewRobotSessions !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          std.status?.includes('Offered')
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : std.status?.includes('Interview')
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : std.status?.includes('Shortlisted')
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {std.status || 'Eligible'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* All JSON Students (including non-registered) */}
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              All JSON Students — Including Not Yet Registered ({jsonStudents.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {jsonStudents.map((std) => (
                <div key={std.uid} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 glass-card flex items-center gap-3">
                  <img
                    src={std.profilePhoto}
                    alt={std.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-white text-xs block truncate">{std.name}</span>
                    <span className="text-[11px] text-slate-400 block truncate">{std.college}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        std.registeredForPlacement
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {std.registeredForPlacement ? '✓ Registered' : '○ Not Registered'}
                      </span>
                      <span className="text-[10px] text-blue-400 font-semibold">{std.placementReadinessScore}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INTERVIEW ROBOT SIMULATOR */}
      {activeTab === 'robot' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                AI Interview Robot — Admin Test Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Run the RoboSDE interview simulator to calibrate questions and evaluate candidate experience before scheduling live drives.
            </p>
          </div>
          <InterviewRobot
            roleTitle="Software Development Engineer (SDE-1)"
            companyName="Company Drive Simulation"
          />
        </div>
      )}

      {/* MODAL: HOST / EDIT PLACEMENT DRIVE */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-100">
            <button
              onClick={() => setIsDriveModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingDriveId ? 'Edit Placement Drive' : 'Host New Company Placement Drive'}
                </h2>
                <p className="text-xs text-slate-400">
                  Publish drive specifications to the student portal with eligibility and hiring rounds.
                </p>
              </div>
            </div>

            <form onSubmit={handleDriveSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={driveForm.company}
                    onChange={(e) => setDriveForm({ ...driveForm, company: e.target.value })}
                    placeholder="e.g. Google, Amazon, Microsoft"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Job Role / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={driveForm.role}
                    onChange={(e) => setDriveForm({ ...driveForm, role: e.target.value })}
                    placeholder="e.g. Software Development Engineer 1"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    CTC / Compensation Package *
                  </label>
                  <input
                    type="text"
                    required
                    value={driveForm.ctc}
                    onChange={(e) => setDriveForm({ ...driveForm, ctc: e.target.value })}
                    placeholder="e.g. ₹24 - ₹32 LPA"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Job Location
                  </label>
                  <input
                    type="text"
                    value={driveForm.location}
                    onChange={(e) => setDriveForm({ ...driveForm, location: e.target.value })}
                    placeholder="e.g. Bangalore / Hyderabad / Hybrid"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Min CGPA Required
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={driveForm.minCgpa}
                    onChange={(e) => setDriveForm({ ...driveForm, minCgpa: e.target.value })}
                    placeholder="7.5"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Min ARENA Readiness Score (%)
                  </label>
                  <input
                    type="number"
                    value={driveForm.minReadinessScore}
                    onChange={(e) => setDriveForm({ ...driveForm, minReadinessScore: e.target.value })}
                    placeholder="75"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Drive Date
                  </label>
                  <input
                    type="date"
                    value={driveForm.driveDate}
                    onChange={(e) => setDriveForm({ ...driveForm, driveDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={driveForm.applicationDeadline}
                    onChange={(e) => setDriveForm({ ...driveForm, applicationDeadline: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Eligible Engineering Branches (Comma separated)
                </label>
                <input
                  type="text"
                  value={driveForm.eligibleBranches}
                  onChange={(e) => setDriveForm({ ...driveForm, eligibleBranches: e.target.value })}
                  placeholder="Computer Science, IT, Electronics"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Selection Rounds (Comma separated)
                </label>
                <input
                  type="text"
                  value={driveForm.rounds}
                  onChange={(e) => setDriveForm({ ...driveForm, rounds: e.target.value })}
                  placeholder="Aptitude OA, Coding Round, GD Round, Tech Interview, HR"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Job Description & Overview
                </label>
                <textarea
                  rows="3"
                  value={driveForm.description}
                  onChange={(e) => setDriveForm({ ...driveForm, description: e.target.value })}
                  placeholder="Describe the candidate responsibilities, role perks, and tech stack..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  {editingDriveId ? 'Save Drive Updates' : 'Publish Placement Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE PREVIEW MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                {selectedStudent.name?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedStudent.name}</h3>
                <span className="text-xs text-purple-400 block">{selectedStudent.email}</span>
                <span className="text-[11px] text-slate-400">{selectedStudent.college}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Branch</span>
                <span className="font-semibold text-slate-200">{selectedStudent.branch}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">CGPA</span>
                <span className="font-bold text-emerald-400">{selectedStudent.cgpa || 8.8} / 10</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Target Role</span>
                <span className="font-semibold text-slate-200">{selectedStudent.targetRole || 'SDE'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Readiness Score</span>
                <span className="font-bold text-blue-400">{selectedStudent.placementReadinessScore || 78}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Key Technical Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedStudent.skills || ['Data Structures', 'React', 'Python', 'SQL']).map((sk, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
