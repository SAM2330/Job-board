import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setCurrentView, setCurrentUser } from '../store/careerSlice';
import { ViewType } from '../types';
import { Briefcase, LayoutDashboard, Bookmark, Bell, Menu, Plus, LogOut, Search, User, ShieldAlert } from 'lucide-react';

export default function Header() {
  const dispatch = useDispatch();
  const { currentUser, currentView, notifications } = useSelector((state: RootState) => state.career);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navigateTo = (view: ViewType) => {
    dispatch(setCurrentView(view));
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(setCurrentUser(null));
    dispatch(setCurrentView('signin'));
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 h-16 bg-surface-container-lowest border-b border-outline-variant shadow-sm">
      <div className="flex justify-between items-center max-w-[1280px] mx-auto px-margin-desktop h-full">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigateTo(currentUser?.role === 'employer' ? 'employer-jobs' : 'jobs')}
            className="text-headline-md font-bold text-primary tracking-tight hover:opacity-90 cursor-pointer"
          >
            CareerSync
          </button>

          {/* Desktop Nav for Seeker */}
          {currentUser && currentUser.role === 'seeker' && (
            <nav className="hidden md:flex gap-6 h-full items-center pt-2">
              <button
                onClick={() => navigateTo('jobs')}
                className={`font-label-md text-label-md pb-5 border-b-2 transition-all cursor-pointer ${
                  currentView === 'jobs' || currentView === 'job-details'
                    ? 'text-primary border-primary font-bold'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                Jobs
              </button>
              <button
                onClick={() => navigateTo('dashboard')}
                className={`font-label-md text-label-md pb-5 border-b-2 transition-all cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'text-primary border-primary font-bold'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigateTo('saved-jobs')}
                className={`font-label-md text-label-md pb-5 border-b-2 transition-all cursor-pointer ${
                  currentView === 'saved-jobs'
                    ? 'text-primary border-primary font-bold'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                Saved Jobs
              </button>
              <button
                onClick={() => navigateTo('notifications')}
                className={`font-label-md text-label-md pb-5 border-b-2 transition-all cursor-pointer ${
                  currentView === 'notifications'
                    ? 'text-primary border-primary font-bold'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                Notifications
              </button>
            </nav>
          )}

          {/* Desktop Nav for Employer */}
          {currentUser && currentUser.role === 'employer' && (
            <nav className="hidden md:flex gap-6 h-full items-center pt-2">
              <button
                onClick={() => navigateTo('employer-applicants')}
                className={`font-label-md text-label-md pb-5 border-b-2 transition-all cursor-pointer ${
                  currentView === 'employer-applicants'
                    ? 'text-primary border-primary font-bold'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => navigateTo('employer-jobs')}
                className={`font-label-md text-label-md pb-5 border-b-2 transition-all cursor-pointer ${
                  currentView === 'employer-jobs'
                    ? 'text-primary border-primary font-bold'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                My Jobs
              </button>
              <button
                onClick={() => navigateTo('post-job')}
                className={`font-label-md text-label-md pb-5 border-b-2 transition-all cursor-pointer ${
                  currentView === 'post-job'
                    ? 'text-primary border-primary font-bold'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                Post a Job
              </button>
            </nav>
          )}
        </div>

        {/* Right Section utilities */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              {/* Notifications bell */}
              <button
                onClick={() => navigateTo('notifications')}
                className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all relative cursor-pointer"
              >
                <Bell size={20} />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-[10px] text-white font-bold rounded-full flex items-center justify-center">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {/* Profile Avatar / logout */}
              <div className="flex items-center gap-3 pl-2 border-l border-outline-variant">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant flex items-center justify-center">
                  {currentUser.image ? (
                    <img src={currentUser.image} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-primary/10 text-primary">
                      {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'US'}
                    </div>
                  )}
                </div>
                <span className="hidden md:block font-label-md text-label-md text-on-surface">{currentUser.name}</span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-full transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateTo('signin')}
                className="text-primary hover:underline font-semibold font-label-md text-label-md cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => navigateTo('register')}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-all cursor-pointer shadow-sm"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          {currentUser && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full cursor-pointer"
            >
              <Menu size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && currentUser && (
        <div className="absolute top-16 left-0 w-full bg-surface-container-lowest border-b border-outline-variant shadow-md md:hidden flex flex-col p-4 gap-2 z-40">
          {currentUser.role === 'seeker' ? (
            <>
              <button
                onClick={() => navigateTo('jobs')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  currentView === 'jobs' ? 'bg-secondary-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Briefcase size={18} />
                <span>Browse Jobs</span>
              </button>
              <button
                onClick={() => navigateTo('dashboard')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  currentView === 'dashboard' ? 'bg-secondary-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <LayoutDashboard size={18} />
                <span>My Applications</span>
              </button>
              <button
                onClick={() => navigateTo('saved-jobs')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  currentView === 'saved-jobs' ? 'bg-secondary-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Bookmark size={18} />
                <span>Saved Jobs</span>
              </button>
              <button
                onClick={() => navigateTo('notifications')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  currentView === 'notifications' ? 'bg-secondary-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Bell size={18} />
                <span>Notifications ({unreadNotifs})</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigateTo('employer-applicants')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  currentView === 'employer-applicants' ? 'bg-secondary-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </button>
              <button
                onClick={() => navigateTo('employer-jobs')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  currentView === 'employer-jobs' ? 'bg-secondary-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Briefcase size={18} />
                <span>My Jobs</span>
              </button>
              <button
                onClick={() => navigateTo('post-job')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  currentView === 'post-job' ? 'bg-secondary-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Plus size={18} />
                <span>Post New Vacancy</span>
              </button>
            </>
          )}

          {/* Sign Out inside mobile menu */}
          <div className="border-t border-outline-variant pt-2 mt-2 flex flex-col gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-lg text-left font-semibold"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
