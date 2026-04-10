import React from "react";
import { StyleSheet, View } from "react-native";
import { MapPin, Navigation } from "lucide-react-native";
import { MotiView } from "moti";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { formatDistanceMeters } from "@/lib/formatters";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppIcon } from "@/components/ui/AppIcon";
import { AppButton } from "@/components/ui/AppButton";

export function NearestUnvisitedCard({ __location__Data, distanceMeters, locErr, onOpen__Location__ }: any) {
  // --- SEARCHING / ERROR STATE ---
  if (!__location__Data) {
    return (
      <CardShell status="basic">
        <Row gap="sm" align="center">
          {locErr ? (
            // Static icon if location is denied/error
            <AppIcon icon={Navigation} variant="hint" size={20} />
          ) : (
            <View>
              <MotiView
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
                transition={{ type: "timing", duration: 1500, loop: true }}
              >
                <AppIcon icon={Navigation} variant="surf" size={20} />
              </MotiView>
            </View>
          )}

          <AppText variant="body" status="hint">
            {locErr
              ? "Enable location to find nearby __ENTITY_PLURAL__"
              : "Finding your next destination..."}
          </AppText>
        </Row>
      </CardShell>
    );
  }

  // --- FOUND STATE ---
  return (
    <CardShell status="surf" onPress={() => onOpen__Location__(__location__Data.id)} style={styles.card}>
      <Stack gap="md">
        <Row justify="space-between" align="center">
          <Row gap="xs" align="center">
            <AppIcon icon={MapPin} variant="surf" size={18} />
            <AppText variant="label" style={styles.headerLabel}>
              NEXT MISSION
            </AppText>
          </Row>
          {distanceMeters != null && (
            <Pill status="surf">{formatDistanceMeters(distanceMeters)}</Pill>
          )}
        </Row>

        <Stack gap="xs">
          <AppText variant="sectionTitle" style={styles.__location__Name}>
            {locationData.name}
          </AppText>
          <AppText variant="body" numberOfLines={2} style={styles.description}>
            {__location__Data.description || "A unique __ENTITY_SINGULAR__ waiting to be explored."}
          </AppText>
        </Stack>

        <AppButton variant="primary" size="sm" onPress={() => onOpen__Location__(__location__Data.id)}>
          <AppText variant="h3" style={styles.buttonText}>
            View Details
          </AppText>
        </AppButton>
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "__PRIMARY_LIGHT_BG__",
  },
  headerLabel: {
    fontWeight: "900",
    color: "#1E293B",
    letterSpacing: 0.5,
  },
  __location__Name: {
    color: "#0F172A",
    fontWeight: "900",
  },
  description: {
    color: "#475569",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});