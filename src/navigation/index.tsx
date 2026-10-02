import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalendarDays, GraduationCap, LayoutDashboard, Music, Users } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../data/auth';
import { AlunoFormScreen } from '../screens/AlunoFormScreen';
import { AlunosScreen } from '../screens/AlunosScreen';
import { HorariosScreen } from '../screens/HorariosScreen';
import { ProfessorFormScreen } from '../screens/ProfessorFormScreen';
import { ProfessoresScreen } from '../screens/ProfessoresScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { colors, fonts } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, border: colors.border, primary: colors.primary, text: colors.foreground } };

function MainTabs() {
  const insets = useSafeAreaInsets();
  const icon = (I: typeof Users) => ({ color }: { color: string }) => <I size={22} color={color} strokeWidth={1.75} />;
  return (
    <Tab.Navigator
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholder,
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.medium },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, height: 56 + insets.bottom, paddingBottom: insets.bottom },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Início', tabBarIcon: icon(LayoutDashboard) }} />
      <Tab.Screen name="Horarios" component={HorariosScreen} options={{ title: 'Horários', tabBarIcon: icon(CalendarDays) }} />
      <Tab.Screen name="Alunos" component={AlunosScreen} options={{ tabBarIcon: icon(Users) }} />
      <Tab.Screen name="Professores" component={ProfessoresScreen} options={{ tabBarIcon: icon(GraduationCap) }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Music size={32} color="#fff" strokeWidth={1.75} />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme} documentTitle={{ formatter: () => 'SONATA' }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="AlunoForm" component={AlunoFormScreen} />
            <Stack.Screen name="ProfessorForm" component={ProfessorFormScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
