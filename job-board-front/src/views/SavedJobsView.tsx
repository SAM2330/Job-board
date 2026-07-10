import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { markJobApplied, setJobs, setSavedJobIds, setSelectedJobId, setCurrentView } from '../store/careerSlice';
import { applyToJob, uploadResume } from '../api/applications';
import { getSavedJobs, removeSavedJob } from '../api/savedJobs';
import { mapBackendJob } from '../utils/mappers';
import { MapPin, DollarSign, Calendar, Trash2, Eye, Compass, Search, Filter } from 'lucide-react';
import ApplyModal from '../components/ApplyModal';
import SuccessModal from '../components/SuccessModal';

export default function SavedJobsView() {
  const dispatch = useDispatch();
  const { jobs, appliedJobIds } = useSelector((state: RootState) => state.career);
  const [localSearch, setLocalSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // For Apply Modal inside Saved List
  const [selectedApplyJobId, setSelectedApplyJobId] = useState<string | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  useEffect(() => {
    const loadSavedJobs = async () => {
      setIsLoading(true);
      try {
        const response = await getSavedJobs();
        const savedRows = response.data.savedJobs ?? [];
        const savedIds = savedRows
          .map((row: { jobs?: { id: string } | null }) => row.jobs?.id)
          .filter(Boolean);
        const mappedJobs = savedRows
          .map((row: { jobs?: Parameters<typeof mapBackendJob>[0] | null }) => row.jobs)
          .filter(Boolean)
          .map((job: Parameters<typeof mapBackendJob>[0]) =>
            mapBackendJob(job, {
              saved: true,
              applied: appliedJobIds.includes(job.id),
            })
          );
        dispatch(setSavedJobIds(savedIds));
        dispatch(setJobs(mappedJobs));
      } catch {
        dispatch(setSavedJobIds([]));
        dispatch(setJobs([]));
      } finally {
        setIsLoading(false);
      }
    };
    loadSavedJobs();
  }, [appliedJobIds, dispatch]);

  // Filter bookmarked/saved jobs
  const savedJobs = jobs.filter((j) => j.saved && (
    localSearch === '' ||
    j.title.toLowerCase().includes(localSearch.toLowerCase()) ||
    j.company.toLowerCase().includes(localSearch.toLowerCase())
  ));

  const handleViewJob = (jobId: string) => {
    dispatch(setSelectedJobId(jobId));
    dispatch(setCurrentView('job-details'));
  };

  const handleApplyClick = (jobId: string) => {
    setSelectedApplyJobId(jobId);
  };

  const handleApplySubmit = async (coverLetter: string, resumeFile: File) => {
    if (selectedApplyJobId) {
      try {
        const uploadResponse = await uploadResume(resumeFile);
        await applyToJob({
          job_id: selectedApplyJobId,
          cover_letter: coverLetter,
          resume_url: uploadResponse.data.url,
        });
        dispatch(markJobApplied(selectedApplyJobId));
        setSelectedApplyJobId(null);
        setIsSuccessOpen(true);
      } catch {
        alert('Could not submit your application. Please try again.');
      }
    }
  };

  const handleRemove = async (jobId: string) => {
    try {
      await removeSavedJob(jobId);
      dispatch(setSavedJobIds(savedJobs.filter((job) => job.id !== jobId).map((job) => job.id)));
      dispatch(setJobs(jobs.filter((job) => job.id !== jobId)));
    } catch {
      alert('Could not remove this saved job. Please try again.');
    }
  };

  const currentApplyJob = jobs.find((j) => j.id === selectedApplyJobId);

  return (
    <main className="pt-24 pb-12 max-w-[1280px] mx-auto px-margin-desktop min-h-screen">
      {/* Page Header */}
      <div className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Saved Jobs</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            You have <span className="font-bold text-primary">{savedJobs.length}</span> opportunities waiting for your application.
          </p>
        </div>

        {/* Local search bar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-sm text-sm"
              placeholder="Search saved keywords..."
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low transition-all font-label-md font-bold text-sm cursor-pointer whitespace-nowrap">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Bookmarks Grid List */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {savedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row gap-6"
            >
              {/* Company logo */}
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-center overflow-hidden p-1 bg-white">
                <img src={job.logoUrl} alt={job.company} className="w-full h-full object-contain" />
              </div>

              {/* Central Copy description */}
              <div className="flex-grow min-w-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
                  <h3
                    className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors cursor-pointer font-bold tracking-tight"
                    onClick={() => handleViewJob(job.id)}
                  >
                    {job.title}
                  </h3>
                  <span className="font-label-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded-full text-xs font-semibold select-none">
                    {job.type}
                  </span>
                </div>
                <p className="font-label-md text-primary mb-3 font-semibold">
                  {job.company} • {job.location}
                </p>

                {/* metadata */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-on-surface-variant text-xs sm:text-sm pt-2">
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={16} className="text-outline" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-outline" />
                    <span>Saved recently</span>
                  </div>
                </div>
              </div>

              {/* CTA and quick action sidebar */}
              <div className="flex flex-row md:flex-col justify-end items-center gap-3 border-t md:border-t-0 md:border-l border-outline-variant pt-4 md:pt-0 md:pl-6 shrink-0 min-w-[150px]">
                {job.applied ? (
                  <span className="w-full text-center py-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 select-none">
                    Applied
                  </span>
                ) : (
                  <button
                    onClick={() => handleApplyClick(job.id)}
                    className="flex-1 md:w-32 py-2.5 px-4 bg-primary text-on-primary font-label-md rounded-xl hover:opacity-95 active:scale-95 transition-all cursor-pointer font-bold text-sm shadow-sm"
                  >
                    Apply Now
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewJob(job.id)}
                    className="p-2.5 border border-outline-variant text-on-surface-variant rounded-xl hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleRemove(job.id)}
                    className="p-2.5 border border-outline-variant text-error rounded-xl hover:bg-error-container/20 transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant">
          <Compass className="text-outline-variant mb-4" size={48} />
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold tracking-tight">No saved jobs found</h2>
          <p className="font-body-md text-on-surface-variant max-w-md mx-auto mb-8 text-sm">
            Keep track of interesting opportunities you find by clicking the save bookmark icon. Your future career starts with a single bookmark.
          </p>
          <button
            onClick={() => dispatch(setCurrentView('jobs'))}
            className="px-8 py-3 bg-primary text-on-primary font-label-md rounded-xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer font-bold shadow-sm"
          >
            <Compass size={18} />
            <span>Explore Jobs</span>
          </button>
        </div>
      )}

      {/* Render Apply Modal if a job is clicked */}
      {currentApplyJob && (
        <ApplyModal
          job={currentApplyJob}
          isOpen={selectedApplyJobId !== null}
          onClose={() => setSelectedApplyJobId(null)}
          onSubmit={handleApplySubmit}
        />
      )}

      {/* Render Success modal */}
      {currentApplyJob && (
        <SuccessModal
          jobTitle={currentApplyJob.title}
          company={currentApplyJob.company}
          isOpen={isSuccessOpen}
          onGoToDashboard={() => {
            setIsSuccessOpen(false);
            dispatch(setCurrentView('dashboard'));
          }}
          onBrowseMore={() => {
            setIsSuccessOpen(false);
            dispatch(setCurrentView('jobs'));
          }}
        />
      )}
    </main>
  );
}
