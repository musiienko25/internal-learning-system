import { apiFetch } from '../lib/api';

export type AdminStats = {
  users: number;
  courses: number;
  enrollments: number;
};

export function fetchAdminStats(adminKey: string): Promise<AdminStats> {
  return apiFetch<AdminStats>('/admin/stats', { adminKey });
}
