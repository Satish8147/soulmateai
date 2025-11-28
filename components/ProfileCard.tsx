import React, { useState, useEffect } from 'react';
import { MapPin, Briefcase, GraduationCap, CheckCircle, Loader2 } from 'lucide-react';
import { Profile } from '../types';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { connectionService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const [connectStatus, setConnectStatus] = useState<'idle' | 'pending' | 'accepted' | 'rejected' | 'loading'>('loading');
  const { addNotification } = useNotifications();
  const { user } = useAuth(); // Assuming useAuth is available and imported

  useEffect(() => {
    const checkStatus = async () => {
      if (user?.id && profile.userId) {
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
    checkStatus();
  }, [user, profile.userId]);

  const handleConnect = async () => {
    if (connectStatus !== 'idle' || !user?.id || !profile.userId) return;
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-64 overflow-hidden">
        <img
          src={profile.imageUrl}
          alt={profile.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-playfair font-semibold flex items-center gap-1">
            {profile.name}, {profile.age}
            {profile.verified && <CheckCircle className="h-4 w-4 text-blue-400 fill-blue-400 bg-white rounded-full" aria-label="Verified Profile" />}
          </h3>
          <p className="text-sm opacity-90">{profile.religion} • {profile.motherTongue}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2 text-slate-600 text-sm">
          <Briefcase className="h-4 w-4 mt-0.5 text-rose-500" aria-hidden="true" />
          <span>{profile.profession}</span>
        </div>
        <div className="flex items-start gap-2 text-slate-600 text-sm">
          <MapPin className="h-4 w-4 mt-0.5 text-rose-500" aria-hidden="true" />
          <span>{profile.location}</span>
        </div>
        <div className="flex items-start gap-2 text-slate-600 text-sm">
          <GraduationCap className="h-4 w-4 mt-0.5 text-rose-500" aria-hidden="true" />
          <span>{profile.education}</span>
        </div>

        <div className="pt-3 flex gap-2">
          <Link
            to={`/matches/${profile.id}`}
            aria-label={`View profile of ${profile.name}`}
            className="flex-1 bg-white border border-rose-600 text-rose-600 py-2 rounded-lg font-medium text-sm hover:bg-rose-50 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1"
          >
            View Profile
          </Link>

          {connectStatus === 'accepted' ? (
            <Link
              to={`/chat/${profile.userId}`} // Assuming chat route uses userId
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-medium text-sm bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1"
            >
              Message
            </Link>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connectStatus !== 'idle'}
              aria-busy={connectStatus === 'loading'}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-medium text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1
                ${connectStatus === 'idle' ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' : ''}
                ${connectStatus === 'loading' ? 'bg-rose-400 text-white cursor-wait' : ''}
                ${connectStatus === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-none cursor-default' : ''}
                ${connectStatus === 'rejected' ? 'bg-gray-100 text-gray-500 border border-gray-200 shadow-none cursor-default' : ''}
              `}
            >
              {connectStatus === 'idle' && "Connect"}
              {connectStatus === 'loading' && <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>}
              {connectStatus === 'pending' && "Pending"}
              {connectStatus === 'rejected' && "Rejected"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;