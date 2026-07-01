import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="mx-auto w-[min(100%-32px,960px)] min-h-screen grid grid-cols-[1fr_400px] items-center gap-[72px] max-md:grid-cols-1 max-md:gap-10 max-md:py-6 max-md:pb-14">
      <div className="self-stretch flex flex-col justify-between py-9 border-y border-rule max-md:min-h-[260px]">
        <div>
          <p className="mb-2 text-sm font-semibold text-muted">Start learning</p>
          <h1 className="font-display text-[2.75rem] font-[650] leading-[1.05] -tracking-[0.035em] text-balance max-sm:text-[2.25rem] max-w-[12ch]">
            Tell Drops what you want to understand.
          </h1>
        </div>
      </div>
      <div>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/today"
        />
      </div>
    </div>
  );
}
