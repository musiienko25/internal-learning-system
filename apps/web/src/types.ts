export type UserPublic = {
  id: string;
  name: string;
  email: string;
};

export type CourseCatalogItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  durationHours: number;
  isMandatory: boolean;
};

export type MyCourseItem = {
  id: string;
  title: string;
  isMandatory: boolean;
  enrolledAt: string;
  progress: number;
  completedAt: string | null;
};

export type AuthPayload = {
  user: UserPublic;
  token: string;
};
