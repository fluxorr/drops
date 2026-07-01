"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { completeOnboarding, type OnboardingState } from "./actions";

const initialState: OnboardingState = {};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-sm text-signal">{messages[0]}</p>;
}

export function ProfileForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(completeOnboarding, initialState);

  return (
    <form action={action}>
      <div className="flex flex-col gap-1.5 mb-5">
        <Label htmlFor="displayName">What should Drops call you?</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={defaultName}
          autoComplete="name"
          maxLength={60}
          required
          aria-describedby={state.errors?.displayName ? "displayName-error" : undefined}
        />
        <div id="displayName-error"><FieldError messages={state.errors?.displayName} /></div>
      </div>

      <div className="flex flex-col gap-1.5 mb-5">
        <Label htmlFor="learningGoal">What would you like to understand better?</Label>
        <Textarea
          id="learningGoal"
          name="learningGoal"
          rows={3}
          maxLength={500}
          placeholder="Build a deeper understanding of systems programming and distributed systems."
          required
        />
        <p className="text-sm text-muted">This gives the learning engine direction, not a rigid curriculum.</p>
        <FieldError messages={state.errors?.learningGoal} />
      </div>

      <div className="flex flex-col gap-1.5 mb-5">
        <Label htmlFor="interests">Start with a few interests</Label>
        <Textarea
          id="interests"
          name="interests"
          rows={3}
          placeholder="Rust, distributed systems, compilers"
          required
        />
        <p className="text-sm text-muted">Separate topics with commas or new lines. You can tune their weight later.</p>
        <FieldError messages={state.errors?.interests} />
      </div>

      <div className="flex flex-col gap-1.5 mb-5">
        <Label htmlFor="background">What do you already know? <span className="text-muted font-normal">Optional</span></Label>
        <Textarea
          id="background"
          name="background"
          rows={4}
          maxLength={1000}
          placeholder="I write TypeScript daily, know the basics of Rust, and am new to consensus algorithms."
        />
        <FieldError messages={state.errors?.background} />
      </div>

      {state.message ? <p className="mb-5 text-sm text-signal" role="alert">{state.message}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-3.5 rounded-full border-2 border-accent-fg/30 border-t-accent-fg animate-spin" />
            Creating your ledger
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            Create my learning profile
            <ArrowRight aria-hidden="true" size={15} strokeWidth={2} />
          </span>
        )}
      </Button>
    </form>
  );
}
