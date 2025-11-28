import axios from 'axios';
import { Profile, ChatMessage } from '../types';

// NOTE: Update this URL to match your local PHP server configuration
const API_BASE_URL = 'http://192.168.1.13/soulmateai/backend/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const profileService = {
  getAll: async (gender?: string, excludeUserId?: string): Promise<Profile[]> => {
    try {
      const params = new URLSearchParams();
      if (gender) params.append('gender', gender);
      if (excludeUserId) params.append('excludeUserId', excludeUserId);

      const response = await api.get(`/profiles.php?${params.toString()}`);
      return response.data.records || [];
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Profile | null> => {
    try {
      const response = await api.get(`/profiles.php?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  getByUserId: async (userId: string): Promise<Profile | null> => {
    try {
      const response = await api.get(`/profiles.php?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile by user ID:', error);
      return null;
    }
  },

  create: async (profile: Partial<Profile>): Promise<boolean> => {
    try {
      await api.post('/profiles.php', profile);
      return true;
    } catch (error) {
      console.error('Error creating profile:', error);
      return false;
    }
  },

  update: async (profile: Partial<Profile>): Promise<boolean> => {
    try {
      await api.post('/profiles.php', profile);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  },
};

export const connectionService = {
  sendRequest: async (senderId: string, receiverId: string): Promise<boolean> => {
    try {
      await api.post('/connections.php', { sender_id: senderId, receiver_id: receiverId });
      return true;
    } catch (error) {
      console.error('Error sending connection request:', error);
      return false;
    }
  },

  respondToRequest: async (connectionId: string, status: 'accepted' | 'rejected'): Promise<boolean> => {
    try {
      await api.put('/connections.php', { connection_id: connectionId, status });
      return true;
    } catch (error) {
      console.error('Error responding to request:', error);
      return false;
    }
  },

  checkStatus: async (senderId: string, receiverId: string): Promise<string> => {
    try {
      const response = await api.get(`/connections.php?type=check&sender_id=${senderId}&receiver_id=${receiverId}`);
      return response.data.status || 'none';
    } catch (error) {
      console.error('Error checking connection status:', error);
      return 'none';
    }
  },

  getPendingRequests: async (userId: string): Promise<any[]> => {
    try {
      const response = await api.get(`/connections.php?type=pending&user_id=${userId}`);
      return response.data.records || [];
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  },

  getConnections: async (userId: string): Promise<any[]> => {
    try {
      const response = await api.get(`/connections.php?type=accepted&user_id=${userId}`);
      return response.data.records || [];
    } catch (error) {
      console.error('Error fetching connections:', error);
      return [];
    }
  }
};

export const authService = {
  signup: async (data: any): Promise<{ success: boolean; user?: any; message?: string }> => {
    try {
      const response = await api.post('/auth.php?action=signup', data);
      return { success: true, user: response.data.user };
    } catch (error: any) {
      console.error('Error signing up:', error);
      let message = "Signup failed. Please try again.";
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      return { success: false, message };
    }
  },
  login: async (data: any): Promise<any> => {
    try {
      const response = await api.post('/auth.php?action=login', data);
      return response.data;
    } catch (error: any) {
      console.error('Error logging in:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      return null;
    }
  }
};

export const chatService = {
  getMessages: async (userId: string, friendId: string) => {
    try {
      const response = await api.get(`/user_chat.php?userId=${userId}&friendId=${friendId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  sendMessage: async (senderId: string, receiverId: string, message: string) => {
    try {
      const response = await api.post('/user_chat.php', {
        sender_id: senderId,
        receiver_id: receiverId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }
};
