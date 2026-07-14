import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentView, setSelectedJobId } from '../store/careerSlice';
import { createJob, uploadCompanyLogo } from '../api/jobs';
import {
  Briefcase,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  ArrowLeft,
  ChevronRight,
  Info,
  FileText,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  X,
} from 'lucide-react';

export default function PostJob() {
  const dispatch = useDispatch();

  // Form states
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship'>('Full-time');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState(120000);
  const [salaryMax, setSalaryMax] = useState(180000);
  const [description, setDescription] = useState('');
  
  // Skills tags states
  const [skills, setSkills] = useState<string[]>(['UI/UX Design', 'python']);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Perks states
  const [perks, setPerks] = useState<string[]>(['Remote Work']);

  // Publishing toggles
  const [acceptingApps, setAcceptingApps] = useState(true);
  const [publicVis, setPublicVis] = useState(true);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleTogglePerk = (perk: string) => {
    if (perks.includes(perk)) {
      setPerks(perks.filter((p) => p !== perk));
    } else {
      setPerks([...perks, perk]);
    }
  };

  const handlePublish = async () => {
    if (!title || !location || !description || !companyName) {
      alert('Please fill out the Job Title, Company Name, Location, and Description to publish.');
      return;
    }

    try {
      await createJob({
        title,
        location,
        type,
        description,
        salaryMin,
        salaryMax,
        requiredSkills: skills,
        perks,
        companyName,
        companyLogo: companyLogo || undefined,
      });

      alert('Success! Your job posting was successfully published.');
      dispatch(setCurrentView('employer-jobs'));
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Could not publish this job.');
    }
  };

  return (
    <div className="flex min-h-screen">
      
      {/* SideNavBar - Employer shared context */}
      <aside className="w-64 shrink-0 bg-[#0F172A] border-r border-slate-800 flex flex-col py-6 px-4 text-slate-300">
        <div className="mb-10 px-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-primary/20">
              C
            </div>
            <div>
              <span className="text-headline-sm font-bold text-white tracking-tight">Employer Hub</span>
              <p className="text-xs text-slate-400 font-semibold">Manage your hiring</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setCurrentView('post-job'))}
            className="w-full bg-primary hover:bg-primary/90 text-white font-label-md text-label-md py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 font-bold cursor-pointer transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>Post New Vacancy</span>
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <a onClick={() => dispatch(setCurrentView('employer-jobs'))} className="text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer">
            <Briefcase size={18} />
            <span className="font-label-md text-sm font-semibold">Overview</span>
          </a>
          <a onClick={() => dispatch(setCurrentView('employer-jobs'))} className="text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer">
            <Briefcase size={18} />
            <span className="font-label-md text-sm font-semibold">My Jobs</span>
          </a>
          <a onClick={() => { dispatch(setSelectedJobId(null)); dispatch(setCurrentView('employer-applicants')); }} className="text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer">
            <Users size={18} />
            <span className="font-label-md text-sm font-semibold">Applicants</span>
          </a>
          <a className="text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer">
            <Settings size={18} />
            <span className="font-label-md text-sm font-semibold">Settings</span>
          </a>
        </nav>

        <div className="mt-auto space-y-1 border-t border-slate-800 pt-4">
          <a className="text-slate-400 hover:text-white hover:bg-white/5 transition-all px-4 py-2.5 flex items-center gap-3 rounded-lg cursor-pointer text-xs font-semibold">
            <HelpCircle size={16} />
            <span>Help Center</span>
          </a>
          <a onClick={() => dispatch(setCurrentView('jobs'))} className="text-slate-400 hover:text-white hover:bg-white/5 transition-all px-4 py-2.5 flex items-center gap-3 rounded-lg cursor-pointer text-xs font-semibold text-error hover:text-error hover:bg-error-container/10">
            <LogOut size={16} />
            <span>Sign Out</span>
          </a>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 min-h-screen bg-background">
        
        {/* Top Sticky Header */}
        <header className="sticky top-0 bg-white/90 backdrop-blur-md z-30 border-b border-outline-variant h-16 flex items-center px-margin-desktop shadow-sm">
          <div className="max-w-[1280px] w-full mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-secondary font-label-md text-sm font-semibold">Jobs</span>
              <ChevronRight size={14} className="text-outline" />
              <span className="text-primary font-label-md text-sm font-bold">Post a New Job</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => dispatch(setCurrentView('jobs'))}
                className="text-on-surface-variant font-label-md text-sm font-semibold hover:text-primary transition-colors cursor-pointer"
              >
                Cancel / Draft
              </button>
              <button
                onClick={handlePublish}
                className="bg-primary hover:bg-primary-container text-on-primary px-6 py-2 rounded-xl font-label-md text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Publish Job
              </button>
            </div>
          </div>
        </header>

        {/* Form container */}
        <div className="max-w-[900px] mx-auto px-margin-desktop py-10">
          
          {/* Header Title Section */}
          <div className="mb-10">
            <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2 tracking-tight">Create a Job Posting</h1>
            <p className="text-body-md text-on-surface-variant">Fill in the details below to find your next great hire.</p>
          </div>

          <div className="space-y-8">
            
            {/* Section 1: Job Basics */}
            <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm space-y-6">
              <div className="flex items-start gap-4 pb-4 border-b border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                  <Info size={20} />
                </div>
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface tracking-tight">Job Basics</h2>
                  <p className="text-body-sm text-on-surface-variant">The fundamental details of the position.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Title */}
                <div className="col-span-2">
                  <label className="block text-label-sm text-secondary mb-2 font-semibold">Job Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Product Designer"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-on-surface"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-label-sm text-secondary mb-2 font-semibold">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-on-surface"
                  />
                </div>

                {/* Company Logo Upload */}
                <div>
                  <label className="block text-label-sm text-secondary mb-2 font-semibold">Company Logo <span className="text-outline font-normal">(optional)</span></label>
                  <div className="flex items-center gap-4">
                    {companyLogo ? (
                      <img src={companyLogo} alt="logo preview" className="w-12 h-12 rounded-xl object-cover border border-outline-variant shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-center text-outline shrink-0">
                        <Plus size={20} />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm text-outline hover:border-primary transition-all text-center">
                        {logoUploading ? 'Uploading...' : companyLogo ? 'Change image' : 'Choose image'}
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        disabled={logoUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setLogoUploading(true);
                          try {
                            const res = await uploadCompanyLogo(file);
                            setCompanyLogo(res.data.url);
                          } catch {
                            alert('Failed to upload logo. Please try again.');
                          } finally {
                            setLogoUploading(false);
                          }
                        }}
                      />
                    </label>
                    {companyLogo && (
                      <button type="button" onClick={() => setCompanyLogo('')} className="text-outline hover:text-error transition-colors cursor-pointer">
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-label-sm text-secondary mb-2 font-semibold">Job Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-on-surface appearance-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-label-sm text-secondary mb-2 font-semibold">Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State or Remote"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-on-surface"
                  />
                </div>

                {/* Salary Ranges */}
                <div className="col-span-2 grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-label-sm text-secondary mb-2 font-semibold">Salary Range (Min/Year)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline font-body-md">$</span>
                      <input
                        type="number"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(parseInt(e.target.value) || 0)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-on-surface"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-label-sm text-secondary mb-2 font-semibold">Salary Range (Max/Year)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline font-body-md">$</span>
                      <input
                        type="number"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(parseInt(e.target.value) || 0)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-on-surface"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Job Description */}
            <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm space-y-6">
              <div className="flex items-start gap-4 pb-4 border-b border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface tracking-tight">Job Description</h2>
                  <p className="text-body-sm text-on-surface-variant">Describe the role, responsibilities, and team culture.</p>
                </div>
              </div>

              <div className="border border-outline-variant rounded-xl overflow-hidden">
                <div className="bg-surface-container-low border-b border-outline-variant p-2 flex gap-1">
                  <button type="button" className="p-2 hover:bg-surface-container-high rounded transition-colors text-xs font-bold font-sans">B</button>
                  <button type="button" className="p-2 hover:bg-surface-container-high rounded transition-colors italic font-serif">I</button>
                  <button type="button" className="p-2 hover:bg-surface-container-high rounded transition-colors text-xs font-bold">List</button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about the ideal candidate and the day-to-day tasks..."
                  className="w-full h-64 bg-surface-container-lowest border-none p-4 focus:outline-none focus:ring-0 outline-none font-body-md text-on-surface resize-none placeholder:text-outline-variant"
                />
              </div>
            </section>

            {/* Section 3: Requirements & Benefits */}
            <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm space-y-6">
              <div className="flex items-start gap-4 pb-4 border-b border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface tracking-tight">Requirements & Benefits</h2>
                  <p className="text-body-sm text-on-surface-variant">Specific skills needed and what you offer in return.</p>
                </div>
              </div>

              <div className="space-y-6">
                
                {/* Required Skills tags */}
                <div>
                  <label className="block text-label-sm text-secondary mb-2 font-semibold">Required Skills Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-error text-outline transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  {/* Skill adding form row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      placeholder="Add a skill (e.g. React, Go, Kotlin)..."
                      className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none font-body-sm text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newSkillInput.trim()) {
                            setSkills([...skills, newSkillInput.trim()]);
                            setNewSkillInput('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        if (newSkillInput.trim()) {
                          setSkills([...skills, newSkillInput.trim()]);
                          setNewSkillInput('');
                        }
                      }}
                      className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-5 py-2.5 rounded-xl font-label-md text-sm font-semibold transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Perks Checklist checkboxes */}
                <div>
                  <label className="block text-label-sm text-secondary mb-2 font-semibold">Company Perks</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {['Health Insurance', 'Remote Work', 'Paid Time Off', '401(k) Matching', 'Learning Budget'].map((perk) => (
                      <label
                        key={perk}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors ${
                          perks.includes(perk) ? 'border-primary bg-primary-container/5' : 'border-outline-variant'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={perks.includes(perk)}
                          onChange={() => handleTogglePerk(perk)}
                          className="w-4 h-4 text-primary border-outline rounded cursor-pointer"
                        />
                        <span className="text-body-sm text-on-surface text-sm font-medium">{perk}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Publishing Settings */}
            <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm space-y-6 mb-16">
              <div className="flex items-start gap-4 pb-4 border-b border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                  <Settings size={20} />
                </div>
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface tracking-tight">Publishing Settings</h2>
                  <p className="text-body-sm text-on-surface-variant">Control how and when this job is seen.</p>
                </div>
              </div>

              <div className="space-y-6">
                
                {/* Accepting Apps toggler */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-label-md text-on-surface font-semibold text-sm">Accepting Applications</h4>
                    <p className="text-xs text-outline leading-relaxed">Immediately start receiving applications upon publishing.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAcceptingApps(!acceptingApps)}
                    className="text-primary hover:opacity-90 cursor-pointer"
                  >
                    {acceptingApps ? <ToggleRight size={44} /> : <ToggleLeft size={44} className="text-outline" />}
                  </button>
                </div>

                {/* Public Visibility toggler */}
                <div className="flex items-center justify-between py-2 border-t border-outline-variant/40">
                  <div>
                    <h4 className="font-label-md text-on-surface font-semibold text-sm">Public Visibility</h4>
                    <p className="text-xs text-outline leading-relaxed">Show this job in public search results and similar suggestions.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPublicVis(!publicVis)}
                    className="text-primary hover:opacity-90 cursor-pointer"
                  >
                    {publicVis ? <ToggleRight size={44} /> : <ToggleLeft size={44} className="text-outline" />}
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
