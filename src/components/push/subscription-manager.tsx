"use client";

import { useCallback, useState } from "react";

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
    return <p className="text-sm font-medium text-green">&check; Notifications enabled</p>;
  }

  return (
    <button
      type="button"
      className="inline-flex h-9 items-center justify-center rounded-md border border-rule bg-transparent px-3.5 text-[0.8125rem] font-medium text-ink cursor-pointer transition-all duration-150 hover:bg-surface active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={subscribe}
      disabled={saving}
    >
      {saving ? (
        <span className="inline-flex items-center gap-2">
          <span className="size-3.5 rounded-full border-[1.5px] border-muted/30 border-t-muted animate-spin" />
          Enabling
        </span>
      ) : "Enable push notifications"}
    </button>
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
