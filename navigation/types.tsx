// types.ts
import { FormResponse } from "../types/form";
import { Language } from "../types/language";
import { FormStats } from "../types/formstats";
import { NavigatorScreenParams } from '@react-navigation/native';

export interface StudentData {
  name: string;
  email: string;
  uid: string;
}

export type FormsStackParamList = {
  FormsList: undefined;
  PhysicalLiteracyForm: undefined;
  PhysicalLiteracyResults: {
    formResponse: FormResponse;
    language: Language;
    answers: (number | null)[];
    stats?: FormStats[];
    studentData: StudentData; // Quitamos el opcional ?
    isTeacherView: boolean; // Quitamos el opcional ?
  };
};

export type MainTabParamList = {
  Forms: NavigatorScreenParams<FormsStackParamList>;
  Students: undefined;
  Statistics: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  WelcomeScreen: undefined;
  Login: undefined;
  Registro: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ClassCodes: undefined;
};