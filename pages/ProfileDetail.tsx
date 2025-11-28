import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profileService } from '../services/api';
import { Profile } from '../types';
import { MapPin, Briefcase, GraduationCap, Ruler, Globe, Heart, ShieldCheck, ArrowLeft, Image as ImageIcon, Plus, Loader2, CheckCircle, X, User, Clock, Calendar, Sparkles, HeartHandshake, Home, Wallet, Languages } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { connectionService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ProfileDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState<string[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

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

  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchProfile = async () => {
      if (id) {
        setLoading(true);
        const data = await profileService.getById(id);
        setProfile(data);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (profile) {
      // Initialize gallery with profile data or just the main image if empty
      // Ensure gallery is an array before checking length
      const profileGallery = Array.isArray(profile.gallery) ? profile.gallery : [];
      setGallery(profileGallery.length > 0 ? profileGallery : (profile.imageUrl ? [profile.imageUrl] : []));
    }
  }, [profile]);

  const { user } = useAuth(); // Assuming useAuth is available
  const [connectStatus, setConnectStatus] = useState<'idle' | 'pending' | 'accepted' | 'rejected' | 'loading'>('loading');

  useEffect(() => {
    const checkStatus = async () => {
      if (user?.id && profile?.userId) {
        try {
          const status = await connectionService.checkStatus(user.id, profile.userId);
          if (status && status !== 'none') {
            setConnectStatus(status as any);
          } else {
            setConnectStatus('idle');
          }
        } catch (error) {
          console.error("Error checking connection status", error);
          setConnectStatus('idle');
        }
      } else {
        setConnectStatus('idle');
      }
    };
    if (profile) checkStatus();
  }, [user, profile]);

  const handleConnect = async () => {
    if (connectStatus !== 'idle' || !user?.id || !profile?.userId) return;
    setConnectStatus('loading');

    try {
      await connectionService.sendRequest(user.id, profile.userId);
      setConnectStatus('pending');
      addNotification({
        type: 'connection',
        title: 'Connection Request Sent',
        message: `Your request to connect with ${profile.name} has been sent successfully.`,
        link: `/matches/${profile.id}`
      });
    } catch (error) {
      console.error("Error sending connection request", error);
      setConnectStatus('idle');
      alert("Failed to send request.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-rose-600" /></div>;
  }

  if (!profile) {
    return <div className="p-8 text-center">Profile not found</div>;
  }

  // Helper to format religion, caste, subcaste
  const getCommunityString = () => {
    const parts = [profile.religion];
    if (profile.caste) {
      parts.push(`• ${profile.caste}`);
    }
    if (profile.subCaste) {
      parts.push(`(${profile.subCaste})`);
    }
    return parts.join(' ');
  };

  // Helper to format time to AM/PM
  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return 'Not Specified';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours));
      date.setMinutes(parseInt(minutes));
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return timeString;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/matches" className="inline-flex items-center text-slate-500 hover:text-rose-600 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" /> Back to Matches
      </Link>

      <ImageModal />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Cover / Header */}
        <div className="relative h-48 bg-gradient-to-r from-rose-100 to-purple-100">
          <div
            className="absolute -bottom-24 left-8 p-1 bg-white rounded-2xl shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => profile?.imageUrl && setZoomedImage(profile.imageUrl)}
          >
            <img
              src={profile.imageUrl}
              alt={profile.name}
              className="w-48 h-48 rounded-xl object-cover"
            />
          </div>
        </div>

        <div className="pt-28 pb-8 px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center gap-2">
                {profile.name}
                {profile.verified && (
                  <span title="Verified Profile" className="flex items-center">
                    <ShieldCheck className="h-6 w-6 text-blue-500" aria-label="Verified Profile" />
                  </span>
                )}
              </h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2">
                <span className="font-medium text-slate-900">{profile.age} Yrs</span> • {profile.location}
              </p>
            </div>
            <div className="flex gap-3">
              {connectStatus === 'accepted' ? (
                <Link
                  to={`/chat/${profile.userId}`}
                  className="px-6 py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center gap-2 min-w-[160px] justify-center bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200"
                >
                  Message
                </Link>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={connectStatus !== 'idle'}
                  aria-busy={connectStatus === 'loading'}
                  className={`px-6 py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center gap-2 min-w-[160px] justify-center focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
                     ${connectStatus === 'idle' ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' : ''}
                     ${connectStatus === 'loading' ? 'bg-rose-400 text-white cursor-wait' : ''}
                     ${connectStatus === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-none cursor-default' : ''}
                     ${connectStatus === 'rejected' ? 'bg-gray-100 text-gray-500 border border-gray-200 shadow-none cursor-default' : ''}
                   `}
                >
                  {connectStatus === 'idle' && "Connect Now"}
                  {connectStatus === 'loading' && <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending...</>}
                  {connectStatus === 'pending' && <><CheckCircle className="h-5 w-5" aria-hidden="true" /> Request Sent</>}
                  {connectStatus === 'rejected' && "Rejected"}
                </button>
              )}
              <button
                aria-label="Add to favorites"
                className="p-2.5 border border-slate-200 rounded-lg text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <Heart className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-10">
            {/* Left Column: Bio, Gallery & Basic Info */}
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 font-playfair">About Me</h2>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100">
                  "{profile.bio}"
                </p>
              </section>

              {/* Photo Gallery Section */}
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 font-playfair flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-rose-500" aria-hidden="true" /> Photo Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {gallery.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer"
                      onClick={() => setZoomedImage(img)}
                    >
                      <img
                        src={img}
                        alt={`Gallery photo ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 font-playfair">Basic Information</h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <DetailItem icon={<User />} label="Gender" value={profile.gender} />
                  <DetailItem icon={<Calendar />} label="Date of Birth" value={profile.dob ? new Date(profile.dob).toLocaleDateString('en-GB') : 'Not Specified'} />
                  <DetailItem icon={<Clock />} label="Birth Time" value={formatTime(profile.birthTime)} />
                  <DetailItem icon={<Ruler />} label="Height" value={profile.height} />
                  <DetailItem icon={<Heart />} label="Marital Status" value={profile.maritalStatus} />
                  <DetailItem icon={<MapPin />} label="Location" value={profile.location} />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 font-playfair">Community & Career</h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <DetailItem icon={<Globe />} label="Religion & Community" value={getCommunityString()} />
                  <DetailItem icon={<Languages />} label="Mother Tongue" value={profile.motherTongue} />
                  <DetailItem icon={<Briefcase />} label="Profession" value={profile.profession} />
                  <DetailItem icon={<GraduationCap />} label="Education" value={profile.education} />
                  <DetailItem icon={<Wallet />} label="Income" value={profile.income} />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 font-playfair">Family Details</h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <DetailItem icon={<Briefcase />} label="Father's Occupation" value={profile.fatherOccupation || 'Not Specified'} />
                  <DetailItem icon={<Briefcase />} label="Mother's Occupation" value={profile.motherOccupation || 'Not Specified'} />
                  <DetailItem icon={<User />} label="Siblings" value={profile.siblings !== undefined && profile.siblings !== null ? profile.siblings.toString() : 'Not Specified'} />
                  <DetailItem icon={<Home />} label="Family Location" value={profile.familyLocation || 'Not Specified'} />
                  <DetailItem icon={<Wallet />} label="Family Status" value={profile.familyStatus || 'Not Specified'} />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 font-playfair">Partner Preferences</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <HeartHandshake className="h-5 w-5 text-rose-500" />
                      <h3 className="font-semibold text-slate-800">Partner Preference</h3>
                    </div>
                    <p className="text-slate-600">{profile.partnerPref || "Not specified"}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Hobbies & Preferences */}
            <div className="space-y-8">
              <section className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 font-playfair">Hobbies & Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {(profile.hobbies || []).map(hobby => (
                    <span key={hobby} className="px-3 py-1 bg-rose-50 text-rose-700 text-sm rounded-full border border-rose-100">
                      {hobby}
                    </span>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                <h2 className="text-lg font-bold text-indigo-900 mb-2 font-playfair">AI Compatibility</h2>
                <p className="text-sm text-indigo-700 mb-4">
                  Based on your profile, our Gemini AI thinks you two would be a <span className="font-bold">85% match</span>.
                </p>
                <div className="w-full bg-white rounded-full h-2 mb-2" role="progressbar" aria-valuenow={85} aria-valuemin={0} aria-valuemax={100} aria-label="Compatibility Score">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-indigo-600">
                  You both enjoy traveling and have similar educational backgrounds.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ icon?: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    {icon && <div className="text-slate-400 mt-0.5 w-5 h-5" aria-hidden="true">{icon}</div>}
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-slate-800 font-medium">{value}</p>
    </div>
  </div>
);

export default ProfileDetail;