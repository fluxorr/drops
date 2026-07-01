"use client";

import { useActionState, useState, useCallback } from "react";

import type { Profile, Settings } from "@/database/schemas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import { PushSubscriptionManager } from "@/components/push/subscription-manager";
import { savePreferences, type PreferencesState } from "./actions";

function ErrorText({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <p className="text-sm text-signal">{errors[0]}</p> : null;
}

export function PreferencesForm({ profile, settings }: { profile: Profile; settings: Settings }) {
  const [state, action, pending] = useActionState<PreferencesState, FormData>(savePreferences, {});
  const [notificationTime, setNotificationTime] = useState(settings.notificationTime);
  const [lessonsPerDay, setLessonsPerDay] = useState(String(settings.lessonsPerDay));

  const formAction = useCallback(async (formData: FormData) => {
    formData.set("notificationTime", notificationTime);
    formData.set("lessonsPerDay", lessonsPerDay);
    return action(formData);
  }, [action, notificationTime, lessonsPerDay]);

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <section aria-labelledby="profile-settings-heading">
        <div className="mb-5">
          <h2 id="profile-settings-heading" className="text-base font-medium text-ink">Learning profile</h2>
          <p className="text-sm text-muted mt-0.5">The context Drops uses to shape future lessons.</p>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="displayName">Name</Label>
            <Input id="displayName" name="displayName" defaultValue={profile.displayName} required />
            <ErrorText errors={state.errors?.displayName} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="learningGoal">Learning goal</Label>
            <Textarea id="learningGoal" name="learningGoal" rows={3} defaultValue={profile.learningGoal} required />
            <p className="text-xs text-muted">Describe what you want to learn. Be specific.</p>
            <ErrorText errors={state.errors?.learningGoal} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="background">Current background <span className="text-muted font-normal">Optional</span></Label>
            <Textarea id="background" name="background" rows={4} defaultValue={profile.background ?? ""} />
            <p className="text-xs text-muted">Your existing knowledge helps Drops tailor lessons.</p>
            <ErrorText errors={state.errors?.background} />
          </div>
        </div>
      </section>

      <section aria-labelledby="delivery-settings-heading">
        <div className="mb-5">
          <h2 id="delivery-settings-heading" className="text-base font-medium text-ink">Daily delivery</h2>
          <p className="text-sm text-muted mt-0.5">Notifications follow India Standard Time.</p>
        </div>
        <div className="flex flex-col gap-5 max-w-[400px]">
          <div className="flex flex-col gap-1.5">
            <Label>Notification time</Label>
            <TimePicker
              value={notificationTime}
              onChange={setNotificationTime}
            />
            <p className="text-xs text-muted">Asia/Kolkata (IST), 15-minute intervals</p>
            <ErrorText errors={state.errors?.notificationTime} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lessonsPerDay-select">Lessons per day</Label>
            <Select value={lessonsPerDay} onValueChange={setLessonsPerDay}>
              <SelectTrigger id="lessonsPerDay-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    {count} {count === 1 ? "lesson" : "lessons"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="lessonsPerDay" value={lessonsPerDay} />
            <ErrorText errors={state.errors?.lessonsPerDay} />
          </div>
        </div>
      </section>

      <section aria-labelledby="notifications-heading">
        <div className="mb-5">
          <h2 id="notifications-heading" className="text-base font-medium text-ink">Notifications</h2>
          <p className="text-sm text-muted mt-0.5">Receive a push notification when each daily lesson is ready.</p>
        </div>
        <PushSubscriptionManager />
      </section>

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-3.5 rounded-full border-2 border-accent-fg/30 border-t-accent-fg animate-spin" />
              Saving
            </span>
          ) : "Save changes"}
        </Button>
        {state.message ? (
          <p className={`text-sm font-medium animate-slide-up ${state.status === "error" ? "text-signal" : "text-green"}`} role="status">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
