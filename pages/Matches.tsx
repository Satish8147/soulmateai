import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import { RELIGIONS, MOTHER_TONGUES, MARITAL_STATUS_OPTIONS } from '../constants';
import { connectionService, profileService } from '../services/api';
import { Filter, SlidersHorizontal, UserPlus, Check, X } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const Matches: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [activeTab, setActiveTab] = useState<'matches' | 'requests' | 'connections'>('matches');
  const [requests, setRequests] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    religion: queryParams.get('religion') || '',
    caste: '',
    subCaste: '',
    motherTongue: '',
    maritalStatus: '',
    minAge: Number(queryParams.get('minAge')) || 18,
    maxAge: Number(queryParams.get('maxAge')) || 60,
    search: ''
  });

  const [sortBy, setSortBy] = useState('relevance');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [userGender, setUserGender] = useState<string>('');

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        let oppositeGender = '';
        let currentUserId = '';

        if (user?.id) {
          currentUserId = user.id;
          // Fetch current user's profile to get gender
          try {
            const myProfile = await profileService.getByUserId(user.id);
            if (myProfile && myProfile.gender) {
              const myGender = myProfile.gender.toLowerCase();
              setUserGender(myProfile.gender);
              if (myGender === 'male') oppositeGender = 'Female';
              else if (myGender === 'female') oppositeGender = 'Male';
            }
          } catch (e) {
            console.error("Error fetching user profile", e);
          }
        }

        const data = await profileService.getAll(oppositeGender, currentUserId);
        setProfiles(data);
      } catch (error) {
        console.error("Failed to fetch profiles", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRequests = async () => {
      if (user?.id) {
        try {
          const data = await connectionService.getPendingRequests(user.id);
          setRequests(data);
        } catch (error) {
          console.error("Failed to fetch requests", error);
        }
      }
    };

    const fetchConnections = async () => {
      if (user?.id) {
        try {
          const data = await connectionService.getConnections(user.id);
          setConnections(data);
        } catch (error) {
          console.error("Failed to fetch connections", error);
        }
      }
    };

    fetchProfiles();
    fetchRequests();
    fetchConnections();
  }, [user]);

  const handleAcceptRequest = async (connectionId: string, senderName: string) => {
    try {
      await connectionService.respondToRequest(connectionId, 'accepted');
      setRequests(prev => prev.filter(r => r.id !== connectionId));

      // Refresh connections list immediately
      if (user?.id) {
        const updatedConnections = await connectionService.getConnections(user.id);
        setConnections(updatedConnections);
      }

      addNotification({
        type: 'connection',
        title: 'Request Accepted',
        message: `You are now connected with ${senderName}. You can now message each other.`,
        link: `/chat`
      });
    } catch (error) {
      console.error("Error accepting request", error);
      alert("Failed to accept request.");
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      await connectionService.respondToRequest(connectionId, 'rejected');
      setRequests(prev => prev.filter(r => r.id !== connectionId));
    } catch (error) {
      console.error("Error rejecting request", error);
      alert("Failed to reject request.");
    }
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      // Gender Filtering is now handled by backend, but we keep this as a safeguard
      let matchesGender = true;
      if (userGender === 'Male') {
        matchesGender = profile.gender === 'Female';
      } else if (userGender === 'Female') {
        matchesGender = profile.gender === 'Male';
      }

      const matchesReligion = filters.religion ? profile.religion === filters.religion : true;
      const matchesCaste = filters.caste
        ? (profile.caste && profile.caste.toLowerCase().includes(filters.caste.toLowerCase()))
        : true;
      const matchesSubCaste = filters.subCaste
        ? (profile.subCaste && profile.subCaste.toLowerCase().includes(filters.subCaste.toLowerCase()))
        : true;
      const matchesMotherTongue = filters.motherTongue ? profile.motherTongue === filters.motherTongue : true;
      const matchesMaritalStatus = filters.maritalStatus ? profile.maritalStatus === filters.maritalStatus : true;
      const matchesAge = profile.age >= filters.minAge && profile.age <= filters.maxAge;
      const matchesSearch = filters.search
        ? profile.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        profile.profession.toLowerCase().includes(filters.search.toLowerCase())
        : true;

      return matchesGender && matchesReligion && matchesCaste && matchesSubCaste && matchesMotherTongue && matchesMaritalStatus && matchesAge && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return b.id - a.id; // Higher ID = Newest
      } else if (sortBy === 'age_asc') {
        return a.age - b.age;
      } else if (sortBy === 'age_desc') {
        return b.age - a.age;
      }
      return 0; // Relevance (default order)
    });
  }, [filters, userGender, profiles, sortBy]);

  const handleReset = () => {
    setFilters({
      religion: '',
      caste: '',
      subCaste: '',
      motherTongue: '',
      maritalStatus: '',
      minAge: 18,
      maxAge: 60,
      search: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'matches' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Find Matches
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Requests
            {requests.length > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'connections' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Connections
          </button>
        </div>
      </div>

      {activeTab === 'requests' ? (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6">Connection Requests</h2>
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserPlus className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-500">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <Link to={`/matches/${req.senderProfileId}`} className="flex items-center gap-4 flex-1">
                    <img
                      src={req.senderImage || 'https://via.placeholder.com/150'}
                      alt={req.senderName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 hover:text-rose-600 transition-colors">{req.senderName}</h3>
                      <p className="text-sm text-slate-500">Sent you a connection request</p>
                    </div>
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                      title="Reject"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(req.id, req.senderName)}
                      className="p-2 bg-rose-600 text-white hover:bg-rose-700 rounded-full transition-colors shadow-sm shadow-rose-200"
                      title="Accept"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'connections' ? (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6">My Connections</h2>
          {connections.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserPlus className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-500">No connections yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map(conn => (
                <div key={conn.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <Link to={`/matches/${conn.friendProfileId}`} className="flex items-center gap-4 flex-1">
                    <img
                      src={conn.friendImage || 'https://via.placeholder.com/150'}
                      alt={conn.friendName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 hover:text-rose-600 transition-colors">{conn.friendName}</h3>
                      <p className="text-sm text-slate-500">Connected</p>
                    </div>
                  </Link>
                  <Link
                    to={`/chat/${conn.friendId}`}
                    className="px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded-full hover:bg-rose-700 transition-colors shadow-sm"
                  >
                    Message
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            aria-expanded={isFilterOpen}
            aria-controls="filter-sidebar"
            aria-label="Toggle filters"
            className="md:hidden flex items-center justify-center gap-2 bg-white border border-slate-200 p-3 rounded-lg text-slate-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" /> Filters
          </button>

          {/* Sidebar Filters */}
          <aside
            id="filter-sidebar"
            className={`
            md:w-64 flex-shrink-0 space-y-8
            ${isFilterOpen ? 'block' : 'hidden md:block'}
          `}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6 text-slate-900 font-playfair font-bold text-lg border-b pb-2">
                <Filter className="h-5 w-5 text-rose-600" aria-hidden="true" /> Filters
              </div>

              <div className="space-y-5">

                {/* Search */}
                <div className="space-y-1.5">
                  <label htmlFor="search-input" className="text-xs font-bold text-slate-600 uppercase tracking-wide">Keyword</label>
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Name, Profession..."
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all"
                    value={filters.search}
                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>

                {/* Religion */}
                <div className="space-y-1.5">
                  <label htmlFor="religion-select" className="text-xs font-bold text-slate-600 uppercase tracking-wide">Religion</label>
                  <select
                    id="religion-select"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all bg-white"
                    value={filters.religion}
                    onChange={e => setFilters({ ...filters, religion: e.target.value })}
                  >
                    <option value="">Any Religion</option>
                    {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Caste */}
                <div className="space-y-1.5">
                  <label htmlFor="caste-input" className="text-xs font-bold text-slate-600 uppercase tracking-wide">Caste</label>
                  <input
                    id="caste-input"
                    type="text"
                    placeholder="e.g. Brahmin, Patel"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all"
                    value={filters.caste}
                    onChange={e => setFilters({ ...filters, caste: e.target.value })}
                  />
                </div>

                {/* Sub Caste */}
                <div className="space-y-1.5">
                  <label htmlFor="subcaste-input" className="text-xs font-bold text-slate-600 uppercase tracking-wide">Sub-Caste</label>
                  <input
                    id="subcaste-input"
                    type="text"
                    placeholder="e.g. Kanyakubja, Leuva"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all"
                    value={filters.subCaste}
                    onChange={e => setFilters({ ...filters, subCaste: e.target.value })}
                  />
                </div>

                {/* Mother Tongue */}
                <div className="space-y-1.5">
                  <label htmlFor="language-select" className="text-xs font-bold text-slate-600 uppercase tracking-wide">Mother Tongue</label>
                  <select
                    id="language-select"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all bg-white"
                    value={filters.motherTongue}
                    onChange={e => setFilters({ ...filters, motherTongue: e.target.value })}
                  >
                    <option value="">Any Language</option>
                    {MOTHER_TONGUES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* Marital Status */}
                <div className="space-y-1.5">
                  <label htmlFor="marital-status-select" className="text-xs font-bold text-slate-600 uppercase tracking-wide">Marital Status</label>
                  <select
                    id="marital-status-select"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all bg-white"
                    value={filters.maritalStatus}
                    onChange={e => setFilters({ ...filters, maritalStatus: e.target.value })}
                  >
                    <option value="">Any Status</option>
                    {MARITAL_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label id="age-range-filter-label" className="text-xs font-bold text-slate-600 uppercase tracking-wide">Age Range ({filters.minAge} - {filters.maxAge})</label>
                  <div className="flex items-center gap-2" aria-labelledby="age-range-filter-label">
                    <input
                      type="range" min="18" max="60"
                      aria-label="Minimum age"
                      value={filters.minAge}
                      onChange={e => setFilters({ ...filters, minAge: Math.min(Number(e.target.value), filters.maxAge) })}
                      className="w-full accent-rose-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <input
                      type="range" min="18" max="60"
                      aria-label="Maximum age"
                      value={filters.maxAge}
                      onChange={e => setFilters({ ...filters, maxAge: Math.max(Number(e.target.value), filters.minAge) })}
                      className="w-full accent-rose-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full py-2.5 text-sm text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-bold transition-colors mt-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <main className="flex-1">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <h1 className="text-xl md:text-2xl font-playfair font-bold text-slate-900">
                {filteredProfiles.length} <span className="text-slate-500 text-base md:text-lg font-sans font-normal">Matches found</span>
              </h1>
              <select
                aria-label="Sort profiles"
                className="bg-transparent text-sm font-medium text-slate-600 border-none outline-none cursor-pointer hover:text-rose-600 focus:ring-2 focus:ring-rose-500 rounded"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Sort by: Relevance</option>
                <option value="newest">Newest First</option>
                <option value="age_asc">Age: Low to High</option>
                <option value="age_desc">Age: High to Low</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map(profile => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>

            {filteredProfiles.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="h-8 w-8 text-slate-300" aria-hidden="true" />
                </div>
                <p className="text-slate-900 font-medium text-lg">No matches found</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters to see more results.</p>
                <button
                  onClick={handleReset}
                  className="mt-6 px-6 py-2 bg-rose-600 text-white rounded-full font-medium hover:bg-rose-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default Matches;
