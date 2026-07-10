import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Job, Application, NotificationItem, ViewType } from '../types';

interface CareerState {
  jobs: Job[];
  notifications: NotificationItem[];
  applicants: Application[];
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
  isLoading: boolean;
  appliedJobIds: string[];
  savedJobIds: string[];
}

const loadState = (): Partial<CareerState> => {
  try {
    const serializedState = localStorage.getItem('careersync_state');
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch {
    return {};
  }
};

const savedState = loadState();

const initialState: CareerState = {
  jobs: [],
  notifications: [],
  applicants: [],
  currentUser: savedState.currentUser || null,
  currentView: savedState.currentView || 'signin',
  selectedJobId: savedState.selectedJobId || null,
  searchQuery: '',
  searchLocation: '',
  selectedTypes: savedState.selectedTypes || [],
  selectedSalaryRange: '$120k - $180k',
  selectedExperience: 'Mid-Senior',
  isLoading: false,
  appliedJobIds: [],
  savedJobIds: [],
};

const saveToLocalStorage = (state: CareerState) => {
  try {
    const serializedState = JSON.stringify({
      currentUser: state.currentUser,
      currentView: state.currentView,
      selectedJobId: state.selectedJobId,
      selectedTypes: state.selectedTypes,
    });
    localStorage.setItem('careersync_state', serializedState);
  } catch {
    // ignore write errors
  }
};

export const careerSlice = createSlice({
  name: 'career',
  initialState,
  reducers: {
    setCurrentUser: (
      state,
      action: PayloadAction<{
        id?: string;
        name: string;
        email: string;
        role: 'seeker' | 'employer';
        image?: string;
      } | null>
    ) => {
      state.currentUser = action.payload;
      if (action.payload) {
        state.currentView = action.payload.role === 'employer' ? 'employer-jobs' : 'jobs';
      } else {
        state.currentView = 'signin';
        localStorage.removeItem('token');
        state.jobs = [];
        state.notifications = [];
        state.applicants = [];
        state.appliedJobIds = [];
        state.savedJobIds = [];
      }
      saveToLocalStorage(state);
    },
    setCurrentView: (state, action: PayloadAction<ViewType>) => {
      state.currentView = action.payload;
      saveToLocalStorage(state);
    },
    setSelectedJobId: (state, action: PayloadAction<string | null>) => {
      state.selectedJobId = action.payload;
      saveToLocalStorage(state);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchLocation: (state, action: PayloadAction<string>) => {
      state.searchLocation = action.payload;
    },
    toggleJobType: (state, action: PayloadAction<string>) => {
      const type = action.payload;
      if (state.selectedTypes.includes(type)) {
        state.selectedTypes = state.selectedTypes.filter((t) => t !== type);
      } else {
        state.selectedTypes.push(type);
      }
      saveToLocalStorage(state);
    },
    setSalaryRange: (state, action: PayloadAction<string>) => {
      state.selectedSalaryRange = action.payload;
    },
    setExperience: (state, action: PayloadAction<string>) => {
      state.selectedExperience = action.payload;
    },
    clearFilters: (state) => {
      state.selectedTypes = [];
      state.selectedSalaryRange = '$5k - $8k';
      state.selectedExperience = 'Entry Level';
      state.searchQuery = '';
      state.searchLocation = '';
      saveToLocalStorage(state);
    },
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.jobs = action.payload;
    },
    setNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
      state.notifications = action.payload;
    },
    setApplicants: (state, action: PayloadAction<Application[]>) => {
      state.applicants = action.payload;
    },
    setAppliedJobIds: (state, action: PayloadAction<string[]>) => {
      state.appliedJobIds = action.payload;
      state.jobs = state.jobs.map((job) => ({
        ...job,
        applied: action.payload.includes(job.id),
      }));
    },
    setSavedJobIds: (state, action: PayloadAction<string[]>) => {
      state.savedJobIds = action.payload;
      state.jobs = state.jobs.map((job) => ({
        ...job,
        saved: action.payload.includes(job.id),
      }));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    toggleSaveJob: (state, action: PayloadAction<string>) => {
      const jobId = action.payload;
      const job = state.jobs.find((j) => j.id === jobId);
      if (job) {
        job.saved = !job.saved;
        if (job.saved) {
          if (!state.savedJobIds.includes(jobId)) {
            state.savedJobIds.push(jobId);
          }
        } else {
          state.savedJobIds = state.savedJobIds.filter((id) => id !== jobId);
        }
      }
    },
    markJobApplied: (state, action: PayloadAction<string>) => {
      const jobId = action.payload;
      const job = state.jobs.find((j) => j.id === jobId);
      if (job) {
        job.applied = true;
      }
      if (!state.appliedJobIds.includes(jobId)) {
        state.appliedJobIds.push(jobId);
      }
    },
    updateApplicantStatus: (
      state,
      action: PayloadAction<{ applicationId: string; status: 'pending' | 'accepted' | 'rejected' }>
    ) => {
      const { applicationId, status } = action.payload;
      const applicant = state.applicants.find((a) => a.id === applicationId);
      if (applicant) {
        applicant.status = status;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif) {
        notif.read = true;
      }
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
  },
});

export const {
  setCurrentUser,
  setCurrentView,
  setSelectedJobId,
  setSearchQuery,
  setSearchLocation,
  toggleJobType,
  setSalaryRange,
  setExperience,
  clearFilters,
  setJobs,
  setNotifications,
  setApplicants,
  setAppliedJobIds,
  setSavedJobIds,
  setLoading,
  toggleSaveJob,
  markJobApplied,
  updateApplicantStatus,
  markAllNotificationsAsRead,
  markNotificationRead,
  dismissNotification,
} = careerSlice.actions;

export default careerSlice.reducer;
export type { CareerState };
