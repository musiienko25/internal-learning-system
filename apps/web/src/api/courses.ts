import { apiFetch } from '../lib/api';
import type { AuthPayload, CourseCatalogItem, MyCourseItem } from '../types';

export async function registerUser(body: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthPayload> {
  return apiFetch<AuthPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function loginUser(body: {
  email: string;
  password: string;
}): Promise<AuthPayload> {
  return apiFetch<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchCourses(token: string): Promise<{
  data: CourseCatalogItem[];
}> {
  return apiFetch<{ data: CourseCatalogItem[] }>('/courses', { token });
}

export async function fetchMyCourses(token: string): Promise<{
  data: MyCourseItem[];
}> {
  return apiFetch<{ data: MyCourseItem[] }>('/users/me/courses', { token });
}

export async function enrollInCourse(
  token: string,
  courseId: string,
): Promise<{ message: string; enrolledAt: string }> {
  return apiFetch<{ message: string; enrolledAt: string }>(
    `/courses/${courseId}/enroll`,
    { method: 'POST', token },
  );
}
