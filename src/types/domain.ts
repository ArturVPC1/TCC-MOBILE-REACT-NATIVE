export type StudentStatus = 'ativo' | 'pendente' | 'inativo';
export type TeacherStatus = 'ativo' | 'inativo';
export type RoomStatus = 'disponivel' | 'manutencao';
export type Weekday = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';

export interface User { id: string; name: string; email: string; role: 'admin' }

export interface Student {
  id: string;
  name: string;
  birthDate: string; // 'yyyy-MM-dd'
  phone?: string; // só dígitos
  email?: string;
  guardianName?: string; // obrigatório se menor de 18
  guardianPhone?: string;
  instrument: string;
  classId?: string; // undefined = aula individual
  teacherId?: string; // undefined = a definir
  enrolledAt: string; // 'yyyy-MM-dd'
  status: StudentStatus;
  notes?: string;
  photoUri?: string;
}

export interface Teacher {
  id: string;
  title?: 'Prof.' | 'Profa.';
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  instruments: string[];
  qualification?: string;
  startDate: string;
  availableDays?: Weekday[];
  preferredRoomIds?: string[];
  status: TeacherStatus;
  notes?: string;
  photoUri?: string;
  studentsCount?: number; // calculado pelo servidor/mock
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  status: RoomStatus;
  maintenanceUntil?: string;
}

export interface Lesson {
  id: string;
  date: string;
  start: string; // 'HH:mm'
  end: string;
  roomId: string;
  title: string;
  instrument: string;
  teacherId: string;
  studentId?: string;
  classId?: string;
  participants: number;
}

export interface ClassGroup { id: string; name: string; instrument: string }

export interface DashboardStats {
  activeStudents: number;
  teachers: number;
  activeClasses: number;
  lessonsToday: number;
}

export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number }

export const INSTRUMENTS = [
  'Violão', 'Guitarra', 'Teclado', 'Piano', 'Canto', 'Bateria', 'Flauta', 'Violino', 'Baixo', 'Saxofone', 'Ukulele', 'Teoria musical',
];

export const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 'seg', label: 'Seg' }, { value: 'ter', label: 'Ter' }, { value: 'qua', label: 'Qua' },
  { value: 'qui', label: 'Qui' }, { value: 'sex', label: 'Sex' }, { value: 'sab', label: 'Sáb' },
];
