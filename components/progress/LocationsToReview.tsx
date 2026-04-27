import React from "react";
import { View, StyleSheet } from "react-native";
import { MessageSquarePlus, Star, ChevronRight } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppIcon } from "@/components/ui/AppIcon";
import { space } from "@/lib/ui/tokens";

type __Location__Lite = {
  id: string;
  name: string;
  description?: string;
};

export function __Location__sToReviewCard({
  __locations__,
  onOpen__Location__,
}: {
  __locations__: __Location__Lite[];
  onOpen__Location__: (id: string) => void;
}) {
  if (!__locations__ || __locations__.length === 0) return null;

  const visible = __locations__.slice(0, 3);
  const remaining = __locations__.length - visible.length;

  return (
    <CardShell status="basic">
      <Stack gap="md">
        {/* Header */}
        <Row justify="space-between" align="center">
          <Row gap="xs" align="center">
            <AppIcon icon={MessageSquarePlus} variant="surf" size={18} />
            <AppText variant="sectionTitle">Pending Reviews</AppText>
          </Row>
          <Pill status="surf">{__locations__.length}</Pill>
        </Row>

        <AppText variant="body" status="hint">
          Share your thoughts on your recent adventures.
        </AppText>

        {/* List of __Location__s */}
        <Stack gap="sm">
          {visible.map((__location__) => (
            <CardShell
              key={__location__.id}
              onPress={() => onOpen__Location__(__location__.id)}
              style={styles.innerCard}
            >
              <Row justify="space-between" align="center">
                <Row gap="sm" align="center" style={styles.flex1}>
                  <AppIcon icon={Star} variant="surf" size={16} />
                  <View style={styles.flex1}>
                    <AppText variant="body" style={styles.bold}>
                      {__location__.name}
                    </AppText>
                    {__location__.description?.trim() && (
                      <AppText variant="label" status="hint" numberOfLines={1}>
                        {__location__.description.trim()}
                      </AppText>
                    )}
                  </View>
                </Row>
                <AppIcon icon={ChevronRight} variant="hint" size={16} />
              </Row>
            </CardShell>
          ))}
        </Stack>

        {/* Overflow Hint */}
        {remaining > 0 && (
          <AppText variant="label" status="surf" style={styles.moreText}>
            + {remaining} more to review
          </AppText>
        )}
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  innerCard: {
    padding: space.sm,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  bold: {
    fontWeight: "700",
  },
  moreText: {
    textAlign: "center",
    fontWeight: "800",
    marginTop: 2,
  },
});
