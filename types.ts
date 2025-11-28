export interface Profile {
  id: string;
  userId?: string;
  email?: string;
  name: string;
  age: number;
  dob?: string;
  birthTime?: string;
  gender: 'Male' | 'Female' | 'Other';
  religion: string;
  caste?: string;
  subCaste?: string;
  motherTongue: string;
  profession: string;
  location: string;
  education: string;
  height: string;
  income: string;
  maritalStatus: 'Never Married' | 'Divorced' | 'Widowed';
  bio: string;
  hobbies: string[];
  imageUrl: string;
  gallery?: string[];
  traits?: string;
  partnerPref?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: number;
  familyLocation?: string;
  familyStatus?: string;
  verified: boolean;
}

export interface SearchFilters {
  minAge: number;
  maxAge: number;
  religion: string;
  location: string;
  maritalStatus: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  relatedProfileIds?: string[];
}

export interface AppNotification {
  id: string;
  type: 'connection' | 'message' | 'match' | 'system';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string;
}

export interface User {
  id: string;
  email: string;
}