import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { User, Mail, Phone, GraduationCap, Target, Save, Sparkles, Plus, Trash2, Award, Zap, CheckCircle2, AlertTriangle, Camera, ImagePlus } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useTheme();

  // Dynamic Skill Levels from user state / tests
  const initialSkills = [
    { name: 'Python', level: 85, color: 'emerald' },
    { name: 'SQL', level: 82, color: 'emerald' },
    { name: 'React.js', level: 72, color: 'blue' },
    { name: 'Java', level: 70, color: 'blue' },
    { name: 'DSA & Algorithms', level: 65, color: 'amber' },
  ];

  const [formData, setFormData] = useState({
    name: user?.name || 'Aruna',
    email: user?.email || 'aruna@college.edu',
    phone: user?.phone || '+91 98765 43210',
    college: user?.college || 'National Institute of Technology (NIT)',
    degree: user?.degree || 'B.Tech',
    branch: user?.branch || 'Computer Science & Engineering',
    graduationYear: user?.graduationYear || '2026',
    bio: user?.bio || 'Aspiring Python Developer preparing for campus placements.',
    targetRole: user?.targetRole || 'Python Developer',
  });

  const [skillsList, setSkillsList] = useState(initialSkills);
  const [isSaving, setIsSaving] = useState(false);

  const strengths = ['Python Programming', 'SQL & Database Design', 'Logical Problem Solving'];
  const weaknesses = ['Data Structures & Algorithms (DSA)', 'Verbal & STAR Communication'];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
      addToast('AI Profile updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const currentReadiness = user?.placementReadinessScore || 78;

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="AI Profile & Career Engine"
        description="The brain of ARENA — real-time analysis of your skill levels, strengths, weaknesses, and placement summary."
        badgeText={`Readiness: ${currentReadiness}%`}
        badgeVariant="blue"
      />

      {/* AI Placement Summary Banner */}
      <div className="p-6 rounded-2xl glass-panel border-l-4 border-l-blue-500 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 animate-pulse" /> AI Placement Diagnostic Summary
        </div>
        <p className="text-sm font-semibold text-slate-100 leading-relaxed">
          "Your current placement readiness is {currentReadiness}%. Your strongest area is Python (85%). Focus on DSA and communication to improve your score."
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Strengths, Weaknesses, Career Goals */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 text-center space-y-4">
            {/* Profile Photo with Upload Overlay */}
            <div className="relative inline-block group">
              <img
                src={user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={formData.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 shadow-xl mx-auto"
              />
              {/* Camera overlay button */}
              <label
                htmlFor="profile-photo-upload"
                className="absolute inset-0 rounded-full bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Upload Profile Photo"
              >
                <Camera className="w-6 h-6 text-white" />
              </label>
              <input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) {
                    addToast('Image must be under 5 MB', 'error');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const base64 = ev.target.result;
                    updateProfile({ profilePhoto: base64 });
                    addToast('Profile photo updated!', 'success');
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>

            <h3 className="text-lg font-bold text-white mb-0.5">{formData.name}</h3>
            <span className="text-xs font-bold text-blue-400 block mb-2">{formData.targetRole}</span>
            <p className="text-xs text-slate-400">{formData.college}</p>

            {/* Photo URL input */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 block text-left">Or paste image URL:</label>
              <div className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 px-3 py-1.5 text-[11px] rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      updateProfile({ profilePhoto: e.currentTarget.value.trim() });
                      addToast('Profile photo updated from URL!', 'success');
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling;
                    if (input?.value?.trim()) {
                      updateProfile({ profilePhoto: input.value.trim() });
                      addToast('Profile photo updated from URL!', 'success');
                      input.value = '';
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold cursor-pointer transition-colors"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Career Goals */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" /> Target Career Goal
            </h4>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white">
              Target Role: <span className="text-blue-400">{formData.targetRole}</span>
            </div>
          </div>

          {/* Strengths */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Core Strengths
            </h4>
            <div className="space-y-2">
              {strengths.map((str, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs font-medium text-emerald-300 flex items-center gap-2">
                  <span>✓</span> {str}
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> AI Identified Focus Areas
            </h4>
            <div className="space-y-2">
              {weaknesses.map((wk, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-xs font-medium text-amber-300 flex items-center gap-2">
                  <span>!</span> {wk}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Skills Progress & Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Level Progress Bars */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Skill Proficiency Levels (Evaluated Across Modules)
            </h3>
            <div className="space-y-4">
              {skillsList.map((skill) => (
                <div key={skill.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">{skill.name}</span>
                    <span className="font-bold text-white">{skill.level}%</span>
                  </div>
                  <ProgressBar progress={skill.level} max={100} color={skill.color} height="h-2.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Edit Information Form */}
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Personal & Candidate Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Job Role</label>
                <select
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Python Developer">Python Developer</option>
                  <option value="Java Developer">Java Developer</option>
                  <option value="Web Developer">Web Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                  <option value="Software Developer">Software Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">College / Institute</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Branch & Graduation Year</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  <select
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" isLoading={isSaving} icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
