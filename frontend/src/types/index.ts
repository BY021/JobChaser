export type Job = {
  savedBy: unknown;
  id: number;
  company: string;
  logo: string;
  position: string;
  role: string;
  level: string;
  postedAt: string;
  contract: string;
  location: string;
  languages: string[] | null;
  tools: string[] | null;
};

export type User = {
  id: number;
  email: string;
  role: 'admin' | 'user';
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type SignupFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type CreateJobFormData = {
  company: string;
  position: string;
  role: string;
  level: string;
  location: string;
  contract: string;
  languages: string[];
  tools: string[];
  logo?: File;
};
