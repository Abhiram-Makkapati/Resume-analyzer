import { Redirect, Tabs } from "expo-router";
import { History, House, Sparkles, UserCircle2 } from "lucide-react-native";
import { colors } from "../../src/theme/tokens";
import { useMobileAuth } from "../../src/providers/auth-provider";

export default function TabsLayout() {
  const { user, isLoading } = useMobileAuth();

  if (!isLoading && !user) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.96)",
          borderTopColor: "rgba(90, 115, 166, 0.08)"
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="pricing"
        options={{
          title: "Pro",
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <UserCircle2 color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
