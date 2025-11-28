import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { chatService, connectionService } from '../services/api';
import { Send, User, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const Chat: React.FC = () => {
    const { user } = useAuth();
    const { userId } = useParams<{ userId?: string }>();
    const navigate = useNavigate();

    const [connections, setConnections] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeChat, setActiveChat] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch connections on mount
    useEffect(() => {
        if (user?.id) {
            const fetchConnections = async () => {
                try {
                    const data = await connectionService.getConnections(user.id);
                    setConnections(data);

                    // If userId param exists, set active chat
                    if (userId) {
                        const friend = data.find(c => c.friendId == userId);
                        if (friend) setActiveChat(friend);
                    } else if (data.length > 0 && !activeChat) {
                        // Default to first connection if no param
                        // navigate(\`/chat/\${data[0].friendId}\`);
                    }
                } catch (error) {
                    console.error("Error fetching connections", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchConnections();
        }
    }, [user, userId]);

    // Fetch messages when active chat changes
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const fetchMessages = async () => {
            if (user?.id && activeChat) {
                try {
                    const data = await chatService.getMessages(user.id, activeChat.friendId);
                    setMessages(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(data)) {
                            return data;
                        }
                        return prev;
                    });
                } catch (error) {
                    console.error("Error fetching messages", error);
                }
            }
        };

        if (activeChat) {
            fetchMessages();
            // Poll for new messages every 3 seconds
            interval = setInterval(fetchMessages, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [user, activeChat]);



    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !activeChat) return;

        try {
            await chatService.sendMessage(user.id, activeChat.friendId, newMessage);
            setNewMessage('');
            // Refresh messages immediately
            const data = await chatService.getMessages(user.id, activeChat.friendId);
            setMessages(data);
        } catch (error) {
            console.error("Error sending message", error);
            alert("Failed to send message");
        }
    };

    const handleSelectChat = (connection: any) => {
        setActiveChat(connection);
        navigate(`/chat/${connection.friendId}`);
    };

    if (loading) return <div className="p-8 text-center">Loading chat...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-100px)]">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex overflow-hidden">

                {/* Sidebar - Connections List */}
                <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="font-playfair font-bold text-xl text-slate-900">Messages</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {connections.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <p>No connections yet.</p>
                                <Link to="/matches" className="text-rose-600 font-bold text-sm mt-2 inline-block">Find Matches</Link>
                            </div>
                        ) : (
                            connections.map(conn => (
                                <div
                                    key={conn.id}
                                    onClick={() => handleSelectChat(conn)}
                                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${activeChat?.id === conn.id ? 'bg-rose-50 border-r-4 border-rose-600' : ''}`}
                                >
                                    <img
                                        src={conn.friendImage || 'https://via.placeholder.com/150'}
                                        alt={conn.friendName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 truncate">{conn.friendName}</h3>
                                        <p className="text-xs text-slate-500 truncate">Click to chat</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => navigate('/chat')} className="md:hidden p-2 -ml-2 text-slate-500">
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                    <Link to={`/matches/${activeChat.friendProfileId}`}>
                                        <img
                                            src={activeChat.friendImage || 'https://via.placeholder.com/150'}
                                            alt={activeChat.friendName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    </Link>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{activeChat.friendName}</h3>
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 text-slate-400">
                                    <button className="p-2 hover:bg-slate-100 rounded-full"><Phone className="h-5 w-5" /></button>
                                    <button className="p-2 hover:bg-slate-100 rounded-full"><Video className="h-5 w-5" /></button>
                                    <button className="p-2 hover:bg-slate-100 rounded-full"><MoreVertical className="h-5 w-5" /></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                                {messages.map((msg, index) => {
                                    const isMe = msg.sender_id == user?.id;
                                    return (
                                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-rose-600 text-white rounded-br-none' : 'bg-white text-slate-800 shadow-sm rounded-bl-none'}`}>
                                                <p>{msg.message}</p>
                                                <p className={`text-[10px] mt-1 ${isMe ? 'text-rose-100' : 'text-slate-400'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 p-3 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="p-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-rose-200"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <User className="h-10 w-10 text-slate-300" />
                            </div>
                            <p className="text-lg font-medium text-slate-600">Select a conversation</p>
                            <p className="text-sm">Choose a connection from the left to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
