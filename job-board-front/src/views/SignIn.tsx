import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentUser, setCurrentView, setAppliedJobIds, setSavedJobIds } from '../store/careerSlice';
import { login } from '../api/auth';
import { getMyApplications } from '../api/applications';
import { getSavedJobs } from '../api/savedJobs';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function SignIn() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);

      dispatch(
        setCurrentUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        })
      );

      if (user.role === 'seeker') {
        try {
          const [appsRes, savedRes] = await Promise.all([
            getMyApplications(),
            getSavedJobs(),
          ]);
          const appliedIds = (appsRes.data.applications ?? []).map(
            (a: { jobs?: { id: string } | null }) => a.jobs?.id
          ).filter(Boolean);
          const savedIds = (savedRes.data.savedJobs ?? []).map(
            (s: { jobs?: { id: string } | null }) => s.jobs?.id
          ).filter(Boolean);
          dispatch(setAppliedJobIds(appliedIds));
          dispatch(setSavedJobIds(savedIds));
        } catch {
          // non-critical, local state will be used
        }
      }

      dispatch(setCurrentView(user.role === 'employer' ? 'employer-jobs' : 'jobs'));
    } catch {
      setErrorMsg('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-[440px]">
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant">
          <div className="mb-8">
            <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Welcome Back</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Access your professional dashboard, applications, and saved jobs
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="flex items-center gap-3 p-4 bg-error-container text-on-error-container rounded-lg border border-error/20">
                <ShieldAlert size={20} className="text-error shrink-0" />
                <p className="font-label-md text-label-md">{errorMsg}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 font-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-lg pl-4 pr-12 font-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary text-on-primary rounded-lg font-label-md flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Don't have an account?{' '}
              <button
                onClick={() => dispatch(setCurrentView('register'))}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
