import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { markJobApplied, setCurrentView, setJobs, setSavedJobIds, setSelectedJobId, toggleSaveJob } from '../store/careerSlice';
import { applyToJob, uploadResume } from '../api/applications';
import { getJob } from '../api/jobs';
import { removeSavedJob, saveJob } from '../api/savedJobs';
import { mapBackendJob } from '../utils/mappers';
import { MapPin, Calendar, Heart, ShieldCheck, CheckCircle2, Bookmark, ExternalLink, ChevronLeft } from 'lucide-react';
import ApplyModal from '../components/ApplyModal';
import SuccessModal from '../components/SuccessModal';

export default function JobDetails() {
  const dispatch = useDispatch();
  const { jobs, selectedJobId, currentUser, savedJobIds, appliedJobIds } = useSelector((state: RootState) => state.career);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentJob = jobs.find((j) => j.id === selectedJobId) || null;
  const isEmployer = currentUser?.role === 'employer';

  useEffect(() => {
    const loadSelectedJob = async () => {
      if (!selectedJobId || currentJob) return;
      try {
        const response = await getJob(selectedJobId);
        const job = mapBackendJob(response.data, {
          saved: savedJobIds.includes(response.data.id),
          applied: appliedJobIds.includes(response.data.id),
        });
        dispatch(setJobs([job, ...jobs.filter((existing) => existing.id !== job.id)]));
      } catch {
        dispatch(setCurrentView('jobs'));
      }
    };
    loadSelectedJob();
  }, [appliedJobIds, currentJob, dispatch, jobs, savedJobIds, selectedJobId]);

  const handleApplySubmit = async (coverLetter: string, resumeFile: File) => {
    if (!currentJob) return;
    setIsSubmitting(true);
    try {
      const uploadResponse = await uploadResume(resumeFile);
      await applyToJob({
        job_id: currentJob.id,
        cover_letter: coverLetter,
        resume_url: uploadResponse.data.url,
      });
      dispatch(markJobApplied(currentJob.id));
      setIsApplyOpen(false);
      setIsSuccessOpen(true);
    } catch {
      alert('Could not submit your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveToggle = useCallback(async () => {
    if (!currentJob) return;
    if (!currentUser || currentUser.role !== 'seeker') {
      dispatch(setCurrentView('signin'));
      return;
    }
    const isSaved = savedJobIds.includes(currentJob.id);
    try {
      if (isSaved) {
        await removeSavedJob(currentJob.id);
        dispatch(setSavedJobIds(savedJobIds.filter((id) => id !== currentJob.id)));
      } else {
        await saveJob(currentJob.id);
        dispatch(setSavedJobIds([...savedJobIds, currentJob.id]));
      }
      dispatch(toggleSaveJob(currentJob.id));
    } catch {
      alert('Could not update saved job. Please try again.');
    }
  }, [currentJob, currentUser, dispatch, savedJobIds]);

  const handleSimilarJobClick = (jobId: string) => {
    dispatch(setSelectedJobId(jobId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find other jobs as similar jobs
  if (!currentJob) {
    return (
      <div className="pt-24 pb-20 max-w-[1280px] mx-auto px-margin-desktop">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const similarJobs = jobs.filter((j) => j.id !== currentJob.id).slice(0, 3);

  return (
    <div className="pt-20 max-w-[1280px] mx-auto px-margin-desktop pb-20">
      
      {/* Back to Jobs button */}
      <button
        onClick={() => dispatch(setCurrentView('jobs'))}
        className="flex items-center gap-1 text-primary hover:underline mb-6 cursor-pointer font-semibold"
      >
        <ChevronLeft size={16} />
        <span>Back to Jobs Feed</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column: Job Info Cards & Actions */}
        <aside className="lg:col-span-4 flex flex-col gap-stack-lg">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant sticky top-24">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center border border-outline-variant overflow-hidden shrink-0 p-1">
                <img src={currentJob.logoUrl} alt={currentJob.company} className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-headline-sm text-headline-sm text-on-surface leading-tight tracking-tight">
                  {currentJob.title}
                </h1>
                <p className="font-body-md text-body-md text-primary font-bold">{currentJob.company}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                    <MapPin size={12} />
                    {currentJob.location}
                  </span>
                  <span className="bg-surface-container text-on-surface-variant px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                    <Calendar size={12} />
                    {currentJob.postedDaysAgo === 0 ? 'Today' : `${currentJob.postedDaysAgo} days ago`}
                  </span>
                </div>
              </div>
            </div>

            {/* Application CTAs */}
            <div className="flex flex-col gap-3 mt-6">
              {isEmployer ? (
                <div className="w-full bg-slate-50 text-slate-600 border border-slate-200 py-3.5 px-4 rounded-xl text-xs font-semibold text-center select-none">
                  Recruiter View: You cannot apply to jobs.
                </div>
              ) : (
                <>
                  {currentJob.applied ? (
                    <div className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200 py-3 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 font-bold select-none">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      <span>Application Submitted</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsApplyOpen(true)}
                      className="w-full bg-primary text-on-primary py-3 rounded-xl font-label-md text-label-md hover:opacity-95 active:scale-95 transition-all shadow-sm font-semibold cursor-pointer text-center"
                    >
                      Apply Now
                    </button>
                  )}

                  <button
                    onClick={handleSaveToggle}
                    className={`w-full py-3 rounded-xl font-label-md text-label-md border flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                      currentJob.saved
                        ? 'bg-primary/5 text-primary border-primary'
                        : 'bg-surface-container-lowest text-primary border-primary hover:bg-primary/5'
                    }`}
                  >
                    <Bookmark size={18} className={currentJob.saved ? 'fill-primary' : ''} />
                    <span>{currentJob.saved ? 'Job Bookmarked' : 'Save Job'}</span>
                  </button>
                </>
              )}
            </div>

            {/* Quick Details List */}
            <div className="mt-6 pt-6 border-t border-outline-variant">
              <h3 className="font-label-md text-label-md text-on-surface mb-4 uppercase tracking-wider text-xs font-bold">
                Job Details
              </h3>
              <dl className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <dt className="text-xs text-outline font-semibold uppercase">Salary Range</dt>
                  <dd className="text-body-sm font-bold text-on-surface">{currentJob.salary}</dd>
                </div>
                <div>
                  <dt className="text-xs text-outline font-semibold uppercase">Job Type</dt>
                  <dd className="text-body-sm font-bold text-on-surface">{currentJob.type}</dd>
                </div>
                <div>
                  <dt className="text-xs text-outline font-semibold uppercase">Experience</dt>
                  <dd className="text-body-sm font-bold text-on-surface">{currentJob.experience}</dd>
                </div>
                <div>
                  <dt className="text-xs text-outline font-semibold uppercase">Workplace</dt>
                  <dd className="text-body-sm font-bold text-on-surface">{currentJob.isRemote ? 'Remote' : 'On-site'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>

        {/* Center Content Column: Full Description */}
        <article className="lg:col-span-5 flex flex-col gap-stack-lg">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant">
            <section className="space-y-6">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3 tracking-tight">
                  Job Description
                </h2>
                <div className="font-body-md text-body-md text-on-surface-variant space-y-4 leading-relaxed whitespace-pre-line">
                  {currentJob.description}
                </div>
              </div>

              {/* Requirements Bullet List */}
              <div className="pt-6 border-t border-outline-variant">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4 tracking-tight">
                  Requirements
                </h2>
                <ul className="font-body-md text-body-md text-on-surface-variant space-y-3 pl-0">
                  {currentJob.requirements.map((req, index) => (
                    <li key={index} className="flex gap-3 items-start">
                      <CheckCircle2 size={18} className="text-primary shrink-0 mt-1" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits Bento Section */}
              <div className="pt-6 border-t border-outline-variant">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4 tracking-tight">
                  Benefits & Perks
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentJob.benefits.map((benefit, index) => (
                    <div key={index} className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3 border border-outline-variant/30">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                        <ShieldCheck size={18} />
                      </div>
                      <span className="text-body-sm font-bold text-on-surface">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </article>

        {/* Right Column: Company Overview & Similar Jobs list */}
        <aside className="lg:col-span-3 flex flex-col gap-stack-lg">
          
          {/* Company Card */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant">
            <h3 className="font-label-md text-label-md text-on-surface mb-4 uppercase tracking-wider text-xs font-bold">
              About {currentJob.company}
            </h3>
            
            {currentJob.companyImage && (
              <div className="w-full h-32 rounded-xl mb-4 overflow-hidden relative border border-outline-variant/30">
                <img src={currentJob.companyImage} alt={currentJob.company} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            )}

            <p className="text-body-sm text-on-surface-variant leading-relaxed mb-4">
              {currentJob.companyDescription || `${currentJob.company} is building the future of technology and enterprise design, supported by top-tier VCs and composed of distributed expert talent.`}
            </p>

            <button className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1 font-bold cursor-pointer">
              <span>View Profile</span>
              <ExternalLink size={14} />
            </button>
          </div>

          {/* Similar Jobs sidebar Widget */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant">
            <h3 className="font-label-md text-label-md text-on-surface mb-4 uppercase tracking-wider text-xs font-bold">
              Similar Jobs
            </h3>
            <div className="flex flex-col gap-4 divide-y divide-outline-variant/30">
              {similarJobs.map((simJob, idx) => (
                <div
                  key={simJob.id}
                  onClick={() => handleSimilarJobClick(simJob.id)}
                  className={`group block cursor-pointer transition-colors ${idx > 0 ? 'pt-4' : ''}`}
                >
                  <p className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                    {simJob.title}
                  </p>
                  <p className="text-xs text-outline mt-1 font-semibold">
                    {simJob.company} • {simJob.salary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Render Apply Modal */}
      <ApplyModal
        job={currentJob}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSubmit={handleApplySubmit}
      />

      {/* Render Success Modal */}
      <SuccessModal
        jobTitle={currentJob.title}
        company={currentJob.company}
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
    </div>
  );
}
