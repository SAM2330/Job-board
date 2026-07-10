import React, { useState, useRef } from 'react';
import { Job } from '../types';
import { X, CloudUpload, FileText, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ApplyModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (coverLetter: string, resumeFile: File) => void;
}

export default function ApplyModal({ job, isOpen, onClose, onSubmit }: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setResumeFile(file);
      setResumeName(file.name);
      setError('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setResumeFile(file);
      setResumeName(file.name);
      setError('');
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setError('Please upload your resume to continue.');
      return;
    }
    if (!consent) {
      setError('Please agree to share your information to continue.');
      return;
    }
    onSubmit(coverLetter || 'Hi, please find my application attached.', resumeFile);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#001B3D]/40 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl border border-outline-variant overflow-hidden z-10"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Apply to {job.company}</h2>
            <p className="text-body-sm text-outline">{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-container rounded-full transition-colors cursor-pointer text-on-surface-variant"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl text-label-md flex items-center gap-2 border border-error/20">
              <span className="material-symbols-outlined text-error">error</span>
              <p>{error}</p>
            </div>
          )}

          {/* Resume Upload */}
          <div>
            <label className="block font-label-sm text-label-sm text-outline mb-2">Resume / CV</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary-container/5'
                  : resumeName
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-outline-variant bg-surface-container-low hover:bg-surface-container'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
              
              {resumeName ? (
                <CheckCircle className="text-emerald-600 mb-2 animate-bounce" size={40} />
              ) : (
                <CloudUpload className="text-primary mb-2" size={40} />
              )}
              
              {resumeName ? (
                <div className="text-center">
                  <p className="text-body-md font-semibold text-on-surface">Resume Uploaded Successfully!</p>
                  <p className="text-label-md text-primary font-mono mt-1 flex items-center justify-center gap-1.5">
                    <FileText size={14} />
                    {resumeName}
                  </p>
                  <p className="text-xs text-outline mt-1">Click to replace (PDF up to 10MB)</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-body-md font-semibold text-on-surface">Click to upload or drag and drop</p>
                  <p className="text-label-sm text-outline mt-1">PDF only (Max 10MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block font-label-sm text-label-sm text-outline mb-2">Cover Letter</label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full min-h-[160px] bg-white border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none placeholder:text-outline-variant"
              placeholder="Tell us why you are a great fit for this role..."
            />
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="consent" className="text-label-sm text-on-surface-variant cursor-pointer select-none">
              I agree to share my profile information, contact details, and application data with {job.company}.
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-label-md text-label-md text-outline hover:bg-surface-container transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              Submit Application
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
