import { format } from 'date-fns';
import { ClassGroup, Lesson, Room, Student, Teacher } from '../types/domain';

const TODAY = format(new Date(), 'yyyy-MM-dd');

export const rooms: Room[] = [
  { id: 'r1', name: 'Sala 1', capacity: 4, status: 'disponivel' },
  { id: 'r2', name: 'Sala 2', capacity: 4, status: 'disponivel' },
  { id: 'r3', name: 'Sala 3', capacity: 3, status: 'disponivel' },
  { id: 'r4', name: 'Sala 4', capacity: 6, status: 'manutencao', maintenanceUntil: '2026-10-02' },
  { id: 'r5', name: 'Sala 5', capacity: 4, status: 'disponivel' },
  { id: 'r6', name: 'Auditório', capacity: 40, status: 'disponivel' },
];

export const classes: ClassGroup[] = [
  { id: 'c1', name: 'Canto coral', instrument: 'Canto' },
  { id: 'c2', name: 'Violão iniciantes', instrument: 'Violão' },
  { id: 'c3', name: 'Teclado intermediário', instrument: 'Teclado' },
];

export const teachers: Teacher[] = [
  { id: 't1', title: 'Prof.', name: 'João Pereira', email: 'joao@sonata.com', phone: '11981110001', instruments: ['Violão', 'Baixo'], startDate: '2019-02-01', status: 'ativo' },
  { id: 't2', title: 'Profa.', name: 'Maria Santos', email: 'maria@sonata.com', phone: '11981110002', instruments: ['Teclado', 'Piano'], startDate: '2018-08-15', status: 'ativo' },
  { id: 't3', title: 'Prof.', name: 'Carlos Mendes', email: 'carlos@sonata.com', phone: '11981110003', instruments: ['Canto'], startDate: '2020-03-10', status: 'ativo' },
  { id: 't4', title: 'Prof.', name: 'André Costa', email: 'andre@sonata.com', phone: '11981110004', instruments: ['Guitarra', 'Bateria'], startDate: '2021-01-20', status: 'ativo' },
  { id: 't5', title: 'Profa.', name: 'Luana Ribeiro', email: 'luana@sonata.com', phone: '11981110005', instruments: ['Flauta', 'Saxofone'], startDate: '2022-06-05', status: 'ativo' },
];

export const students: Student[] = [
  { id: 's1', name: 'Ana Silva', birthDate: '2010-05-20', guardianName: 'Marta Silva', guardianPhone: '11988881111', instrument: 'Violão', teacherId: 't1', enrolledAt: '2025-02-10', status: 'ativo' },
  { id: 's2', name: 'Lucas Sousa', birthDate: '2003-08-02', phone: '11977772222', instrument: 'Teclado', teacherId: 't2', classId: 'c3', enrolledAt: '2025-03-05', status: 'ativo' },
  { id: 's3', name: 'Pedro Alves', birthDate: '1998-11-30', phone: '11977773333', instrument: 'Guitarra', teacherId: 't4', enrolledAt: '2025-04-12', status: 'ativo' },
  { id: 's4', name: 'Beatriz Lima', birthDate: '2015-02-11', guardianName: 'Carla Lima', guardianPhone: '11988884444', instrument: 'Flauta', teacherId: 't5', enrolledAt: '2025-05-02', status: 'ativo' },
  { id: 's5', name: 'Carla Nunes', birthDate: '1995-07-09', phone: '11977775555', instrument: 'Canto', teacherId: 't3', classId: 'c1', enrolledAt: '2025-06-18', status: 'ativo' },
  { id: 's6', name: 'Rafael Gomes', birthDate: '2001-01-25', phone: '11977776666', instrument: 'Bateria', enrolledAt: '2026-09-28', status: 'pendente' },
  { id: 's7', name: 'Mariana Duarte', birthDate: '1999-09-17', phone: '11977777777', instrument: 'Violão', teacherId: 't1', enrolledAt: '2024-08-01', status: 'inativo' },
  { id: 's8', name: 'Gabriel Rocha', birthDate: '2009-12-03', guardianName: 'Paulo Rocha', guardianPhone: '11988888888', instrument: 'Piano', teacherId: 't2', enrolledAt: '2025-09-09', status: 'ativo' },
];

export const lessons: Lesson[] = [
  { id: 'l1', date: TODAY, start: '09:00', end: '09:50', roomId: 'r3', title: 'Violão básico', instrument: 'Violão', teacherId: 't1', studentId: 's1', participants: 1 },
  { id: 'l2', date: TODAY, start: '11:00', end: '11:50', roomId: 'r1', title: 'Teclado intermediário', instrument: 'Teclado', teacherId: 't2', studentId: 's2', participants: 1 },
  { id: 'l3', date: TODAY, start: '14:30', end: '15:20', roomId: 'r6', title: 'Canto coral', instrument: 'Canto', teacherId: 't3', classId: 'c1', participants: 12 },
  { id: 'l4', date: TODAY, start: '16:00', end: '16:50', roomId: 'r5', title: 'Guitarra elétrica', instrument: 'Guitarra', teacherId: 't4', studentId: 's3', participants: 1 },
  { id: 'l5', date: TODAY, start: '17:30', end: '18:20', roomId: 'r2', title: 'Flauta doce', instrument: 'Flauta', teacherId: 't5', studentId: 's4', participants: 1 },
];
