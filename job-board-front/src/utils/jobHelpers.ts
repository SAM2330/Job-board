import { getJobs as fetchJobs } from '../api/jobs';
import { getMyApplications } from '../api/applications';
import { getSavedJobs } from '../api/savedJobs';
import { mapBackendJob } from './mappers';
import { Job } from '../types';

export async function loadJobsWithUserState(isAuthenticated: boolean): Promise<{
  jobs: Job[];
  appliedJobIds: string[];
  savedJobIds: string[];
}> {
  const params: Record<string, string | number> = { limit: 50 };
  const jobsResponse = await fetchJobs(params);
  const backendJobs = jobsResponse.data.jobs ?? jobsResponse.data ?? [];

  let appliedJobIds: string[] = [];
  let savedJobIds: string[] = [];

  if (isAuthenticated) {
    try {
      const [appsRes, savedRes] = await Promise.all([
        getMyApplications().catch(() => ({ data: { applications: [] } })),
        getSavedJobs().catch(() => ({ data: { savedJobs: [] } })),
      ]);
      appliedJobIds = (appsRes.data.applications ?? []).map(
        (a: { jobs?: { id: string } | null }) => a.jobs?.id
      ).filter(Boolean);
      savedJobIds = (savedRes.data.savedJobs ?? []).map(
        (s: { jobs?: { id: string } | null }) => s.jobs?.id
      ).filter(Boolean);
    } catch {
      // seeker-only endpoints may fail for employers
    }
  }

  const jobs = backendJobs.map((job: Parameters<typeof mapBackendJob>[0]) =>
    mapBackendJob(job, {
      saved: savedJobIds.includes(job.id),
      applied: appliedJobIds.includes(job.id),
    })
  );

  return { jobs, appliedJobIds, savedJobIds };
}

export async function loadJobsWithFilters(
  filters: {
    search?: string;
    location?: string;
    type?: string;
    page?: number;
  },
  savedJobIds: string[] = [],
  appliedJobIds: string[] = []
): Promise<{ jobs: Job[]; totalJobs: number; totalPages: number }> {
  const response = await fetchJobs({ limit: 20, ...filters });
  const backendJobs = response.data.jobs ?? [];
  const jobs = backendJobs.map((job: Parameters<typeof mapBackendJob>[0]) =>
    mapBackendJob(job, {
      saved: savedJobIds.includes(job.id),
      applied: appliedJobIds.includes(job.id),
    })
  );
  return {
    jobs,
    totalJobs: response.data.totalJobs ?? jobs.length,
    totalPages: response.data.totalPages ?? 1,
  };
}
