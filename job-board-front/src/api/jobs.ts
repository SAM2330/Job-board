import api from './axios';

export interface JobsQueryParams {
  search?: string;
  location?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export const getJobs = (params?: JobsQueryParams) => {
  return api.get('/jobs', { params });
};

export const getJob = (id: string) => {
  return api.get(`/jobs/${id}`);
};

export const createJob = (jobData: {
  title: string;
  description: string;
  location: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  requiredSkills: string[];
  perks: string[];
}) => {
  return api.post('/jobs', jobData);
};