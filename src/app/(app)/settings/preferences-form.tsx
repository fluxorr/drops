"use client";

import { useActionState } from "react";

import type { Profile, Settings } from "@/database/schemas";

import { savePreferences, type PreferencesState } from "./actions";

function ErrorText({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <p className="field-error">{errors[0]}</p> : null;
}

export function PreferencesForm({ profile, settings }: { profile: Profile; settings: Settings }) {
  const [state, action, pending] = useActionState<PreferencesState, FormData>(savePreferences, {});

  return (
    <form action={action} className="settings-form">
      <section className="settings-section" aria-labelledby="profile-settings-heading">
        <div className="settings-section-heading">
          <h2 id="profile-settings-heading">Learning profile</h2>
          <p>The context Drops uses to shape future lessons.</p>
        </div>
        <div className="settings-fields">
          <div className="field-group">
            <label htmlFor="displayName">Name</label>
            <input id="displayName" name="displayName" defaultValue={profile.displayName} required />
            <ErrorText errors={state.errors?.displayName} />
          </div>
          <div className="field-group">
            <label htmlFor="learningGoal">Learning goal</label>
            <textarea id="learningGoal" name="learningGoal" rows={3} defaultValue={profile.learningGoal} required />
            <ErrorText errors={state.errors?.learningGoal} />
          </div>
          <div className="field-group">
            <label htmlFor="background">Current background</label>
            <textarea id="background" name="background" rows={4} defaultValue={profile.background ?? ""} />
            <ErrorText errors={state.errors?.background} />
          </div>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="delivery-settings-heading">
        <div className="settings-section-heading">
          <h2 id="delivery-settings-heading">Daily delivery</h2>
          <p>Notifications follow India Standard Time.</p>
        </div>
        <div className="settings-fields settings-fields-compact">
          <div className="field-group">
            <label htmlFor="notificationTime">Notification time</label>
            <input id="notificationTime" name="notificationTime" type="time" defaultValue={settings.notificationTime} required />
            <p className="field-help">Asia/Kolkata (IST)</p>
            <ErrorText errors={state.errors?.notificationTime} />
          </div>
          <div className="field-group">
            <label htmlFor="lessonsPerDay">Lessons per day</label>
            <select id="lessonsPerDay" name="lessonsPerDay" defaultValue={String(settings.lessonsPerDay)}>
              {[1, 2, 3, 4, 5].map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
            <ErrorText errors={state.errors?.lessonsPerDay} />
          </div>
          <div className="field-group">
            <label htmlFor="theme">Theme</label>
            <select id="theme" name="theme" defaultValue={settings.theme}>
              <option value="system">Follow system</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <ErrorText errors={state.errors?.theme} />
          </div>
        </div>
      </section>

      <div className="settings-save-row">
        <button className="button button-primary" disabled={pending} type="submit">
          {pending ? "Saving…" : "Save changes"}
        </button>
        {state.message ? (
          <p className={state.status === "error" ? "field-error" : "save-confirmation"} role="status">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
