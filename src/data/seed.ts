import { Student } from './types';

const s = (i: number, name: string, instrument: string, birth: string, status: 'ativo' | 'inativo' = 'ativo'): Student => ({
  id: `seed-${i}`,
  name,
  email: `${name.split(' ')[0]!.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}@exemplo.com`,
  phone: `(11) 9${String(1000 + i * 37).padStart(4, '0')}-${String(2000 + i * 53).slice(0, 4)}`,
  birthDate: birth,
  instrument,
  status,
  createdAt: new Date(2026, 0, 5 + i).toISOString(),
});

export const seedStudents: Student[] = [
  s(1, 'Ana Beatriz Souza', 'Piano', '2001-03-14'),
  s(2, 'Bruno Carvalho', 'Violão', '1998-11-02'),
  s(3, 'Camila Ferreira', 'Canto', '2005-07-21'),
  s(4, 'Daniel Almeida', 'Bateria', '2010-01-30'),
  s(5, 'Eduarda Lima', 'Violino', '2008-09-09'),
  s(6, 'Felipe Ribeiro', 'Guitarra', '1995-05-17'),
  s(7, 'Gabriela Martins', 'Flauta', '2003-12-25', 'inativo'),
  s(8, 'Henrique Costa', 'Baixo', '1999-04-04'),
  s(9, 'Isabela Rocha', 'Teclado', '2012-06-18'),
  s(10, 'João Pedro Nunes', 'Saxofone', '2000-08-08'),
  s(11, 'Larissa Mendes', 'Ukulele', '2007-02-11', 'inativo'),
  s(12, 'Marcos Teixeira', 'Teoria musical', '1990-10-29'),
];

// Valores fixos de apoio ao Dashboard enquanto Professores/Turmas/Agenda não existem.
export const seedTeachers = 6;
export const seedActiveClasses = 9;
export const seedLessonsToday = 14;
