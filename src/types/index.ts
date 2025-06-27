// User related types
export type UserRole = 'user' | 'admin';

export interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  karmaScore: number;
  role: UserRole;
  unlockedRewards: Reward[];
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    karmaScore: number;
    role: UserRole;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

// Behavior related types
export type BehaviorType = 
  | 'payment_on_time'
  | 'payment_late'
  | 'credit_utilization_low'
  | 'credit_utilization_high'
  | 'new_credit_account'
  | 'credit_check';

export interface Behavior {
  _id: string;
  user: string;
  type: BehaviorType;
  description: string;
  karmaPoints: number;
  date: string;
  isRead?: boolean;
  metadata?: Record<string, any>;
}

export interface BehaviorTypeInfo {
  label: string;
  karma: string;
}

export interface BehaviorSummaryItem {
  _id: BehaviorType;
  count: number;
  totalKarma: number;
}

export interface BehaviorSummary {
  currentKarma: number;
  behaviorSummary: BehaviorSummaryItem[];
}

// Reward related types
export type RewardCategory = 'cashback' | 'discount' | 'feature' | 'badge';

export interface Reward {
  _id: string;
  title: string;
  description: string;
  karmaRequired: number;
  category: RewardCategory;
  imageUrl?: string;
  active: boolean;
  createdAt: Date;
}

export interface RewardWithStatus extends Reward {
  isUnlocked: boolean;
  canUnlock: boolean;
}

// Chart data types
export interface PieChartData {
  name: string;
  value: number;
  positive: boolean;
}

export interface BarChartData {
  name: string;
  karma: number;
  count: number;
}

// Karma level types
export interface KarmaLevel {
  level: string;
  color: string;
  next: string | null;
  needed: number;
}

// API Error type
export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}