import { useNavigate } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import { generateBio } from '../services/geminiService';
import { Sparkles, Save, Loader2, Camera, User, AlertCircle, Image as ImageIcon, Plus, Trash2, Check, X } from 'lucide-react';
import { RELIGIONS, MOTHER_TONGUES, MARITAL_STATUS_OPTIONS, CASTES, SUB_CASTE_MAPPING, EDUCATION_OPTIONS, HOBBIES_OPTIONS } from '../constants';
import { profileService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// --- Main Profile Edit Component ---

const ProfileEdit: React.FC = () => {
  // Add missing fields to state
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dob: '', // Format: DD/MM/YYYY
    birthTime: '', // Format: HH:MM AM/PM
    height: '',
    maritalStatus: '',
    motherTongue: '',
    profession: '',
    income: '',
    religion: '',
    caste: '',
    subCaste: '',
    hobbies: [] as string[],
    traits: '',
    partnerPref: '',
    bio: '',
    imageUrl: '',
    gallery: [] as string[],
    location: '', // Default or empty
    education: '', // Default or empty
    fatherOccupation: '',
    motherOccupation: '',
    siblings: '',
    familyLocation: '',
    familyStatus: '',
    email: '',
    userId: ''
  });

  // Separate state for Date Dropdowns
  const [dobState, setDobState] = useState({
    day: '',
    month: '',
    year: ''
  });

  // Separate state for Time Dropdowns
  const [timeState, setTimeState] = useState({
    hour: '',
    minute: '',
    ampm: ''
  });

  const { user, checkProfileStatus } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        userId: user.id
      }));
    }
  }, [user]);

  // Image Modal Component
  const ImageModal = () => {
    if (!zoomedImage) return null;
    return (
      <div
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={() => setZoomedImage(null)}
      >
        <button
          onClick={() => setZoomedImage(null)}
          className="absolute top-4 right-4 text-white hover:text-rose-500 transition-colors"
        >
          <X className="h-8 w-8" />
        </button>
        <img
          src={zoomedImage}
          alt="Full View"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  };


  const [errors, setErrors] = useState<{ name?: string; gender?: string; religion?: string; dob?: string }>({});
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate options
  const heightOptions = [];
  for (let i = 4; i <= 7; i++) {
    for (let j = 0; j < 12; j++) {
      heightOptions.push(`${i}' ${j}"`);
    }
  }

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 70 }, (_, i) => (currentYear - 18 - i).toString()); // 18 years ago down to 70 years ago

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Load profile from backend and local storage on mount
  useEffect(() => {
    if (user?.id) {
      const loadProfile = async () => {
        try {
          // 1. Try to fetch existing profile from backend
          const backendProfile = await profileService.getByUserId(user.id);

          // 2. Check for local draft
          const savedProfile = localStorage.getItem(`soulmate_user_profile_${user.id}`);
          let parsedDraft = {};
          if (savedProfile) {
            try {
              parsedDraft = JSON.parse(savedProfile);
            } catch (e) {
              console.error("Error parsing local draft", e);
            }
          }

          // 3. Merge: Backend data takes precedence, but local draft overrides if it's "newer"
          // We use functional update to ensure we don't overwrite email/userId set by the other effect
          setFormData(prev => {
            let mergedData = { ...prev };

            if (backendProfile) {
              mergedData = { ...mergedData, ...backendProfile };
            }

            if (savedProfile && parsedDraft) {
              mergedData = { ...mergedData, ...parsedDraft };
            }

            // Ensure email and userId are always set from the auth user if they are missing or empty
            if (!mergedData.email && user.email) {
              mergedData.email = user.email;
            }
            if (!mergedData.userId && user.id) {
              mergedData.userId = user.id;
            }

            return mergedData;
          });

          // We need to re-calculate derived state (dobState, timeState) based on the *new* merged data.
          // Since we can't access the result of setFormData immediately, we'll compute it here for the local variables.
          let finalData = { ...formData };
          if (backendProfile) finalData = { ...finalData, ...backendProfile };
          if (savedProfile && parsedDraft) finalData = { ...finalData, ...parsedDraft };

          // Parse DOB and Time from the merged data

          // Parse DOB and Time from the merged data
          if (finalData.dob) {
            // Handle YYYY-MM-DD (Backend/MySQL format)
            if (finalData.dob.includes('-')) {
              const [y, m, d] = finalData.dob.split('-');
              setDobState({ day: d, month: m, year: y });
            }
            // Handle DD/MM/YYYY (Legacy/Frontend format)
            else if (finalData.dob.includes('/')) {
              const [d, m, y] = finalData.dob.split('/');
              setDobState({ day: d, month: m, year: y });
            }
          }

          if (finalData.birthTime) {
            if (finalData.birthTime.includes('M')) { // AM or PM
              const [time, period] = finalData.birthTime.split(' ');
              const [h, min] = time.split(':');
              setTimeState({ hour: h, minute: min, ampm: period });
            } else if (finalData.birthTime.includes(':')) {
              const [h, min] = finalData.birthTime.split(':');
              let hourInt = parseInt(h);
              const period = hourInt >= 12 ? 'PM' : 'AM';
              if (hourInt > 12) hourInt -= 12;
              if (hourInt === 0) hourInt = 12;
              setTimeState({ hour: hourInt.toString().padStart(2, '0'), minute: min, ampm: period });
            }
          }

        } catch (error) {
          console.error("Error loading profile", error);
        }
      };
      loadProfile();
    }
  }, [user]);

  // Update formData when dropdowns change
  useEffect(() => {
    if (dobState.day && dobState.month && dobState.year) {
      // Send YYYY-MM-DD to backend
      const formattedDob = `${dobState.year}-${dobState.month}-${dobState.day}`;
      setFormData(prev => ({ ...prev, dob: formattedDob }));
      if (errors.dob) setErrors(prev => ({ ...prev, dob: undefined }));
    }
  }, [dobState]);

  useEffect(() => {
    if (timeState.hour && timeState.minute && timeState.ampm) {
      const formattedTime = `${timeState.hour}:${timeState.minute} ${timeState.ampm}`;
      setFormData(prev => ({ ...prev, birthTime: formattedTime }));
    }
  }, [timeState]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleGenerateBio = async () => {
    setIsGenerating(true);
    const bio = await generateBio(formData);
    setFormData(prev => ({ ...prev, bio }));
    setIsGenerating(false);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    const newErrors: { name?: string; gender?: string; religion?: string; dob?: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required.';
    if (!formData.gender) newErrors.gender = 'Please select a gender.';
    if (!formData.religion) newErrors.religion = 'Please select a religion.';
    if (!formData.dob) newErrors.dob = 'Date of Birth is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    let birthDate: Date;

    if (dob.includes('-')) {
      // YYYY-MM-DD
      const [year, month, day] = dob.split('-');
      birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // DD/MM/YYYY
      const [day, month, year] = dob.split('/');
      birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSaveProfile = async () => {
    if (validateForm()) {
      const age = calculateAge(formData.dob);

      const profileData = {
        ...formData,
        age,
        hobbies: formData.hobbies, // Already an array now
        verified: false // Default
      };

      try {
        const success = await profileService.create(profileData); // Using create for now as update logic is same in PHP
        if (success) {
          if (user?.id) {
            localStorage.setItem(`soulmate_user_profile_${user.id}`, JSON.stringify(formData)); // Keep local sync for now
          }
          await checkProfileStatus(); // Update auth context
          setShowSaveMessage(true);
          setTimeout(() => {
            setShowSaveMessage(false);
            navigate('/matches');
          }, 1500);
        } else {
          alert('Failed to save profile to backend.');
        }
      } catch (error) {
        console.error("Error saving profile", error);
        alert('An error occurred while saving.');
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCasteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCaste = e.target.value;
    setFormData(prev => ({
      ...prev,
      caste: newCaste,
      subCaste: '' // Reset subcaste when caste changes
    }));
  };

  const availableSubCastes = SUB_CASTE_MAPPING[formData.caste] || [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Cropper Modal */}
      {/* Image Modal */}
      <ImageModal />

      {/* Success Message Toast */}
      {showSaveMessage && (
        <div className="fixed top-24 right-4 md:right-8 bg-green-50 text-green-800 border border-green-200 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300 z-50">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-bold text-sm">Profile Saved!</p>
            <p className="text-xs opacity-90">Your changes have been updated.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8">
        <h1 className="text-2xl font-playfair font-bold text-slate-900 mb-6">Create Your Profile</h1>

        {/* Profile Image Upload */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div
              className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-50 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => formData.imageUrl && setZoomedImage(formData.imageUrl)}
            >
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-slate-300" aria-hidden="true" />
              )}
            </div>
            <button
              type="button"
              onClick={triggerFileUpload}
              aria-label="Upload profile photo"
              className="absolute bottom-0 right-0 bg-rose-600 text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-rose-700 transition-all hover:scale-105 active:scale-95 border-2 border-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              <Camera className="w-5 h-5" aria-hidden="true" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <p className="text-sm text-slate-500 mt-3 font-medium">Upload Profile Photo</p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-rose-600">*</span></label>
              <input
                id="fullName"
                type="text"
                value={formData.name}
                onChange={e => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className={`w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-rose-500 outline-none ${errors.name ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                readOnly
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">Sex <span className="text-rose-600">*</span></label>
              <select
                id="gender"
                value={formData.gender}
                onChange={e => {
                  setFormData({ ...formData, gender: e.target.value });
                  if (errors.gender) setErrors({ ...errors, gender: undefined });
                }}
                className={`w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white ${errors.gender ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.gender}
                </p>
              )}
            </div>

            {/* Date of Birth Refactored */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth (DD/MM/YYYY) <span className="text-rose-600">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={dobState.day}
                  onChange={e => setDobState({ ...dobState, day: e.target.value })}
                  className={`p-2.5 border rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white ${errors.dob ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                >
                  <option value="">Day</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select
                  value={dobState.month}
                  onChange={e => setDobState({ ...dobState, month: e.target.value })}
                  className={`p-2.5 border rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white ${errors.dob ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                >
                  <option value="">Month</option>
                  {months.map((m, i) => <option key={m} value={(i + 1).toString().padStart(2, '0')}>{m}</option>)}
                </select>
                <select
                  value={dobState.year}
                  onChange={e => setDobState({ ...dobState, year: e.target.value })}
                  className={`p-2.5 border rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white ${errors.dob ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                >
                  <option value="">Year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {errors.dob && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.dob}
                </p>
              )}
            </div>

            {/* Birth Time Refactored */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Birth Time</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={timeState.hour}
                  onChange={e => setTimeState({ ...timeState, hour: e.target.value })}
                  className="p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white"
                >
                  <option value="">Hour</option>
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select
                  value={timeState.minute}
                  onChange={e => setTimeState({ ...timeState, minute: e.target.value })}
                  className="p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white"
                >
                  <option value="">Min</option>
                  {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select
                  value={timeState.ampm}
                  onChange={e => setTimeState({ ...timeState, ampm: e.target.value })}
                  className="p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white"
                >
                  <option value="">AM/PM</option>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-slate-700 mb-1">Height</label>
              <select
                id="height"
                value={formData.height}
                onChange={e => setFormData({ ...formData, height: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white"
              >
                <option value="">Select Height</option>
                {heightOptions.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-slate-700 mb-1">Marital Status</label>
              <select
                id="maritalStatus"
                value={formData.maritalStatus}
                onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white"
              >
                <option value="">Select Status</option>
                {MARITAL_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>

          {/* Community & Professional Details */}
          <div className="p-5 bg-slate-50 rounded-xl space-y-6 border border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">Community & Career</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="religion" className="block text-sm font-medium text-slate-600 mb-1">Religion <span className="text-rose-600">*</span></label>
                <select
                  id="religion"
                  value={formData.religion}
                  onChange={e => {
                    setFormData({ ...formData, religion: e.target.value });
                    if (errors.religion) setErrors({ ...errors, religion: undefined });
                  }}
                  className={`w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white ${errors.religion ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                >
                  <option value="" disabled>Select</option>
                  {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.religion && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.religion}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="motherTongue" className="block text-sm font-medium text-slate-600 mb-1">Mother Tongue</label>
                <select
                  id="motherTongue"
                  value={formData.motherTongue}
                  onChange={e => setFormData({ ...formData, motherTongue: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white"
                >
                  <option value="">Select Language</option>
                  {MOTHER_TONGUES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Caste Dropdown */}
              <div>
                <label htmlFor="caste" className="block text-sm font-medium text-slate-600 mb-1">Caste</label>
                <select
                  id="caste"
                  value={formData.caste}
                  onChange={handleCasteChange}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white"
                >
                  <option value="">Select Caste</option>
                  {CASTES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Sub-Caste Dropdown or Input */}
              <div>
                <label htmlFor="subCaste" className="block text-sm font-medium text-slate-600 mb-1">Sub-Caste</label>
                {availableSubCastes.length > 0 ? (
                  <select
                    id="subCaste"
                    value={formData.subCaste}
                    onChange={e => setFormData({ ...formData, subCaste: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white"
                  >
                    <option value="">Select Sub-Caste</option>
                    {availableSubCastes.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                ) : (
                  <input
                    id="subCaste"
                    type="text"
                    placeholder="e.g. Kanyakubja"
                    value={formData.subCaste}
                    onChange={e => setFormData({ ...formData, subCaste: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                )}
              </div>

              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-slate-600 mb-1">Profession</label>
                <input
                  id="profession"
                  type="text"
                  value={formData.profession}
                  onChange={e => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="income" className="block text-sm font-medium text-slate-600 mb-1">Annual Income</label>
                <input
                  id="income"
                  type="text"
                  placeholder="e.g. 15-20 LPA"
                  value={formData.income}
                  onChange={e => setFormData({ ...formData, income: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-600 mb-1">Location</label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Mumbai, India"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="education" className="block text-sm font-medium text-slate-600 mb-1">Education</label>
                <select
                  id="education"
                  value={formData.education}
                  onChange={e => setFormData({ ...formData, education: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white"
                >
                  <option value="">Select Education</option>
                  {EDUCATION_OPTIONS.map(edu => <option key={edu} value={edu}>{edu}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Hobbies & Interests</label>
            <div className="flex flex-wrap gap-2">
              {HOBBIES_OPTIONS.map(hobby => {
                const isSelected = (formData.hobbies as string[]).includes(hobby);
                return (
                  <button
                    key={hobby}
                    type="button"
                    onClick={() => {
                      const currentHobbies = [...(formData.hobbies as string[])];
                      if (isSelected) {
                        setFormData({ ...formData, hobbies: currentHobbies.filter(h => h !== hobby) });
                      } else {
                        if (currentHobbies.length < 10) {
                          setFormData({ ...formData, hobbies: [...currentHobbies, hobby] });
                        }
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${isSelected
                      ? 'bg-rose-100 text-rose-700 border-rose-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-rose-200 hover:text-rose-600'
                      }`}
                  >
                    {hobby}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-2">Select up to 10 hobbies.</p>
          </div>

          {/* Family Details */}
          <div className="p-5 bg-slate-50 rounded-xl space-y-6 border border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">Family Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fatherOccupation" className="block text-sm font-medium text-slate-600 mb-1">Father's Occupation</label>
                <input
                  id="fatherOccupation"
                  type="text"
                  placeholder="e.g. Businessman"
                  value={formData.fatherOccupation}
                  onChange={e => setFormData({ ...formData, fatherOccupation: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="motherOccupation" className="block text-sm font-medium text-slate-600 mb-1">Mother's Occupation</label>
                <input
                  id="motherOccupation"
                  type="text"
                  placeholder="e.g. Homemaker"
                  value={formData.motherOccupation}
                  onChange={e => setFormData({ ...formData, motherOccupation: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="siblings" className="block text-sm font-medium text-slate-600 mb-1">No. of Siblings</label>
                <input
                  id="siblings"
                  type="number"
                  min="0"
                  value={formData.siblings}
                  onChange={e => setFormData({ ...formData, siblings: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="familyLocation" className="block text-sm font-medium text-slate-600 mb-1">Family Location</label>
                <input
                  id="familyLocation"
                  type="text"
                  placeholder="e.g. Delhi"
                  value={formData.familyLocation}
                  onChange={e => setFormData({ ...formData, familyLocation: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="familyStatus" className="block text-sm font-medium text-slate-600 mb-1">Family Financial Status</label>
                <select
                  id="familyStatus"
                  value={formData.familyStatus}
                  onChange={e => setFormData({ ...formData, familyStatus: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none bg-white"
                >
                  <option value="">Select Status</option>
                  <option value="Middle Class">Middle Class</option>
                  <option value="Upper Middle Class">Upper Middle Class</option>
                  <option value="Rich">Rich</option>
                  <option value="Affluent">Affluent</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-1 gap-6">
            <div>
              <label htmlFor="partnerPref" className="block text-sm font-medium text-slate-700 mb-1">Partner Preference</label>
              <input
                id="partnerPref"
                type="text"
                placeholder="e.g. Someone kind..."
                value={formData.partnerPref}
                onChange={e => setFormData({ ...formData, partnerPref: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-rose-500" aria-hidden="true" /> Photo Gallery
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {/* Existing Gallery Images */}
              {Array.isArray(formData.gallery) && formData.gallery.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer" onClick={() => setZoomedImage(img)}>
                  <img
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newGallery = [...(formData.gallery as string[])];
                      newGallery.splice(idx, 1);
                      setFormData({ ...formData, gallery: newGallery });
                    }}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Add New Photo Button */}
              <button
                type="button"
                onClick={() => document.getElementById('gallery-upload')?.click()}
                className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                <div className="p-2 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="h-5 w-5 text-rose-500" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold text-slate-500 group-hover:text-rose-600">Add Photo</span>
              </button>
              <input
                id="gallery-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach((file: File) => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (reader.result) {
                          setFormData(prev => ({
                            ...prev,
                            gallery: [...(prev.gallery || []), reader.result as string]
                          }));
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                    e.target.value = ''; // Reset input
                  }
                }}
              />
            </div>
            <p className="text-xs text-slate-500">Add up to 5 photos to showcase your personality.</p>
          </div>

          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700">Bio / About Me</label>
              <button
                type="button"
                onClick={handleGenerateBio}
                disabled={isGenerating}
                className="text-xs flex items-center gap-1 text-rose-600 font-bold hover:text-rose-700 disabled:opacity-50 focus:outline-none focus:underline"
              >
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : <Sparkles className="h-3 w-3" aria-hidden="true" />}
                {isGenerating ? "Writing..." : "Magic Write with AI"}
              </button>
            </div>
            <textarea
              id="bio"
              rows={5}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none resize-none"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">Use AI to generate a professional bio instantly.</p>
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
          >
            <Save className="h-5 w-5" aria-hidden="true" /> Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
