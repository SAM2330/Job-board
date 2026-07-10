import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentUser, setCurrentView } from '../store/careerSlice';
import { register, login } from '../api/auth';
import { User, Briefcase, Mail, Lock, UserCheck, ArrowRight } from 'lucide-react';

export default function Register() {
  const dispatch = useDispatch();
  const [role, setRole] = useState<'seeker' | 'employer'>('seeker');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await register({
        name: fullName,
        email,
        password,
        role,
      });

      const loginResponse = await login({ email, password });
      const { token, user } = loginResponse.data;

      localStorage.setItem('token', token);

      dispatch(
        setCurrentUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        })
      );

      dispatch(setCurrentView(role === 'employer' ? 'employer-jobs' : 'jobs'));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-margin-mobile">
      <div className="w-full max-w-[480px]">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Create your account</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Join the leading network for professional growth.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold">I want to join as a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('seeker')}
                  className={`flex flex-col items-center p-4 border rounded-xl transition-all duration-200 text-center cursor-pointer ${
                    role === 'seeker'
                      ? 'border-primary bg-primary-container/5 ring-1 ring-primary'
                      : 'border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <UserCheck className={`mb-2 ${role === 'seeker' ? 'text-primary' : 'text-secondary'}`} size={32} />
                  <span className="font-label-md text-label-md text-on-surface">Job Seeker</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant mt-1 leading-normal">I'm looking for a job</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`flex flex-col items-center p-4 border rounded-xl transition-all duration-200 text-center cursor-pointer ${
                    role === 'employer'
                      ? 'border-primary bg-primary-container/5 ring-1 ring-primary'
                      : 'border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <Briefcase className={`mb-2 ${role === 'employer' ? 'text-primary' : 'text-secondary'}`} size={32} />
                  <span className="font-label-md text-label-md text-on-surface">Employer</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant mt-1 leading-normal">I'm hiring talent</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold" htmlFor="full_name">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User size={18} className="absolute left-3 text-outline" />
                <input
                  id="full_name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold" htmlFor="email">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-3 text-outline" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold" htmlFor="password">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-3 text-outline" />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="terms" className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none">
                I agree to the Terms of Service and Privacy Policy.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-lg shadow-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Get Started</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Already have an account?{' '}
              <button
                onClick={() => dispatch(setCurrentView('signin'))}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
