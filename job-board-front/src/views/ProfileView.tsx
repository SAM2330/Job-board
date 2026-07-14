import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setCurrentUser } from '../store/careerSlice';
import { getProfile, updateProfile, uploadProfilePic } from '../api/auth';
import { 
  User, 
  Mail, 
  Briefcase, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Save, 
  Image, 
  Building2, 
  GraduationCap, 
  Award, 
  Check, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

export default function ProfileView() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.career);
  
  // Local states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [education, setEducation] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  
  // Employer states
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);

  // Load profile details
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const res = await getProfile();
        const user = res.data.user;
        
        setName(user.name || '');
        setBio(user.bio || '');
        setProfilePic(user.profile_pic || user.image || '');
        
        // Parse skills safely
        if (user.skills) {
          if (Array.isArray(user.skills)) {
            setSkills(user.skills);
          } else if (typeof user.skills === 'string') {
            try {
              setSkills(JSON.parse(user.skills));
            } catch {
              setSkills(user.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
            }
          }
        }
        
        setEducation(user.education || '');
        setExperienceSummary(user.experience_summary || '');
        setResumeUrl(user.resume_url || '');
        
        setCompanyName(user.company_name || '');
        setCompanyWebsite(user.company_website || '');
        setCompanyIndustry(user.company_industry || '');
        setCompanySize(user.company_size || '');
      } catch (err) {
        console.error('Failed to load profile details:', err);
        setErrorMsg('Could not load profile. Please verify your authentication.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchProfileData();
    }
  }, [currentUser]);

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload: any = {
        name,
        bio,
        profile_pic: profilePic,
      };

      if (currentUser?.role === 'seeker') {
        payload.skills = skills;
        payload.education = education;
        payload.experience_summary = experienceSummary;
        payload.resume_url = resumeUrl;
      } else {
        payload.company_name = companyName;
        payload.company_website = companyWebsite;
        payload.company_industry = companyIndustry;
        payload.company_size = companySize;
      }

      const res = await updateProfile(payload);
      const updatedUser = res.data.user;

      // Update Redux state
      dispatch(setCurrentUser({
        ...currentUser,
        ...updatedUser,
        image: updatedUser.profile_pic || updatedUser.image, // fallbacks
      }));

      setSuccessMsg('Your profile has been saved and synchronized successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add tag-style skill
  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleAddSkillBtn = () => {
    if (skillInput.trim()) {
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  // Remove tag-style skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadProfilePic(file);
      const url = res.data.url || res.data.profile_pic;
      setProfilePic(url);
    } catch {
      setErrorMsg('Failed to upload image. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-secondary font-medium font-mono text-sm">Loading complete profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background text-on-background px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card Container */}
        <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden mb-6">
          
          {/* Cover Header Graphic */}
          <div className="h-32 bg-linear-to-r from-primary/30 to-tertiary/20 relative" />

          <form onSubmit={handleSave} className="p-6 md:p-8 -mt-16">
            
            {/* Header Content */}
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-8 border-b border-outline-variant pb-6">
              
              {/* Profile Image upload/selection */}
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="relative group w-28 h-28 rounded-full border-4 border-surface shadow-md overflow-hidden bg-surface-container-high flex items-center justify-center">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-outline" />
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer gap-1">
                    <Image size={18} />
                    <span>CHANGE PHOTO</span>
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <h1 className="text-headline-sm font-bold tracking-tight text-on-surface">
                    {name || 'Your Profile'}
                  </h1>
                  <p className="text-sm font-mono text-on-surface-variant flex items-center gap-2 mt-1 justify-center sm:justify-start">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold capitalize text-xs">
                      {currentUser?.role === 'seeker' ? 'Job Seeker' : 'Employer'}
                    </span>
                    <span>•</span>
                    <span className="text-secondary">{currentUser?.email}</span>
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                      className="px-3 py-1.5 rounded-lg border border-outline bg-white text-xs text-on-surface hover:bg-surface-container transition-all cursor-pointer font-medium"
                    >
                      Choose Avatar Preset
                    </button>
                    <label className="px-3 py-1.5 rounded-lg border border-outline bg-white text-xs text-on-surface hover:bg-surface-container transition-all cursor-pointer font-medium">
                      Upload Custom PP
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold hover:opacity-95 shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save size={18} />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </div>

            {/* Avatar Presets Selection Grid */}
            {showAvatarPresets && (
              <div className="mb-8 p-4 bg-surface-container rounded-xl border border-outline-variant animate-fadeIn">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-on-surface-variant mb-3">
                  Select a professionally stylized Avatar
                </h3>
                <div className="grid grid-cols-6 gap-3">
                  {AVATAR_PRESETS.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setProfilePic(avatar);
                        setShowAvatarPresets(false);
                      }}
                      className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                        profilePic === avatar ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-outline-variant hover:border-outline'
                      }`}
                    >
                      <img src={avatar} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      {profilePic === avatar && (
                        <div className="absolute inset-0 bg-primary/40 flex items-center justify-center text-white">
                          <Check size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Banner Notifications */}
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">✓</div>
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-error-container/25 border border-error/20 text-on-error-container text-sm font-medium flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-error text-white flex items-center justify-center font-bold text-xs">!</div>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Shared Fields */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-3.5 text-on-surface-variant" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your complete professional name"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Short Professional Biography
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short introduction detailing your goals, passion, or background..."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-white text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Profile Picture URL (Alternative to custom uploads)
                </label>
                <div className="relative">
                  <Image size={18} className="absolute left-3.5 top-3.5 text-on-surface-variant" />
                  <input
                    type="url"
                    value={profilePic}
                    onChange={(e) => setProfilePic(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Seeker Specific Fields */}
            {currentUser?.role === 'seeker' && (
              <div className="border-t border-outline-variant pt-6 space-y-6">
                <h2 className="text-title-md font-bold text-on-surface flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" />
                  <span>Seeker Profile & Professional Experience</span>
                </h2>

                {/* Core Skills (Polished Tag System) */}
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    Skills & Areas of Expertise
                  </label>
                  <p className="text-xs text-on-surface-variant mb-3">
                    Type a skill (e.g. React, Figma, Python) and press <kbd className="font-mono bg-surface-container px-1 py-0.5 rounded">Enter</kbd> to add it.
                  </p>
                  
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="e.g. Node.js"
                      className="flex-grow px-4 py-2 rounded-xl border border-outline-variant bg-white text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkillBtn}
                      className="px-4 py-2 bg-secondary-container text-primary font-bold rounded-xl text-sm hover:bg-primary hover:text-white transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {/* Skills tags area */}
                  <div className="flex flex-wrap gap-2 p-3 bg-surface-container rounded-xl border border-outline-variant min-h-[60px]">
                    {skills.length === 0 ? (
                      <span className="text-xs text-on-surface-variant italic self-center">No skills added yet. Add some above!</span>
                    ) : (
                      skills.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-medium text-xs rounded-full flex items-center gap-1.5 animate-fadeIn"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/20 transition-all text-primary font-bold cursor-pointer text-[10px]"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Education Summary
                    </label>
                    <div className="relative">
                      <GraduationCap size={18} className="absolute left-3.5 top-3.5 text-on-surface-variant" />
                      <input
                        type="text"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="e.g. M.S. in Computer Science at NYU"
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Resume URL / Portfolio Link
                    </label>
                    <div className="relative">
                      <LinkIcon size={18} className="absolute left-3.5 top-3.5 text-on-surface-variant" />
                      <input
                        type="url"
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        placeholder="https://yourportfolio.dev or PDF link"
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Professional Experience Summary
                  </label>
                  <textarea
                    rows={4}
                    value={experienceSummary}
                    onChange={(e) => setExperienceSummary(e.target.value)}
                    placeholder="Detail your professional experience highlights, job roles, or key milestones..."
                    className="w-full p-4 rounded-xl border border-outline-variant bg-white text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* Employer Specific Fields */}
            {currentUser?.role === 'employer' && (
              <div className="border-t border-outline-variant pt-6 space-y-6">
                <h2 className="text-title-md font-bold text-on-surface flex items-center gap-2">
                  <Building2 size={20} className="text-primary" />
                  <span>Company Profile Information</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building2 size={18} className="absolute left-3.5 top-3.5 text-on-surface-variant" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Tech Corporation"
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Company Website
                    </label>
                    <div className="relative">
                      <LinkIcon size={18} className="absolute left-3.5 top-3.5 text-on-surface-variant" />
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://acmetech.com"
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Industry Sector
                    </label>
                    <div className="relative">
                      <Award size={18} className="absolute left-3.5 top-3.5 text-on-surface-variant" />
                      <input
                        type="text"
                        value={companyIndustry}
                        onChange={(e) => setCompanyIndustry(e.target.value)}
                        placeholder="e.g. Enterprise SaaS / Artificial Intelligence"
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Company Size
                    </label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-outline-variant bg-white text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all cursor-pointer"
                    >
                      <option value="">Select company size</option>
                      <option value="1-10 employees">1-10 employees</option>
                      <option value="11-50 employees">11-50 employees</option>
                      <option value="51-200 employees">51-200 employees</option>
                      <option value="201-500 employees">201-500 employees</option>
                      <option value="500+ employees">500+ employees</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}
