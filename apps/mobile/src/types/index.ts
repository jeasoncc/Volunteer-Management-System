export interface User {
  id: number;
  lotusId: string;
  account: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  lotusRole: 'admin' | 'volunteer';
  adminInfo?: {
    role?: string;
    permissions?: any;
    department?: string;
  };
}

export interface CheckinRecord {
  id: number;
  lotusId: string;
  name: string;
  date: string;
  checkIn: string;
  status: 'present' | 'late' | 'early_leave' | 'absent' | 'on_leave';
  location?: string;
  recordType?: string;
  deviceSn?: string;
  bodyTemperature?: string;
  confidence?: string;
  createdAt: string;
}

export interface Scripture {
  id: string;
  title: string;
  content: string;
  category?: string;
  author?: string;
}

