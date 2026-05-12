import 'react-native-reanimated';
import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider, useConvexAuth } from "@convex-dev/auth/react";
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProvider as UIThemeProvider } from '@/components/ui/theme';

const getConvexUrl = () => {
  let url = process.env.EXPO_PUBLIC_CONVEX_URL;
  
  if (typeof window !== "undefined" && window.location.hostname.includes("preview.cto.new")) {
    // We are in a sandbox preview. The Convex port is likely 3210.
    const hostname = window.location.hostname;
    const parts = hostname.split("-");
    if (parts.length > 1) {
      // Reconstruct the Convex URL based on the preview subdomain pattern
      // e.g. 3000-id.preview.cto.new -> 3210-id.preview.cto.new
      url = `https://3210-${parts.slice(1).join("-")}`;
    }
  }

  if (!url || url.includes("127.0.0.1") || url.includes("localhost")) {
    // If it's still local but we're in a browser not on localhost, it will fail
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
       console.warn("Convex URL is local but browser is remote. Authentication will likely fail.");
    }
  }

  if (!url) {
    console.warn("EXPO_PUBLIC_CONVEX_URL is not set — Convex will not connect until .env.local is configured and the dev server is restarted.");
    return "https://placeholder.convex.cloud";
  }
  return url;
};

const convex = new ConvexReactClient(getConvexUrl());

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAppGroup = segments[0] === "(tabs)";
    const isAdminGroup = segments[0] === "admin";
    const isOnboarding = segments[0] === "onboarding";
    
    if (!isAuthenticated && (inAppGroup || isAdminGroup || isOnboarding)) {
      router.replace("/login");
    } else if (isAuthenticated && (segments[0] === "login" || segments[0] === "signup")) {
      // If user is logged in and tries to go to landing or login/signup, redirect to home
      // But only if they are not intentionally on the landing page
      // Actually, let's just allow them to stay on landing if they want, but usually redirect
      // router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, isLoading, segments]);

  return <>{children}</>;
}

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <UIThemeProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="privacy-security" />
              <Stack.Screen name="privacy" />
              <Stack.Screen name="terms" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="donate" />
              <Stack.Screen name="gas-savings" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" options={{ headerShown: true }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </UIThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex}>
      <AuthGuard>
        <RootLayoutInner />
      </AuthGuard>
    </ConvexAuthProvider>
  );
}
