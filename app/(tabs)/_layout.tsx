import { Tabs } from 'expo-router';

import TabBarIcon from '@/components/navigation/TabarIcon';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2196f3',
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      {/* 메인 스톱워치 탭 설정 */}
      <Tabs.Screen
        name="index"
        options={{
          title: '메이플 보스 스톱워치',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'timer' : 'timer-outline'} color={color} />
          )
        }}
      />
      {/* 대시보드 통계 탭 추가 */}
      <Tabs.Screen
        name="stats"
        options={{
          title: '통계 리포트',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} color={color} />
          )
        }}
      />
      {/* 캐릭터 관리 탭 설정 */}
      <Tabs.Screen
        name="manage"
        options={{
          title: '캐릭터 관리',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
          )
        }}
      />
    </Tabs>
  );
}
