import React from 'react';
import { Globe, Share2, Award, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant mt-20 py-12 px-margin-desktop">
      <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1 space-y-4">
          <span className="text-headline-sm font-headline-sm font-bold text-primary">CareerSync</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
            The modern standard for professional recruitment and high-stakes networking. High clarity, zero friction.
          </p>
          <div className="flex gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-outline font-semibold">
              <Shield size={14} className="text-primary" />
              <span>Secure Connection</span>
            </div>
          </div>
        </div>

        {/* Job Seeker info */}
        <div className="space-y-4">
          <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">For Job Seekers</h4>
          <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
            <li>
              <a className="hover:text-primary transition-colors cursor-pointer" href="#browse">
                Browse Jobs
              </a>
            </li>
            <li>
              <a className="hover:text-primary transition-colors cursor-pointer" href="#advice">
                Career Advice
              </a>
            </li>
            <li>
              <a className="hover:text-primary transition-colors cursor-pointer" href="#alerts">
                Job Alerts
              </a>
            </li>
          </ul>
        </div>

        {/* Employer info */}
        <div className="space-y-4">
          <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">For Employers</h4>
          <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
            <li>
              <a className="hover:text-primary transition-colors cursor-pointer" href="#post">
                Post a Job
              </a>
            </li>
            <li>
              <a className="hover:text-primary transition-colors cursor-pointer" href="#talent">
                Talent Solutions
              </a>
            </li>
            <li>
              <a className="hover:text-primary transition-colors cursor-pointer" href="#enterprise">
                Enterprise Hub
              </a>
            </li>
          </ul>
        </div>

        {/* Connect */}
        <div className="space-y-4">
          <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Connect</h4>
          <div className="flex gap-4">
            <a className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-2 bg-surface-container-low rounded-lg" href="#globe">
              <Globe size={18} />
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-2 bg-surface-container-low rounded-lg" href="#share">
              <Share2 size={18} />
            </a>
          </div>
          <div className="text-xs text-outline space-y-1">
            <p>Support: support@careersync.dev</p>
            <p>Location: San Francisco, CA</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto mt-12 pt-8 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 text-outline">
        <p className="font-label-sm text-label-sm">
          © 2026 CareerSync Inc. All rights reserved. Built with React and Redux.
        </p>
        <div className="flex gap-6 font-label-sm text-label-sm">
          <a className="hover:text-primary transition-colors cursor-pointer" href="#security">Security</a>
          <a className="hover:text-primary transition-colors cursor-pointer" href="#privacy">Privacy</a>
          <a className="hover:text-primary transition-colors cursor-pointer" href="#terms">Terms</a>
        </div>
      </div>
    </footer>
  );
}
