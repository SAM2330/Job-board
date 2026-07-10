export interface Job {
  id: string;
  title: string;
  company: string;
  logoUrl: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  experience: 'Entry Level' | 'Mid-Senior' | 'Director / Executive';
  salaryMin: number;
  salaryMax: number;
  isRemote: boolean;
  postedDaysAgo: number;
  description: string;
  requirements: string[];
  benefits: string[];
  saved: boolean;
  applied: boolean;
  isActive?: boolean;
  companyImage?: string;
  companyDescription?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  dateApplied: string;
  status: 'pending' | 'accepted' | 'rejected';
  applicantName: string;
  applicantEmail: string;
  applicantImage: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  type: 'alert' | 'message' | 'update' | 'security';
  read: boolean;
  important: boolean;
  senderName?: string;
  senderImage?: string;
}

export type ViewType =
  | 'jobs'
  | 'job-details'
  | 'dashboard'
  | 'notifications'
  | 'saved-jobs'
  | 'post-job'
  | 'employer-applicants'
  | 'employer-jobs'
  | 'signin'
  | 'register';

export interface UserState {
  currentUser: {
    id?: string;
    name: string;
    email: string;
    role: 'seeker' | 'employer';
    image?: string;
  } | null;
  currentView: ViewType;
  selectedJobId: string | null;
  searchQuery: string;
  searchLocation: string;
  selectedTypes: string[];
  selectedSalaryRange: string;
  selectedExperience: string;
}
