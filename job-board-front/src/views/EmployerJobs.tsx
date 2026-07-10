import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setApplicants, setCurrentView, setJobs, setSelectedJobId } from '../store/careerSlice';
import { getEmployerJobs, getJobApplicants } from '../api/dashboard';
import { mapBackendJob, mapEmployerApplicant } from '../utils/mappers';
import {
  Briefcase,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  ArrowLeft,
  ChevronRight,
  MapPin,
  DollarSign,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export default function EmployerJobs() {
  const dispatch = useDispatch();
  const { jobs, applicants } = useSelector((state: RootState) => state.career);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadEmployerDashboard = async () => {
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
    loadEmployerDashboard();
  }, [dispatch]);

  const employerJobs = useMemo(() => jobs, [jobs]);

  // Calculate applicant count per job
  const getApplicantCount = (jobId: string) => {
    return applicants.filter((app) => app.jobId === jobId).length;
  };

  const handleSeeApplicants = (jobId: string) => {
    dispatch(setSelectedJobId(jobId));
    dispatch(setCurrentView('employer-applicants'));
  };

  const handleViewFeedPost = (jobId: string) => {
    dispatch(setSelectedJobId(jobId));
    dispatch(setCurrentView('job-details'));
  };

  return (
    <div className="flex min-h-screen bg-background">
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
            onClick={() => dispatch(setCurrentView('employer-applicants'))}
            className="text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer"
          >
            <Briefcase size={18} />
            <span className="font-label-md text-sm font-semibold">Overview</span>
          </a>
          <a className="bg-primary/15 text-blue-400 rounded-xl px-4 py-3 flex items-center gap-3 scale-98 transition-transform font-bold cursor-pointer">
            <Briefcase size={18} />
            <span className="font-label-md text-sm">My Jobs</span>
          </a>
          <a
            onClick={() => {
              dispatch(setSelectedJobId(null));
              dispatch(setCurrentView('employer-applicants'));
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
            onClick={() => dispatch(setCurrentView('jobs'))}
            className="text-slate-400 hover:text-white hover:bg-white/5 transition-all px-4 py-2.5 flex items-center gap-3 rounded-lg cursor-pointer text-xs font-semibold"
          >
            <LogOut size={16} />
            <span>Exit Hub</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen bg-background pb-12">
        {/* Header bar */}
        <header className="h-16 bg-white border-b border-outline-variant px-margin-desktop sticky top-0 z-30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(setCurrentView('employer-applicants'))}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">
              My Posted Jobs
            </h1>
          </div>
          <button
            onClick={() => dispatch(setCurrentView('post-job'))}
            className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            <span>Post Vacancy</span>
          </button>
        </header>

        {/* Content Wrapper */}
        <div className="max-w-[1280px] mx-auto p-margin-desktop space-y-6">
          
          {/* Quick stats panel */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-extrabold tracking-wider">Total Vacancies</span>
                <div className="text-3xl font-extrabold text-primary mt-2">
                  {employerJobs.length}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-semibold">Active hiring campaigns</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-extrabold tracking-wider">Total Applicants</span>
                <div className="text-3xl font-extrabold text-on-surface mt-2">
                  {employerJobs.reduce((acc, job) => acc + getApplicantCount(job.id), 0)}
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                <TrendingUp size={14} />
                <span>Steady response rate</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-extrabold tracking-wider">Verification Status</span>
                <div className="text-xl font-extrabold text-emerald-600 mt-2 flex items-center gap-1.5">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <span>Verified Recruiter</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-semibold">Current employer account</p>
            </div>
          </section>

          {/* Job Postings Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-on-surface">Manage Listings</h2>
              <span className="text-xs text-slate-500 font-semibold">
                {employerJobs.length} {employerJobs.length === 1 ? 'Job' : 'Jobs'} Found
              </span>
            </div>

            <div className="divide-y divide-outline-variant">
              {isLoading ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : employerJobs.length > 0 ? (
                employerJobs.map((job) => {
                  const applicantCount = getApplicantCount(job.id);
                  return (
                    <div key={job.id} className="p-6 hover:bg-slate-50/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-outline-variant shrink-0 flex items-center justify-center p-1">
                          <img src={job.logoUrl} alt={job.company} className="w-full h-full object-contain" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-on-surface tracking-tight">
                              {job.title}
                            </h3>
                            {job.isActive !== false ? (
                              <span
                                className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                              </span>
                            ) : (
                              <span
                                className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-300 flex items-center gap-1"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs font-medium">
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-slate-400" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign size={13} className="text-slate-400" />
                              {job.salary}
                            </span>
                            <span className="bg-primary-container text-primary px-2 py-0.2 rounded-md font-bold text-[10px]">
                              {job.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Applicants Indicator Card */}
                      <div className="flex items-center gap-8 self-stretch lg:self-center justify-between lg:justify-end">
                        <div className="text-left lg:text-right">
                          <div className="text-xs text-slate-400 uppercase font-bold">Applicants</div>
                          <button 
                            onClick={() => handleSeeApplicants(job.id)}
                            className="text-lg font-extrabold text-primary hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>{applicantCount}</span>
                            <span className="text-xs text-slate-500 font-semibold">applied</span>
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleSeeApplicants(job.id)}
                            className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                          >
                            <Users size={14} />
                            <span>See Applicants</span>
                          </button>
                          
                          <button
                            onClick={() => handleViewFeedPost(job.id)}
                            className="border border-outline-variant hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink size={14} />
                            <span>View Feed Post</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center">
                  <Briefcase size={40} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-500">You haven't posted any jobs yet.</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Post a new job vacancy to start receiving applicants.</p>
                  <button
                    onClick={() => dispatch(setCurrentView('post-job'))}
                    className="bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    Post Your First Job
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
