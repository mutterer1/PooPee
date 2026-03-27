import { Tabs } from 'expo-router';
import { House, ChartBar as BarChart3, Settings, LogOut } from 'lucide-react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { useAuth } from '@/lib/auth.context';
import { TouchableOpacity } from 'react-native';
import PoopIcon from '@/components/PoopIcon';

export default function TabsLayout() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: MEDITATIVE_COLORS.primary.lavender,
        tabBarInactiveTintColor: MEDITATIVE_COLORS.neutral.mediumGray,
        tabBarStyle: {
          backgroundColor: MEDITATIVE_COLORS.backgrounds.card,
          borderTopColor: MEDITATIVE_COLORS.neutral.lightGray,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => <House size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: 'Track',
          tabBarIcon: ({ size, color }) => <PoopIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ size, color }) => <BarChart3 size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => <Settings size={size} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
