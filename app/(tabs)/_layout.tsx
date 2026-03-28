import { Tabs } from 'expo-router';
import { House, ChartBar as BarChart3, Settings } from 'lucide-react-native';
import { DS } from '@/theme/colors';
import { View, Text, StyleSheet } from 'react-native';
import PoopIcon from '@/components/PoopIcon';
import { LinearGradient } from 'expo-linear-gradient';

function GradientTabBar({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={[DS.primary, DS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBar}
    >
      {children}
    </LinearGradient>
  );
}

function TabIcon({
  icon,
  label,
  focused,
}: {
  icon: React.ReactNode;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabItem}>
      {focused ? (
        <LinearGradient
          colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.12)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activePill}
        >
          {icon}
        </LinearGradient>
      ) : (
        <View style={styles.inactivePill}>{icon}</View>
      )}
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <LinearGradient
            colors={[DS.primary, DS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={<House size={20} color="#ffffff" strokeWidth={focused ? 2.5 : 1.8} />}
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={<PoopIcon size={20} color="#ffffff" />}
              label="Track"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={<BarChart3 size={20} color="#ffffff" strokeWidth={focused ? 2.5 : 1.8} />}
              label="Insights"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={<Settings size={20} color="#ffffff" strokeWidth={focused ? 2.5 : 1.8} />}
              label="Settings"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    elevation: 0,
    height: 72,
    paddingBottom: 0,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  gradientBar: {
    flex: 1,
    flexDirection: 'row',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  activePill: {
    width: 52,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactivePill: {
    width: 52,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
  },
  tabLabelActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
