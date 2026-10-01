/**
 * CAMADA MOCK. Persiste em AsyncStorage (localStorage na web).
 * Para trocar por Supabase/API: mantenha estas assinaturas e reescreva só o corpo das funções.
 */
import { load, save } from '../lib/storage';
import { seedActiveClasses, seedLessonsToday, seedStudents, seedTeachers } from './seed';
import { DashboardStats, Student, StudentInput } from './types';

const KEY = 'sonata:students:v1';
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

async function readAll(): Promise<Student[]> {
  const data = await load<Student[] | null>(KEY, null);
  if (data) return data;
  await save(KEY, seedStudents);
  return seedStudents;
}

export async function listStudents(): Promise<Student[]> {
  await delay();
  const all = await readAll();
  return [...all].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function createStudent(input: StudentInput): Promise<Student> {
  await delay(500);
  const all = await readAll();
  const student: Student = {
    ...input,
    status: input.status ?? 'ativo',
    id: `st-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  await save(KEY, [student, ...all]);
  return student;
}

export async function getStats(): Promise<DashboardStats> {
  await delay(250);
  const all = await readAll();
  return {
    activeStudents: all.filter((s) => s.status === 'ativo').length,
    teachers: seedTeachers,
    activeClasses: seedActiveClasses,
    lessonsToday: seedLessonsToday,
  };
}
