import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/authContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // const isAuth =false;
  const { user, isLoadingUser } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";
    if (!user && !inAuthGroup && !isLoadingUser) {
      const timeout = setTimeout(() => {
        router.replace("/auth");
      }, 0);

      return () => clearTimeout(timeout);
    } else if (user && inAuthGroup && !isLoadingUser) {
      const timeout = setTimeout(() => {
        router.replace("/");
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [user, segments]);

  return <>{children}</>;
}
export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <SafeAreaProvider>
          <RouteGuard>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </RouteGuard>
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
