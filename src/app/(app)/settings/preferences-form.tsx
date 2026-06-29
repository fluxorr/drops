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

  const fieldClass = "h-10 w-full rounded-lg border border-rule bg-transparent px-3 py-2 text-base outline-none transition-[border] duration-150 focus:border-moss";
  const textareaClass = "w-full rounded-lg border border-rule bg-transparent px-3 py-2 text-base outline-none transition-[border] duration-150 focus:border-moss resize-y";
  const labelClass = "text-sm font-semibold text-muted";
  const selectClass = "h-10 w-full rounded-lg border border-rule bg-transparent px-3 py-2 text-base outline-none transition-[border] duration-150 focus:border-moss";

  return (
    <form action={action} className="flex flex-col gap-10">
      <section aria-labelledby="profile-settings-heading">
        <div className="mb-4">
          <h2 id="profile-settings-heading" className="font-display text-lg font-[650]">Learning profile</h2>
          <p className="text-sm text-muted">The context Drops uses to shape future lessons.</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="displayName" className={labelClass}>Name</label>
            <input id="displayName" name="displayName" defaultValue={profile.displayName} required className={fieldClass} />
            <ErrorText errors={state.errors?.displayName} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="learningGoal" className={labelClass}>Learning goal</label>
            <textarea id="learningGoal" name="learningGoal" rows={3} defaultValue={profile.learningGoal} required className={textareaClass} />
            <ErrorText errors={state.errors?.learningGoal} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="background" className={labelClass}>Current background</label>
            <textarea id="background" name="background" rows={4} defaultValue={profile.background ?? ""} className={textareaClass} />
            <ErrorText errors={state.errors?.background} />
          </div>
        </div>
      </section>

      <section aria-labelledby="delivery-settings-heading">
        <div className="mb-4">
          <h2 id="delivery-settings-heading" className="font-display text-lg font-[650]">Daily delivery</h2>
          <p className="text-sm text-muted">Notifications follow India Standard Time.</p>
        </div>
        <div className="flex flex-col gap-4 max-w-[400px]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="notificationTime" className={labelClass}>Notification time</label>
            <input id="notificationTime" name="notificationTime" type="time" defaultValue={settings.notificationTime} required className={fieldClass} />
            <p className="text-sm text-muted">Asia/Kolkata (IST)</p>
            <ErrorText errors={state.errors?.notificationTime} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lessonsPerDay" className={labelClass}>Lessons per day</label>
            <select id="lessonsPerDay" name="lessonsPerDay" defaultValue={String(settings.lessonsPerDay)} className={selectClass}>
              {[1, 2, 3, 4, 5].map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
            <ErrorText errors={state.errors?.lessonsPerDay} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="theme" className={labelClass}>Theme</label>
            <select id="theme" name="theme" defaultValue={settings.theme} className={selectClass}>
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
          <h2 id="notifications-heading" className="font-display text-lg font-[650]">Notifications</h2>
          <p className="text-sm text-muted">Receive a push notification when each daily lesson is ready.</p>
        </div>
        <PushSubscriptionManager />
      </section>

      <div className="flex items-center gap-4">
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border-0 bg-moss-strong px-4 py-2.5 text-[0.9375rem] font-[650] leading-[1.25] text-white no-underline cursor-pointer transition-[background] duration-180 hover:bg-moss-strong/88 disabled:opacity-65 disabled:cursor-not-allowed"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving\u2026" : "Save changes"}
        </button>
        {state.message ? (
          <p className={state.status === "error" ? "text-sm text-signal" : "text-sm font-semibold text-moss-strong"} role="status">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
