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
    return <p className="text-sm font-semibold text-moss-strong">&#x2713; Notifications enabled</p>;
  }

  const btnBase = "inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border-0 bg-surface px-4 py-2.5 text-[0.9375rem] font-[650] leading-[1.25] text-inherit no-underline cursor-pointer transition-[background] duration-180 hover:brightness-95 disabled:opacity-65 disabled:cursor-not-allowed";

  return (
    <button
      type="button"
      className={btnBase}
      onClick={subscribe}
      disabled={saving}
    >
      {saving ? "Enabling\u2026" : "Enable push notifications"}
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
