
import React, { useState, useRef, useEffect } from 'react';
import { Heart, Menu, X, Bell, User, Check, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isAuthenticated, logout } = useAuth();
  const notificationRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path ? 'text-rose-600 font-semibold' : 'text-slate-600 hover:text-rose-500';

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    setIsNotificationsOpen(false);
    if (link) {
      navigate(link);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const formatTime = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-rose-50 p-2 rounded-full group-hover:bg-rose-100 transition-colors">
              <Heart className="h-6 w-6 text-rose-600 fill-rose-600" aria-hidden="true" />
            </div>
            <span className="font-playfair text-xl font-bold text-slate-900">Soulmate<span className="text-rose-600">AI</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={isActive('/')}>Home</Link>

            {isAuthenticated ? (
              <>
                <Link to="/matches" className={isActive('/matches')}>Matches</Link>
                <Link to="/ai-matchmaker" className={`${isActive('/ai-matchmaker')} flex items-center gap-1`}>
                  <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent font-bold">AI Assistant</span>
                </Link>

                <div className="h-6 w-px bg-slate-200" aria-hidden="true"></div>

                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    aria-expanded={isNotificationsOpen}
                    aria-haspopup="true"
                    aria-label="Notifications"
                    className="relative text-slate-600 hover:text-rose-600 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-full"
                  >
                    <Bell className="h-6 w-6" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                      <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-rose-600 font-medium hover:text-rose-700 flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto" role="list">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              role="listitem"
                              onClick={() => handleNotificationClick(n.id, n.link)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  handleNotificationClick(n.id, n.link);
                                }
                              }}
                              tabIndex={0}
                              className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500 ${!n.read ? 'bg-rose-50/50' : ''}`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <h4 className={`text-sm font-semibold ${!n.read ? 'text-rose-700' : 'text-slate-800'}`}>{n.title}</h4>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatTime(n.timestamp)}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/profile" className="flex items-center gap-2 text-slate-700 hover:text-rose-600 font-medium" aria-label="My Profile">
                  <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 border border-rose-200" aria-hidden="true">
                    <User className="h-4 w-4" />
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <div className="h-6 w-px bg-slate-200" aria-hidden="true"></div>
                <Link to="/signin" className="text-sm font-bold text-slate-600 hover:text-rose-600 transition-colors">
                  Log In
                </Link>
                <Link to="/signup" className="px-5 py-2 bg-rose-600 text-white rounded-full font-bold text-sm hover:bg-rose-700 transition-all hover:shadow-lg hover:shadow-rose-200">
                  Join Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                aria-label="Notifications"
                className="relative text-slate-600 hover:text-rose-600"
              >
                <Bell className="h-6 w-6" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {!isAuthenticated && (
              <Link to="/signup" className="px-3 py-1.5 bg-rose-600 text-white rounded-full font-bold text-xs hover:bg-rose-700 transition-colors">
                Join
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="text-slate-600 hover:text-rose-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Notifications Panel */}
      {isNotificationsOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 shadow-inner max-h-64 overflow-y-auto">
          <div className="p-3 bg-slate-50 flex justify-between items-center sticky top-0">
            <span className="font-bold text-sm text-slate-700">Notifications</span>
            <button onClick={markAllAsRead} className="text-xs text-rose-600">Mark all read</button>
          </div>
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n.id, n.link)}
              className={`p-3 border-b border-slate-100 ${!n.read ? 'bg-rose-50' : ''}`}
            >
              <div className="flex justify-between">
                <span className="text-sm font-semibold">{n.title}</span>
                <span className="text-xs text-slate-400">{formatTime(n.timestamp)}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{n.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg z-40">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50">Home</Link>

            {isAuthenticated ? (
              <>
                <Link to="/matches" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50">Matches</Link>
                <Link to="/ai-matchmaker" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50">AI Assistant</Link>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50">My Profile</Link>
                <div className="h-px bg-slate-100 my-2"></div>
                <button onClick={handleLogout} className="w-full text-left block px-3 py-3 rounded-md text-base font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50">Log Out</button>
              </>
            ) : (
              <>
                <div className="h-px bg-slate-100 my-2"></div>
                <Link to="/signin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50">Log In</Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-rose-600 bg-rose-50 font-bold">Join Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
