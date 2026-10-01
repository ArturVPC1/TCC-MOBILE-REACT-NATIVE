import { useQuery } from '@tanstack/react-query';
import { CalendarDays, GraduationCap, Music, UserPlus, Users } from 'lucide-react-native';
import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Button, ErrorState, KpiCard, ScreenHeader } from '../components/ui';
import { getStats } from '../data/repository';
import { formatNumber } from '../lib/text';
import { colors } from '../theme';

export function DashboardScreen({ navigation }: { navigation: any }) {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({ queryKey: ['stats'], queryFn: getStats });
  const ic = (I: typeof Users) => <I size={18} color={colors.muted} strokeWidth={1.75} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Dashboard" subtitle="Bem-vindo, Administrador!" />
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 12 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <KpiCard title="Alunos ativos" value={formatNumber(data?.activeStudents ?? 0)} caption="matriculados" icon={ic(Users)} loading={isLoading} />
            <KpiCard title="Professores" value={formatNumber(data?.teachers ?? 0)} caption="cadastrados" icon={ic(GraduationCap)} loading={isLoading} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <KpiCard title="Turmas ativas" value={formatNumber(data?.activeClasses ?? 0)} caption="em andamento" icon={ic(Music)} loading={isLoading} />
            <KpiCard title="Aulas hoje" value={formatNumber(data?.lessonsToday ?? 0)} caption="agendadas" icon={ic(CalendarDays)} loading={isLoading} />
          </View>
          <View style={{ marginTop: 12 }}>
            <Button label="Matricular aluno" icon={<UserPlus size={18} color="#fff" strokeWidth={1.75} />} onPress={() => navigation.navigate('AlunoForm')} fullWidth />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
