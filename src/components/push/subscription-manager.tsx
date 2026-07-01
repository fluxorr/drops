"use client";

import { useCallback, useState } from "react";
import { Bell, BellRing } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PushSubscriptionManager() {
  const [saving, setSaving] = useState(false);

  const isSupported = typeof window !== "undefined"
    && "Notification" in window
    && "serviceWorker" in navigator;

  const permission = typeof window !== "undefined"
    ? Notification.permission
    : "default";

  const subscribe = useCallback(async () => {
    if (saving) return;
    setSaving(true);

    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        console.warn("VAPID public key not configured");
        return;
      }

      const keyBuffer = urlBase64ToUint8Array(publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBuffer as unknown as string,
      });

      const raw = JSON.parse(JSON.stringify(subscription));

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: raw.endpoint,
          p256dh: raw.keys.p256dh,
          auth: raw.keys.auth,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error("Push subscription failed", error);
    } finally {
      setSaving(false);
    }
  }, [saving]);

  if (!isSupported) {
    return <p className="text-sm text-muted">Push notifications are not supported in this browser.</p>;
  }

  if (permission === "denied") {
    return (
      <p className="text-sm text-signal">
        Push notifications were denied. Update your browser settings to enable them.
      </p>
    );
  }

  if (permission === "granted") {
    return (
      <p className="inline-flex items-center gap-1.5 text-sm font-medium text-green">
        <BellRing className="size-3.5" />
        Notifications enabled
      </p>
    );
  }

  return (
    <Button variant="outline" onClick={subscribe} disabled={saving}>
      {saving ? (
        <span className="inline-flex items-center gap-2">
          <span className="size-3.5 rounded-full border-2 border-ink/30 border-t-ink animate-spin" />
          Enabling
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          <Bell className="size-3.5" />
          Enable push notifications
        </span>
      )}
    </Button>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
