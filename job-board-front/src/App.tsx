/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import { RootState } from './store';
import Header from './components/Header';
import Footer from './components/Footer';

// Views
import JobsFeed from './views/JobsFeed';
import JobDetails from './views/JobDetails';
import SeekerDashboard from './views/SeekerDashboard';
import EmployerHub from './views/EmployerHub';
import EmployerJobs from './views/EmployerJobs';
import PostJob from './views/PostJob';
import NotificationsView from './views/NotificationsView';
import SavedJobsView from './views/SavedJobsView';
import SignIn from './views/SignIn';
import Register from './views/Register';
import ProfileView from './views/ProfileView';

function AppContent() {
  const { currentView } = useSelector((state: RootState) => state.career);

  // Authentication screens (Sign In & Register) do not show the global header/footer.
  // Employer Dashboard screens (Employer Hub & Post Job) implement their own custom sidebar & topbars.
  const isAuthPage = currentView === 'signin' || currentView === 'register';
  const hasCustomLayout =
    currentView === 'employer-applicants' ||
    currentView === 'employer-jobs' ||
    currentView === 'post-job';

  const showGlobalHeader = !isAuthPage && !hasCustomLayout;
  const showGlobalFooter = !isAuthPage && !hasCustomLayout;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Global Header */}
      {showGlobalHeader && <Header />}

      {/* Main View Area */}
      <div className="flex-grow">
        {currentView === 'jobs' && <JobsFeed />}
        {currentView === 'job-details' && <JobDetails />}
        {currentView === 'dashboard' && <SeekerDashboard />}
        {currentView === 'notifications' && <NotificationsView />}
        {currentView === 'saved-jobs' && <SavedJobsView />}
        {currentView === 'post-job' && <PostJob />}
        {currentView === 'employer-applicants' && <EmployerHub />}
        {currentView === 'employer-jobs' && <EmployerJobs />}
        {currentView === 'signin' && <SignIn />}
        {currentView === 'register' && <Register />}
        {currentView === 'profile' && <ProfileView />}
      </div>

      {/* Global Footer */}
      {showGlobalFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
