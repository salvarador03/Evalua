// src/types/user.ts

interface BaseUser {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'guest';
  createdAt: number;
  lastLogin: number;
}

interface StudentUser extends BaseUser {
  role: 'student';
  dateOfBirth: string;
  age: number;
  classCode: string;
}

interface TeacherUser extends BaseUser {
  role: 'teacher';
}

interface GuestUser extends BaseUser {
  role: 'guest';
  dateOfBirth: string;
  age: number;
  classCode: string;
}

export type User = StudentUser | TeacherUser | GuestUser;

export type { StudentUser, TeacherUser, GuestUser };