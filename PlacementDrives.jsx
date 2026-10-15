import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Building2,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  MapPin,
  X,
  FileCheck,
  Award
} from 'lucide-react';
import {
  getPlacementDrives,
  applyForPlacementDrive,
  getStudentApplications
} from '../firebase/firestore';

export const PlacementDrives = () => {
  const { user } = useAuth();
  const { addToast } = useTheme();

  const [drives, setDrives] = useState([]);
  const [appliedDrives, setAppliedDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'applied'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedModalDrive, setSelectedModalDrive] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const drivesList = await getPlacementDrives();
      setDrives(drivesList || []);
      if (user?.uid) {
        const studentApps = await getStudentApplications(user.uid);
        setAppliedDrives(studentApps || []);
      }
    } catch (err) {
      console.error('Error fetching drives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  const isApplied = (driveId) => {
    return appliedDrives.some((a) => a.driveId === driveId);
  };

  const handleApply = async (drive) => {
    if (isApplied(drive.id)) {
      addToast(`You have already registered for ${drive.company}!`, 'info');
      return;
    }

    // Eligibility check
    const studentCgpa = user?.cgpa || 8.2;
    const studentScore = user?.placementReadinessScore || 78;

    if (studentCgpa < drive.minCgpa) {
      addToast(
        `Eligibility Alert: Drive requires min ${drive.minCgpa} CGPA (Your CGPA: ${studentCgpa}). Application submitted with exception note.`,
        'warning'
      );
    }

    try {
      await applyForPlacementDrive({
        driveId: drive.id,
        company: drive.company,
        role: drive.role,
        userProfile: user,
      });

      addToast(`Successfully registered for ${drive.company} ${drive.role} drive! 🎉`, 'success');
      loadData();
      if (selectedModalDrive?.id === drive.id) {
        setSelectedModalDrive(null);
      }
    } catch (err) {
      addToast('Failed to submit application: ' + err.message, 'error');
    }
  };

  // Filter drives
  const filteredDrives = drives.filter((d) => {
    const matchesSearch =
      (d.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(d.skillsRequired) ? d.skillsRequired.join(' ') : d.skillsRequired || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedTier === 'super' && (d.ctcNum || 0) < 25) return false;
    if (selectedTier === 'dream' && ((d.ctcNum || 0) < 12 || (d.ctcNum || 0) >= 25)) return false;
    if (selectedTier === 'prime' && (d.ctcNum || 0) >= 12) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-950/70 to-slate-900 border border-blue-800/40 relative overflow-hidden backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Official Campus Placement Drives
              </span>
              <span className="text-xs text-slate-400">Campus Recruitment 2026</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Visiting Enterprise Drives & Opportunities
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Explore Tier-1 product giants and global tech conglomerates visiting your campus. Review CTC packages, eligibility criteria, hiring rounds, and register with one click.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Your Readiness</span>
              <span className="text-lg font-black text-blue-400">
                {user?.placementReadinessScore || 78}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Applied Drives</span>
              <span className="text-lg font-black text-emerald-400">
                {appliedDrives.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 px-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" /> All Visiting Companies ({drives.length})
          </button>
          <button
            onClick={() => setActiveTab('applied')}
            className={`pb-2 px-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'applied'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" /> My Registered Drives ({appliedDrives.length})
          </button>
        </div>

        {activeTab === 'all' && (
          <div className="flex items-center gap-2">
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, CTC, skills..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Packages</option>
              <option value="super">Super Dream (≥ 25 LPA)</option>
              <option value="dream">Dream (12 - 25 LPA)</option>
              <option value="prime">Prime (≤ 12 LPA)</option>
            </select>
          </div>
        )}
      </div>

      {/* ALL DRIVES GRID */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrives.map((drive) => {
            const hasApplied = isApplied(drive.id);
            const userCgpa = user?.cgpa || 8.2;
            const isCgpaEligible = userCgpa >= drive.minCgpa;
            const isScoreEligible = (user?.placementReadinessScore || 78) >= drive.minReadinessScore;

            return (
              <div
                key={drive.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 glass-card flex flex-col justify-between hover:border-blue-500/40 transition-all duration-300"
              >
                <div>
                  {/* Top Company Info */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={drive.logo || 'https://cdn-icons-png.flaticon.com/512/3281/3281289.png'}
                        alt={drive.company}
                        className="w-11 h-11 rounded-xl object-contain bg-white/10 p-1.5 border border-slate-700"
                      />
                      <div>
                        <h3 className="text-base font-black text-white">{drive.company}</h3>
                        <span className="text-xs text-blue-400 font-semibold block">{drive.role}</span>
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

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 my-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Package (CTC)</span>
                      <span className="font-extrabold text-amber-400">{drive.ctc}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Location</span>
                      <span className="font-semibold text-slate-200 truncate block">
                        {drive.location || 'India'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Drive Date</span>
                      <span className="font-semibold text-slate-300">
                        {drive.driveDate || 'Upcoming'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Positions</span>
                      <span className="font-semibold text-emerald-400">
                        {drive.openPositions || 20} Openings
                      </span>
                    </div>
                  </div>

                  {/* Eligibility Status Pill */}
                  <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-slate-950/50 border border-slate-800/80 text-[11px]">
                    {isCgpaEligible && isScoreEligible ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>You meet all academic & readiness criteria!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Req: {drive.minCgpa} CGPA • {drive.minReadinessScore}% Score</span>
                      </div>
                    )}
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {drive.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(drive.skillsRequired)
                      ? drive.skillsRequired
                      : (drive.skillsRequired || '').split(',')
                    )
                      .slice(0, 3)
                      .map((sk, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium"
                        >
                          {typeof sk === 'string' ? sk.trim() : sk}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedModalDrive(drive)}
                    className="text-xs text-slate-400 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {hasApplied ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(drive)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* APPLIED DRIVES TAB */}
      {activeTab === 'applied' && (
        <div className="space-y-4">
          {appliedDrives.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
              <Briefcase className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-200">No Placement Drives Applied Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Explore visiting companies under "All Visiting Companies" and submit your candidature.
              </p>
              <button
                onClick={() => setActiveTab('all')}
                className="mt-4 px-4 py-2 text-xs rounded-xl bg-blue-600 text-white font-bold"
              >
                Browse Visiting Companies
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appliedDrives.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 glass-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-base font-bold text-white">{app.company}</h4>
                        <span className="text-xs text-blue-400 font-semibold">{app.role}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          app.status.includes('Interview')
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : app.status.includes('Shortlist')
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Application ID</span>
                        <span className="font-mono text-slate-300 text-[11px]">{app.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Submitted On</span>
                        <span className="text-slate-300">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Next Step: Check email for Online Assessment credentials
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active in Loop
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DRIVE DETAILS MODAL */}
      {selectedModalDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-100">
            <button
              onClick={() => setSelectedModalDrive(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <img
                src={selectedModalDrive.logo || 'https://cdn-icons-png.flaticon.com/512/3281/3281289.png'}
                alt={selectedModalDrive.company}
                className="w-12 h-12 rounded-xl object-contain bg-white/10 p-1.5 border border-slate-700"
              />
              <div>
                <h2 className="text-xl font-black text-white">{selectedModalDrive.company}</h2>
                <span className="text-xs font-semibold text-blue-400">{selectedModalDrive.role}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Package</span>
                <span className="font-extrabold text-amber-400">{selectedModalDrive.ctc}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Min CGPA</span>
                <span className="font-bold text-slate-200">{selectedModalDrive.minCgpa}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Min Score</span>
                <span className="font-bold text-blue-400">{selectedModalDrive.minReadinessScore}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Drive Date</span>
                <span className="font-bold text-slate-300">{selectedModalDrive.driveDate || 'TBD'}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-200 mb-1">Company & Role Overview:</h4>
                <p className="text-slate-400 leading-relaxed">{selectedModalDrive.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1">Hiring Selection Pipeline:</h4>
                <div className="space-y-1.5">
                  {(Array.isArray(selectedModalDrive.rounds)
                    ? selectedModalDrive.rounds
                    : (selectedModalDrive.rounds || '').split(',')
                  ).map((rnd, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2.5"
                    >
                      <div className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                        {i + 1}
                      </div>
                      <span className="text-slate-300 font-medium">
                        {typeof rnd === 'string' ? rnd.trim() : rnd}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1">Eligible Branches:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(selectedModalDrive.eligibleBranches)
                    ? selectedModalDrive.eligibleBranches
                    : (selectedModalDrive.eligibleBranches || '').split(',')
                  ).map((b, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium text-[11px]"
                    >
                      {typeof b === 'string' ? b.trim() : b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Deadline: {selectedModalDrive.applicationDeadline || 'Rolling Admissions'}
              </span>

              {isApplied(selectedModalDrive.id) ? (
                <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Already Registered
                </span>
              ) : (
                <button
                  onClick={() => handleApply(selectedModalDrive)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Confirm Registration
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementDrives;
