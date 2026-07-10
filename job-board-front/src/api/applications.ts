import api from './axios';

export const applyToJob = (data: {
  job_id: string;
  cover_letter: string;
  resume_url: string;
}) => {
  return api.post('/applications', data);
};

export const getMyApplications = () => {
  return api.get('/applications/me');
};

export const getJobApplications = (jobId: string) => {
  return api.get(`/applications/${jobId}`);
};

export const updateApplicationStatus = (data: {
  application_id: string;
  status: 'pending' | 'accepted' | 'rejected';
}) => {
  return api.put('/applications/status', data);
};

export const uploadResume = (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.post('/applications/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
