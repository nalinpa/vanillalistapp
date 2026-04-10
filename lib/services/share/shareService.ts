import { NativeModules, Platform, Share as RNShare } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Sentry from "@sentry/react-native";

import type { Share__Location__Payload, ShareResult } from "./types";
import { renderShareCardPngAsync } from "./shareRenderskia";

function buildTextShare(payload: Share__Location__Payload): { message: string; title?: string } {
  return {
    title: "App Name Placeholder",
    message: [
      `Check out: ${payload.__location__Name}`,
      "",
      "Shared via App Name Placeholder",
    ].join("\n"),
  };
}

function getSupportedAbis(): string[] {
  const pc = (NativeModules as any)?.PlatformConstants;
  const abis: unknown =
    pc?.supportedAbis ?? pc?.supported32BitAbis ?? pc?.supported64BitAbis;
  return Array.isArray(abis) ? abis.map(String) : [];
}

/**
 * HARD safety gate:
 * - On Android devices that only support armeabi-v7a (32-bit), DO NOT attempt
 * the offscreen Skia render path (known native SIGSEGV).
 */
function canAttemptOffscreenRender(): boolean {
  if (Platform.OS !== "android") return true;

  const abis = getSupportedAbis();
  if (abis.length === 0) return true; // unknown -> allow (still wrapped in try/catch)

  const only32 = abis.every((a) => a === "armeabi-v7a");
  return !only32;
}

async function shareImageAsync(fileUri: string): Promise<boolean> {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "image/png",
        dialogTitle: "Share",
        UTI: "public.png",
      });
      return true;
    }
  } catch (e) {
    Sentry.captureException(e);
  }

  try {
    await RNShare.share({ url: fileUri });
    return true;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
}

async function shareTextAsync(payload: Share__Location__Payload): Promise<boolean> {
  const { message, title } = buildTextShare(payload);
  try {
    await RNShare.share({ message, title });
    return true;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
}

async function safeUnlink(uri: string) {
  try {
    // @ts-ignore
    if (FileSystem.cacheDirectory && uri.startsWith(FileSystem.cacheDirectory)) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (e) {
    Sentry.captureException(e);
    // ignore
  }
}

export const shareService = {
  /**
   * Share a pre-rendered image file (e.g. captured via react-native-view-shot).
   * This avoids any offscreen Skia rendering inside the service.
   */
  async shareImageUriAsync(fileUri: string): Promise<ShareResult> {
    const ok = await shareImageAsync(fileUri);
    void safeUnlink(fileUri);

    if (ok) return { ok: true, mode: "image", shared: true };
    return { ok: false, mode: "image", error: "Share cancelled or failed." };
  },

  /**
   * Main entry point: try offscreen image render (only if safe), otherwise fall back to text.
   */
  async share__Location__Async(payload: Share__Location__Payload): Promise<ShareResult> {
    if (canAttemptOffscreenRender()) {
      try {
        const uri = await renderShareCardPngAsync(payload);
        if (uri) {
          const ok = await shareImageAsync(uri);
          void safeUnlink(uri);
          if (ok) return { ok: true, mode: "image", shared: true };
        }
      } catch (e) {
        Sentry.captureException(e);
        // ignore → fallback
      }
    }

    const textOk = await shareTextAsync(payload);
    if (textOk) return { ok: true, mode: "text", shared: true };

    return { ok: false, mode: "text", error: "Share cancelled or failed." };
  },
};