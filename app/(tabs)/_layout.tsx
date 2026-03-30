import { Tabs } from 'expo-router';
import { House, ChartBar as BarChart3, Settings } from 'lucide-react-native';
import { DS } from '@/theme/colors';
import { View, Text, StyleSheet, Animated } from 'react-native';
import PoopIcon from '@/components/PoopIcon';
import { useEffect, useRef } from 'react';

function TabIcon({
  icon,
  label,
  focused,
}: {
  icon: React.ReactNode;
  label: string;
  focused: boolean;
}) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [focused, shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.6, 1],
  });

  return (
    <View style={styles.tabItem}>
      {focused ? (
        <Animated.View
          style={[
            styles.activePill,
            {
              opacity,
            },
          ]}
        >
          {icon}
        </Animated.View>
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
        tabBarItemStyle: styles.tabBarItem,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={<House size={20} color="#000000" strokeWidth={focused ? 2.0 : 1.8} />}
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
              icon={<PoopIcon size={20} color="#000000" />}
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
              icon={<BarChart3 size={20} color="#000000" strokeWidth={focused ? 2.0 : 1.8} />}
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
              icon={<Settings size={20} color="#000000" strokeWidth={focused ? 2.0 : 1.8} />}
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
    paddingBottom: 8,
    paddingTop: 10,
    backgroundColor: '#ffffff',
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    color: 'rgba(0,0,0,0.5)',
  },
  tabLabelActive: {
    color: '#000000',
    fontWeight: '700',
  },
});
