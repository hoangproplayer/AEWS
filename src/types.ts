/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  ADVISOR = 'ADVISOR',
  STUDENT = 'STUDENT',
  MANAGER = 'MANAGER'
}

export enum WarningLevel {
  SAFE = 'SAFE', // Green
  WARNING = 'WARNING', // Yellow
  DANGER = 'DANGER' // Red
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  classId?: string; // For Advisors and Students
  studentId?: string;
}

export interface StudentProfile {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  classId: string;
  cohort: string;
  gpa: number;
  totalCredits: number;
  warningLevel: WarningLevel;
  attendanceRate: number; // e.g., 0.85 for 85%
  lastLmsActivity?: Date;
  status: 'ACTIVE' | 'PROCESSED' | 'REPORTED';
}

export interface AcademicRecord {
  id: string;
  studentId: string;
  semester: string;
  subjectCode: string;
  subjectName: string;
  grade: number;
  credits: number;
}

export interface CounselingLog {
  id: string;
  studentId: string;
  advisorId: string;
  date: Date;
  reason: string;
  notes: string;
  commitment: string;
}

export interface WarningThreshold {
  id: string;
  name: string;
  type: 'GPA' | 'ATTENDANCE' | 'LMS_INACTIVITY';
  operator: '<' | '<=' | '>' | '>=';
  value: number;
  level: WarningLevel;
}
