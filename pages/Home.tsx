import React, { useState } from 'react';
import { Search, Heart, Shield, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RELIGIONS } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [lookingFor, setLookingFor] = useState('Woman');
  const [ageFrom, setAgeFrom] = useState('20');
  const [ageTo, setAgeTo] = useState('35');
  const [religion, setReligion] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/matches?religion=${religion}&minAge=${ageFrom}&maxAge=${ageTo}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-slate-900 py-20 lg:py-32 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/id/429/1920/1080" 
            alt="Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          
          <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium text-sm tracking-wide uppercase">
              #1 Matrimony Platform
            </span>
            <h1 className="text-4xl lg:text-6xl font-playfair font-bold text-white leading-tight">
              Find the One Who <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">Completes You</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl mx-auto lg:mx-0">
              Millions of happy stories started here. Use our AI-powered matchmaking to find a partner who truly matches your vibe, values, and vision.
            </p>
          </div>

          {/* Search Widget */}
          <div className="lg:w-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 lg:p-8">
            <h2 className="text-2xl font-playfair font-bold text-slate-800 mb-6">Begin Your Journey</h2>
            <form onSubmit={handleSearch} className="space-y-4" role="search" aria-label="Profile Search">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="lookingFor" className="text-xs font-semibold text-slate-500 uppercase">I'm looking for</label>
                  <select 
                    id="lookingFor"
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-slate-700 font-medium"
                  >
                    <option value="Woman">Woman</option>
                    <option value="Man">Man</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="religion" className="text-xs font-semibold text-slate-500 uppercase">Religion</label>
                  <select 
                    id="religion"
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-slate-700 font-medium"
                  >
                    <option value="">Any</option>
                    {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label id="age-range-label" className="text-xs font-semibold text-slate-500 uppercase">Age Range</label>
                <div className="flex items-center gap-2" aria-labelledby="age-range-label">
                  <select 
                    aria-label="Minimum Age"
                    value={ageFrom}
                    onChange={(e) => setAgeFrom(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 outline-none text-slate-700"
                  >
                    {Array.from({length: 40}, (_, i) => i + 18).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                  <span className="text-slate-400" aria-hidden="true">to</span>
                  <select 
                    aria-label="Maximum Age"
                    value={ageTo}
                    onChange={(e) => setAgeTo(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 outline-none text-slate-700"
                  >
                    {Array.from({length: 40}, (_, i) => i + 18).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 mt-4 focus:ring-2 focus:ring-offset-2 focus:ring-rose-500">
                <Search className="h-5 w-5" aria-hidden="true" />
                Let's Begin
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Features / Stats */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-playfair font-bold text-slate-900">Why Choose SoulmateAI?</h2>
            <p className="text-slate-500 mt-2">The most trusted way to find your life partner</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 text-center">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-rose-600" aria-hidden="true">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">100% Verified Profiles</h3>
              <p className="text-slate-600 leading-relaxed">Every profile is manually screened and verified to ensure a safe and secure experience.</p>
            </div>
            <div className="p-6 rounded-2xl bg-purple-50 border border-purple-100 text-center">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-purple-600" aria-hidden="true">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">AI-Powered Matching</h3>
              <p className="text-slate-600 leading-relaxed">Our Gemini-powered algorithm understands your preferences better than anyone else.</p>
            </div>
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 text-center">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-amber-600" aria-hidden="true">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Millions of Success Stories</h3>
              <p className="text-slate-600 leading-relaxed">Join the platform that has brought together happy couples from all over the world.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action for AI */}
      <div className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 bg-rose-600 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 p-20 bg-purple-600 rounded-full blur-[100px] opacity-20"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">Not sure what you're looking for?</h2>
          <p className="text-slate-300 text-lg mb-8">Chat with our AI Matchmaker. Tell it about yourself in plain English, and let it find your perfect match from thousands of profiles.</p>
          <button 
            onClick={() => navigate('/ai-matchmaker')}
            className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-rose-50 transition-colors focus:ring-4 focus:ring-rose-500/50"
          >
            Try AI Matchmaker <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;