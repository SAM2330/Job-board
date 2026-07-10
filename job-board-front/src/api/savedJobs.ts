import api from './axios';

export const saveJob = (job_id: string) => {
  return api.post('/saved-jobs', { job_id });
};

export const getSavedJobs = () => {
  return api.get('/saved-jobs');
};

export const removeSavedJob = (job_id: string) => {
  return api.delete(`/saved-jobs/${job_id}`);
};
