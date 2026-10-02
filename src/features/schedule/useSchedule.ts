import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '../../services/api';
import { Lesson, Student, Teacher } from '../../types/domain';

export function useSchedule() {
  const date = format(new Date(), 'yyyy-MM-dd');
  const rooms = useQuery({ queryKey: ['rooms'], queryFn: api.rooms.list });
  const lessons = useQuery({ queryKey: ['lessons', date], queryFn: () => api.lessons.listByDate(date) });
  const teachers = useQuery({ queryKey: ['teachers', { all: true }], queryFn: () => api.teachers.list({}).then((r) => r.items) });
  const students = useQuery({ queryKey: ['students', { all: true }], queryFn: () => api.students.list({}).then((r) => r.items) });
  const all = [rooms, lessons, teachers, students];
  return {
    rooms: rooms.data ?? [],
    lessons: lessons.data ?? [],
    teachers: teachers.data ?? [],
    students: students.data ?? [],
    isLoading: all.some((q) => q.isLoading),
    isError: all.some((q) => q.isError),
    isRefetching: all.some((q) => q.isRefetching),
    refetch: () => Promise.all(all.map((q) => q.refetch())),
  };
}

export function lessonLine2(l: Lesson, teachers: Teacher[], students: Student[]) {
  const t = teachers.find((x) => x.id === l.teacherId);
  const tn = t ? `${t.title ? t.title + ' ' : ''}${t.name.split(' ')[0]}` : 'Professor a definir';
  const who = l.studentId ? students.find((s) => s.id === l.studentId)?.name ?? '—' : `${l.participants} participantes`;
  return `${tn} • ${who}`;
}
