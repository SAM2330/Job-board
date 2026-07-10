import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  setSearchQuery,
  setSearchLocation,
  toggleJobType,
  setSalaryRange,
  setExperience,
  clearFilters,
  setCurrentView,
  setSelectedJobId,
  toggleSaveJob,
  setJobs,
  setAppliedJobIds,
  setSavedJobIds,
  setLoading,
} from '../store/careerSlice';
import { loadJobsWithFilters } from '../utils/jobHelpers';
import { saveJob, removeSavedJob } from '../api/savedJobs';
import { Search, MapPin, DollarSign, Bookmark, ArrowUpDown, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function JobsFeed() {
  const dispatch = useDispatch();
  const {
    jobs,
    searchQuery,
    searchLocation,
    selectedTypes,
    selectedSalaryRange,
    selectedExperience,
    currentUser,
    savedJobIds,
    appliedJobIds,
    isLoading,
  } = useSelector((state: RootState) => state.career);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const typeFilter = selectedTypes.length === 1 ? selectedTypes[0] : undefined;
      const result = await loadJobsWithFilters(
        {
          search: searchQuery || undefined,
          location: searchLocation || undefined,
          type: typeFilter,
          page,
        },
        savedJobIds,
        appliedJobIds
      );
      dispatch(setJobs(result.jobs));
      setTotalPages(result.totalPages);
    } catch {
      dispatch(setJobs([]));
    } finally {
      dispatch(setLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, searchQuery, searchLocation, selectedTypes, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(job.type);

      const matchesExperience =
        selectedExperience === '' || job.experience === selectedExperience;

      let matchesSalary = true;
      if (selectedSalaryRange) {
        if (selectedSalaryRange === '$50k - $80k') {
          matchesSalary = job.salaryMax <= 80000;
        } else if (selectedSalaryRange === '$80k - $120k') {
          matchesSalary = job.salaryMin >= 80000 && job.salaryMax <= 120000;
        } else if (selectedSalaryRange === '$120k - $180k') {
          matchesSalary = job.salaryMin >= 120000 && job.salaryMax <= 180000;
        } else if (selectedSalaryRange === '$180k+') {
          matchesSalary = job.salaryMax >= 180000;
        }
      }

      return matchesType && matchesExperience && matchesSalary;
    });
  }, [jobs, selectedTypes, selectedSalaryRange, selectedExperience]);

  const handleSaveToggle = async (jobId: string) => {
    if (!currentUser || currentUser.role !== 'seeker') {
      dispatch(setCurrentView('signin'));
      return;
    }
    const isSaved = savedJobIds.includes(jobId);
    dispatch(toggleSaveJob(jobId));
    try {
      if (isSaved) {
        await removeSavedJob(jobId);
      } else {
        await saveJob(jobId);
      }
    } catch (err: unknown) {
      dispatch(toggleSaveJob(jobId)); // revert on failure
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Unknown error';
      alert(`Could not update saved job: ${msg}`);
    }
  };

  const handleViewDetails = (jobId: string) => {
    dispatch(setSelectedJobId(jobId));
    dispatch(setCurrentView('job-details'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero/Search Section */}
      <section className="bg-white pt-24 pb-16 px-margin-desktop border-b border-outline-variant shadow-sm relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1280px] mx-auto text-center md:text-left relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-6 leading-tight tracking-tight">
            Find your dream job <br className="hidden md:block" /> in{' '}
            <span className="text-primary bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">technology & design.</span>
          </h1>
          <p className="text-base sm:text-lg text-on-surface-variant mb-8 max-w-2xl leading-relaxed">
            Connect with over 5,000+ top companies looking for talent like you. High-stakes networking made simple.
          </p>

          {/* Search Bar Container */}
          <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-outline-variant flex flex-col md:flex-row items-stretch gap-2 max-w-4xl">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-outline-variant">
              <Search className="text-primary shrink-0" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="w-full border-none focus:outline-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline"
                placeholder="Job title, keywords, or company"
              />
              {searchQuery && (
                <button onClick={() => dispatch(setSearchQuery(''))} className="text-outline hover:text-on-surface">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex-1 flex items-center gap-3 px-4 py-2">
              <MapPin className="text-primary shrink-0" size={20} />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => dispatch(setSearchLocation(e.target.value))}
                className="w-full border-none focus:outline-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline"
                placeholder="Location (e.g. Remote, San Francisco)"
              />
              {searchLocation && (
                <button onClick={() => dispatch(setSearchLocation(''))} className="text-outline hover:text-on-surface">
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setPage(1);
                fetchJobs();
              }}
              className="bg-primary hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all active:scale-95 shadow-md shadow-blue-500/10 shrink-0 cursor-pointer"
            >
              Search Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1280px] mx-auto px-margin-desktop py-12 flex flex-col md:flex-row gap-8">
        
        {/* Filter Sidebar */}
        <aside className="w-full md:w-64 shrink-0 bg-white border border-outline-variant p-6 rounded-2xl shadow-sm space-y-6 h-fit">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <Filter size={18} className="text-primary" />
              <span>Filters</span>
            </h2>
            <button
              onClick={() => dispatch(clearFilters())}
              className="text-primary font-semibold text-xs hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Job Type Checkboxes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Job Type
            </h3>
            <div className="space-y-2.5">
              {['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'].map((type) => (
                <label key={type} className="flex items-center gap-3 group cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => dispatch(toggleJobType(type))}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Salary Range Selector */}
          <div className="space-y-3 pt-4 border-t border-outline-variant">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Salary Range
            </h3>
            <select
              value={selectedSalaryRange}
              onChange={(e) => dispatch(setSalaryRange(e.target.value))}
              className="w-full rounded-xl border border-outline-variant bg-white p-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
            >
              <option value="$50k - $80k">$50k - $80k</option>
              <option value="$80k - $120k">$80k - $120k</option>
              <option value="$120k - $180k">$120k - $180k</option>
              <option value="$180k+">$180k+</option>
            </select>
          </div>
                
          {/* Experience level Radio buttons */}
          <div className="space-y-3 pt-4 border-t border-outline-variant">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Experience Level
            </h3>
            <div className="space-y-2.5">
              {['Entry Level', 'Mid-Senior', 'Director / Executive'].map((exp) => (
                <label key={exp} className="flex items-center gap-3 group cursor-pointer">
                  <input
                    type="radio"
                    name="experience-level"
                    checked={selectedExperience === exp}
                    onChange={() => dispatch(setExperience(exp))}
                    className="w-4 h-4 border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                    {exp}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Feed Content */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-on-surface-variant">
              Showing <span className="font-bold text-on-surface">{filteredJobs.length}</span> matching jobs
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant">Sort by:</span>
              <button className="flex items-center gap-1 text-xs text-on-surface hover:text-primary cursor-pointer font-bold">
                <span>Newest</span>
                <ArrowUpDown size={14} />
              </button>
            </div>
          </div>

          {/* Job Listings List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm job-card-hover flex flex-col md:flex-row gap-6 items-start"
                >
                  {/* Company Logo Image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-outline-variant shrink-0 flex items-center justify-center p-1">
                    <img src={job.logoUrl} alt={job.company} className="w-full h-full object-contain" />
                  </div>

                  {/* Content body */}
                  <div className="flex-1 space-y-1 w-full">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-on-surface tracking-tight hover:text-primary cursor-pointer transition-all" onClick={() => handleViewDetails(job.id)}>
                          {job.title}
                        </h3>
                        <p className="text-sm text-primary font-semibold">{job.company}</p>
                      </div>
                      <button
                        onClick={() => handleSaveToggle(job.id)}
                        className={`p-2.5 rounded-full hover:bg-surface-container transition-all cursor-pointer ${
                          job.saved ? 'text-primary fill-primary' : 'text-outline hover:text-primary'
                        }`}
                      >
                        <Bookmark size={20} className={job.saved ? 'fill-primary' : ''} />
                      </button>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-on-surface-variant">
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin size={15} className="text-outline" />
                        <span className="text-xs">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <DollarSign size={15} className="text-outline" />
                        <span className="text-xs">{job.salary}</span>
                      </div>
                      <span className="bg-primary-container text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {job.type}
                      </span>
                      {job.applied && (
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                          Applied
                        </span>
                      )}
                    </div>
                  </div>

                  {/* View details CTA button */}
                  <div className="w-full md:w-auto self-stretch md:self-center pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/40 flex justify-end">
                    <button
                      onClick={() => handleViewDetails(job.id)}
                      className="w-full md:w-auto border border-primary text-primary px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-blue-700 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-outline-variant p-8">
                <p className="font-headline-sm text-headline-sm text-on-surface mb-2">No jobs match your criteria</p>
                <p className="text-on-surface-variant max-w-md mx-auto mb-6">
                  Try clearing your search query or adjusting your sidebar filters to discover more tech and design opportunities.
                </p>
                <button
                  onClick={() => dispatch(clearFilters())}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md cursor-pointer hover:opacity-90"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 pt-10">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant hover:bg-surface-container-high transition-all cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft size={18} className="text-on-surface-variant" />
            </button>
            <span className="text-sm text-on-surface-variant font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant hover:bg-surface-container-high transition-all cursor-pointer disabled:opacity-40"
            >
              <ChevronRight size={18} className="text-on-surface-variant" />
            </button>
          </nav>
          )}
        </div>
      </div>
    </div>
  );
}
