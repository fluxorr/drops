"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";

import { completeOnboarding, type OnboardingState } from "./actions";

const initialState: OnboardingState = {};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="field-error">{messages[0]}</p>;
}

export function ProfileForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(completeOnboarding, initialState);

  return (
    <form action={action} className="profile-form">
      <div className="field-group">
        <label htmlFor="displayName">What should Drops call you?</label>
        <input
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

      <div className="field-group">
        <label htmlFor="learningGoal">What would you like to understand better?</label>
        <textarea
          id="learningGoal"
          name="learningGoal"
          rows={3}
          maxLength={500}
          placeholder="Build a deeper understanding of systems programming and distributed systems."
          required
        />
        <p className="field-help">This gives the learning engine direction, not a rigid curriculum.</p>
        <FieldError messages={state.errors?.learningGoal} />
      </div>

      <div className="field-group">
        <label htmlFor="interests">Start with a few interests</label>
        <textarea
          id="interests"
          name="interests"
          rows={3}
          placeholder="Rust, distributed systems, compilers"
          required
        />
        <p className="field-help">Separate topics with commas or new lines. You can tune their weight later.</p>
        <FieldError messages={state.errors?.interests} />
      </div>

      <div className="field-group">
        <label htmlFor="background">What do you already know? <span>Optional</span></label>
        <textarea
          id="background"
          name="background"
          rows={4}
          maxLength={1000}
          placeholder="I write TypeScript daily, know the basics of Rust, and am new to consensus algorithms."
        />
        <FieldError messages={state.errors?.background} />
      </div>

      {state.message ? <p className="form-error" role="alert">{state.message}</p> : null}

      <button className="button button-primary profile-submit" disabled={pending} type="submit">
        {pending ? "Creating your ledger…" : "Create my learning profile"}
        {!pending ? <ArrowRight aria-hidden="true" size={17} /> : null}
      </button>
    </form>
  );
}
