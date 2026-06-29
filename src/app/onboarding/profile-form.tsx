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

  const fieldClass = "h-10 w-full rounded-lg border border-rule bg-transparent px-3 py-2 text-base outline-none transition-[border] duration-150 focus:border-moss";
  const textareaClass = "w-full rounded-lg border border-rule bg-transparent px-3 py-2 text-base outline-none transition-[border] duration-150 focus:border-moss resize-y";
  const labelClass = "text-sm font-semibold text-muted";
  const helpClass = "text-sm text-muted";
  const btnBase = "inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border-0 bg-moss-strong px-4 py-2.5 text-[0.9375rem] font-[650] leading-[1.25] text-white no-underline cursor-pointer transition-[background] duration-180 hover:bg-moss-strong/88 disabled:opacity-65 disabled:cursor-not-allowed";

  return (
    <form action={action}>
      <div className="flex flex-col gap-1.5 mb-5">
        <label htmlFor="displayName" className={labelClass}>What should Drops call you?</label>
        <input
          id="displayName"
          name="displayName"
          defaultValue={defaultName}
          autoComplete="name"
          maxLength={60}
          required
          className={fieldClass}
          aria-describedby={state.errors?.displayName ? "displayName-error" : undefined}
        />
        <div id="displayName-error"><FieldError messages={state.errors?.displayName} /></div>
      </div>

      <div className="flex flex-col gap-1.5 mb-5">
        <label htmlFor="learningGoal" className={labelClass}>What would you like to understand better?</label>
        <textarea
          id="learningGoal"
          name="learningGoal"
          rows={3}
          maxLength={500}
          placeholder="Build a deeper understanding of systems programming and distributed systems."
          required
          className={textareaClass}
        />
        <p className={helpClass}>This gives the learning engine direction, not a rigid curriculum.</p>
        <FieldError messages={state.errors?.learningGoal} />
      </div>

      <div className="flex flex-col gap-1.5 mb-5">
        <label htmlFor="interests" className={labelClass}>Start with a few interests</label>
        <textarea
          id="interests"
          name="interests"
          rows={3}
          placeholder="Rust, distributed systems, compilers"
          required
          className={textareaClass}
        />
        <p className={helpClass}>Separate topics with commas or new lines. You can tune their weight later.</p>
        <FieldError messages={state.errors?.interests} />
      </div>

      <div className="flex flex-col gap-1.5 mb-5">
        <label htmlFor="background" className={labelClass}>What do you already know? <span className="text-muted">Optional</span></label>
        <textarea
          id="background"
          name="background"
          rows={4}
          maxLength={1000}
          placeholder="I write TypeScript daily, know the basics of Rust, and am new to consensus algorithms."
          className={textareaClass}
        />
        <FieldError messages={state.errors?.background} />
      </div>

      {state.message ? <p className="mb-5 text-sm text-signal" role="alert">{state.message}</p> : null}

      <button className={btnBase} disabled={pending} type="submit">
        {pending ? "Creating your ledger\u2026" : "Create my learning profile"}
        {!pending ? <ArrowRight aria-hidden="true" size={17} /> : null}
      </button>
    </form>
  );
}
