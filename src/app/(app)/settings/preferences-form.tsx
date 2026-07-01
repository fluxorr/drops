"use client";

import { useActionState } from "react";

import type { Profile, Settings } from "@/database/schemas";

import { PushSubscriptionManager } from "@/components/push/subscription-manager";
import { savePreferences, type PreferencesState } from "./actions";

function ErrorText({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <p className="text-sm text-signal">{errors[0]}</p> : null;
}

export function PreferencesForm({ profile, settings }: { profile: Profile; settings: Settings }) {
  const [state, action, pending] = useActionState<PreferencesState, FormData>(savePreferences, {});

  const labelClass = "text-sm font-medium text-muted";

  return (
    <form action={action} className="flex flex-col gap-10">
      <section aria-labelledby="profile-settings-heading">
        <div className="mb-4">
          <h2 id="profile-settings-heading" className="text-base font-medium">Learning profile</h2>
          <p className="text-sm text-muted">The context Drops uses to shape future lessons.</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="displayName" className={labelClass}>Name</label>
            <input id="displayName" name="displayName" defaultValue={profile.displayName} required className="input-base" />
            <ErrorText errors={state.errors?.displayName} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="learningGoal" className={labelClass}>Learning goal</label>
            <textarea id="learningGoal" name="learningGoal" rows={3} defaultValue={profile.learningGoal} required className="textarea-base" />
            <ErrorText errors={state.errors?.learningGoal} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="background" className={labelClass}>Current background</label>
            <textarea id="background" name="background" rows={4} defaultValue={profile.background ?? ""} className="textarea-base" />
            <ErrorText errors={state.errors?.background} />
          </div>
        </div>
      </section>

      <section aria-labelledby="delivery-settings-heading">
        <div className="mb-4">
          <h2 id="delivery-settings-heading" className="text-base font-medium">Daily delivery</h2>
          <p className="text-sm text-muted">Notifications follow India Standard Time.</p>
        </div>
        <div className="flex flex-col gap-4 max-w-[400px]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="notificationTime" className={labelClass}>Notification time</label>
            <input id="notificationTime" name="notificationTime" type="time" defaultValue={settings.notificationTime} required className="input-base" />
            <p className="text-sm text-muted">Asia/Kolkata (IST)</p>
            <ErrorText errors={state.errors?.notificationTime} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lessonsPerDay" className={labelClass}>Lessons per day</label>
            <select id="lessonsPerDay" name="lessonsPerDay" defaultValue={String(settings.lessonsPerDay)} className="select-base">
              {[1, 2, 3, 4, 5].map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
            <ErrorText errors={state.errors?.lessonsPerDay} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="theme" className={labelClass}>Theme</label>
            <select id="theme" name="theme" defaultValue={settings.theme} className="select-base">
              <option value="system">Follow system</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <ErrorText errors={state.errors?.theme} />
          </div>
        </div>
      </section>

      <section aria-labelledby="notifications-heading">
        <div className="mb-4">
          <h2 id="notifications-heading" className="text-base font-medium">Notifications</h2>
          <p className="text-sm text-muted">Receive a push notification when each daily lesson is ready.</p>
        </div>
        <PushSubscriptionManager />
      </section>

      <div className="flex items-center gap-4">
        <button
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-accent px-4 text-[0.875rem] font-medium text-white cursor-pointer transition-all duration-150 hover:opacity-85 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={pending}
          type="submit"
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving
            </span>
          ) : "Save changes"}
        </button>
        {state.message ? (
          <p className={`text-sm font-medium animate-slide-up ${state.status === "error" ? "text-signal" : "text-green"}`} role="status">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
