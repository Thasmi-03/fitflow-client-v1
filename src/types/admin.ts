import { UserProfile } from './user';

export interface AdminStats {
    totalUsers: number;
    totalStylists: number;
    totalPartners: number;
    totalPayments: number;
    totalRevenue: number;
    weeklyTrend: {
        week: string;
        registrations: number;
        logins: number;
    }[];
}

export interface PendingUser extends UserProfile {
    // Add any specific fields for pending users if different from UserProfile
}
