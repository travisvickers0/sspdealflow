import { Apple, Eye, EyeOff, Github } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const inputClassName =
  "w-full bg-white border border-[rgba(13,12,11,0.1)] rounded-[10px] text-[#0d0c0b] text-[14px] px-3.5 py-3 outline-none placeholder:text-[rgba(13,12,11,0.3)] focus:border-[#e8432d] focus:shadow-[0_0_0_3px_rgba(232,67,45,0.07)] transition-all font-['DM_Sans',sans-serif]";

const labelClassName =
  "block text-[11px] font-semibold tracking-[0.08em] uppercase text-[rgba(13,12,11,0.45)] mb-1.5";

const oauthButtonClassName =
  "w-full bg-white border border-[rgba(13,12,11,0.1)] rounded-[10px] py-2.5 font-['DM_Sans',sans-serif] text-[13px] font-medium text-[rgba(13,12,11,0.7)] cursor-pointer flex items-center justify-center gap-2 hover:border-[rgba(13,12,11,0.2)] hover:text-[#0d0c0b] hover:bg-[#faf9f7] transition-all mb-2 disabled:opacity-50 disabled:cursor-not-allowed";

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = () => {
    setIsLoading(true);
    window.location.href = "/api/login";
  };

  const handleSimpleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register/simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        const data = await response.json();
        setError(data.message || "Registration failed");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0a0908]">
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-10 border-r border-[#1e1c19] bg-[#0a0908]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a2018] to-[#0a0908]" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(10,9,8,0.6) 0%, rgba(10,9,8,0.3) 50%, rgba(10,9,8,0.7) 100%)",
            }}
          />
        </div>

        <div
          className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full pointer-events-none z-[1]"
          style={{
            background:
              "radial-gradient(circle, rgba(232,67,45,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-[2] flex flex-col justify-between h-full">
          <a
            href="/"
            className="flex items-center gap-0.5 no-underline"
          >
            <span className="text-[22px] font-bold text-[#e8432d] leading-none tracking-[-0.02em]">
              [
            </span>
            <span className="text-[14px] font-bold text-[#f0ebe3] leading-none tracking-[0.05em] px-0.5">
              SSP DEAL FLOW
            </span>
            <span className="text-[22px] font-bold text-[#e8432d] leading-none tracking-[-0.02em]">
              ]
            </span>
          </a>

          <div className="flex flex-col py-8">
            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] uppercase text-[#e8432d] mb-4">
              <div className="w-6 h-px bg-[#e8432d] flex-shrink-0" />
              Accredited Investors
            </div>

            <h1
              className="font-bold tracking-[-0.03em] text-[#f0ebe3] leading-[0.92] mb-5"
              style={{ fontSize: "clamp(40px,4.5vw,60px)" }}
            >
              Join the
              <br />
              <em
                style={{
                  fontStyle: "italic",
                  fontFamily: "'Instrument Serif',Georgia,serif",
                  fontWeight: 400,
                  color: "#e8432d",
                  display: "block",
                }}
              >
                Deal Room
              </em>
            </h1>

            <p className="text-[15px] text-[rgba(255,255,255,0.45)] leading-[1.75] max-w-[340px] mb-8">
              Access vetted off-market acquisitions across the Southeast.
              Deal-by-deal JV partnerships - 50/50 profit split at sale.
            </p>

            <div className="flex flex-col gap-3 mb-8">
              {[
                {
                  text: "50/50 profit split at sale - every deal",
                  bold: "50/50 profit split",
                  color: "rgba(232,67,45,0.12)",
                  border: "rgba(232,67,45,0.2)",
                  check: "#e8432d",
                },
                {
                  text: "First-position lien on every acquisition",
                  bold: "First-position lien",
                  color: "rgba(255,255,255,0.06)",
                  border: "rgba(255,255,255,0.1)",
                  check: "rgba(255,255,255,0.6)",
                },
                {
                  text: "No fees, no fund - deal-by-deal only",
                  bold: "No fees, no fund",
                  color: "rgba(255,255,255,0.06)",
                  border: "rgba(255,255,255,0.1)",
                  check: "rgba(255,255,255,0.6)",
                },
                {
                  text: "119 closed deals · 10+ year track record",
                  bold: "119 closed deals",
                  color: "rgba(74,222,128,0.08)",
                  border: "rgba(74,222,128,0.15)",
                  check: "#4ade80",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-[8px] flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: feature.color,
                      border: `1px solid ${feature.border}`,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l2.5 2.5L10 3"
                        stroke={feature.check}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-[14px] font-medium text-[rgba(255,255,255,0.65)]">
                    <strong className="text-[#f0ebe3] font-semibold">
                      {feature.bold}
                    </strong>
                    {feature.text.replace(feature.bold, "")}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[14px] p-5">
              <p className="text-[14px] italic text-[rgba(255,255,255,0.6)] leading-[1.7] mb-3">
                &quot;SSP found deals I never could have found myself. The
                transparency on every closeout report is unlike anything
                I&apos;ve seen in private real estate.&quot;
              </p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[rgba(232,67,45,0.2)] border border-[rgba(232,67,45,0.3)] flex items-center justify-center text-[10px] font-bold text-[#e8432d] flex-shrink-0">
                  B
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-[#f0ebe3]">
                    Brian B.
                  </div>
                  <div className="text-[11px] text-[rgba(255,255,255,0.35)]">
                    Accredited Investor · 4 deals closed
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-px bg-[rgba(255,255,255,0.07)] rounded-[12px] overflow-hidden">
            {[
              { val: "119", label: "Deals Closed", color: "text-[#f0ebe3]" },
              { val: "$6.4M", label: "Total Equity", color: "text-[#4ade80]" },
              { val: "94d", label: "Avg Hold", color: "text-[#f0ebe3]" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[rgba(255,255,255,0.03)] px-4 py-3.5"
              >
                <div
                  className={`font-mono text-[20px] font-medium leading-none mb-1 ${stat.color}`}
                >
                  {stat.val}
                </div>
                <div className="text-[8px] font-semibold tracking-[0.1em] uppercase text-[rgba(255,255,255,0.28)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#f7f4ef] flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 overflow-y-auto min-h-screen">
        <div className="w-full max-w-[460px] mx-auto">
          <div className="flex gap-0 bg-[rgba(13,12,11,0.06)] rounded-full p-1 mb-8 w-fit">
            <Link
              href="/signup"
              className="px-6 py-2 rounded-full text-[13px] font-semibold bg-white text-[#0d0c0b] shadow-[0_1px_4px_rgba(0,0,0,0.1)]"
            >
              Create Account
            </Link>
            <Link
              href="/signin"
              className="px-6 py-2 rounded-full text-[13px] font-semibold bg-transparent text-[rgba(13,12,11,0.4)] hover:text-[#0d0c0b] transition-colors"
            >
              Sign In
            </Link>
          </div>

          <h1 className="text-[24px] font-bold tracking-[-0.025em] text-[#0d0c0b] mb-1">
            Create your account
          </h1>
          <p className="text-[14px] text-[rgba(13,12,11,0.45)] mb-6">
            Access exclusive real estate investment opportunities.
          </p>

          <div className="flex items-center gap-2.5 bg-[rgba(232,67,45,0.06)] border border-[rgba(232,67,45,0.15)] rounded-[10px] px-3.5 py-3 mb-6">
            <span className="w-1.5 h-1.5 bg-[#e8432d] rounded-full flex-shrink-0" />
            <p className="text-[12px] text-[rgba(13,12,11,0.6)] leading-[1.5]">
              <strong className="text-[#0d0c0b] font-semibold">
                Accredited investors only.
              </strong>{" "}
              By creating an account you confirm you meet SEC accreditation
              requirements.
            </p>
          </div>

          <form onSubmit={handleSimpleSignUp}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="signup-first-name" className={labelClassName}>
                  First Name
                </label>
                <input
                  id="signup-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Dustin"
                  data-testid="input-first-name"
                  className={inputClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-last-name" className={labelClassName}>
                  Last Name
                </label>
                <input
                  id="signup-last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Cole"
                  data-testid="input-last-name"
                  className={inputClassName}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="signup-email" className={labelClassName}>
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                data-testid="input-email"
                className={inputClassName}
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="signup-password" className={labelClassName}>
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8+ characters"
                  data-testid="input-password"
                  className={`${inputClassName} pr-12`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(13,12,11,0.35)] hover:text-[#0d0c0b] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                className="text-[12px] text-[#e8432d] mb-3 font-medium"
                data-testid="text-signup-error"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              data-testid="button-signup-submit"
              className="w-full bg-[#0d0c0b] hover:bg-[#e8432d] text-white font-semibold text-[14px] py-3.5 rounded-[12px] border-none cursor-pointer flex items-center justify-center gap-2 transition-all hover:-translate-y-px mt-1 mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span>Create Account</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 7h10M7 2l5 5-5 5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[rgba(13,12,11,0.1)]" />
            <span className="text-[12px] font-medium text-[rgba(13,12,11,0.35)]">
              or continue with
            </span>
            <div className="flex-1 h-px bg-[rgba(13,12,11,0.1)]" />
          </div>

          <div>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={isLoading}
              data-testid="button-signup-google"
              className={oauthButtonClassName}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={isLoading}
              data-testid="button-signup-github"
              className={oauthButtonClassName}
            >
              <Github className="h-4 w-4" />
              <span>Continue with GitHub</span>
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={isLoading}
              data-testid="button-signup-apple"
              className={oauthButtonClassName}
            >
              <Apple className="h-4 w-4" />
              <span>Continue with Apple</span>
            </button>
          </div>

          <div className="text-center text-[13px] text-[rgba(13,12,11,0.45)] mt-5 pt-5 border-t border-[rgba(13,12,11,0.07)]">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-[#e8432d] font-semibold no-underline hover:underline"
            >
              Sign in →
            </Link>
          </div>

          <p className="text-[11px] text-[rgba(13,12,11,0.3)] text-center mt-3 leading-[1.6]">
            By creating an account, you agree to our{" "}
            <a
              href="/terms"
              className="text-[#e8432d] no-underline font-medium"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-[#e8432d] no-underline font-medium"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
