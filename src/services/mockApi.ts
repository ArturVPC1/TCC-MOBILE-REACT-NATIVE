/** API MOCK. Alunos e professores persistem em AsyncStorage (localStorage na web); o resto é fixo. */
import { format } from 'date-fns';
import { MOCK_EMPTY } from '../config';
import { load, save } from '../lib/storage';
import { normalize } from '../lib/text';
import { Paginated, Student, Teacher } from '../types/domain';
import type { Api, ListParams } from './api';
import { ApiError } from './api';
import * as seed from './mockData';

const K = { students: 'sonata:students:v2', teachers: 'sonata:teachers:v2' };
const wait = () => new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

async function readStudents(): Promise<Student[]> {
  const d = await load<Student[] | null>(K.students, null);
  if (d) return d;
  const init = MOCK_EMPTY ? [] : seed.students;
  await save(K.students, init);
  return init;
}
async function readTeachers(): Promise<Teacher[]> {
  const d = await load<Teacher[] | null>(K.teachers, null);
  if (d) return d;
  const init = MOCK_EMPTY ? [] : seed.teachers;
  await save(K.teachers, init);
  return init;
}

const withCount = (t: Teacher, students: Student[]): Teacher => ({
  ...t,
  studentsCount: students.filter((s) => s.teacherId === t.id && s.status === 'ativo').length,
});

function paginate<T>(all: T[], p: ListParams): Paginated<T> {
  const page = p.page ?? 1;
  const pageSize = p.pageSize ?? 1000;
  return { items: all.slice((page - 1) * pageSize, page * pageSize), total: all.length, page, pageSize };
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'pt-BR');

export const mockApi: Api = {
  auth: {
    async login(email, password) {
      await wait();
      if (email.trim().toLowerCase() !== 'admin@exemplo.com' || password !== '123456') {
        throw new ApiError(401, 'invalid_credentials', 'E-mail ou senha incorretos.');
      }
      return { token: 'mock-token', user: { id: 'u1', name: 'Administrador', email: 'admin@exemplo.com', role: 'admin' } };
    },
    async me() {
      return { id: 'u1', name: 'Administrador', email: 'admin@exemplo.com', role: 'admin' };
    },
  },

  dashboard: {
    async stats() {
      await wait();
      const [st, te] = await Promise.all([readStudents(), readTeachers()]);
      return {
        activeStudents: st.filter((s) => s.status === 'ativo').length,
        teachers: te.filter((t) => t.status === 'ativo').length,
        activeClasses: MOCK_EMPTY ? 0 : seed.classes.length,
        lessonsToday: MOCK_EMPTY ? 0 : seed.lessons.length,
      };
    },
  },

  rooms: {
    async list() {
      await wait();
      return MOCK_EMPTY ? [] : seed.rooms;
    },
  },

  lessons: {
    async listByDate(date) {
      await wait();
      if (MOCK_EMPTY) return [];
      return seed.lessons.filter((l) => l.date === date || date === format(new Date(), 'yyyy-MM-dd')).sort((a, b) => a.start.localeCompare(b.start));
    },
  },

  classes: {
    async listByInstrument(instrument) {
      await wait();
      return MOCK_EMPTY ? [] : seed.classes.filter((c) => c.instrument === instrument);
    },
  },

  students: {
    async list(p) {
      await wait();
      const q = normalize(p.search ?? '');
      const all = (await readStudents())
        .filter((s) => !p.status || s.status === p.status)
        .filter((s) => !p.instrument || s.instrument === p.instrument)
        .filter((s) => !q || normalize(`${s.name} ${s.email ?? ''} ${s.instrument}`).includes(q))
        .sort(byName);
      return paginate(all, p);
    },
    async get(id) {
      await wait();
      const s = (await readStudents()).find((x) => x.id === id);
      if (!s) throw new ApiError(404, 'not_found', 'Aluno não encontrado.');
      return s;
    },
    async create(input) {
      await wait();
      const all = await readStudents();
      const s: Student = { ...input, id: uid('s') };
      await save(K.students, [s, ...all]);
      return s;
    },
    async update(id, input) {
      await wait();
      const all = await readStudents();
      const i = all.findIndex((x) => x.id === id);
      if (i < 0) throw new ApiError(404, 'not_found', 'Aluno não encontrado.');
      const s = { ...all[i]!, ...input, id };
      all[i] = s;
      await save(K.students, all);
      return s;
    },
    async setStatus(id, status) {
      await wait();
      const all = await readStudents();
      await save(K.students, all.map((s) => (s.id === id ? { ...s, status } : s)));
    },
  },

  teachers: {
    async list(p) {
      await wait();
      const q = normalize(p.search ?? '');
      const st = await readStudents();
      const all = (await readTeachers())
        .filter((t) => !p.status || t.status === p.status)
        .filter((t) => !p.instrument || t.instruments.includes(p.instrument))
        .filter((t) => !q || normalize(`${t.name} ${t.instruments.join(' ')}`).includes(q))
        .sort(byName)
        .map((t) => withCount(t, st));
      return paginate(all, p);
    },
    async get(id) {
      await wait();
      const t = (await readTeachers()).find((x) => x.id === id);
      if (!t) throw new ApiError(404, 'not_found', 'Professor não encontrado.');
      return withCount(t, await readStudents());
    },
    async create(input) {
      await wait();
      const all = await readTeachers();
      if (all.some((t) => t.email.toLowerCase() === input.email.trim().toLowerCase())) {
        throw new ApiError(409, 'duplicate_email', 'E-mail duplicado.', { email: 'Já existe um professor com este e-mail.' });
      }
      const t: Teacher = { ...input, id: uid('t') };
      await save(K.teachers, [t, ...all]);
      return t;
    },
    async update(id, input) {
      await wait();
      const all = await readTeachers();
      const i = all.findIndex((x) => x.id === id);
      if (i < 0) throw new ApiError(404, 'not_found', 'Professor não encontrado.');
      if (input.email && all.some((t) => t.id !== id && t.email.toLowerCase() === input.email!.trim().toLowerCase())) {
        throw new ApiError(409, 'duplicate_email', 'E-mail duplicado.', { email: 'Já existe um professor com este e-mail.' });
      }
      const { studentsCount: _ignore, ...rest } = input;
      const t = { ...all[i]!, ...rest, id };
      all[i] = t;
      await save(K.teachers, all);
      return t;
    },
    async setStatus(id, status) {
      await wait();
      if (status === 'inativo') {
        const n = (await readStudents()).filter((s) => s.teacherId === id && s.status === 'ativo').length;
        if (n > 0) throw new ApiError(409, 'has_active_students', `Este professor tem ${n} alunos ativos. Reatribua-os antes de inativar.`);
      }
      const all = await readTeachers();
      await save(K.teachers, all.map((t) => (t.id === id ? { ...t, status } : t)));
    },
  },
};
