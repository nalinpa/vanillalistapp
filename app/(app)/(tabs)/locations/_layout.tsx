import { Stack } from "expo-router";

export default function __Locations__Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "__ENTITY_PLURAL__" }} />
      <Stack.Screen name="[__location__Id]/index" options={{ title: "__ENTITY_SINGULAR__" }} />
      <Stack.Screen name="[__location__Id]/reviews" options={{ title: "Reviews" }} />
    </Stack>
  );
}