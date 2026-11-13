import {
  ClassGroup, DashboardStats, Lesson, Paginated, Room, Student, StudentStatus, Teacher, TeacherStatus, User,
} from '../types/domain';

export interface ListParams {
  search?: string;
  status?: string;
  instrument?: string;
  page?: number;
  pageSize?: number;
}

export interface Api {
  auth: {
    login(email: string, password: string): Promise<{ token: string; user: User }>;
    me(): Promise<User>;
  };
  dashboard: { stats(): Promise<DashboardStats> };
  rooms: { list(): Promise<Room[]> };
  lessons: { listByDate(date: string): Promise<Lesson[]> };
  classes: { listByInstrument(instrument: string): Promise<ClassGroup[]> };
  students: {
    list(p: ListParams): Promise<Paginated<Student>>;
    get(id: string): Promise<Student>;
    create(input: Omit<Student, 'id'>): Promise<Student>;
    update(id: string, input: Partial<Student>): Promise<Student>;
    setStatus(id: string, status: StudentStatus): Promise<void>;
  };
  teachers: {
    list(p: ListParams): Promise<Paginated<Teacher>>;
    get(id: string): Promise<Teacher>;
    create(input: Omit<Teacher, 'id' | 'studentsCount'>): Promise<Teacher>;
    update(id: string, input: Partial<Teacher>): Promise<Teacher>;
    setStatus(id: string, status: TeacherStatus): Promise<void>;
  };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
  }
}

// Troque por httpApi quando houver backend real. As telas só conhecem esta interface.
export { mockApi as api } from './mockApi';
