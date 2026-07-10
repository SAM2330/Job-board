import React, { useMemo } from 'react';
import { Check, ArrowRight, Verified } from 'lucide-react';
import { motion } from 'motion/react';

interface SuccessModalProps {
  jobTitle: string;
  company: string;
  isOpen: boolean;
  onGoToDashboard: () => void;
  onBrowseMore: () => void;
}

export default function SuccessModal({ jobTitle, company, isOpen, onGoToDashboard, onBrowseMore }: SuccessModalProps) {
  const applicationId = useMemo(() => {
    return `#NF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
      />

      {/* Success Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-surface-container-lowest w-full max-w-[480px] rounded-2xl shadow-2xl border border-outline-variant p-10 text-center overflow-hidden z-10"
      >
        {/* Floating atmospheric elements */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute top-8 left-12 w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
          <div className="absolute top-1/4 right-16 w-2 h-2 bg-secondary rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
          <div className="absolute bottom-1/4 left-16 w-3 h-3 bg-tertiary-container rounded-full animate-ping" style={{ animationDelay: '0.8s' }} />
        </div>

        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200/50 animate-ping opacity-75" />
            
            {/* Draw check icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"
            >
              <Check size={36} strokeWidth={3} />
            </motion.div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-3 mb-8">
          <h1 className="font-headline-md text-headline-md text-on-surface">Application Sent!</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[340px] mx-auto">
            Your application for <span className="font-semibold text-on-surface">{jobTitle}</span> at <span className="font-semibold text-on-surface">{company}</span> has been successfully submitted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onGoToDashboard}
            className="w-full h-12 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Go to Dashboard</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={onBrowseMore}
            className="w-full h-12 bg-transparent border border-outline-variant text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container-low active:scale-[0.98] transition-all cursor-pointer"
          >
            Browse More Jobs
          </button>
        </div>

        {/* Meta details footer */}
        <div className="mt-8 pt-6 border-t border-outline-variant flex items-center justify-center gap-2">
          <Verified size={16} className="text-primary" />
          <span className="font-label-sm text-label-sm text-outline">Application ID: {applicationId}</span>
        </div>
      </motion.div>
    </div>
  );
}
