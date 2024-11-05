// src/types/user.ts
export interface User {
    uid: string;
    name: string;
    email: string;
    role: 'student' | 'teacher';
    createdAt: number;
    lastLogin: number;
  }