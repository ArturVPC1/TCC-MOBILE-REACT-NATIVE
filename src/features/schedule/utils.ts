import { NOW_OVERRIDE } from '../../config';
import { Lesson, Room } from '../../types/domain';

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h! * 60 + m!;
};

export function nowMin(): number {
  if (NOW_OVERRIDE) return toMin(NOW_OVERRIDE);
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export type LessonStatus = 'andamento' | 'proxima' | 'concluida';

export function getLessonStatus(l: Lesson, now = nowMin()): LessonStatus {
  if (now >= toMin(l.end)) return 'concluida';
  if (now >= toMin(l.start)) return 'andamento';
  return 'proxima';
}

/** Mapa salaId -> aula em andamento (ignora salas em manutenção). */
export function getOccupiedNow(rooms: Room[], lessons: Lesson[], now = nowMin()): Map<string, Lesson> {
  const map = new Map<string, Lesson>();
  for (const r of rooms) {
    if (r.status !== 'disponivel') continue;
    const l = lessons.find((x) => x.roomId === r.id && getLessonStatus(x, now) === 'andamento');
    if (l) map.set(r.id, l);
  }
  return map;
}

export function getFreeNow(rooms: Room[], lessons: Lesson[], now = nowMin()): Room[] {
  const occ = getOccupiedNow(rooms, lessons, now);
  return rooms.filter((r) => r.status === 'disponivel' && !occ.has(r.id));
}

export function freeUntilLabel(roomId: string, lessons: Lesson[], now = nowMin()): string {
  const next = lessons
    .filter((l) => l.roomId === roomId && toMin(l.start) > now)
    .sort((a, b) => toMin(a.start) - toMin(b.start))[0];
  return next ? `Livre até ${next.start}` : 'Livre pelo resto do dia';
}
