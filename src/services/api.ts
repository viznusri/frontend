import axios, { AxiosInstance } from 'axios';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  User, 
  Behavior, 
  BehaviorSummary, 
  RewardWithStatus,
  BehaviorType
} from '../types';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, Firebase rewrites will handle this
  : 'http://localhost:5001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface NewBehavior {
  type: BehaviorType;
  description: string;
  metadata?: Record<string, any>;
  date?: string;
}

export const auth = {
  login: (credentials: LoginCredentials) => 
    api.post<AuthResponse>('/auth/login', credentials),
  
  register: (userData: RegisterData) => 
    api.post<AuthResponse>('/auth/register', userData),
};

export const users = {
  getMe: () => 
    api.get<User>('/users/me'),
  
  getLeaderboard: () => 
    api.get<Array<{ _id: string; username: string; karmaScore: number }>>('/users/leaderboard'),
};

export const behaviors = {
  getAll: () => 
    api.get<{ behaviors: Behavior[], unreadCount: number }>('/behaviors'),
  
  create: (behavior: NewBehavior) => 
    api.post<Behavior>('/behaviors', behavior),
  
  getSummary: () => 
    api.get<BehaviorSummary>('/behaviors/summary'),
  
  markAsRead: (behaviorId: string) => 
    api.put<{ behavior: Behavior, unreadCount: number }>(`/behaviors/${behaviorId}/read`),
  
  markAllAsRead: () => 
    api.put<{ message: string }>('/behaviors/read-all'),
};

export const rewards = {
  getAll: () => 
    api.get<RewardWithStatus[]>('/rewards'),
  
  unlock: (rewardId: string) => 
    api.post<{ message: string; reward: RewardWithStatus }>(`/rewards/${rewardId}/unlock`),
  
  seed: () => 
    api.post<{ message: string }>('/rewards/seed'),
};

export interface DashboardAnalytics {
  summary: {
    totalUsers: number;
    avgKarmaScore: number;
    totalBehaviors: number;
    activeUsers: number;
  };
  leaderboard: Array<{
    _id: string;
    username: string;
    email: string;
    karmaScore: number;
    createdAt: string;
  }>;
  behaviorStats: Array<{
    _id: string;
    count: number;
    totalKarma: number;
  }>;
  karmaDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    _id: string;
    count: number;
    karmaChange: number;
  }>;
  topPerformers: Array<{
    username: string;
    karmaGained: number;
    behaviorCount: number;
  }>;
}

export const dashboard = {
  getAnalytics: () => 
    api.get<DashboardAnalytics>('/dashboard/analytics'),
};

export default api;