"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";

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
        <label htmlFor="displayName" className="text-sm font-medium text-muted">What should Drops call you?</label>
        <input
          id="displayName"
          name="displayName"
          defaultValue={defaultName}
          autoComplete="name"
          maxLength={60}
          required
          className="input-base"
          aria-describedby={state.errors?.displayName ? "displayName-error" : undefined}
        />
        <div id="displayName-error"><FieldError messages={state.errors?.displayName} /></div>
      </div>

      <div className="flex flex-col gap-1.5 mb-5">
        <label htmlFor="learningGoal" className="text-sm font-medium text-muted">What would you like to understand better?</label>
        <textarea
          id="learningGoal"
          name="learningGoal"
          rows={3}
          maxLength={500}
          placeholder="Build a deeper understanding of systems programming and distributed systems."
          required
          className="textarea-base"
        />
        <p className="text-sm text-muted">This gives the learning engine direction, not a rigid curriculum.</p>
        <FieldError messages={state.errors?.learningGoal} />
      </div>

      <div className="flex flex-col gap-1.5 mb-5">
        <label htmlFor="interests" className="text-sm font-medium text-muted">Start with a few interests</label>
        <textarea
          id="interests"
          name="interests"
          rows={3}
          placeholder="Rust, distributed systems, compilers"
          required
          className="textarea-base"
        />
        <p className="text-sm text-muted">Separate topics with commas or new lines. You can tune their weight later.</p>
        <FieldError messages={state.errors?.interests} />
      </div>

      <div className="flex flex-col gap-1.5 mb-5">
        <label htmlFor="background" className="text-sm font-medium text-muted">What do you already know? <span className="text-muted">Optional</span></label>
        <textarea
          id="background"
          name="background"
          rows={4}
          maxLength={1000}
          placeholder="I write TypeScript daily, know the basics of Rust, and am new to consensus algorithms."
          className="textarea-base"
        />
        <FieldError messages={state.errors?.background} />
      </div>

      {state.message ? <p className="mb-5 text-sm text-signal" role="alert">{state.message}</p> : null}

      <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-accent px-4 text-[0.875rem] font-medium text-white cursor-pointer transition-all duration-150 hover:opacity-85 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100" disabled={pending} type="submit">
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Creating your ledger
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            Create my learning profile
            <ArrowRight aria-hidden="true" size={15} strokeWidth={2} />
          </span>
        )}
      </button>
    </form>
  );
}
