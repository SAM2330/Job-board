import api from './axios';

export const getEmployerJobs = () => {
  return api.get('/dashboard/jobs');
};

export const getEmployerStats = () => {
  return api.get('/dashboard/stats');
};

export const getJobApplicants = (jobId: string) => {
  return api.get(`/dashboard/job/${jobId}/applicants`);
};
