import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Globe } from 'lucide-react';
import { getMatchmakerResponse } from '../services/geminiService';
import { chatService } from '../services/api';
import { MOCK_PROFILES } from '../constants';
import ProfileCard from '../components/ProfileCard';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendedProfileIds?: string[];
  groundingChunks?: any[];
}

const AIMatchmaker: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadMessages = async () => {
      const history = await chatService.getMessages();
      if (history.length > 0) {
        // Convert backend messages to UI messages
        const uiMessages: Message[] = history.map(m => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          recommendedProfileIds: m.relatedProfileIds
        }));
        setMessages(uiMessages);
      } else {
        // Initial welcome message if no history
        setMessages([{
          id: '1',
          sender: 'ai',
          text: "Hello! I'm SoulmateBot. I can help you find matches based on what matters to you. Try asking: 'Find me a doctor who loves travel' or 'Show me profiles in Mumbai'. I can also help with dating advice or search for recent wedding trends!"
        }]);
      }
    };
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Save user message to backend
    await chatService.sendMessage({
      sender: 'user',
      text: userMsg.text
    });

    try {
      // Convert current messages to history format for Gemini
      // limiting context to last 10 messages to save tokens/complexity
      const history = messages.slice(-10).map(m => ({
        role: m.sender,
        parts: [{ text: m.text }]
      }));

      const response = await getMatchmakerResponse(userMsg.text, history);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.text,
        recommendedProfileIds: response.recommendedProfileIds,
        groundingChunks: response.groundingChunks
      };

      setMessages(prev => [...prev, aiMsg]);

      // Save AI message to backend
      await chatService.sendMessage({
        sender: 'ai',
        text: aiMsg.text,
        relatedProfileIds: aiMsg.recommendedProfileIds
      });

    } catch (error) {
      console.error("Chat error", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Sorry, I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">AI Matchmaker</h1>
            <p className="text-xs text-slate-500">Powered by Gemini 2.5 Flash & Google Search</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50" role="log" aria-live="polite">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-rose-100 text-rose-600'}`}>
                  {msg.sender === 'user' ? <User className="h-4 w-4" aria-hidden="true" /> : <Bot className="h-4 w-4" aria-hidden="true" />}
                </div>

                {/* Bubble */}
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === 'user'
                    ? 'bg-rose-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                    {msg.text}

                    {/* Grounding Sources */}
                    {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                          <Globe className="h-3 w-3" aria-hidden="true" /> Sources
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {msg.groundingChunks.map((chunk, idx) => {
                            if (chunk.web) {
                              return (
                                <a
                                  key={idx}
                                  href={chunk.web.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-slate-50 text-rose-600 px-2 py-1 rounded border border-slate-200 hover:bg-rose-50 hover:border-rose-200 truncate max-w-[200px]"
                                >
                                  {chunk.web.title || chunk.web.uri}
                                </a>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Render Recommendations if any */}
                  {msg.sender === 'ai' && msg.recommendedProfileIds && msg.recommendedProfileIds.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 mt-2">
                      {msg.recommendedProfileIds.map(id => {
                        const profile = MOCK_PROFILES.find(p => p.id === id);
                        if (!profile) return null;
                        return (
                          <div key={id} className="scale-90 origin-top-left -mb-4 -mr-4">
                            {/* Reusing Profile Card but smaller container */}
                            <ProfileCard profile={profile} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2 ml-11">
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your ideal partner or ask for dating advice..."
              aria-label="Message SoulmateBot"
              className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="absolute right-2 top-2 p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:hover:bg-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-500"
            >
              <Send className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-400">AI can make mistakes. Check important info.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMatchmaker;