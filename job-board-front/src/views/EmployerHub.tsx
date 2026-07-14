import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setApplicants, setCurrentView, setJobs, setSelectedJobId, updateApplicantStatus } from '../store/careerSlice';
import { updateApplicationStatus } from '../api/applications';
import { getEmployerJobs, getJobApplicants } from '../api/dashboard';
import { getPublicProfile } from '../api/auth';
import { mapBackendJob, mapEmployerApplicant } from '../utils/mappers';
import { Application } from '../types';
import {
  Users, Briefcase, Settings, HelpCircle, LogOut, Plus, ArrowLeft,
  ChevronDown, TrendingUp, FileText, FileSpreadsheet, CheckCircle, X,
  Mail, GraduationCap, Briefcase as BriefcaseIcon, Link as LinkIcon,
} from 'lucide-react';

export default function EmployerHub() {
  const dispatch = useDispatch();
  const { applicants, jobs, selectedJobId, currentUser } = useSelector((state: RootState) => state.career);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string | 'all'>(selectedJobId || 'all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [seekerProfile, setSeekerProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const handleViewApplicant = async (app: Application) => {
    setSelectedApplicant(app);
    setSeekerProfile(null);
    if (app.applicantUserId) {
      setProfileLoading(true);
      try {
        const res = await getPublicProfile(app.applicantUserId);
        setSeekerProfile(res.data.user);
      } catch {
        setSeekerProfile(null);
      } finally {
        setProfileLoading(false);
      }
    }
  };

  useEffect(() => {
    const loadEmployerApplicants = async () => {
      setIsLoading(true);
      try {
        const jobsResponse = await getEmployerJobs();
        const employerJobs = (jobsResponse.data ?? []).map((job: Parameters<typeof mapBackendJob>[0]) =>
          mapBackendJob(job)
        );
        dispatch(setJobs(employerJobs));

        const applicantGroups = await Promise.all(
          employerJobs.map(async (job) => {
            const response = await getJobApplicants(job.id);
            return (response.data.applicants ?? []).map((app: Parameters<typeof mapEmployerApplicant>[0]) =>
              mapEmployerApplicant(app, job.id, response.data.jobTitle || job.title)
            );
          })
        );
        dispatch(setApplicants(applicantGroups.flat()));
      } catch {
        dispatch(setJobs([]));
        dispatch(setApplicants([]));
      } finally {
        setIsLoading(false);
      }
    };
    loadEmployerApplicants();
  }, [dispatch]);

  const employerJobs = useMemo(() => jobs, [jobs]);

  // Find the currently filtered job title if any
  const selectedJobDetail = useMemo(() => {
    if (selectedJobFilter === 'all') return null;
    return jobs.find((j) => j.id === selectedJobFilter);
  }, [jobs, selectedJobFilter]);

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    let result = [...applicants];
    
    if (selectedJobFilter !== 'all') {
      result = result.filter((app) => app.jobId === selectedJobFilter);
    }
    
    if (statusFilter !== 'all') {
      result = result.filter((app) => app.status === statusFilter);
    }

    if (sortOrder === 'newest') {
      result = [...result];
    } else if (sortOrder === 'name') {
      result.sort((a, b) => a.applicantName.localeCompare(b.applicantName));
    }

    return result;
  }, [applicants, selectedJobFilter, statusFilter, sortOrder]);

  const handleStatusChange = async (applicationId: string, status: 'pending' | 'accepted' | 'rejected') => {
    try {
      await updateApplicationStatus({ application_id: applicationId, status });
      dispatch(updateApplicantStatus({ applicationId, status }));
    } catch {
      alert('Could not update the applicant status. Please try again.');
    }
  };

  const handleExport = () => {
    alert('Exporting applicants list... Downloading CSV spreadsheet.');
  };

  return (
    <div className="flex min-h-screen">
      {/* SideNavBar for Employer */}
      <aside className="w-64 shrink-0 bg-[#0F172A] border-r border-slate-800 flex flex-col py-6 px-4 text-slate-300">
        <div className="mb-10 px-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-primary/20">
              C
            </div>
            <div>
              <span className="text-headline-sm font-bold text-white tracking-tight">Employer Hub</span>
              <p className="text-xs text-slate-400 font-semibold">Manage your hiring</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <a
            onClick={() => {
              dispatch(setSelectedJobId(null));
              setSelectedJobFilter('all');
            }}
            className="bg-primary/15 text-blue-400 rounded-xl px-4 py-3 flex items-center gap-3 scale-98 transition-transform font-bold cursor-pointer"
          >
            <Briefcase size={18} />
            <span className="font-label-md text-sm">Overview</span>
          </a>
          <a
            onClick={() => dispatch(setCurrentView('employer-jobs'))}
            className="text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer"
          >
            <Briefcase size={18} />
            <span className="font-label-md text-sm font-semibold">My Jobs</span>
          </a>
          <a
            onClick={() => {
              dispatch(setSelectedJobId(null));
              setSelectedJobFilter('all');
            }}
            className="text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer"
          >
            <Users size={18} />
            <span className="font-label-md text-sm font-semibold">Applicants</span>
          </a>
          <a className="text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer">
            <Settings size={18} />
            <span className="font-label-md text-sm font-semibold">Settings</span>
          </a>
        </nav>

        <div className="mt-auto pt-6 space-y-2 border-t border-slate-800">
          <button
            onClick={() => dispatch(setCurrentView('post-job'))}
            className="w-full bg-primary hover:bg-primary/90 text-white font-label-md text-label-md py-3 rounded-xl flex items-center justify-center gap-2 mb-6 cursor-pointer font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Post New Vacancy</span>
          </button>
          <a className="text-slate-400 hover:text-white hover:bg-white/5 transition-all px-4 py-2.5 flex items-center gap-3 rounded-lg cursor-pointer text-xs font-semibold">
            <HelpCircle size={16} />
            <span>Help Center</span>
          </a>
          <a
            onClick={() => {
              dispatch(setCurrentView('jobs'));
            }}
            className="text-slate-400 hover:text-white hover:bg-white/5 transition-all px-4 py-2.5 flex items-center gap-3 rounded-lg cursor-pointer text-xs font-semibold"
          >
            <LogOut size={16} />
            <span>Exit Hub</span>
          </a>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 min-h-screen bg-background pb-12">
        {/* Header bar */}
        <header className="h-16 bg-white border-b border-outline-variant px-margin-desktop sticky top-0 z-30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(setCurrentView('employer-jobs'))}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">
              {selectedJobDetail ? `Applicants for ${selectedJobDetail.title}` : 'All Job Applicants'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-on-surface-variant hidden sm:inline">{currentUser?.name}</span>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-surface-container">
                {currentUser?.image ? (
                  <img
                    src={currentUser.image}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-sm bg-primary/10 text-primary">
                    {currentUser?.name?.substring(0, 2).toUpperCase() || 'EM'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="max-w-[1280px] mx-auto p-margin-desktop space-y-stack-lg">
          {/* Filters controls */}
          <section className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Job Post */}
              <div className="relative">
                <select
                  value={selectedJobFilter}
                  onChange={(e) => {
                    setSelectedJobFilter(e.target.value);
                    dispatch(setSelectedJobId(e.target.value === 'all' ? null : e.target.value));
                  }}
                  className="bg-white border border-outline-variant rounded-xl pl-4 pr-10 py-2.5 font-label-md text-sm text-on-surface focus:ring-2 focus:ring-primary focus:ring-opacity-20 outline-none cursor-pointer appearance-none min-w-[200px]"
                >
                  <option value="all">All Vacancies</option>
                  {employerJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({job.company})
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline" />
              </div>

              {/* Filter Status */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-white border border-outline-variant rounded-xl pl-4 pr-10 py-2.5 font-label-md text-sm text-on-surface focus:ring-2 focus:ring-primary focus:ring-opacity-20 outline-none cursor-pointer appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline" />
              </div>

              {/* Sort Order */}
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-white border border-outline-variant rounded-xl pl-4 pr-10 py-2.5 font-label-md text-sm text-on-surface focus:ring-2 focus:ring-primary focus:ring-opacity-20 outline-none cursor-pointer appearance-none"
                >
                  <option value="newest">Sort: Newest Applied</option>
                  <option value="name">Sort: Name A-Z</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline" />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-body-sm text-on-surface-variant font-semibold">
                Showing {filteredApplicants.length} Applicants
              </span>
            </div>
          </section>

          {/* Applicants Table list */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider text-xs font-bold">
                      Applicant
                    </th>
                    <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider text-xs font-bold">
                      Date Applied
                    </th>
                    <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider text-xs font-bold">
                      Status Change
                    </th>
                    <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider text-xs font-bold">
                      Documents
                    </th>
                    <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider text-xs font-bold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                        Loading applicants...
                      </td>
                    </tr>
                  ) : filteredApplicants.length > 0 ? (
                    filteredApplicants.map((app) => (
                      <tr key={app.id} className="hover:bg-surface-container-low/20 transition-all duration-150">
                        {/* Avatar & User Details */}
                        <td className="px-6 py-5">
                          <div
                            className="flex items-center gap-4 cursor-pointer group"
                            onClick={() => handleViewApplicant(app)}
                          >
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-outline-variant/35 flex items-center justify-center bg-primary/10">
                              {app.applicantImage ? (
                                <img src={app.applicantImage} alt={app.applicantName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-primary font-bold text-sm">
                                  {app.applicantName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-label-md text-on-surface font-semibold group-hover:text-primary transition-colors">{app.applicantName}</div>
                              <div className="font-body-sm text-outline text-xs">{app.applicantEmail}</div>
                            </div>
                          </div>
                        </td>

                        {/* Date Applied */}
                        <td className="px-6 py-5">
                          <div className="font-body-sm text-on-surface-variant text-sm">{app.dateApplied}</div>
                        </td>

                        {/* Status dropdown dropdown styling */}
                        <td className="px-6 py-5">
                          <div className="relative inline-block w-40">
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                              className={`appearance-none rounded-full px-4 py-1.5 pr-8 font-label-sm text-xs font-bold border-none focus:ring-0 cursor-pointer w-full text-center ${
                                app.status === 'accepted'
                                  ? 'status-accepted'
                                  : app.status === 'rejected'
                                  ? 'status-rejected'
                                  : 'status-pending'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-current" />
                          </div>
                        </td>

                        {/* Documents Links */}
                        <td className="px-6 py-5">
                          <div className="flex gap-3 text-xs font-bold text-primary items-center">
                            <a
                              href={`#resume-${app.id}`}
                              className="flex items-center gap-1 hover:underline cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                if (app.resumeUrl) {
                                  const a = document.createElement('a');
                                  a.href = app.resumeUrl;
                                  a.target = '_blank';
                                  a.rel = 'noopener noreferrer';
                                  a.click();
                                }
                              }}
                            >
                              <FileText size={14} />
                              <span>Resume</span>
                            </a>
                            <span className="text-outline-variant">|</span>
                            <a
                              href={`#cover-${app.id}`}
                              className="flex items-center gap-1 hover:underline cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                alert(`Applicant Cover Letter:\n\n"${app.coverLetter || 'No cover letter attached.'}"`);
                              }}
                            >
                              <FileText size={14} />
                              <span>Letter</span>
                            </a>
                          </div>
                        </td>

                        {/* Row action */}
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => handleViewApplicant(app)}
                            className="p-2 rounded-full hover:bg-surface-container text-outline hover:text-primary cursor-pointer transition-colors"
                            title="View Profile"
                          >
                            <CheckCircle size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                        No applicants found matching this status filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-low/20">
              <span className="text-body-sm text-on-surface-variant text-xs font-semibold">
                Showing 1 to {filteredApplicants.length} of {applicants.length} applicants
              </span>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border border-outline-variant rounded-lg font-label-md text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer">
                  Previous
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg font-label-md text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-sm">
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Bento Summary section / quick insights */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between gap-4">
              <div>
                <span className="text-xs text-outline uppercase font-extrabold tracking-wider">Total Applicants</span>
                <div className="text-display-lg font-display-lg text-primary font-bold mt-2">
                  {applicants.length}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                <TrendingUp size={16} />
                <span>+4 from yesterday</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between gap-4">
              <div>
                <span className="text-xs text-outline uppercase font-extrabold tracking-wider">Avg. Experience</span>
                <div className="text-display-lg font-display-lg text-on-surface font-bold mt-2">
                  6.2 <span className="text-headline-sm font-bold text-lg">years</span>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">Top keyword skill: React.js (92%)</p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-center">
              <button
                onClick={handleExport}
                className="w-full py-6 border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all text-on-surface-variant cursor-pointer hover:bg-primary-container/5"
              >
                <FileSpreadsheet className="text-outline group-hover:text-primary" size={32} />
                <span className="font-label-md text-sm font-bold">Export Applicants List</span>
                <span className="text-xs text-outline">Download CSV spreadsheet</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Seeker Profile Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <h2 className="font-bold text-on-surface text-lg">Applicant Profile</h2>
              <button onClick={() => setSelectedApplicant(null)} className="p-2 rounded-full hover:bg-surface-container cursor-pointer text-on-surface-variant">
                <X size={18} />
              </button>
            </div>

            {profileLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Avatar + name */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center bg-primary/10 shrink-0">
                    {selectedApplicant.applicantImage ? (
                      <img src={selectedApplicant.applicantImage} alt={selectedApplicant.applicantName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary font-bold text-xl">
                        {selectedApplicant.applicantName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-lg">{selectedApplicant.applicantName}</p>
                    <p className="text-sm text-outline flex items-center gap-1"><Mail size={13} />{selectedApplicant.applicantEmail}</p>
                  </div>
                </div>

                {seekerProfile?.bio && (
                  <div>
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">About</p>
                    <p className="text-sm text-on-surface-variant">{seekerProfile.bio}</p>
                  </div>
                )}

                {seekerProfile?.skills?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {seekerProfile.skills.map((s: string) => (
                        <span key={s} className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {seekerProfile?.education && (
                  <div className="flex items-start gap-2">
                    <GraduationCap size={16} className="text-outline mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-outline uppercase tracking-wider">Education</p>
                      <p className="text-sm text-on-surface">{seekerProfile.education}</p>
                    </div>
                  </div>
                )}

                {seekerProfile?.experience_summary && (
                  <div className="flex items-start gap-2">
                    <BriefcaseIcon size={16} className="text-outline mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-outline uppercase tracking-wider">Experience</p>
                      <p className="text-sm text-on-surface-variant">{seekerProfile.experience_summary}</p>
                    </div>
                  </div>
                )}

                {seekerProfile?.resume_url && (
                  <a href={seekerProfile.resume_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary text-sm font-semibold hover:underline">
                    <LinkIcon size={14} />
                    Portfolio / Resume Link
                  </a>
                )}

                {!seekerProfile && (
                  <p className="text-sm text-on-surface-variant text-center py-4">This applicant hasn't filled out their profile yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
