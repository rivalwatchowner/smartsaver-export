import { Tabs } from "expo-router";
import { Home, Compass, CreditCard, Award } from "lucide-react-native";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4F46E5",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarLabelPosition: "below-icon",
        tabBarLabelStyle: Platform.select({
          web: { overflow: "visible" },
          default: {},
        }),
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Coupons",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Stores",
          tabBarIcon: ({ color }) => <Compass size={22} color={color} />,
        }}
      />
       <Tabs.Screen
        name="cards"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => <CreditCard size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color }) => <Award size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
