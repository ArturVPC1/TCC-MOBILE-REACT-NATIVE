export type StudentStatus = 'ativo' | 'inativo';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string; // yyyy-MM-dd
  cpf?: string;
  instrument: string;
  guardian?: string; // responsável (menores)
  notes?: string;
  status: StudentStatus;
  createdAt: string; // ISO
}

export type StudentInput = Omit<Student, 'id' | 'createdAt' | 'status'> & { status?: StudentStatus };

export interface DashboardStats {
  activeStudents: number;
  teachers: number;
  activeClasses: number;
  lessonsToday: number;
}

export const INSTRUMENTS = [
  'Violão', 'Guitarra', 'Piano', 'Teclado', 'Bateria', 'Baixo', 'Violino', 'Canto', 'Flauta', 'Saxofone', 'Ukulele', 'Teoria musical',
];
