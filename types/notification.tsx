import { Language } from "./language";

// types/notification.tsx
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: "welcome" | "form_completed" | "info";
}

export interface UserLanguagePreference {
  language: Language;
  country?: string;
}
