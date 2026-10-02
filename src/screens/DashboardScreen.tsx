import { useQuery } from '@tanstack/react-query';
import { CalendarDays, GraduationCap, Music, UserPlus, Users } from 'lucide-react-native';
import React from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { LessonRow } from '../components/rows/Rows';
import { Button, ErrorState, KpiCard, ScreenHeader, Skeleton, Txt } from '../components/ui';
import { useAuth } from '../data/auth';
import { getLessonStatus, nowMin } from '../features/schedule/utils';
import { lessonLine2, useSchedule } from '../features/schedule/useSchedule';
import { formatNumber } from '../lib/text';
import { api } from '../services/api';
import { colors } from '../theme';

export function DashboardScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const stats = useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard.stats });
  const sch = useSchedule();
  const refetch = () => Promise.all([stats.refetch(), sch.refetch()]);
  const ic = (I: typeof Users) => <I size={18} color={colors.muted} strokeWidth={1.75} />;
  const d = stats.data;

  const now = nowMin();
  const upcoming = sch.lessons.filter((l) => getLessonStatus(l, now) !== 'concluida').slice(0, 3);
  const roomName = (id: string) => sch.rooms.find((r) => r.id === id)?.name ?? 'Sala';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader brand title="Dashboard" subtitle={`Bem-vindo, ${user?.name ?? 'Administrador'}!`} />
      {stats.isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={stats.isRefetching || sch.isRefetching} onRefresh={refetch} />}
        >
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <KpiCard title="Alunos ativos" value={formatNumber(d?.activeStudents ?? 0)} caption="matriculados" icon={ic(Users)} loading={stats.isLoading} onPress={() => navigation.navigate('Alunos')} />
              <KpiCard title="Professores" value={formatNumber(d?.teachers ?? 0)} caption="cadastrados" icon={ic(GraduationCap)} loading={stats.isLoading} onPress={() => navigation.navigate('Professores')} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <KpiCard title="Turmas ativas" value={formatNumber(d?.activeClasses ?? 0)} caption="em andamento" icon={ic(Music)} loading={stats.isLoading} />
              <KpiCard title="Aulas hoje" value={formatNumber(d?.lessonsToday ?? 0)} caption="agendadas" icon={ic(CalendarDays)} loading={stats.isLoading} onPress={() => navigation.navigate('Horarios')} />
            </View>
          </View>

          <Txt variant="section" style={{ marginTop: 28, marginBottom: 12 }}>Ações rápidas</Txt>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button label="Matricular aluno" icon={<UserPlus size={18} color="#fff" strokeWidth={1.75} />} onPress={() => navigation.navigate('AlunoForm')} fullWidth />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Cadastrar professor" variant="outline" icon={<UserPlus size={18} color={colors.foreground} strokeWidth={1.75} />} onPress={() => navigation.navigate('ProfessorForm')} fullWidth />
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 12 }}>
            <Txt variant="section">Aulas de hoje</Txt>
            <Pressable onPress={() => navigation.navigate('Horarios')} accessibilityRole="link" hitSlop={8}>
              <Txt variant="caption" style={{ color: colors.foreground, fontWeight: '500' }}>Ver todas</Txt>
            </Pressable>
          </View>
          <View style={{ gap: 12 }}>
            {sch.isLoading ? (
              [0, 1].map((i) => <Skeleton key={i} height={64} radius={8} />)
            ) : upcoming.length === 0 ? (
              <Txt variant="caption">Nenhuma aula agendada para hoje.</Txt>
            ) : (
              upcoming.map((l) => (
                <LessonRow key={l.id} lesson={l} roomName={roomName(l.roomId)} line2={lessonLine2(l, sch.teachers, sch.students)}
                  status={getLessonStatus(l, now)} onPress={() => navigation.navigate('Horarios')} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
