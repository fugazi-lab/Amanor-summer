import { TriggerRecordingProvider } from "@/contexts/TriggerRecordingContext";
import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  return (
    <TriggerRecordingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="(drawer)" />
      </Stack>
    </TriggerRecordingProvider>
  );
}
