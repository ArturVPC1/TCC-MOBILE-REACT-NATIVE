import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Clock, DoorOpen, Wrench } from 'lucide-react-native';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { LessonRow, teacherFull } from '../components/rows/Rows';
import { Badge, BottomSheet, Button, Card, EmptyState, ErrorState, KpiCard, ScreenHeader, Skeleton, Txt, useToast } from '../components/ui';
import { freeUntilLabel, getFreeNow, getLessonStatus, getOccupiedNow, nowMin } from '../features/schedule/utils';
import { lessonLine2, useSchedule } from '../features/schedule/useSchedule';
import { colors } from '../theme';
import { Lesson } from '../types/domain';

export function HorariosScreen() {
  const toast = useToast();
  const sch = useSchedule();
  const [selected, setSelected] = useState<Lesson | null>(null);
  const now = nowMin();
  const { rooms, lessons, teachers, students } = sch;

  const occupied = getOccupiedNow(rooms, lessons, now);
  const free = getFreeNow(rooms, lessons, now);
  const maintenance = rooms.filter((r) => r.status === 'manutencao').length;
  const roomName = (id: string) => rooms.find((r) => r.id === id)?.name ?? 'Sala';
  const soon = () => toast('Em breve');
  const subtitle = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  const sel = selected;
  const selTeacher = sel ? teachers.find((t) => t.id === sel.teacherId) : undefined;
  const selWho = sel ? (sel.studentId ? students.find((s) => s.id === sel.studentId)?.name ?? '—' : `Turma — ${sel.participants} participantes`) : '';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Horários" subtitle={subtitle} />
      {sch.isError ? (
        <ErrorState onRetry={sch.refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 32, gap: 28 }}
          refreshControl={<RefreshControl refreshing={sch.isRefetching} onRefresh={sch.refetch} />}
        >
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <KpiCard compact title="Salas cadastradas" value={String(rooms.length)} caption={maintenance ? `${maintenance} em manutenção` : undefined} icon={<DoorOpen size={18} color={colors.muted} strokeWidth={1.75} />} loading={sch.isLoading} />
              <KpiCard compact title="Ocupadas agora" value={String(occupied.size)} icon={<Clock size={18} color={colors.muted} strokeWidth={1.75} />} loading={sch.isLoading} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <KpiCard compact title="Aulas hoje" value={String(lessons.length)} icon={<CalendarDays size={18} color={colors.muted} strokeWidth={1.75} />} loading={sch.isLoading} />
              <KpiCard compact title="Livres agora" value={String(free.length)} icon={<DoorOpen size={18} color={colors.muted} strokeWidth={1.75} />} loading={sch.isLoading} />
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <Button label="Novo agendamento" onPress={soon} fullWidth />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><Button label="Ver mapa de salas" variant="secondary" onPress={soon} fullWidth /></View>
              <View style={{ flex: 1 }}><Button label="Bloquear sala" variant="secondary" onPress={soon} fullWidth /></View>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <Txt variant="section">Aulas de hoje</Txt>
            {sch.isLoading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} height={64} radius={8} />)
            ) : lessons.length === 0 ? (
              <Txt variant="caption">Nenhuma aula agendada para hoje.</Txt>
            ) : (
              lessons.map((l) => (
                <LessonRow key={l.id} lesson={l} roomName={roomName(l.roomId)} line2={lessonLine2(l, teachers, students)}
                  status={getLessonStatus(l, now)} onPress={() => setSelected(l)} />
              ))
            )}
          </View>

          <View style={{ gap: 12 }}>
            <Txt variant="section">Salas livres agora</Txt>
            {sch.isLoading ? (
              <Skeleton height={56} radius={8} />
            ) : free.length === 0 ? (
              <Txt variant="caption">Todas as salas estão ocupadas ou indisponíveis.</Txt>
            ) : (
              free.map((r) => (
                <Card key={r.id} shadow={false} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 8 }}>
                  <View>
                    <Txt variant="bodyStrong">{r.name}</Txt>
                    <Txt variant="caption">{freeUntilLabel(r.id, lessons, now)}</Txt>
                  </View>
                  <Badge label="Livre" variant="soft" />
                </Card>
              ))
            )}
          </View>

          <View style={{ gap: 12 }}>
            <Txt variant="section">Resumo de ocupação</Txt>
            {sch.isLoading ? (
              <Skeleton height={120} radius={8} />
            ) : rooms.length === 0 ? (
              <EmptyState icon={<DoorOpen size={24} color={colors.muted} strokeWidth={1.75} />} title="Nenhuma sala cadastrada" />
            ) : (
              rooms.map((r) => {
                const occ = occupied.get(r.id);
                const maint = r.status === 'manutencao';
                return (
                  <Card key={r.id} shadow={false} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Txt variant="bodyStrong">{r.name}</Txt>
                      <Txt variant="caption" numberOfLines={1}>{maint ? 'Indisponível' : occ ? occ.instrument : 'Disponível'} · {r.capacity} pessoas</Txt>
                    </View>
                    {maint ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Wrench size={14} color={colors.muted} strokeWidth={1.75} />
                        <Badge label="Manutenção" variant="outline" />
                      </View>
                    ) : (
                      <Badge label={occ ? 'Ocupada' : 'Livre'} variant={occ ? 'solid' : 'soft'} />
                    )}
                  </Card>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      <BottomSheet visible={!!sel} onClose={() => setSelected(null)} title={sel?.title}>
        {sel ? (
          <View style={{ gap: 12 }}>
            {([
              ['Sala', roomName(sel.roomId)],
              ['Horário', `${sel.start} – ${sel.end}`],
              ['Instrumento', sel.instrument],
              ['Professor', selTeacher ? teacherFull(selTeacher) : 'A definir'],
              [sel.studentId ? 'Aluno' : 'Alunos', selWho],
            ] as const).map(([k, v]) => (
              <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16 }}>
                <Txt variant="caption">{k}</Txt>
                <Txt variant="body" style={{ flexShrink: 1, textAlign: 'right' }}>{v}</Txt>
              </View>
            ))}
            <View style={{ marginTop: 8 }}><Button label="Fechar" variant="outline" onPress={() => setSelected(null)} fullWidth /></View>
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
}
