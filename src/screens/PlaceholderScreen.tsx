import { CalendarDays, GraduationCap } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { EmptyState, ScreenHeader } from '../components/ui';
import { colors } from '../theme';

export const HorariosScreen = () => (
  <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScreenHeader title="Horários" subtitle="Salas e aulas" />
    <EmptyState icon={<CalendarDays size={24} color={colors.muted} strokeWidth={1.75} />} title="Em breve" text="Esta tela será implementada na próxima etapa do protótipo." />
  </View>
);

export const ProfessoresScreen = () => (
  <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScreenHeader title="Professores" subtitle="Corpo docente" />
    <EmptyState icon={<GraduationCap size={24} color={colors.muted} strokeWidth={1.75} />} title="Em breve" text="Esta tela será implementada na próxima etapa do protótipo." />
  </View>
);
