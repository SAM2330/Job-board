import { Job, Application, NotificationItem } from '../types';

const DEFAULT_LOGO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB3NQTYFnFVr_iKz6qZ8ofAqrBrx4PylZJPi9kWCbzAUlO4YjTcbIfmZ6uzwql-zzAlRAFGRMEHEMgQbRhJNxL1s-xaFwCM3UQbxtJnFt0z3bsqn3LmyyTokTtKxPq6EoK09_DdiAm3cFERwOvvqrElgx0hU6jxhbwv0_EVTgqWscHx6wMNqNsZ3NmhXxhNlvvdIVCxirKApMeM2q7vsMZzQT-5k31t_0mfS0EXP5kb1krvTtqj7R2x';

export interface BackendJob {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  salary?: string | null;
  type?: string | null;
  employer_id?: string;
  created_at?: string;
}

function parseSalaryRange(salary?: string | null): { min: number; max: number; display: string } {
  if (!salary) {
    return { min: 0, max: 0, display: 'Competitive' };
  }
  const numbers = salary.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length >= 2) {
    const min = numbers[0] * (salary.includes('k') ? 1000 : 1);
    const max = numbers[1] * (salary.includes('k') ? 1000 : 1);
    return { min, max, display: salary };
  }
  if (numbers.length === 1) {
    const val = numbers[0] * (salary.includes('k') ? 1000 : 1);
    return { min: val, max: val, display: salary };
  }
  return { min: 0, max: 0, display: salary };
}

function daysAgo(dateStr?: string): number {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(dateStr);
}

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'] as const;

function normalizeJobType(type?: string | null): Job['type'] {
  if (type && JOB_TYPES.includes(type as Job['type'])) {
    return type as Job['type'];
  }
  if (type?.toLowerCase() === 'remote') return 'Remote';
  return 'Full-time';
}

export function mapBackendJob(
  job: BackendJob,
  options: { saved?: boolean; applied?: boolean; company?: string } = {}
): Job {
  const { min, max, display } = parseSalaryRange(job.salary);
  const location = job.location || 'Remote';
  const type = normalizeJobType(job.type);

  return {
    id: job.id,
    title: job.title,
    company: options.company || 'Hiring Company',
    logoUrl: DEFAULT_LOGO,
    location,
    salary: display,
    type,
    experience: max >= 180000 ? 'Director / Executive' : max >= 80000 ? 'Mid-Senior' : 'Entry Level',
    salaryMin: min,
    salaryMax: max,
    isRemote: type === 'Remote' || location.toLowerCase().includes('remote'),
    postedDaysAgo: daysAgo(job.created_at),
    description: job.description || '',
    requirements: [],
    benefits: [],
    saved: options.saved ?? false,
    applied: options.applied ?? false,
    isActive: true,
    companyImage: DEFAULT_LOGO,
    companyDescription: job.description?.slice(0, 200) || '',
  };
}

export function mapMyApplication(
  app: {
    id: string;
    cover_letter?: string;
    resume_url?: string;
    status: Application['status'];
    created_at?: string;
    jobs?: BackendJob | null;
  },
  user: { name: string; email: string; image?: string }
): Application {
  const job = app.jobs;
  return {
    id: app.id,
    jobId: job?.id || '',
    jobTitle: job?.title || 'Unknown Role',
    company: 'Hiring Company',
    dateApplied: formatDate(app.created_at),
    status: app.status || 'pending',
    applicantName: user.name,
    applicantEmail: user.email,
    applicantImage: user.image || DEFAULT_LOGO,
    resumeUrl: app.resume_url,
    coverLetter: app.cover_letter,
  };
}

export function mapEmployerApplicant(
  app: {
    id: string;
    cover_letter?: string;
    resume_url?: string;
    status: Application['status'];
    created_at?: string;
    users?: { id: string; name: string; email: string } | null;
  },
  jobId: string,
  jobTitle: string
): Application {
  const user = app.users;
  return {
    id: app.id,
    jobId,
    jobTitle,
    company: 'Hiring Company',
    dateApplied: formatDate(app.created_at),
    status: app.status || 'pending',
    applicantName: user?.name || 'Applicant',
    applicantEmail: user?.email || '',
    applicantImage: DEFAULT_LOGO,
    resumeUrl: app.resume_url,
    coverLetter: app.cover_letter,
  };
}

export function mapNotification(notif: {
  id: string;
  message: string;
  is_read?: boolean;
  created_at?: string;
}): NotificationItem {
  return {
    id: notif.id,
    title: notif.message,
    description: notif.message,
    timeAgo: formatTimeAgo(notif.created_at),
    type: 'update',
    read: notif.is_read ?? false,
    important: false,
  };
}
