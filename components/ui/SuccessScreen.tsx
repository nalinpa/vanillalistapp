import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { Share2, Check } from "lucide-react-native";
import { MotiView } from "moti";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import * as Sentry from "@sentry/react-native";
import { Easing } from "react-native-reanimated";

import { AppText } from "../ui/AppText";
import { Stack } from "../ui/Stack";
import { Row } from "../ui/Row";
import { AppButton } from "../ui/AppButton";

import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { useLocationStore } from "@/lib/store/index";
import { use__Location__Data } from "@/lib/hooks/use__Location__Data";
import { useGPSGate } from "@/lib/hooks/useGPSGate";
import { use__Location__CompletionMutation } from "@/lib/hooks/use__Location__CompletionMutation";

interface SuccessScreenProps {
  __location__Id: string;
  onClose: () => void;
  onShare: () => void;
}

export function SuccessScreen({ __location__Id, onClose, onShare }: SuccessScreenProps) {
  const [triggered__Location__Id, setTriggered__Location__Id] = useState<string | null>(null);

  const { user } = useAuthUser();
  const location = useLocationStore((s) => s.location);

  const { __location__Data, loading: __location__Loading, err: __location__Error } = use__Location__(__location__Id);
  const gate = useGPSGate(__location__Data, location);
  const { complete__Location__, loading: saving } = use__Location__CompletionMutation();

  useEffect(() => {
    const isReadyToTrigger = user && __location__Data && location;

    // Check if we haven't triggered THIS specific __location__ yet
    if (isReadyToTrigger && triggered__Location__Id !== __location__Id) {
      setTriggered__Location__Id(__location__Id); // Lock it for this __location__!

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      complete__Location__({
        uid: user.uid,
        __location__Data: __location__Data,
        loc: location,
        gate: gate,
      }).then((res) => {
        if (!res.ok) {
          Sentry.captureMessage("Failed to queue __location__ completion", { level: "error" });
        }
      });
    }
  }, [user, __location__Data, location, triggered__Location__Id, __location__Id, gate, complete__Location__]);

  if (__location__Loading || !__location__Data) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#FFFFFF" size="large" />
        <AppText style={styles.loadingText}>SAVING YOUR VISIT...</AppText>
        {__location__Error && <AppText style={styles.errorText}>Error: {__location__Error}</AppText>}
        <AppButton variant="ghost" onPress={onClose} style={styles.cancelButton}>
          <AppText style={styles.whiteText}>CANCEL</AppText>
        </AppButton>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, scale: 0.9, translateY: 20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{
          type: "timing",
          duration: 500,
          easing: Easing.out(Easing.back(1.5)),
        }}
        style={styles.card}
      >
        <Stack gap="xl" align="center" style={styles.fullWidth}>
          <View style={styles.lottieContainer}>
            <LottieView
              autoPlay
              loop={false}
              source={require("@/assets/animations/success.confetti.json")}
              style={styles.lottieAnimation}
              resizeMode="cover"
            />
          </View>

          <Stack align="center" gap="xs">
            <AppText variant="h3" style={styles.title}>
              {__location__Data.name}
            </AppText>
            <AppText variant="label" style={styles.subtitle}>
              YOU MADE IT!
            </AppText>
          </Stack>

          <Stack gap="md" style={styles.buttonStack}>
            <AppButton
              variant="hero"
              size="lg"
              onPress={onShare}
              loading={saving}
              loadingLabel="SAVING VISIT..."
            >
              <Row gap="sm" align="center">
                <Share2 size={20} color="#FFF" strokeWidth={2.5} />
                <AppText style={styles.heroBtnText}>CAPTURE THE VIEW</AppText>
              </Row>
            </AppButton>

            <AppButton variant="ghost" onPress={onClose} disabled={saving}>
              <Row gap="xs" align="center">
                <Check size={16} color="#64748B" />
                <AppText style={styles.doneText}>DONE</AppText>
              </Row>
            </AppButton>
          </Stack>
        </Stack>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.94)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 10000,
  },
  card: {
    backgroundColor: "white",
    width: "100%",
    borderRadius: 32,
    padding: 32,
    paddingTop: 10,
    alignItems: "center",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  lottieContainer: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -40,
  },
  lottieAnimation: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    color: "#0F172A",
    lineHeight: 38,
  },
  subtitle: {
    color: "__PRIMARY_COLOR__",
    letterSpacing: 4,
    fontWeight: "900",
    fontSize: 12,
    marginTop: 4,
  },
  heroBtnText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },
  doneText: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 14,
  },
  loadingText: {
    color: "white",
    marginTop: 12,
  },
  errorText: {
    color: "#F87171",
    marginTop: 8,
    fontSize: 12,
  },
  whiteText: {
    color: "white",
  },
  cancelButton: {
    marginTop: 20,
  },
  fullWidth: {
    width: "100%",
  },
  buttonStack: {
    width: "100%",
    marginTop: 8,
  },
});