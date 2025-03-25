// src/types/user.ts

import { Language } from './language';

export interface CountryRole {
  country: string;
  language: Language;
  flag: string;
}

interface BaseUser {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'guest';
  createdAt: number;
  lastLogin: number;
  countryRole?: CountryRole;
  language?: Language;
  isTeacher?: boolean;
}

interface StudentUser extends BaseUser {
  role: 'student';
  dateOfBirth: string;
  age: number;
  classCode: string;
}

interface TeacherUser extends BaseUser {
  role: 'teacher';
  age?: number; // Opcional para profesores
  dateOfBirth?: string; // Opcional para profesores
}

interface GuestUser extends BaseUser {
  role: 'guest';
  dateOfBirth: string;
  age: number;
  classCode: string;
}

export type User = StudentUser | TeacherUser | GuestUser;

export type { StudentUser, TeacherUser, GuestUser };