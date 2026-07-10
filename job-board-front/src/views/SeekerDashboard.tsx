import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setApplicants, setCurrentView, setJobs, setSavedJobIds, setSelectedJobId } from '../store/careerSlice';
import { getMyApplications } from '../api/applications';
import { getSavedJobs } from '../api/savedJobs';
import { mapBackendJob, mapMyApplication } from '../utils/mappers';
import { CheckCircle2, AlertCircle, Clock, XCircle, ChevronRight, HelpCircle, Bookmark, Compass } from 'lucide-react';

export default function SeekerDashboard() {
  const dispatch = useDispatch();
  const { applicants, currentUser, jobs, appliedJobIds } = useSelector((state: RootState) => state.career);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const [applicationsResponse, savedResponse] = await Promise.all([
          getMyApplications(),
          getSavedJobs(),
        ]);
        const user = { name: currentUser.name, email: currentUser.email, image: currentUser.image };
        const applications = (applicationsResponse.data.applications ?? []).map(
          (app: Parameters<typeof mapMyApplication>[0]) => mapMyApplication(app, user)
        );
        const savedRows = savedResponse.data.savedJobs ?? [];
        const savedIds = savedRows
          .map((row: { jobs?: { id: string } | null }) => row.jobs?.id)
          .filter(Boolean);
        const savedJobs = savedRows
          .map((row: { jobs?: Parameters<typeof mapBackendJob>[0] | null }) => row.jobs)
          .filter(Boolean)
          .map((job: Parameters<typeof mapBackendJob>[0]) =>
            mapBackendJob(job, {
              saved: true,
              applied: appliedJobIds.includes(job.id),
            })
          );
        dispatch(setApplicants(applications));
        dispatch(setSavedJobIds(savedIds));
        dispatch(setJobs(savedJobs));
      } catch {
        dispatch(setApplicants([]));
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, [appliedJobIds, currentUser, dispatch]);

  const userApplications = applicants;

  const savedJobs = jobs.filter((j) => j.saved);

  // Calculate status counts
  const acceptedCount = userApplications.filter((a) => a.status === 'accepted').length;
  const pendingCount = userApplications.filter((a) => a.status === 'pending').length;
  const totalCount = userApplications.length;

  const handleViewApplication = (jobId: string) => {
    dispatch(setSelectedJobId(jobId));
    dispatch(setCurrentView('job-details'));
  };

  return (
    <div className="pt-24 pb-12 max-w-[1280px] mx-auto px-margin-desktop">
      {/* Header Section */}
      <header className="mb-stack-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">My Applications</h1>
            <p className="font-body-md text-on-surface-variant">
              You have <span className="font-bold text-primary">{totalCount}</span> active job applications across various industries.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="font-label-sm text-outline uppercase tracking-wider text-[10px] font-bold">Accepted</p>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  {acceptedCount.toString().padStart(2, '0')}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="font-label-sm text-outline uppercase tracking-wider text-[10px] font-bold">Pending</p>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  {pendingCount.toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Main Applications Table */}
        <div className="lg:col-span-8">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30">
              <h2 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Recent Activity</h2>
              <button className="text-primary font-label-md hover:underline flex items-center gap-1 font-bold cursor-pointer text-sm">
                <span>Filter by Status</span>
              </button>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-on-surface-variant">
                Loading applications...
              </div>
            ) : userApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low/50 border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-4 font-label-md text-outline text-xs uppercase font-bold">
                        Job Title & Company
                      </th>
                      <th className="px-6 py-4 font-label-md text-outline text-xs uppercase font-bold">Date Applied</th>
                      <th className="px-6 py-4 font-label-md text-outline text-xs uppercase font-bold">Status</th>
                      <th className="px-6 py-4 font-label-md text-outline text-xs uppercase font-bold text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {userApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-surface-container-low/20 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                              {app.company.charAt(0)}
                            </div>
                            <div>
                              <p
                                className="font-label-md text-on-surface group-hover:text-primary transition-colors cursor-pointer font-semibold"
                                onClick={() => handleViewApplication(app.jobId)}
                              >
                                {app.jobTitle}
                              </p>
                              <p className="font-body-sm text-outline text-xs">{app.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-body-sm text-on-surface-variant text-sm">
                          {app.dateApplied}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              app.status === 'accepted'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : app.status === 'rejected'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => handleViewApplication(app.jobId)}
                            className="text-primary font-label-md hover:text-primary-container transition-colors cursor-pointer font-bold text-sm"
                          >
                            View Job
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-on-surface-variant">
                <Compass className="mx-auto text-outline-variant mb-3" size={48} />
                <p className="font-headline-sm text-on-surface mb-1">No applications yet</p>
                <p className="text-sm max-w-sm mx-auto mb-6">
                  You haven't submitted any applications. Search and apply for tech and design roles to see them tracked here!
                </p>
                <button
                  onClick={() => dispatch(setCurrentView('jobs'))}
                  className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Explore Jobs
                </button>
              </div>
            )}

            {userApplications.length > 0 && (
              <div className="px-6 py-4 bg-surface-container-low/30 border-t border-outline-variant flex justify-center">
                <button className="font-label-md text-primary flex items-center gap-2 hover:opacity-80 cursor-pointer font-bold text-sm">
                  <span>Load More Applications</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <aside className="lg:col-span-4 space-y-gutter">
          {/* Profile strength widget */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
            <h3 className="font-headline-sm text-headline-sm mb-4 text-on-surface tracking-tight">Profile Strength</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-bold inline-block py-1 px-2.5 uppercase rounded-full text-primary bg-primary/10">
                    Intermediate
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-primary">75%</span>
                </div>
              </div>
              <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-surface-container">
                <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500" style={{ width: '75%' }} />
              </div>
            </div>
            <p className="font-body-sm text-on-surface-variant text-sm leading-normal mb-4">
              Complete your portfolio and add a professional resume to increase visibility to top recruiters by{' '}
              <span className="font-bold text-on-surface">3x</span>.
            </p>
            <button className="w-full py-3 px-4 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/95 transition-all active:scale-95 cursor-pointer font-semibold shadow-sm text-center">
              Finish Profile
            </button>
          </section>

          {/* Saved jobs brief widget */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low/30">
              <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Saved Jobs</h3>
            </div>
            <div className="p-2 divide-y divide-outline-variant/30">
              {savedJobs.length > 0 ? (
                savedJobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    onClick={() => handleViewApplication(job.id)}
                    className="p-4 hover:bg-surface-container-low/30 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-label-md text-on-surface group-hover:text-primary transition-colors font-semibold">
                          {job.title}
                        </h4>
                        <p className="text-xs text-outline font-semibold mt-1">
                          {job.company} • {job.location}
                        </p>
                      </div>
                      <Bookmark size={16} className="text-primary fill-primary shrink-0" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-on-surface-variant">
                  No saved jobs yet. Bookmark jobs to see them here!
                </div>
              )}
            </div>
            <button
              onClick={() => dispatch(setCurrentView('saved-jobs'))}
              className="block w-full text-center py-4 text-primary font-label-md border-t border-outline-variant hover:bg-surface-container-low/40 transition-colors font-bold text-sm cursor-pointer"
            >
              View All Saved Jobs ({savedJobs.length})
            </button>
          </section>

          {/* Coach help banner */}
          <div className="relative h-48 rounded-2xl overflow-hidden shadow-sm group">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMHEajmVy9SzUaMv3ddjk7eAu3nBz1LeemzHv18g5IJC1vyjTjm-P0TG9slOiYifdmY-BmfopdwF1nsqQEw09Nd6Ve6ts1GvqqDrkpC4YD5zofzTrKhvj0DC8cy9RsbL4lVQoKPoP60W0jJU9Wb06Vtv22XI5o-fxcBFTJsz25jtmByOVppfrT3ofUInCAr1y_eFMZPWq5kFMvrw3j1tYJ81gIxKR2xitB0w_CvoDEU2qQgX6v-f0W')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h4 className="font-headline-sm text-sm font-bold mb-1 flex items-center gap-1.5">
                <HelpCircle size={16} />
                <span>Need Interview Prep?</span>
              </h4>
              <p className="text-on-primary-container text-xs mb-3 font-medium opacity-90">
                Our AI-powered coach can help you nail your next meeting.
              </p>
              <button className="bg-white text-primary px-4 py-2 rounded-lg font-label-md text-xs font-bold hover:bg-on-primary transition-colors cursor-pointer shadow-sm">
                Try CareerCoach
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
