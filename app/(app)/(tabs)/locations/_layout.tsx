import { Stack } from "expo-router";

export default function LocationsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "__ENTITY_PLURAL__" }} />
      <Stack.Screen name="[locationId]/index" options={{ title: "__ENTITY_SINGULAR__" }} />
      <Stack.Screen name="[locationId]/reviews" options={{ title: "Reviews" }} />
    </Stack>
  );
}